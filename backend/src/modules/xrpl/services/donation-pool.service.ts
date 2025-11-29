/**
 * Donation Pool Service
 *
 * Gère le pool de donations, les profits et les distributions aux ONG.
 *
 * Fonctions principales:
 * - deposit(): Enregistrer une donation
 * - simulateProfit(): Simuler des profits de trading
 * - distributeProfits(): Distribuer les profits aux ONG
 *
 * Mode MOCK: Toutes les opérations sont simulées sans vraie blockchain.
 */

import { XRPLClientService } from './xrpl-client.service';
import {
  PoolState,
  DonorInfo,
  DepositRequest,
  DepositResponse,
  ProfitDistributionResult,
  DistributionRecord,
  NGO,
} from '../types/xrpl.types';

export class DonationPoolService {
  private xrplClient: XRPLClientService;
  private poolState: PoolState;
  private donors: Map<string, DonorInfo>;
  private ngos: Map<string, NGO>;

  constructor(xrplClient: XRPLClientService) {
    this.xrplClient = xrplClient;

    // Initialiser l'état du pool
    this.poolState = {
      totalBalance: 0,
      totalDonations: 0,
      totalProfitsGenerated: 0,
      totalDistributed: 0,
      lastTradingRun: new Date(),
      donorCount: 0,
    };

    this.donors = new Map();
    this.ngos = new Map();

    // Initialiser avec des ONG par défaut (mock data)
    this.initializeMockNGOs();

    console.log('[DonationPool] Service initialized');
  }

  // ==========================================================================
  // DEPOSIT - Enregistrer une donation
  // ==========================================================================

  /**
   * Enregistrer une donation dans le pool
   *
   * @param request - Requête de donation (adresse donateur + montant)
   * @returns Résultat de la donation (txHash, NFT, XP)
   *
   * Processus:
   * 1. Vérifier le montant (> 0)
   * 2. Enregistrer la transaction XRPL (ou mock)
   * 3. Mettre à jour le solde du pool
   * 4. Mettre à jour les infos du donateur
   * 5. Calculer et attribuer XP
   * 6. Mint NFT si première donation
   */
  async deposit(request: DepositRequest): Promise<DepositResponse> {
    const { donorAddress, amount } = request;

    // Validation
    if (amount <= 0) {
      throw new Error('Donation amount must be positive');
    }

    console.log(`[DonationPool] Processing deposit: ${amount} XRP from ${donorAddress}`);

    // 1. Vérifier la transaction XRPL (en mode MOCK, toujours OK)
    let txHash: string;

    if (this.xrplClient.isMockMode()) {
      // Mode MOCK: générer un hash fictif
      txHash = `MOCK_DEPOSIT_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      console.log(`[DonationPool] MOCK: Generated txHash: ${txHash}`);
    } else {
      // Mode LIVE: vérifier que la transaction existe
      // Dans un cas réel, on recevrait le txHash depuis le frontend
      // et on le vérifierait ici
      txHash = `LIVE_TX_${Date.now()}`;
      // const isValid = await this.xrplClient.verifyTransaction(txHash);
      // if (!isValid) throw new Error('Invalid transaction');
    }

    // 2. Mettre à jour le pool
    this.poolState.totalBalance += amount;
    this.poolState.totalDonations += amount;

    // 3. Mettre à jour ou créer le donateur
    let donor = this.donors.get(donorAddress);
    const isFirstDonation = !donor;

    if (!donor) {
      // Nouveau donateur
      donor = {
        address: donorAddress,
        totalDonated: 0,
        xp: 0,
        level: 1,
        firstDonationDate: new Date(),
        lastDonationDate: new Date(),
        donationCount: 0,
      };
      this.donors.set(donorAddress, donor);
      this.poolState.donorCount++;
    }

    donor.totalDonated += amount;
    donor.donationCount++;
    donor.lastDonationDate = new Date();

    // 4. Calculer et attribuer XP (1 XRP = 10 XP)
    const xpGained = Math.floor(amount * 10);
    donor.xp += xpGained;

    // 5. Calculer le nouveau niveau (niveau = floor(sqrt(XP / 100)) + 1)
    const previousLevel = donor.level;
    const newLevel = Math.floor(Math.sqrt(donor.xp / 100)) + 1;
    donor.level = newLevel;

    // 6. Mint NFT si première donation ou level up
    let nftMinted = false;
    let nftTokenId: string | undefined;

    if (isFirstDonation || newLevel > previousLevel) {
      nftTokenId = await this.mintImpactNFT(donorAddress, newLevel);
      donor.nftTokenId = nftTokenId;
      nftMinted = true;

      if (newLevel > previousLevel) {
        console.log(`[DonationPool] Donor ${donorAddress} leveled up! ${previousLevel} -> ${newLevel}`);
      }
    }

    // 7. Mint DIT (Donor Impact Token) si première donation
    if (isFirstDonation) {
      donor.ditTokenId = await this.mintDIT(donorAddress);
    }

    console.log(`[DonationPool] Deposit successful: ${amount} XRP, +${xpGained} XP, Level ${newLevel}`);

    return {
      success: true,
      txHash,
      nftMinted,
      nftTokenId,
      xpGained,
      newLevel,
      poolBalance: this.poolState.totalBalance,
    };
  }

  // ==========================================================================
  // SIMULATE PROFIT - Simuler des profits de trading
  // ==========================================================================

  /**
   * Simuler des profits générés par le trading AI
   *
   * @param profitPercentage - Pourcentage de profit (par défaut 8% annuel = 0.67% mensuel)
   * @returns Montant du profit généré
   *
   * En production, cette fonction serait appelée par le service AI Trading.
   * Pour le hackathon, on simule un profit basé sur le solde du pool.
   */
  async simulateProfit(profitPercentage: number = 0.67): Promise<number> {
    console.log(`[DonationPool] Simulating profit (${profitPercentage}% of pool balance)`);

    // Calculer le profit basé sur le solde actuel
    const profit = (this.poolState.totalBalance * profitPercentage) / 100;

    // Mettre à jour l'état du pool
    this.poolState.totalProfitsGenerated += profit;
    this.poolState.totalBalance += profit;
    this.poolState.lastTradingRun = new Date();

    console.log(`[DonationPool] Profit generated: ${profit.toFixed(2)} XRP`);

    return profit;
  }

  // ==========================================================================
  // DISTRIBUTE PROFITS - Distribuer les profits aux ONG
  // ==========================================================================

  /**
   * Distribuer les profits aux ONG validées
   *
   * @param profitAmount - Montant total à distribuer
   * @returns Résultat de la distribution (succès, montants, txHashes)
   *
   * Processus:
   * 1. Récupérer les ONG validées
   * 2. Calculer la part de chaque ONG (basé sur weight)
   * 3. Envoyer les paiements via XRPL (ou mock)
   * 4. Enregistrer les distributions
   * 5. Mettre à jour les totaux
   */
  async distributeProfits(profitAmount: number): Promise<ProfitDistributionResult> {
    console.log(`[DonationPool] Distributing ${profitAmount} XRP to NGOs`);

    // 1. Récupérer les ONG validées
    const validatedNGOs = Array.from(this.ngos.values()).filter((ngo) => ngo.verified);

    if (validatedNGOs.length === 0) {
      console.warn('[DonationPool] No validated NGOs found');
      return {
        success: false,
        totalProfit: profitAmount,
        distributions: [],
        txHashes: [],
      };
    }

    // 2. Normaliser les poids (s'assurer que la somme = 1)
    const totalWeight = validatedNGOs.reduce((sum, ngo) => sum + ngo.weight, 0);
    const normalizedNGOs = validatedNGOs.map((ngo) => ({
      ...ngo,
      normalizedWeight: ngo.weight / totalWeight,
    }));

    // 3. Distribuer aux ONG
    const distributions: DistributionRecord[] = [];
    const txHashes: string[] = [];

    for (const ngo of normalizedNGOs) {
      const share = profitAmount * ngo.normalizedWeight;

      if (share <= 0) continue;

      try {
        // Envoyer le paiement via XRPL
        const memo = `XRPL Impact Fund - Profit distribution to ${ngo.name}`;
        const tx = await this.xrplClient.sendPayment(ngo.walletAddress, share, memo);

        // Enregistrer la distribution
        const distribution: DistributionRecord = {
          id: `DIST_${Date.now()}_${ngo.id}`,
          ngoId: ngo.id,
          ngoName: ngo.name,
          amount: share,
          txHash: tx.hash,
          timestamp: new Date(),
        };

        distributions.push(distribution);
        txHashes.push(tx.hash);

        // Mettre à jour le total reçu par l'ONG
        ngo.totalReceived += share;
        this.ngos.set(ngo.id, ngo);

        console.log(`[DonationPool] Distributed ${share.toFixed(2)} XRP to ${ngo.name}`);
      } catch (error) {
        console.error(`[DonationPool] Failed to distribute to ${ngo.name}:`, error);
      }
    }

    // 4. Mettre à jour les totaux du pool
    const totalDistributed = distributions.reduce((sum, d) => sum + d.amount, 0);
    this.poolState.totalDistributed += totalDistributed;
    this.poolState.totalBalance -= totalDistributed;

    console.log(`[DonationPool] Distribution complete: ${totalDistributed.toFixed(2)} XRP sent to ${distributions.length} NGOs`);

    return {
      success: true,
      totalProfit: profitAmount,
      distributions,
      txHashes,
    };
  }

  // ==========================================================================
  // GETTERS
  // ==========================================================================

  /**
   * Obtenir l'état actuel du pool
   */
  getPoolState(): PoolState {
    return { ...this.poolState };
  }

  /**
   * Obtenir les informations d'un donateur
   */
  getDonor(address: string): DonorInfo | undefined {
    return this.donors.get(address);
  }

  /**
   * Obtenir toutes les ONG
   */
  getAllNGOs(): NGO[] {
    return Array.from(this.ngos.values());
  }

  /**
   * Obtenir les ONG validées
   */
  getValidatedNGOs(): NGO[] {
    return Array.from(this.ngos.values()).filter((ngo) => ngo.verified);
  }

  /**
   * Ajouter ou mettre à jour une ONG
   */
  upsertNGO(ngo: NGO): void {
    this.ngos.set(ngo.id, ngo);
    console.log(`[DonationPool] NGO ${ngo.name} ${this.ngos.has(ngo.id) ? 'updated' : 'added'}`);
  }

  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================

  /**
   * Mint Impact NFT pour un donateur
   * En mode MOCK, génère juste un tokenId fictif
   */
  private async mintImpactNFT(donorAddress: string, level: number): Promise<string> {
    if (this.xrplClient.isMockMode()) {
      const tokenId = `IMPACT_NFT_${donorAddress}_${Date.now()}`;
      console.log(`[DonationPool] MOCK: Minted Impact NFT for ${donorAddress}: ${tokenId}`);
      return tokenId;
    }

    // En mode LIVE, on utiliserait xrpl.NFTokenMint
    // Pour l'instant, retourne un mock
    return `NFT_${donorAddress}_${level}`;
  }

  /**
   * Mint DIT (Donor Impact Token) - Soulbound
   * En mode MOCK, génère juste un tokenId fictif
   */
  private async mintDIT(donorAddress: string): Promise<string> {
    if (this.xrplClient.isMockMode()) {
      const tokenId = `DIT_${donorAddress}_${Date.now()}`;
      console.log(`[DonationPool] MOCK: Minted DIT (soulbound) for ${donorAddress}: ${tokenId}`);
      return tokenId;
    }

    // En mode LIVE, on utiliserait un token soulbound custom
    return `DIT_${donorAddress}`;
  }

  /**
   * Initialiser des ONG par défaut pour le mode MOCK
   */
  private initializeMockNGOs(): void {
    const mockNGOs: NGO[] = [
      {
        id: 'ngo-001',
        name: 'Reforestation International',
        walletAddress: this.xrplClient.isMockMode()
          ? 'rMockNGO1ReforestationXXXXXXXXX'
          : 'rNGO1RealAddress123',
        category: 0, // NGOCategory.CLIMATE
        impactScore: 95,
        weight: 0.3,
        totalReceived: 0,
        verified: true,
        certifications: ['UN SDG Partner', 'Gold Standard Certified'],
        website: 'https://reforest-intl.org',
        description: 'Global reforestation and carbon offset projects',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ngo-002',
        name: 'Clean Water Project',
        walletAddress: this.xrplClient.isMockMode() ? 'rMockNGO2CleanWaterXXXXXXXXXX' : 'rNGO2RealAddress123',
        category: 3, // NGOCategory.WATER
        impactScore: 92,
        weight: 0.25,
        totalReceived: 0,
        verified: true,
        certifications: ['GiveWell Recommended', 'Charity Navigator 4-Star'],
        website: 'https://cleanwater.org',
        description: 'Providing access to clean water in developing countries',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ngo-003',
        name: 'Education for All',
        walletAddress: this.xrplClient.isMockMode()
          ? 'rMockNGO3EducationXXXXXXXXXXX'
          : 'rNGO3RealAddress123',
        category: 2, // NGOCategory.EDUCATION
        impactScore: 90,
        weight: 0.25,
        totalReceived: 0,
        verified: true,
        certifications: ['UN SDG Partner'],
        website: 'https://educationforall.org',
        description: 'Providing quality education to underserved communities',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ngo-004',
        name: 'Global Health Initiative',
        walletAddress: this.xrplClient.isMockMode()
          ? 'rMockNGO4HealthXXXXXXXXXXXXXX'
          : 'rNGO4RealAddress123',
        category: 1, // NGOCategory.HEALTH
        impactScore: 88,
        weight: 0.2,
        totalReceived: 0,
        verified: true,
        certifications: ['GiveWell Recommended'],
        website: 'https://globalhealthinit.org',
        description: 'Improving healthcare access in remote regions',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockNGOs.forEach((ngo) => this.ngos.set(ngo.id, ngo));
    console.log(`[DonationPool] Initialized ${mockNGOs.length} mock NGOs`);
  }
}

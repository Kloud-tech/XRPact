/**
 * ═══════════════════════════════════════════════════════════════════════════
 * XRPL SERVICE - MODULE COMPLET
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Service unifié pour toutes les opérations XRPL avec:
 * ✅ Envoi/réception de paiements XRPL
 * ✅ Lecture de soldes XRPL
 * ✅ Enregistrement des donations en base
 * ✅ Calcul mock des profits (IA trading simulé)
 * ✅ Redistribution automatique aux ONG
 * ✅ Mode Emergency Redistribution avec gouvernance
 * ✅ Logging détaillé et vérification
 * ✅ Support MOCK et LIVE
 *
 * @author XRPact Hack For Good Team
 * @version 2.0.0
 */

import { Client, Wallet, Payment, dropsToXrp, xrpToDrops } from 'xrpl';
import { XRPLClientService } from '../modules/xrpl/services/xrpl-client.service';
import { DonationPoolService } from '../modules/xrpl/services/donation-pool.service';
import { EmergencyFund } from '../core/domain/emergency-fund.entity';

// ═══════════════════════════════════════════════════════════════════════════
// INTERFACES & TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Configuration du service XRPL
 */
export interface XRPLServiceConfig {
  network: 'mock' | 'testnet' | 'mainnet';
  websocketUrl?: string;
  poolWalletSeed?: string;
  poolWalletAddress: string;
  mockMode: boolean;
  enableLogging: boolean;
  emergencyThreshold: number; // Seuil de votes pour activer emergency (%)
}

/**
 * Résultat d'une transaction XRPL
 */
export interface TransactionResult {
  success: boolean;
  txHash: string;
  amount: number;
  from: string;
  to: string;
  timestamp: Date;
  validated: boolean;
  memo?: string;
}

/**
 * Résultat d'une donation
 */
export interface DonationResult {
  success: boolean;
  txHash: string;
  donorAddress: string;
  amount: number;
  xpGained: number;
  newLevel: number;
  nftMinted: boolean;
  nftTokenId?: string;
  ditTokenId?: string;
  poolBalance: number;
}

/**
 * Résultat du calcul de profit
 */
export interface ProfitCalculation {
  profitAmount: number;
  profitPercentage: number;
  poolBalanceBefore: number;
  poolBalanceAfter: number;
  timestamp: Date;
}

/**
 * Résultat de redistribution
 */
export interface RedistributionResult {
  success: boolean;
  totalAmount: number;
  ngoCount: number;
  distributions: Array<{
    ngoId: string;
    ngoName: string;
    amount: number;
    txHash: string;
    category: string;
  }>;
  timestamp: Date;
}

/**
 * Résultat d'urgence
 */
export interface EmergencyRedistributionResult {
  success: boolean;
  emergencyId: string;
  reason: string;
  totalAmount: number;
  affectedNGOs: string[];
  txHashes: string[];
  approvalVotes: number;
  requiredVotes: number;
  timestamp: Date;
}

/**
 * Log d'opération
 */
interface OperationLog {
  operation: string;
  success: boolean;
  details: any;
  timestamp: Date;
  duration: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export class XRPLService {
  private xrplClient: XRPLClientService;
  private poolService: DonationPoolService;
  private config: XRPLServiceConfig;
  private operationLogs: OperationLog[] = [];
  private emergencyFunds: Map<string, EmergencyFund> = new Map();

  constructor(config?: Partial<XRPLServiceConfig>) {
    // Configuration par défaut
    this.config = {
      network: (process.env.XRPL_NETWORK as any) || 'mock',
      websocketUrl: process.env.XRPL_WEBSOCKET_URL || 'wss://s.altnet.rippletest.net:51233',
      poolWalletSeed: process.env.XRPL_POOL_WALLET_SEED,
      poolWalletAddress: process.env.XRPL_POOL_WALLET_ADDRESS || 'rMockPoolWallet123',
      mockMode: process.env.XRPL_NETWORK === 'mock',
      enableLogging: process.env.ENABLE_LOGGING !== 'false',
      emergencyThreshold: 20, // 20% des votes requis
      ...config,
    };

    // Initialiser les services
    this.xrplClient = new XRPLClientService();
    this.poolService = new DonationPoolService(this.xrplClient);

    this.log('XRPLService', 'Initialized', {
      mode: this.config.mockMode ? 'MOCK' : 'LIVE',
      network: this.config.network,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. CONNEXION & INITIALISATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Initialiser la connexion au réseau XRPL
   */
  async initialize(): Promise<void> {
    const startTime = Date.now();

    try {
      await this.xrplClient.connect();

      this.log('initialize', 'Connected to XRPL', {
        poolAddress: this.xrplClient.getPoolWalletAddress(),
      });
    } catch (error) {
      this.log('initialize', 'Connection failed', { error: error.message }, false);
      throw error;
    } finally {
      this.logOperation('initialize', true, {}, Date.now() - startTime);
    }
  }

  /**
   * Fermer la connexion
   */
  async shutdown(): Promise<void> {
    await this.xrplClient.disconnect();
    this.log('shutdown', 'Disconnected from XRPL', {});
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. LECTURE DE SOLDE XRPL
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Lire le solde d'une adresse XRPL
   *
   * @param address - Adresse XRPL (format: rXXXXXXX...)
   * @returns Solde en XRP
   */
  async getBalance(address: string): Promise<number> {
    const startTime = Date.now();

    try {
      this.validateAddress(address);

      const balance = await this.xrplClient.getBalance(address);

      this.log('getBalance', 'Balance retrieved', {
        address,
        balance: `${balance.toFixed(2)} XRP`,
      });

      this.logOperation('getBalance', true, { address, balance }, Date.now() - startTime);

      return balance;
    } catch (error) {
      this.log('getBalance', 'Failed to get balance', { address, error: error.message }, false);
      throw error;
    }
  }

  /**
   * Obtenir le solde du pool de donations
   */
  async getPoolBalance(): Promise<number> {
    const poolAddress = this.xrplClient.getPoolWalletAddress();
    return this.getBalance(poolAddress);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. ENVOI DE DÉPÔT XRPL (DONATION)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Enregistrer une donation dans le système
   *
   * Processus complet:
   * 1. Valider l'adresse et le montant
   * 2. Vérifier la transaction XRPL (ou simuler en MOCK)
   * 3. Enregistrer en base de données
   * 4. Calculer et attribuer XP au donateur
   * 5. Mint NFT si premier don ou level up
   * 6. Mint DIT (Donor Impact Token) si premier don
   * 7. Logger toutes les étapes
   *
   * @param donorAddress - Adresse XRPL du donateur
   * @param amount - Montant en XRP
   * @param txHash - Hash de transaction (optionnel en MOCK)
   * @returns Résultat de la donation avec XP, NFT, etc.
   */
  async processDonation(
    donorAddress: string,
    amount: number,
    txHash?: string
  ): Promise<DonationResult> {
    const startTime = Date.now();

    try {
      // 1. Validation
      this.validateAddress(donorAddress);
      if (amount <= 0) {
        throw new Error('Amount must be positive');
      }

      this.log('processDonation', 'Processing donation', {
        donor: donorAddress,
        amount: `${amount} XRP`,
      });

      // 2. Vérifier la transaction XRPL (si txHash fourni)
      if (txHash && !this.config.mockMode) {
        const isValid = await this.xrplClient.verifyTransaction(txHash);
        if (!isValid) {
          throw new Error('Invalid or unvalidated transaction');
        }
      }

      // 3. Enregistrer via le service de pool
      const result = await this.poolService.deposit({
        donorAddress,
        amount,
        txHash: txHash || `MOCK_DONATION_${Date.now()}`,
      });

      // 4. Préparer le résultat
      const donationResult: DonationResult = {
        success: result.success,
        txHash: result.txHash,
        donorAddress,
        amount,
        xpGained: result.xpGained,
        newLevel: result.newLevel,
        nftMinted: result.nftMinted,
        nftTokenId: result.nftTokenId,
        poolBalance: result.poolBalance,
      };

      this.log('processDonation', 'Donation processed successfully', {
        ...donationResult,
        levelUp: result.nftMinted,
      });

      this.logOperation('processDonation', true, donationResult, Date.now() - startTime);

      return donationResult;
    } catch (error) {
      this.log('processDonation', 'Failed to process donation', {
        donor: donorAddress,
        amount,
        error: error.message,
      }, false);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. FONCTION MOCK "CALCUL DU PROFIT"
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Calculer les profits générés par l'algorithme de trading IA (MOCK)
   *
   * Simule les profits basés sur:
   * - Solde actuel du pool
   * - Pourcentage de profit cible (par défaut 8% annuel = 0.67% mensuel)
   * - Volatilité du marché (aléatoire)
   *
   * En production réelle, cette fonction appellerait l'algo de trading IA.
   *
   * @param profitPercentage - Pourcentage de profit (défaut: 0.67% = mensuel)
   * @returns Détails du profit calculé
   */
  async calculateProfit(profitPercentage: number = 0.67): Promise<ProfitCalculation> {
    const startTime = Date.now();

    try {
      this.log('calculateProfit', 'Calculating trading profits', {
        targetPercentage: `${profitPercentage}%`,
      });

      // Récupérer le solde actuel du pool
      const poolStateBefore = this.poolService.getPoolState();
      const balanceBefore = poolStateBefore.totalBalance;

      // Simuler le profit
      const profitAmount = await this.poolService.simulateProfit(profitPercentage);

      // Récupérer le nouveau solde
      const poolStateAfter = this.poolService.getPoolState();
      const balanceAfter = poolStateAfter.totalBalance;

      const result: ProfitCalculation = {
        profitAmount,
        profitPercentage,
        poolBalanceBefore: balanceBefore,
        poolBalanceAfter: balanceAfter,
        timestamp: new Date(),
      };

      this.log('calculateProfit', 'Profit calculated', {
        profit: `${profitAmount.toFixed(2)} XRP`,
        poolBefore: `${balanceBefore.toFixed(2)} XRP`,
        poolAfter: `${balanceAfter.toFixed(2)} XRP`,
      });

      this.logOperation('calculateProfit', true, result, Date.now() - startTime);

      return result;
    } catch (error) {
      this.log('calculateProfit', 'Failed to calculate profit', { error: error.message }, false);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. REDISTRIBUTION AUTOMATIQUE XRPL AUX ONG
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Redistribuer automatiquement les profits aux ONG validées
   *
   * Processus:
   * 1. Récupérer toutes les ONG vérifiées
   * 2. Calculer la part de chaque ONG (basé sur weight + impactScore)
   * 3. Envoyer les paiements XRPL (ou mock)
   * 4. Enregistrer chaque distribution en base
   * 5. Logger tous les envois
   * 6. Vérifier que toutes les transactions sont validées
   *
   * @param profitAmount - Montant total à redistribuer (en XRP)
   * @returns Résultat détaillé de la redistribution
   */
  async redistributeProfits(profitAmount: number): Promise<RedistributionResult> {
    const startTime = Date.now();

    try {
      this.log('redistributeProfits', 'Starting profit redistribution', {
        totalAmount: `${profitAmount.toFixed(2)} XRP`,
      });

      if (profitAmount <= 0) {
        throw new Error('Profit amount must be positive');
      }

      // Distribuer via le service de pool
      const distribution = await this.poolService.distributeProfits(profitAmount);

      if (!distribution.success) {
        throw new Error('Distribution failed');
      }

      // Formatter le résultat
      const result: RedistributionResult = {
        success: true,
        totalAmount: profitAmount,
        ngoCount: distribution.distributions.length,
        distributions: distribution.distributions.map((d) => ({
          ngoId: d.ngoId,
          ngoName: d.ngoName,
          amount: d.amount,
          txHash: d.txHash,
          category: 'Unknown', // Pourrait être enrichi
        })),
        timestamp: new Date(),
      };

      this.log('redistributeProfits', 'Redistribution completed', {
        ngoCount: result.ngoCount,
        totalSent: `${profitAmount.toFixed(2)} XRP`,
        txHashes: distribution.txHashes.slice(0, 3).join(', ') + '...',
      });

      this.logOperation('redistributeProfits', true, result, Date.now() - startTime);

      // Vérifier toutes les transactions
      await this.verifyAllTransactions(distribution.txHashes);

      return result;
    } catch (error) {
      this.log('redistributeProfits', 'Redistribution failed', {
        amount: profitAmount,
        error: error.message,
      }, false);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. MODE EMERGENCY REDISTRIBUTION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Déclencher une redistribution d'urgence avec vote de gouvernance
   *
   * Mode Emergency permet de débloquer des fonds rapidement en cas de:
   * - Catastrophes naturelles
   * - Crises humanitaires urgentes
   * - Besoins médicaux critiques
   *
   * Processus:
   * 1. Créer une demande d'urgence
   * 2. Notifier tous les stakeholders
   * 3. Attendre les votes (ou simuler en MOCK)
   * 4. Si quorum atteint et votes favorables > 50%
   * 5. Débloquer les fonds immédiatement
   * 6. Distribuer aux ONG affectées
   * 7. Logger toutes les actions
   *
   * @param emergency - Informations de l'urgence
   * @returns Résultat de la redistribution d'urgence
   */
  async triggerEmergencyRedistribution(emergency: {
    triggeredBy: string;
    reason: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    amountRequested: number;
    affectedNGOs: string[];
  }): Promise<EmergencyRedistributionResult> {
    const startTime = Date.now();

    try {
      this.log('emergencyRedistribution', '🚨 EMERGENCY TRIGGERED 🚨', {
        severity: emergency.severity.toUpperCase(),
        reason: emergency.reason,
        amount: `${emergency.amountRequested} XRP`,
        affectedNGOs: emergency.affectedNGOs.length,
      });

      // 1. Validation
      this.validateAddress(emergency.triggeredBy);
      if (emergency.amountRequested <= 0) {
        throw new Error('Emergency amount must be positive');
      }
      if (emergency.affectedNGOs.length === 0) {
        throw new Error('At least one affected NGO required');
      }

      // 2. Créer l'emergency fund
      const emergencyId = `emergency_${Date.now()}`;
      const emergencyFund = new EmergencyFund(
        emergencyId,
        emergency.triggeredBy,
        emergency.severity as any,
        emergency.reason,
        emergency.amountRequested,
        emergency.affectedNGOs
      );

      this.emergencyFunds.set(emergencyId, emergencyFund);

      // 3. Simuler les votes en mode MOCK (en production, vrai système de vote)
      let votesFor = 0;
      let votesAgainst = 0;
      const totalVotingPower = 100;

      if (this.config.mockMode) {
        // En MOCK, approuver automatiquement les urgences critiques
        if (emergency.severity === 'critical') {
          votesFor = 80;
          votesAgainst = 20;
        } else {
          votesFor = 60;
          votesAgainst = 40;
        }

        this.log('emergencyRedistribution', 'MOCK: Votes simulated', {
          votesFor,
          votesAgainst,
        });
      }

      // 4. Vérifier le quorum et l'approbation
      const totalVotes = votesFor + votesAgainst;
      const quorumReached = totalVotes >= totalVotingPower * (this.config.emergencyThreshold / 100);
      const approved = votesFor > votesAgainst;

      if (!quorumReached) {
        throw new Error(`Quorum not reached. Need ${this.config.emergencyThreshold}%, got ${(totalVotes / totalVotingPower) * 100}%`);
      }

      if (!approved) {
        throw new Error(`Emergency rejected. Votes: ${votesFor} for, ${votesAgainst} against`);
      }

      this.log('emergencyRedistribution', '✅ Emergency APPROVED', {
        votesFor,
        votesAgainst,
        approval: `${((votesFor / totalVotes) * 100).toFixed(1)}%`,
      });

      // 5. Distribuer aux ONG affectées
      const txHashes: string[] = [];
      const validatedNGOs = this.poolService.getValidatedNGOs();
      const affectedNGOs = validatedNGOs.filter((ngo) =>
        emergency.affectedNGOs.includes(ngo.id)
      );

      if (affectedNGOs.length === 0) {
        throw new Error('No validated NGOs found in affected list');
      }

      // Répartir équitablement entre les ONG affectées
      const amountPerNGO = emergency.amountRequested / affectedNGOs.length;

      for (const ngo of affectedNGOs) {
        try {
          const memo = `EMERGENCY: ${emergency.reason.substring(0, 50)}`;
          const tx = await this.xrplClient.sendPayment(ngo.walletAddress, amountPerNGO, memo);
          txHashes.push(tx.hash);

          this.log('emergencyRedistribution', `Sent to ${ngo.name}`, {
            amount: `${amountPerNGO.toFixed(2)} XRP`,
            txHash: tx.hash,
          });
        } catch (error) {
          this.log('emergencyRedistribution', `Failed to send to ${ngo.name}`, {
            error: error.message,
          }, false);
        }
      }

      // 6. Résultat
      const result: EmergencyRedistributionResult = {
        success: true,
        emergencyId,
        reason: emergency.reason,
        totalAmount: emergency.amountRequested,
        affectedNGOs: emergency.affectedNGOs,
        txHashes,
        approvalVotes: votesFor,
        requiredVotes: Math.ceil(totalVotingPower * (this.config.emergencyThreshold / 100)),
        timestamp: new Date(),
      };

      this.log('emergencyRedistribution', '🎉 Emergency redistribution COMPLETED', {
        emergencyId,
        totalSent: `${emergency.amountRequested.toFixed(2)} XRP`,
        ngosHelped: affectedNGOs.length,
      });

      this.logOperation('emergencyRedistribution', true, result, Date.now() - startTime);

      return result;
    } catch (error) {
      this.log('emergencyRedistribution', '❌ Emergency redistribution FAILED', {
        reason: emergency.reason,
        error: error.message,
      }, false);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. LOGGING & VÉRIFICATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Vérifier toutes les transactions
   */
  private async verifyAllTransactions(txHashes: string[]): Promise<void> {
    if (this.config.mockMode) {
      this.log('verifyAllTransactions', 'MOCK: All transactions validated', {
        count: txHashes.length,
      });
      return;
    }

    let validCount = 0;
    let invalidCount = 0;

    for (const txHash of txHashes) {
      const isValid = await this.xrplClient.verifyTransaction(txHash);
      if (isValid) {
        validCount++;
      } else {
        invalidCount++;
        this.log('verifyAllTransactions', 'Invalid transaction detected', { txHash }, false);
      }
    }

    this.log('verifyAllTransactions', 'Verification complete', {
      total: txHashes.length,
      valid: validCount,
      invalid: invalidCount,
    });
  }

  /**
   * Valider une adresse XRPL
   */
  private validateAddress(address: string): void {
    // Format XRPL: commence par 'r', 25-35 caractères alphanumériques
    if (!address.match(/^r[a-zA-Z0-9]{24,34}$/)) {
      throw new Error(`Invalid XRPL address: ${address}`);
    }
  }

  /**
   * Logger une opération
   */
  private log(operation: string, message: string, details: any, success: boolean = true): void {
    if (!this.config.enableLogging) return;

    const emoji = success ? '✅' : '❌';
    const timestamp = new Date().toISOString();

    console.log(`${emoji} [XRPLService][${operation}] ${message}`);
    if (Object.keys(details).length > 0) {
      console.log(`   Details:`, details);
    }
  }

  /**
   * Enregistrer une opération dans l'historique
   */
  private logOperation(operation: string, success: boolean, details: any, duration: number): void {
    this.operationLogs.push({
      operation,
      success,
      details,
      timestamp: new Date(),
      duration,
    });

    // Garder seulement les 1000 derniers logs
    if (this.operationLogs.length > 1000) {
      this.operationLogs = this.operationLogs.slice(-1000);
    }
  }

  /**
   * Obtenir les logs d'opérations
   */
  getOperationLogs(limit: number = 100): OperationLog[] {
    return this.operationLogs.slice(-limit);
  }

  /**
   * Obtenir les statistiques du service
   */
  getStatistics(): any {
    const successful = this.operationLogs.filter((log) => log.success).length;
    const failed = this.operationLogs.filter((log) => !log.success).length;

    return {
      totalOperations: this.operationLogs.length,
      successful,
      failed,
      successRate: this.operationLogs.length > 0 ? (successful / this.operationLogs.length) * 100 : 0,
      poolState: this.poolService.getPoolState(),
      emergencies: this.emergencyFunds.size,
      mode: this.config.mockMode ? 'MOCK' : 'LIVE',
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default XRPLService;

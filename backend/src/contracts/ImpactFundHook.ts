/**
 * XRPL Impact Fund - Smart Contract Hook (Pseudo-code/TypeScript representation)
 *
 * This represents the logic that would be implemented as an XRPL Hook or Xahau smart contract.
 * For the hackathon, this serves as a reference implementation.
 */

import { Client, Payment, TxResponse } from 'xrpl';

export interface PoolState {
  totalBalance: number;
  totalDonations: number;
  totalProfitsGenerated: number;
  totalDistributed: number;
  lastTradingRun: Date;
  donors: Map<string, DonorInfo>;
  ngos: Map<string, NGOInfo>;
}

export interface DonorInfo {
  address: string;
  totalDonated: number;
  xp: number;
  level: number;
  nftTokenId?: string;
  ditTokenId?: string;
  firstDonationDate: Date;
  lastDonationDate: Date;
}

export interface NGOInfo {
  id: string;
  name: string;
  walletAddress: string;
  impactScore: number;
  totalReceived: number;
  weight: number; // Distribution weight (0-1)
  verified: boolean;
  category: 'climate' | 'health' | 'education' | 'water' | 'other';
}

export class ImpactFundHook {
  private client: Client;
  private poolWallet: string;
  private state: PoolState;

  constructor(client: Client, poolWallet: string) {
    this.client = client;
    this.poolWallet = poolWallet;
    this.state = this.initializeState();
  }

  private initializeState(): PoolState {
    return {
      totalBalance: 0,
      totalDonations: 0,
      totalProfitsGenerated: 0,
      totalDistributed: 0,
      lastTradingRun: new Date(),
      donors: new Map(),
      ngos: new Map(),
    };
  }

  /**
   * Handle incoming donation
   * Triggered on Payment to pool wallet
   */
  async onDeposit(amount: number, donorAddress: string): Promise<void> {
    console.log(`[HOOK] Deposit received: ${amount} XRP from ${donorAddress}`);

    // Update pool balance
    this.state.totalBalance += amount;
    this.state.totalDonations += amount;

    // Update or create donor info
    let donor = this.state.donors.get(donorAddress);
    if (!donor) {
      donor = {
        address: donorAddress,
        totalDonated: 0,
        xp: 0,
        level: 1,
        firstDonationDate: new Date(),
        lastDonationDate: new Date(),
      };
      this.state.donors.set(donorAddress, donor);
    }

    donor.totalDonated += amount;
    donor.lastDonationDate = new Date();

    // Award XP (1 XRP = 10 XP)
    const xpGained = Math.floor(amount * 10);
    await this.awardXP(donorAddress, xpGained);

    // Mint or evolve Impact NFT
    await this.handleImpactNFT(donorAddress);

    // Mint DIT (Donor Impact Token) if first donation
    if (!donor.ditTokenId) {
      await this.mintDIT(donorAddress);
    }

    // Update leaderboard (handled in backend service)

    // Emit event
    console.log(`[EVENT] DonationReceived: ${amount} XRP from ${donorAddress}`);
  }

  /**
   * Handle profit distribution
   * Triggered by AI trading service when profits are generated
   */
  async onProfitGenerated(profit: number): Promise<void> {
    console.log(`[HOOK] Profit generated: ${profit} XRP`);

    this.state.totalProfitsGenerated += profit;

    // Get validated NGOs from Impact Oracle
    const validatedNGOs = await this.getValidatedNGOs();

    if (validatedNGOs.length === 0) {
      console.warn('[HOOK] No validated NGOs found. Profit held in pool.');
      return;
    }

    // Distribute to NGOs based on weight
    for (const ngo of validatedNGOs) {
      const share = profit * ngo.weight;

      if (share > 0) {
        await this.transferToNGO(ngo.walletAddress, share);

        // Update NGO stats
        ngo.totalReceived += share;
        this.state.totalDistributed += share;

        // Create Donation Story (handled in backend service)
        await this.createDonationStory(ngo, share);

        console.log(`[EVENT] ProfitDistributed: ${share} XRP to ${ngo.name}`);
      }
    }

    // Award XP to all donors (participation bonus)
    for (const [address, donor] of this.state.donors) {
      await this.awardXP(address, 5); // +5 XP for being part of the pool
    }
  }

  /**
   * Handle governance vote
   * Requires DIT token
   */
  async onGovernanceVote(donorAddress: string, ngoId: string): Promise<void> {
    const donor = this.state.donors.get(donorAddress);

    if (!donor || !donor.ditTokenId) {
      throw new Error('Donor does not have DIT token (governance rights)');
    }

    // Vote weight = donor XP
    const voteWeight = donor.xp;

    // Update NGO weight (simplified - real implementation would be more complex)
    const ngo = this.state.ngos.get(ngoId);
    if (ngo) {
      // Voting logic would adjust weights
      console.log(`[VOTE] ${donorAddress} voted for ${ngo.name} with weight ${voteWeight}`);
    }

    // Award XP for governance participation
    await this.awardXP(donorAddress, 10);

    console.log(`[EVENT] GovernanceVote: ${donorAddress} -> ${ngoId}`);
  }

  /**
   * Award XP and handle level-up
   */
  private async awardXP(donorAddress: string, xp: number): Promise<void> {
    const donor = this.state.donors.get(donorAddress);
    if (!donor) return;

    donor.xp += xp;

    // Level calculation: Level = floor(sqrt(XP / 100))
    const newLevel = Math.floor(Math.sqrt(donor.xp / 100)) + 1;

    if (newLevel > donor.level) {
      donor.level = newLevel;
      console.log(`[LEVEL UP] ${donorAddress} reached level ${newLevel}`);

      // Evolve NFT on level up
      await this.evolveNFT(donorAddress);
    }
  }

  /**
   * Mint or evolve Impact NFT
   */
  private async handleImpactNFT(donorAddress: string): Promise<void> {
    const donor = this.state.donors.get(donorAddress);
    if (!donor) return;

    if (!donor.nftTokenId) {
      // Mint new NFT
      donor.nftTokenId = await this.mintImpactNFT(donorAddress, donor.level);
      console.log(`[NFT] Minted Impact NFT for ${donorAddress}: ${donor.nftTokenId}`);
    } else {
      // Evolve existing NFT
      await this.evolveNFT(donorAddress);
    }
  }

  /**
   * Mint Impact NFT
   */
  private async mintImpactNFT(donorAddress: string, level: number): Promise<string> {
    // In real implementation, this would call xrpl.NFTokenMint
    const tokenId = `IMPACT_NFT_${donorAddress}_${Date.now()}`;

    // Metadata would include:
    // - Level
    // - Visual attributes (color, shape, aura)
    // - Total donated
    // - XP
    // - Donation count

    return tokenId;
  }

  /**
   * Evolve NFT visual attributes
   */
  private async evolveNFT(donorAddress: string): Promise<void> {
    const donor = this.state.donors.get(donorAddress);
    if (!donor || !donor.nftTokenId) return;

    // Update NFT metadata based on level
    const attributes = this.calculateNFTAttributes(donor);

    console.log(`[NFT] Evolved NFT for ${donorAddress}: Level ${donor.level}, ${attributes.color}`);
  }

  /**
   * Calculate NFT visual attributes based on donor stats
   */
  private calculateNFTAttributes(donor: DonorInfo): {
    color: string;
    shape: string;
    aura: string;
  } {
    const level = donor.level;

    let color = 'bronze';
    let shape = 'circle';
    let aura = 'none';

    if (level >= 10) { color = 'diamond'; aura = 'legendary'; shape = 'star'; }
    else if (level >= 8) { color = 'platinum'; aura = 'epic'; shape = 'hexagon'; }
    else if (level >= 6) { color = 'gold'; aura = 'rare'; shape = 'pentagon'; }
    else if (level >= 4) { color = 'silver'; aura = 'uncommon'; }
    else if (level >= 2) { color = 'bronze'; }

    return { color, shape, aura };
  }

  /**
   * Mint DIT (Donor Impact Token) - Soulbound
   */
  private async mintDIT(donorAddress: string): Promise<void> {
    // In real implementation, this would mint a soulbound token
    const tokenId = `DIT_${donorAddress}_${Date.now()}`;

    const donor = this.state.donors.get(donorAddress);
    if (donor) {
      donor.ditTokenId = tokenId;
      console.log(`[DIT] Minted soulbound token for ${donorAddress}: ${tokenId}`);
    }
  }

  /**
   * Transfer XRP to NGO wallet
   */
  private async transferToNGO(ngoWallet: string, amount: number): Promise<void> {
    // In real implementation, this would execute Payment transaction
    console.log(`[TRANSFER] Sending ${amount} XRP to NGO wallet ${ngoWallet}`);

    // Mock implementation
    // const payment: Payment = {
    //   TransactionType: 'Payment',
    //   Account: this.poolWallet,
    //   Destination: ngoWallet,
    //   Amount: xrpl.xrpToDrops(amount),
    // };
    // await this.client.submitAndWait(payment, { wallet: poolWalletObject });
  }

  /**
   * Get validated NGOs from Impact Oracle
   */
  private async getValidatedNGOs(): Promise<NGOInfo[]> {
    // In real implementation, this would call the Impact Oracle service
    // For now, return mock data from state
    return Array.from(this.state.ngos.values()).filter(ngo => ngo.verified);
  }

  /**
   * Create Donation Story
   */
  private async createDonationStory(ngo: NGOInfo, amount: number): Promise<void> {
    // This would be handled by backend service to create:
    // - Story metadata
    // - QR code
    // - Visual representation
    // - Store in database
    console.log(`[STORY] Created donation story: ${amount} XRP to ${ngo.name}`);
  }

  /**
   * Get pool state (for dashboard)
   */
  getState(): PoolState {
    return this.state;
  }

  /**
   * Add NGO to the pool (admin function)
   */
  async addNGO(ngo: NGOInfo): Promise<void> {
    this.state.ngos.set(ngo.id, ngo);
    console.log(`[NGO] Added ${ngo.name} to pool`);
  }
}

/**
 * Example usage / deployment script
 */
export async function deployImpactFundHook(xrplClient: Client, poolWallet: string) {
  const hook = new ImpactFundHook(xrplClient, poolWallet);

  // Add initial NGOs
  await hook.addNGO({
    id: 'ngo-001',
    name: 'Reforestation International',
    walletAddress: 'rNGO1...',
    impactScore: 95,
    totalReceived: 0,
    weight: 0.3,
    verified: true,
    category: 'climate',
  });

  await hook.addNGO({
    id: 'ngo-002',
    name: 'Clean Water Project',
    walletAddress: 'rNGO2...',
    impactScore: 92,
    totalReceived: 0,
    weight: 0.25,
    verified: true,
    category: 'water',
  });

  await hook.addNGO({
    id: 'ngo-003',
    name: 'Education for All',
    walletAddress: 'rNGO3...',
    impactScore: 90,
    totalReceived: 0,
    weight: 0.25,
    verified: true,
    category: 'education',
  });

  await hook.addNGO({
    id: 'ngo-004',
    name: 'Global Health Initiative',
    walletAddress: 'rNGO4...',
    impactScore: 88,
    totalReceived: 0,
    weight: 0.2,
    verified: true,
    category: 'health',
  });

  console.log('[DEPLOYED] Impact Fund Hook initialized with 4 NGOs');

  return hook;
}

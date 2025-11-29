/**
 * Donor Domain Entity
 * Encapsulates all donor business logic
 */

export class Donor {
  constructor(
    public address: string,
    public totalDonated: number,
    public xp: number,
    public level: number,
    public nftTokenId?: string,
    public ditTokenId?: string,
    public firstDonationDate: Date = new Date(),
    public lastDonationDate: Date = new Date(),
    public donationCount: number = 0
  ) {}

  /**
   * Add a new donation and update donor stats
   * XP Calculation: 1 XRP = 10 XP
   * Level Calculation: floor(sqrt(xp/100)) + 1
   */
  addDonation(amount: number): void {
    const previousLevel = this.level;

    this.totalDonated += amount;
    this.xp += amount * 10; // 1 XRP = 10 XP
    this.level = this.calculateLevel(this.xp);
    this.donationCount++;
    this.lastDonationDate = new Date();

    // First donation
    if (this.donationCount === 1) {
      this.firstDonationDate = new Date();
    }
  }

  /**
   * Calculate level from XP
   * Formula: level = floor(sqrt(xp/100)) + 1
   */
  private calculateLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  /**
   * Check if NFT should evolve based on level change
   * Evolution happens at level milestones: 5, 10, 20, 50
   */
  shouldEvolveNFT(previousLevel: number): boolean {
    if (this.level <= previousLevel) return false;

    const evolutionMilestones = [5, 10, 20, 50];
    return evolutionMilestones.some(
      milestone => this.level >= milestone && previousLevel < milestone
    );
  }

  /**
   * Get NFT tier based on current level
   */
  getNFTTier(): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' {
    if (this.level >= 50) return 'Diamond';
    if (this.level >= 20) return 'Platinum';
    if (this.level >= 10) return 'Gold';
    if (this.level >= 5) return 'Silver';
    return 'Bronze';
  }

  /**
   * Check if donor should receive DIT token (first donation)
   */
  shouldReceiveDIT(): boolean {
    return this.donationCount === 1 && !this.ditTokenId;
  }

  /**
   * Get voting power based on total donated
   */
  getVotingPower(): number {
    return Math.floor(this.totalDonated);
  }

  /**
   * Convert to plain object for API response
   */
  toJSON() {
    return {
      address: this.address,
      totalDonated: this.totalDonated,
      xp: this.xp,
      level: this.level,
      nftTokenId: this.nftTokenId,
      ditTokenId: this.ditTokenId,
      tier: this.getNFTTier(),
      votingPower: this.getVotingPower(),
      firstDonationDate: this.firstDonationDate,
      lastDonationDate: this.lastDonationDate,
      donationCount: this.donationCount,
    };
  }
}

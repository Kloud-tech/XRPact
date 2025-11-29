/**
 * NGO Domain Entity
 * Represents a verified non-governmental organization
 */

export type NGOCategory = 'climate' | 'health' | 'education' | 'water' | 'other';

export class NGO {
  constructor(
    public id: string,
    public name: string,
    public walletAddress: string,
    public category: NGOCategory,
    public impactScore: number,
    public weight: number,
    public totalReceived: number = 0,
    public verified: boolean = false,
    public certifications: string[] = [],
    public website?: string,
    public description?: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  /**
   * Validate NGO data
   */
  validate(): void {
    if (this.impactScore < 0 || this.impactScore > 100) {
      throw new Error('Impact score must be between 0 and 100');
    }

    if (this.weight < 0 || this.weight > 1) {
      throw new Error('Weight must be between 0 and 1');
    }

    if (!this.walletAddress.match(/^r[a-zA-Z0-9]{24,34}$/)) {
      throw new Error('Invalid XRPL wallet address');
    }
  }

  /**
   * Add distributed funds to total received
   */
  addDistribution(amount: number): void {
    this.totalReceived += amount;
    this.updatedAt = new Date();
  }

  /**
   * Update impact score from Oracle
   */
  updateImpactScore(score: number, certifications: string[]): void {
    this.impactScore = score;
    this.certifications = certifications;
    this.verified = score >= 70; // Threshold for verification
    this.updatedAt = new Date();
  }

  /**
   * Check if NGO is eligible for distribution
   */
  isEligibleForDistribution(): boolean {
    return this.verified && this.impactScore >= 70 && this.weight > 0;
  }

  /**
   * Get tier based on impact score
   */
  getTier(): 'Excellent' | 'Good' | 'Fair' | 'Poor' {
    if (this.impactScore >= 90) return 'Excellent';
    if (this.impactScore >= 75) return 'Good';
    if (this.impactScore >= 60) return 'Fair';
    return 'Poor';
  }

  /**
   * Convert to plain object for API response
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      walletAddress: this.walletAddress,
      category: this.category,
      impactScore: this.impactScore,
      weight: this.weight,
      totalReceived: this.totalReceived,
      verified: this.verified,
      certifications: this.certifications,
      tier: this.getTier(),
      website: this.website,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

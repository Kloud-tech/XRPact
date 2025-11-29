/**
 * Emergency Fund Domain Entity
 * Manages emergency fund releases for urgent situations
 */

export type EmergencySeverity = 'low' | 'medium' | 'high' | 'critical';
export type EmergencyStatus = 'pending' | 'approved' | 'distributed' | 'rejected';

export class EmergencyFund {
  constructor(
    public id: string,
    public triggeredBy: string,
    public severity: EmergencySeverity,
    public reason: string,
    public amountRequested: number,
    public affectedNGOs: string[],
    public status: EmergencyStatus = 'pending',
    public votesFor: number = 0,
    public votesAgainst: number = 0,
    public createdAt: Date = new Date(),
    public resolvedAt?: Date
  ) {}

  /**
   * Check if emergency has reached quorum
   * Quorum = 20% of total voting power
   */
  hasQuorum(totalVotingPower: number): boolean {
    const totalVotes = this.votesFor + this.votesAgainst;
    const quorumThreshold = totalVotingPower * 0.2;
    return totalVotes >= quorumThreshold;
  }

  /**
   * Check if emergency is approved
   */
  isApproved(): boolean {
    return this.votesFor > this.votesAgainst;
  }

  /**
   * Check if funds can be distributed
   */
  canDistribute(totalVotingPower: number): boolean {
    return (
      this.status === 'approved' &&
      this.hasQuorum(totalVotingPower) &&
      this.isApproved()
    );
  }

  /**
   * Add a vote
   */
  addVote(votingPower: number, inFavor: boolean): void {
    if (this.status !== 'pending') {
      throw new Error('Cannot vote on resolved emergency');
    }

    if (inFavor) {
      this.votesFor += votingPower;
    } else {
      this.votesAgainst += votingPower;
    }
  }

  /**
   * Approve emergency
   */
  approve(): void {
    if (!this.isApproved()) {
      throw new Error('Emergency does not have majority approval');
    }

    this.status = 'approved';
  }

  /**
   * Reject emergency
   */
  reject(): void {
    this.status = 'rejected';
    this.resolvedAt = new Date();
  }

  /**
   * Mark as distributed
   */
  markDistributed(): void {
    if (this.status !== 'approved') {
      throw new Error('Cannot distribute unapproved emergency');
    }

    this.status = 'distributed';
    this.resolvedAt = new Date();
  }

  /**
   * Get severity multiplier for urgency
   */
  getSeverityMultiplier(): number {
    const multipliers = {
      low: 1.0,
      medium: 1.5,
      high: 2.0,
      critical: 3.0,
    };
    return multipliers[this.severity];
  }

  /**
   * Convert to plain object
   */
  toJSON() {
    return {
      id: this.id,
      triggeredBy: this.triggeredBy,
      severity: this.severity,
      reason: this.reason,
      amountRequested: this.amountRequested,
      affectedNGOs: this.affectedNGOs,
      status: this.status,
      votesFor: this.votesFor,
      votesAgainst: this.votesAgainst,
      severityMultiplier: this.getSeverityMultiplier(),
      createdAt: this.createdAt,
      resolvedAt: this.resolvedAt,
    };
  }
}

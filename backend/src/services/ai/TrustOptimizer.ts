/**
 * AI Trust Optimizer - Mock RL Agent
 *
 * Optimizes validator selection based on:
 * - Geographic proximity
 * - Historical performance
 * - Reputation score
 * - Category specialization
 * - Response time
 *
 * Future: Replace with actual RL model (TensorFlow.js / PyTorch)
 */

interface ValidatorScore {
  validatorId: string;
  validatorName: string;
  overallScore: number;
  proximityScore: number;
  reputationScore: number;
  specializationScore: number;
  responseTimeScore: number;
  recommendation: 'HIGHLY_RECOMMENDED' | 'RECOMMENDED' | 'ACCEPTABLE' | 'NOT_RECOMMENDED';
}

interface ProjectContext {
  category: string;
  location: { lat: number; lng: number };
  amount: number;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  riskLevel: number; // 0-100
}

interface ValidatorProfile {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  reputation: number;
  specialties: string[];
  avgResponseTime: number; // hours
  successRate: number; // percentage
  validationsCompleted: number;
}

export class TrustOptimizer {
  private readonly PROXIMITY_WEIGHT = 0.3;
  private readonly REPUTATION_WEIGHT = 0.35;
  private readonly SPECIALIZATION_WEIGHT = 0.2;
  private readonly RESPONSE_TIME_WEIGHT = 0.15;

  /**
   * Mock RL Agent - Selects optimal validators for a project
   *
   * Future implementation:
   * - Use Q-Learning or Policy Gradient
   * - Train on historical validation outcomes
   * - Adjust weights dynamically based on success rate
   */
  async selectOptimalValidators(
    project: ProjectContext,
    availableValidators: ValidatorProfile[],
    requiredCount: number = 3
  ): Promise<ValidatorScore[]> {
    console.log(`[Trust Optimizer] Analyzing ${availableValidators.length} validators for project...`);

    // Score each validator
    const scoredValidators = availableValidators.map(validator =>
      this.scoreValidator(validator, project)
    );

    // Sort by overall score (descending)
    scoredValidators.sort((a, b) => b.overallScore - a.overallScore);

    // Return top N validators
    const selected = scoredValidators.slice(0, requiredCount);

    console.log(`[Trust Optimizer] Selected ${selected.length} validators:`);
    selected.forEach(v => {
      console.log(`  - ${v.validatorName}: ${v.overallScore.toFixed(2)} (${v.recommendation})`);
    });

    return selected;
  }

  /**
   * Score a single validator against project context
   */
  private scoreValidator(validator: ValidatorProfile, project: ProjectContext): ValidatorScore {
    // 1. Proximity Score (0-100)
    const distance = this.calculateDistance(
      validator.location.lat,
      validator.location.lng,
      project.location.lat,
      project.location.lng
    );
    const proximityScore = Math.max(0, 100 - (distance / 10)); // 10km = -1 point

    // 2. Reputation Score (0-100)
    const reputationScore = validator.reputation;

    // 3. Specialization Score (0-100)
    const hasSpecialty = validator.specialties.includes(project.category);
    const specializationScore = hasSpecialty ? 100 : 50;

    // 4. Response Time Score (0-100)
    const urgencyMultiplier = project.urgency === 'HIGH' ? 2 : project.urgency === 'MEDIUM' ? 1.5 : 1;
    const responseTimeScore = Math.max(0, 100 - (validator.avgResponseTime * urgencyMultiplier));

    // Calculate weighted overall score
    const overallScore = (
      proximityScore * this.PROXIMITY_WEIGHT +
      reputationScore * this.REPUTATION_WEIGHT +
      specializationScore * this.SPECIALIZATION_WEIGHT +
      responseTimeScore * this.RESPONSE_TIME_WEIGHT
    );

    // Determine recommendation level
    let recommendation: ValidatorScore['recommendation'];
    if (overallScore >= 85) recommendation = 'HIGHLY_RECOMMENDED';
    else if (overallScore >= 70) recommendation = 'RECOMMENDED';
    else if (overallScore >= 50) recommendation = 'ACCEPTABLE';
    else recommendation = 'NOT_RECOMMENDED';

    return {
      validatorId: validator.id,
      validatorName: validator.name,
      overallScore,
      proximityScore,
      reputationScore,
      specializationScore,
      responseTimeScore,
      recommendation
    };
  }

  /**
   * Haversine formula - Calculate distance between two GPS points
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Mock RL Training Loop (Future implementation)
   *
   * Would use historical data:
   * - State: Project context + Validator profiles
   * - Action: Selected validator set
   * - Reward: +1 if validation successful, -1 if failed, -0.5 if timeout
   */
  async trainModel(historicalData: any[]): Promise<void> {
    console.log('[Trust Optimizer] Mock training - Replace with actual RL in production');
    console.log(`[Trust Optimizer] Training data size: ${historicalData.length} samples`);

    // Future: Implement Q-Learning or Policy Gradient
    // For now, return immediately
  }

  /**
   * Predict project success probability given selected validators
   */
  predictSuccessProbability(
    project: ProjectContext,
    selectedValidators: ValidatorScore[]
  ): number {
    if (selectedValidators.length === 0) return 0;

    // Simple average of validator scores
    const avgScore = selectedValidators.reduce((sum, v) => sum + v.overallScore, 0) / selectedValidators.length;

    // Adjust for risk level
    const riskPenalty = project.riskLevel * 0.3; // High risk reduces success probability

    // Adjust for amount (larger amounts = more scrutiny needed)
    const amountFactor = Math.min(1, 10000 / project.amount); // Normalize around 10k XRP

    const probability = (avgScore / 100) * amountFactor * (1 - riskPenalty / 100);

    return Math.max(0, Math.min(1, probability)); // Clamp to [0, 1]
  }
}

// Export singleton instance
export const trustOptimizer = new TrustOptimizer();

// Demo usage
// if (require.main === module) {
//   (async () => {
//     console.log('=== AI Trust Optimizer Demo ===\n');
// 
//     const mockProject: ProjectContext = {
//       category: 'Water',
//       location: { lat: 14.4974, lng: -14.4524 }, // Senegal
//       amount: 5000,
//       urgency: 'MEDIUM',
//       riskLevel: 20
//     };
// 
//     const mockValidators: ValidatorProfile[] = [
//       {
//         id: 'VAL_001',
//         name: 'Amadou Diallo',
//         location: { lat: 14.6928, lng: -17.4467 }, // Dakar
//         reputation: 98,
//         specialties: ['Water', 'Infrastructure'],
//         avgResponseTime: 2,
//         successRate: 97.9,
//         validationsCompleted: 47
//       },
//       {
//         id: 'VAL_002',
//         name: 'Raj Kumar',
//         location: { lat: 12.9716, lng: 77.5946 }, // Bangalore
//         reputation: 94,
//         specialties: ['Education', 'Infrastructure'],
//         avgResponseTime: 4,
//         successRate: 94.7,
//         validationsCompleted: 38
//       },
//       {
//         id: 'VAL_003',
//         name: 'Fatou Sow',
//         location: { lat: 14.7645, lng: -17.3660 }, // Near Dakar
//         reputation: 95,
//         specialties: ['Water', 'Health'],
//         avgResponseTime: 1.5,
//         successRate: 95.2,
//         validationsCompleted: 42
//       },
//       {
//         id: 'VAL_004',
//         name: 'Carlos Silva',
//         location: { lat: -3.4653, lng: -62.2159 }, // Brazil
//         reputation: 91,
//         specialties: ['Climate', 'Infrastructure'],
//         avgResponseTime: 3,
//         successRate: 93.1,
//         validationsCompleted: 29
//       }
//     ];
// 
//     const optimizer = new TrustOptimizer();
//     const selected = await optimizer.selectOptimalValidators(mockProject, mockValidators, 3);
// 
//     console.log('\n=== Selected Validators ===');
//     selected.forEach((v, i) => {
//       console.log(`\n${i + 1}. ${v.validatorName}`);
//       console.log(`   Overall Score: ${v.overallScore.toFixed(2)}/100`);
//       console.log(`   - Proximity: ${v.proximityScore.toFixed(1)}`);
//       console.log(`   - Reputation: ${v.reputationScore.toFixed(1)}`);
//       console.log(`   - Specialization: ${v.specializationScore.toFixed(1)}`);
//       console.log(`   - Response Time: ${v.responseTimeScore.toFixed(1)}`);
//       console.log(`   Recommendation: ${v.recommendation}`);
//     });
// 
//     const successProb = optimizer.predictSuccessProbability(mockProject, selected);
//     console.log(`\n=== Success Probability: ${(successProb * 100).toFixed(1)}% ===`);
//   })();
// }

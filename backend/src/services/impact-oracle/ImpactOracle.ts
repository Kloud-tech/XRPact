/**
 * Impact Oracle Service
 *
 * Validates NGO legitimacy and provides Impact Scores
 * Data sources:
 * - UN Data API
 * - OECD Stats
 * - Charity Navigator (mock)
 * - GiveWell (mock)
 */

export interface NGOValidationResult {
  isValid: boolean;
  impactScore: number; // 0-100
  certifications: string[];
  redFlags: string[];
  dataSource: string;
  lastUpdated: Date;
}

export interface NGOData {
  id: string;
  name: string;
  registrationNumber?: string;
  country: string;
  category: 'climate' | 'health' | 'education' | 'water' | 'other';
  website?: string;
}

export class ImpactOracle {
  private cache: Map<string, NGOValidationResult> = new Map();
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    console.log('[Impact Oracle] Initialized');
  }

  /**
   * Validate NGO and calculate Impact Score
   */
  async validateNGO(ngo: NGOData): Promise<NGOValidationResult> {
    // Check cache first
    const cached = this.cache.get(ngo.id);
    if (cached && this.isCacheValid(cached.lastUpdated)) {
      console.log(`[Impact Oracle] Cache hit for ${ngo.name}`);
      return cached;
    }

    console.log(`[Impact Oracle] Validating ${ngo.name}...`);

    // Perform validation checks
    const checks = await Promise.all([
      this.checkRegistration(ngo),
      this.checkFinancialTransparency(ngo),
      this.checkImpactMetrics(ngo),
      this.checkCertifications(ngo),
      this.scanForRedFlags(ngo),
    ]);

    // Calculate overall score
    const impactScore = this.calculateImpactScore(checks);

    const result: NGOValidationResult = {
      isValid: impactScore >= 60, // Minimum 60/100 to be valid
      impactScore,
      certifications: checks[3].certifications,
      redFlags: checks[4].redFlags,
      dataSource: 'UN Data + OECD + Charity Navigator',
      lastUpdated: new Date(),
    };

    // Cache result
    this.cache.set(ngo.id, result);

    console.log(`[Impact Oracle] ${ngo.name}: ${result.isValid ? 'VALID' : 'INVALID'} (Score: ${impactScore}/100)`);

    return result;
  }

  /**
   * Check if NGO is properly registered
   */
  private async checkRegistration(ngo: NGOData): Promise<{ score: number }> {
    // Mock implementation - in production, this would query official registries
    const hasRegistration = !!ngo.registrationNumber;
    const hasWebsite = !!ngo.website;

    let score = 0;
    if (hasRegistration) score += 15;
    if (hasWebsite) score += 10;

    return { score };
  }

  /**
   * Check financial transparency
   */
  private async checkFinancialTransparency(ngo: NGOData): Promise<{ score: number }> {
    // Mock implementation - would check:
    // - Published annual reports
    // - Audited financials
    // - Administrative overhead ratio
    // - Program expense ratio

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock scoring based on category (some categories are harder to track)
    const categoryScores: Record<string, number> = {
      climate: 25,
      health: 23,
      education: 22,
      water: 24,
      other: 18,
    };

    return { score: categoryScores[ngo.category] || 15 };
  }

  /**
   * Check measurable impact metrics
   */
  private async checkImpactMetrics(ngo: NGOData): Promise<{ score: number }> {
    // Mock implementation - would check:
    // - Lives impacted
    // - CO₂ reduced (for climate NGOs)
    // - People educated
    // - Water access provided
    // - ROI on donations

    await new Promise(resolve => setTimeout(resolve, 100));

    // Category-specific impact scoring
    const impactMultipliers: Record<string, number> = {
      climate: 1.2,  // Higher weight for climate action
      health: 1.1,
      education: 1.0,
      water: 1.15,
      other: 0.9,
    };

    const baseScore = 20;
    const multiplier = impactMultipliers[ngo.category] || 1.0;

    return { score: Math.floor(baseScore * multiplier) };
  }

  /**
   * Check for certifications and endorsements
   */
  private async checkCertifications(ngo: NGOData): Promise<{
    score: number;
    certifications: string[];
  }> {
    // Mock implementation - would check:
    // - UN certified partner
    // - B-Corp certification
    // - ISO standards
    // - National charity certifications

    await new Promise(resolve => setTimeout(resolve, 100));

    const mockCertifications: string[] = [];
    let score = 0;

    // Simulate some NGOs having certifications
    const random = Math.random();
    if (random > 0.3) {
      mockCertifications.push('UN SDG Partner');
      score += 8;
    }
    if (random > 0.5) {
      mockCertifications.push('GiveWell Recommended');
      score += 10;
    }
    if (random > 0.7) {
      mockCertifications.push('Charity Navigator 4-Star');
      score += 7;
    }
    if (ngo.category === 'climate' && random > 0.4) {
      mockCertifications.push('Gold Standard Certified');
      score += 10;
    }

    return { score, certifications: mockCertifications };
  }

  /**
   * Scan for red flags
   */
  private async scanForRedFlags(ngo: NGOData): Promise<{
    score: number;
    redFlags: string[];
  }> {
    // Mock implementation - would check:
    // - Legal issues
    // - Fraud reports
    // - Blacklists
    // - Negative news

    await new Promise(resolve => setTimeout(resolve, 100));

    const redFlags: string[] = [];
    let score = 15; // Start with full points, deduct for red flags

    // Simulate occasional red flags
    const random = Math.random();
    if (random < 0.1) {
      redFlags.push('Missing recent financial reports');
      score -= 5;
    }
    if (random < 0.05) {
      redFlags.push('High administrative overhead (>25%)');
      score -= 8;
    }

    return { score, redFlags };
  }

  /**
   * Calculate overall Impact Score
   */
  private calculateImpactScore(
    checks: Array<{ score: number; [key: string]: any }>
  ): number {
    const totalScore = checks.reduce((sum, check) => sum + check.score, 0);
    return Math.min(100, Math.max(0, totalScore));
  }

  /**
   * Check if cached result is still valid
   */
  private isCacheValid(lastUpdated: Date): boolean {
    return Date.now() - lastUpdated.getTime() < this.cacheExpiry;
  }

  /**
   * Get top-rated NGOs by category
   */
  async getTopNGOsByCategory(
    category: NGOData['category'],
    limit = 10
  ): Promise<NGOValidationResult[]> {
    // In production, this would query a database
    // For now, return mock data from cache

    const results = Array.from(this.cache.values())
      .filter(result => result.isValid)
      .sort((a, b) => b.impactScore - a.impactScore)
      .slice(0, limit);

    return results;
  }

  /**
   * Generate Impact Report for NGO
   */
  async generateImpactReport(ngoId: string): Promise<{
    validation: NGOValidationResult;
    breakdown: {
      registration: number;
      transparency: number;
      impact: number;
      certifications: number;
      trustScore: number;
    };
    recommendation: 'Highly Recommended' | 'Recommended' | 'Acceptable' | 'Not Recommended';
  }> {
    const validation = this.cache.get(ngoId);

    if (!validation) {
      throw new Error('NGO not found in cache. Run validation first.');
    }

    // Mock breakdown
    const breakdown = {
      registration: 25,
      transparency: 23,
      impact: 22,
      certifications: 18,
      trustScore: validation.redFlags.length === 0 ? 12 : 5,
    };

    let recommendation: 'Highly Recommended' | 'Recommended' | 'Acceptable' | 'Not Recommended';
    if (validation.impactScore >= 85) recommendation = 'Highly Recommended';
    else if (validation.impactScore >= 75) recommendation = 'Recommended';
    else if (validation.impactScore >= 60) recommendation = 'Acceptable';
    else recommendation = 'Not Recommended';

    return { validation, breakdown, recommendation };
  }

  /**
   * Batch validate multiple NGOs
   */
  async batchValidate(ngos: NGOData[]): Promise<Map<string, NGOValidationResult>> {
    console.log(`[Impact Oracle] Batch validating ${ngos.length} NGOs...`);

    const results = new Map<string, NGOValidationResult>();

    // Process in parallel
    await Promise.all(
      ngos.map(async (ngo) => {
        const result = await this.validateNGO(ngo);
        results.set(ngo.id, result);
      })
    );

    const validCount = Array.from(results.values()).filter(r => r.isValid).length;
    console.log(`[Impact Oracle] ${validCount}/${ngos.length} NGOs validated successfully`);

    return results;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[Impact Oracle] Cache cleared');
  }
}

/**
 * Example usage
 */
export async function runImpactOracleDemo() {
  console.log('[DEMO] Impact Oracle Demo\n');

  const oracle = new ImpactOracle();

  const testNGOs: NGOData[] = [
    {
      id: 'ngo-001',
      name: 'Reforestation International',
      registrationNumber: 'UN-RF-2019-001',
      country: 'Global',
      category: 'climate',
      website: 'https://reforest-intl.org',
    },
    {
      id: 'ngo-002',
      name: 'Clean Water Project',
      registrationNumber: 'OECD-CW-2020-042',
      country: 'Kenya',
      category: 'water',
      website: 'https://cleanwater.ke',
    },
    {
      id: 'ngo-003',
      name: 'Education for All',
      country: 'India',
      category: 'education',
    },
  ];

  // Validate NGOs
  const results = await oracle.batchValidate(testNGOs);

  console.log('\n[RESULTS] Validation Results:');
  for (const [id, result] of results) {
    const ngo = testNGOs.find(n => n.id === id);
    console.log(`\n${ngo?.name}:`);
    console.log(`  Valid: ${result.isValid ? 'YES' : 'NO'}`);
    console.log(`  Impact Score: ${result.impactScore}/100`);
    console.log(`  Certifications: ${result.certifications.join(', ') || 'None'}`);
    console.log(`  Red Flags: ${result.redFlags.join(', ') || 'None'}`);
  }

  // Generate detailed report for top NGO
  const topNGO = testNGOs[0];
  const report = await oracle.generateImpactReport(topNGO.id);

  console.log(`\n[REPORT] Detailed Report for ${topNGO.name}:`);
  console.log(`  Recommendation: ${report.recommendation}`);
  console.log(`  Breakdown:`);
  console.log(`    Registration: ${report.breakdown.registration}/25`);
  console.log(`    Transparency: ${report.breakdown.transparency}/25`);
  console.log(`    Impact: ${report.breakdown.impact}/25`);
  console.log(`    Certifications: ${report.breakdown.certifications}/25`);
  console.log(`    Trust Score: ${report.breakdown.trustScore}/15`);
}

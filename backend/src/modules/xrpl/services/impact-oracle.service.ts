/**
 * Impact Oracle Service
 *
 * Service de validation des ONG et calcul de scores d'impact.
 * Simule la vérification via des APIs externes (UN, OECD, etc.)
 *
 * En mode MOCK: Toutes les validations sont simulées.
 */

import { NGOValidationRequest, NGOValidationResult } from '../types/xrpl.types';

export class ImpactOracleService {
  private cache: Map<string, NGOValidationResult> = new Map();
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24 heures

  constructor() {
    console.log('[ImpactOracle] Service initialized');
  }

  /**
   * Valider une ONG et calculer son score d'impact
   *
   * @param request - Requête de validation avec infos de l'ONG
   * @returns Résultat de validation avec score et certifications
   *
   * Processus:
   * 1. Vérifier le cache
   * 2. Vérifier l'enregistrement officiel
   * 3. Vérifier la transparence financière
   * 4. Vérifier les métriques d'impact
   * 5. Vérifier les certifications
   * 6. Scanner les red flags
   * 7. Calculer le score final (0-100)
   */
  async validateNGO(request: NGOValidationRequest): Promise<NGOValidationResult> {
    const { ngoId } = request;

    // 1. Vérifier le cache
    const cached = this.cache.get(ngoId);
    if (cached && this.isCacheValid(cached.lastUpdated)) {
      console.log(`[ImpactOracle] Cache hit for NGO ${ngoId}`);
      return cached;
    }

    console.log(`[ImpactOracle] Validating NGO ${ngoId}...`);

    // 2-6. Effectuer les vérifications (simulées)
    const checks = await Promise.all([
      this.checkRegistration(request),
      this.checkFinancialTransparency(request),
      this.checkImpactMetrics(request),
      this.checkCertifications(request),
      this.scanRedFlags(request),
    ]);

    // 7. Calculer le score final
    const impactScore = this.calculateImpactScore(checks);

    const result: NGOValidationResult = {
      isValid: impactScore >= 60, // Minimum 60/100 pour être valide
      impactScore,
      certifications: checks[3].certifications,
      redFlags: checks[4].redFlags,
      dataSource: 'UN Data + OECD + Charity Navigator (simulated)',
      lastUpdated: new Date(),
    };

    // Mettre en cache
    this.cache.set(ngoId, result);

    console.log(
      `[ImpactOracle] NGO ${ngoId}: ${result.isValid ? 'VALID' : 'INVALID'} (Score: ${impactScore}/100)`
    );

    return result;
  }

  /**
   * Obtenir le score d'impact d'une ONG (depuis cache ou nouvelle validation)
   */
  async getImpactScore(ngoId: string): Promise<number> {
    const result = await this.validateNGO({ ngoId });
    return result.impactScore;
  }

  /**
   * Obtenir les top ONG par score
   */
  async getTopNGOs(limit: number = 10): Promise<NGOValidationResult[]> {
    const results = Array.from(this.cache.values())
      .filter((r) => r.isValid)
      .sort((a, b) => b.impactScore - a.impactScore)
      .slice(0, limit);

    return results;
  }

  /**
   * Vider le cache (pour forcer une revalidation)
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[ImpactOracle] Cache cleared');
  }

  // ==========================================================================
  // PRIVATE VALIDATION CHECKS
  // ==========================================================================

  /**
   * Vérifier l'enregistrement officiel de l'ONG
   */
  private async checkRegistration(request: NGOValidationRequest): Promise<{ score: number }> {
    // Simulation: vérifier si l'ONG a un numéro d'enregistrement et un site web
    await this.delay(50);

    const hasRegistration = !!request.registrationNumber;
    const hasWebsite = !!request.website;

    let score = 0;
    if (hasRegistration) score += 15;
    if (hasWebsite) score += 10;

    return { score };
  }

  /**
   * Vérifier la transparence financière
   */
  private async checkFinancialTransparency(
    request: NGOValidationRequest
  ): Promise<{ score: number }> {
    // Simulation: vérifier les rapports financiers, audits, etc.
    await this.delay(50);

    // Mock: score basé sur un facteur aléatoire (entre 15 et 25)
    const score = 15 + Math.floor(Math.random() * 10);

    return { score };
  }

  /**
   * Vérifier les métriques d'impact
   */
  private async checkImpactMetrics(request: NGOValidationRequest): Promise<{ score: number }> {
    // Simulation: vérifier les métriques d'impact (vies impactées, CO2 réduit, etc.)
    await this.delay(50);

    // Mock: score basé sur un facteur aléatoire (entre 15 et 25)
    const score = 15 + Math.floor(Math.random() * 10);

    return { score };
  }

  /**
   * Vérifier les certifications
   */
  private async checkCertifications(
    request: NGOValidationRequest
  ): Promise<{ score: number; certifications: string[] }> {
    // Simulation: vérifier les certifications (UN, GiveWell, Charity Navigator, etc.)
    await this.delay(50);

    const certifications: string[] = [];
    let score = 0;

    // Mock: probabilité d'avoir certaines certifications
    const random = Math.random();

    if (random > 0.3) {
      certifications.push('UN SDG Partner');
      score += 8;
    }

    if (random > 0.5) {
      certifications.push('GiveWell Recommended');
      score += 10;
    }

    if (random > 0.7) {
      certifications.push('Charity Navigator 4-Star');
      score += 7;
    }

    if (request.country && random > 0.6) {
      certifications.push('National Charity Certification');
      score += 5;
    }

    return { score, certifications };
  }

  /**
   * Scanner les red flags (problèmes légaux, fraudes, etc.)
   */
  private async scanRedFlags(
    request: NGOValidationRequest
  ): Promise<{ score: number; redFlags: string[] }> {
    // Simulation: scanner les bases de données de fraudes, problèmes légaux, etc.
    await this.delay(50);

    const redFlags: string[] = [];
    let score = 15; // Commence avec le score maximum

    // Mock: probabilité d'avoir des red flags (rare)
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
   * Calculer le score d'impact final
   */
  private calculateImpactScore(checks: Array<{ score: number; [key: string]: any }>): number {
    const totalScore = checks.reduce((sum, check) => sum + check.score, 0);
    return Math.min(100, Math.max(0, totalScore));
  }

  /**
   * Vérifier si le cache est encore valide
   */
  private isCacheValid(lastUpdated: Date): boolean {
    return Date.now() - lastUpdated.getTime() < this.cacheExpiry;
  }

  /**
   * Utilitaire: délai pour simulation
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

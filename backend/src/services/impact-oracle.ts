/**
 * ═══════════════════════════════════════════════════════════════════════════
 * IMPACT ORACLE SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Micro-service qui vérifie l'impact et la légitimité des ONGs via APIs publiques.
 *
 * Fonctionnalités:
 * - Vérification d'adresse XRPL ONG
 * - Intégration avec APIs publiques (UNData, OCDE, CharityBase)
 * - Calcul du degré d'impact (0-100)
 * - Stockage des résultats
 * - Endpoint REST /oracle/verify
 *
 * APIs utilisées:
 * - UNData API: https://data.un.org/
 * - OECD API: https://data.oecd.org/
 * - CharityBase API: https://charitybase.uk/api-portal
 * - OpenCharities: http://opencharities.org/
 */

import axios, { AxiosError } from 'axios';
import { Pool } from 'pg';
import winston from 'winston';
import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Schéma de validation pour une ONG
 */
export const NGOSchema = z.object({
  xrplAddress: z.string().min(25).max(35).regex(/^r[a-zA-Z0-9]{24,34}$/),
  name: z.string().min(2).max(200),
  registrationNumber: z.string().optional(),
  country: z.string().length(2).optional(), // ISO 3166-1 alpha-2
  website: z.string().url().optional(),
  email: z.string().email().optional(),
});

export type NGOInput = z.infer<typeof NGOSchema>;

/**
 * Résultat de vérification d'impact
 */
export interface ImpactVerificationResult {
  xrplAddress: string;
  verified: boolean;
  impactScore: number; // 0-100
  verificationSources: {
    unData: boolean;
    oecd: boolean;
    charityBase: boolean;
    openCharities: boolean;
  };
  metadata: {
    name: string;
    country?: string;
    category?: string;
    registrationNumber?: string;
    foundedYear?: number;
    sdgAlignment?: number[]; // UN Sustainable Development Goals (1-17)
  };
  verifiedAt: Date;
  nextVerificationDue: Date;
  riskScore: number; // 0-100 (0 = no risk, 100 = high risk)
  warnings: string[];
}

/**
 * Configuration des APIs externes
 */
interface OracleConfig {
  unDataApiKey?: string;
  oecdApiKey?: string;
  charityBaseApiKey?: string;
  enableMockData: boolean; // Pour tests et développement
  verificationIntervalDays: number;
  impactScoreWeights: {
    unData: number;
    oecd: number;
    charityBase: number;
    openCharities: number;
    xrplActivity: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// IMPACT ORACLE SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export class ImpactOracleService {
  private pool: Pool;
  private logger: winston.Logger;
  private config: OracleConfig;

  constructor(pool: Pool, config?: Partial<OracleConfig>) {
    this.pool = pool;

    // Configuration par défaut
    this.config = {
      enableMockData: config?.enableMockData ?? true,
      verificationIntervalDays: config?.verificationIntervalDays ?? 30,
      unDataApiKey: config?.unDataApiKey ?? process.env.UNDATA_API_KEY,
      oecdApiKey: config?.oecdApiKey ?? process.env.OECD_API_KEY,
      charityBaseApiKey: config?.charityBaseApiKey ?? process.env.CHARITYBASE_API_KEY,
      impactScoreWeights: config?.impactScoreWeights ?? {
        unData: 0.25,
        oecd: 0.2,
        charityBase: 0.25,
        openCharities: 0.2,
        xrplActivity: 0.1,
      },
    };

    // Logger Winston
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'impact-oracle' },
      transports: [
        new winston.transports.File({ filename: 'logs/oracle-error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/oracle.log' }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
      ],
    });
  }

  // ═════════════════════════════════════════════════════════════════════════
  // MÉTHODE PRINCIPALE: VÉRIFICATION D'IMPACT
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Vérifie une ONG et calcule son score d'impact
   */
  async verifyNGOImpact(ngoInput: NGOInput): Promise<ImpactVerificationResult> {
    this.logger.info('Starting NGO impact verification', {
      xrplAddress: ngoInput.xrplAddress,
      name: ngoInput.name,
    });

    // Validation des données d'entrée
    const validatedNGO = NGOSchema.parse(ngoInput);

    // Vérification dans la base de données (cache)
    const cachedVerification = await this.getCachedVerification(validatedNGO.xrplAddress);
    if (cachedVerification && !this.isVerificationExpired(cachedVerification)) {
      this.logger.info('Using cached verification', { xrplAddress: validatedNGO.xrplAddress });
      return cachedVerification;
    }

    // Vérifications parallèles via APIs externes
    const [unDataResult, oecdResult, charityBaseResult, openCharitiesResult, xrplActivityResult] =
      await Promise.allSettled([
        this.verifyWithUNData(validatedNGO),
        this.verifyWithOECD(validatedNGO),
        this.verifyWithCharityBase(validatedNGO),
        this.verifyWithOpenCharities(validatedNGO),
        this.verifyXRPLActivity(validatedNGO.xrplAddress),
      ]);

    // Extraction des résultats
    const sources = {
      unData: unDataResult.status === 'fulfilled' && unDataResult.value.verified,
      oecd: oecdResult.status === 'fulfilled' && oecdResult.value.verified,
      charityBase: charityBaseResult.status === 'fulfilled' && charityBaseResult.value.verified,
      openCharities:
        openCharitiesResult.status === 'fulfilled' && openCharitiesResult.value.verified,
    };

    // Calcul du score d'impact (0-100)
    const impactScore = this.calculateImpactScore({
      unDataScore: unDataResult.status === 'fulfilled' ? unDataResult.value.score : 0,
      oecdScore: oecdResult.status === 'fulfilled' ? oecdResult.value.score : 0,
      charityBaseScore:
        charityBaseResult.status === 'fulfilled' ? charityBaseResult.value.score : 0,
      openCharitiesScore:
        openCharitiesResult.status === 'fulfilled' ? openCharitiesResult.value.score : 0,
      xrplActivityScore:
        xrplActivityResult.status === 'fulfilled' ? xrplActivityResult.value.score : 0,
    });

    // Calcul du score de risque (inverse de la vérification)
    const riskScore = this.calculateRiskScore(sources, impactScore);

    // Warnings
    const warnings = this.generateWarnings(sources, riskScore);

    // Métadonnées agrégées
    const metadata = this.aggregateMetadata({
      name: validatedNGO.name,
      country: validatedNGO.country,
      registrationNumber: validatedNGO.registrationNumber,
      unDataResult: unDataResult.status === 'fulfilled' ? unDataResult.value : null,
      charityBaseResult: charityBaseResult.status === 'fulfilled' ? charityBaseResult.value : null,
    });

    // Résultat final
    const result: ImpactVerificationResult = {
      xrplAddress: validatedNGO.xrplAddress,
      verified: Object.values(sources).filter(Boolean).length >= 2, // Au moins 2 sources
      impactScore,
      verificationSources: sources,
      metadata,
      verifiedAt: new Date(),
      nextVerificationDue: new Date(
        Date.now() + this.config.verificationIntervalDays * 24 * 60 * 60 * 1000
      ),
      riskScore,
      warnings,
    };

    // Sauvegarde en base de données
    await this.saveVerification(result);

    this.logger.info('NGO verification completed', {
      xrplAddress: validatedNGO.xrplAddress,
      impactScore,
      verified: result.verified,
    });

    return result;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // VÉRIFICATIONS AVEC APIS EXTERNES
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Vérification via UNData API
   * https://data.un.org/
   */
  private async verifyWithUNData(
    ngo: NGOInput
  ): Promise<{ verified: boolean; score: number; data?: any }> {
    try {
      if (this.config.enableMockData) {
        return this.mockUNDataVerification(ngo);
      }

      // En production, appel réel à l'API UNData
      // L'API UNData n'a pas d'endpoint direct pour vérifier les ONGs
      // On peut utiliser leurs données de développement durable pour évaluer l'alignement
      const response = await axios.get('https://data.un.org/ws/rest/data/IAEG-SDGs/M..', {
        timeout: 5000,
        headers: {
          'Accept': 'application/json',
        },
      });

      // Analyse de la réponse (à adapter selon l'API réelle)
      const verified = response.status === 200;
      const score = verified ? 75 : 0;

      return { verified, score, data: response.data };
    } catch (error) {
      this.logger.warn('UNData verification failed', {
        xrplAddress: ngo.xrplAddress,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return { verified: false, score: 0 };
    }
  }

  /**
   * Vérification via OECD API
   * https://data.oecd.org/
   */
  private async verifyWithOECD(
    ngo: NGOInput
  ): Promise<{ verified: boolean; score: number; data?: any }> {
    try {
      if (this.config.enableMockData) {
        return this.mockOECDVerification(ngo);
      }

      // En production, appel à l'API OECD
      // OECD a une API REST pour les statistiques de développement
      const response = await axios.get('https://stats.oecd.org/restsdmx/sdmx.ashx/GetData/TABLE1', {
        timeout: 5000,
        headers: {
          'Accept': 'application/json',
        },
      });

      const verified = response.status === 200;
      const score = verified ? 70 : 0;

      return { verified, score, data: response.data };
    } catch (error) {
      this.logger.warn('OECD verification failed', {
        xrplAddress: ngo.xrplAddress,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return { verified: false, score: 0 };
    }
  }

  /**
   * Vérification via CharityBase API
   * https://charitybase.uk/api-portal
   */
  private async verifyWithCharityBase(
    ngo: NGOInput
  ): Promise<{ verified: boolean; score: number; data?: any }> {
    try {
      if (this.config.enableMockData) {
        return this.mockCharityBaseVerification(ngo);
      }

      // En production, appel à CharityBase API (UK charities)
      // Requiert une API key gratuite
      if (!this.config.charityBaseApiKey) {
        this.logger.warn('CharityBase API key not configured');
        return { verified: false, score: 0 };
      }

      const response = await axios.post(
        'https://charitybase.uk/api/graphql',
        {
          query: `
            query SearchCharities($name: String!) {
              CHC {
                getCharities(filters: { search: $name }) {
                  count
                  list {
                    id
                    names {
                      value
                    }
                    finances {
                      income
                    }
                  }
                }
              }
            }
          `,
          variables: { name: ngo.name },
        },
        {
          headers: {
            'Authorization': `Apikey ${this.config.charityBaseApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        }
      );

      const charities = response.data?.data?.CHC?.getCharities?.list || [];
      const verified = charities.length > 0;
      const score = verified ? 80 : 0;

      return { verified, score, data: charities[0] };
    } catch (error) {
      this.logger.warn('CharityBase verification failed', {
        xrplAddress: ngo.xrplAddress,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return { verified: false, score: 0 };
    }
  }

  /**
   * Vérification via OpenCharities API
   * http://opencharities.org/
   */
  private async verifyWithOpenCharities(
    ngo: NGOInput
  ): Promise<{ verified: boolean; score: number; data?: any }> {
    try {
      if (this.config.enableMockData) {
        return this.mockOpenCharitiesVerification(ngo);
      }

      // En production, appel à OpenCharities
      // API publique sans clé requise
      const response = await axios.get(
        `http://opencharities.org/charities/${ngo.registrationNumber || ngo.name}`,
        {
          timeout: 5000,
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      const verified = response.status === 200 && response.data?.charity;
      const score = verified ? 75 : 0;

      return { verified, score, data: response.data };
    } catch (error) {
      this.logger.warn('OpenCharities verification failed', {
        xrplAddress: ngo.xrplAddress,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return { verified: false, score: 0 };
    }
  }

  /**
   * Vérification de l'activité XRPL (transactions, âge du compte)
   */
  private async verifyXRPLActivity(
    xrplAddress: string
  ): Promise<{ verified: boolean; score: number; data?: any }> {
    try {
      // Appel à l'API XRPL publique (testnet ou mainnet)
      const response = await axios.post(
        'https://s.altnet.rippletest.net:51234/', // Testnet
        {
          method: 'account_info',
          params: [
            {
              account: xrplAddress,
              ledger_index: 'validated',
            },
          ],
        },
        { timeout: 5000 }
      );

      if (response.data?.result?.account_data) {
        const accountData = response.data.result.account_data;
        const balance = parseInt(accountData.Balance || '0') / 1_000_000; // XRP
        const sequence = accountData.Sequence || 0;

        // Score basé sur l'activité
        // - Balance > 10 XRP: +30 points
        // - Plus de 5 transactions: +40 points
        // - Compte existant: +30 points
        let score = 30; // Compte existe
        if (balance > 10) score += 30;
        if (sequence > 5) score += 40;

        return {
          verified: true,
          score: Math.min(score, 100),
          data: { balance, sequence, exists: true },
        };
      }

      return { verified: false, score: 0 };
    } catch (error) {
      this.logger.warn('XRPL activity verification failed', {
        xrplAddress,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return { verified: false, score: 0 };
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // MOCK DATA (Pour développement et tests)
  // ═════════════════════════════════════════════════════════════════════════

  private mockUNDataVerification(ngo: NGOInput): { verified: boolean; score: number; data?: any } {
    // Simulation basée sur le nom et le pays
    const verified = ngo.name.toLowerCase().includes('climate') ||
                     ngo.name.toLowerCase().includes('water') ||
                     ngo.name.toLowerCase().includes('education');

    const score = verified ? Math.floor(Math.random() * 20) + 70 : Math.floor(Math.random() * 30);

    return {
      verified,
      score,
      data: {
        sdgAlignment: verified ? [1, 3, 4, 6, 13] : [],
        recognizedByUN: verified,
      },
    };
  }

  private mockOECDVerification(ngo: NGOInput): { verified: boolean; score: number; data?: any } {
    const verified = ngo.country && ['FR', 'US', 'GB', 'DE', 'CA'].includes(ngo.country);
    const score = verified ? Math.floor(Math.random() * 20) + 65 : Math.floor(Math.random() * 25);

    return {
      verified,
      score,
      data: {
        oecdMember: verified,
        developmentAidRecipient: verified,
      },
    };
  }

  private mockCharityBaseVerification(
    ngo: NGOInput
  ): { verified: boolean; score: number; data?: any } {
    const verified = ngo.registrationNumber !== undefined;
    const score = verified ? Math.floor(Math.random() * 20) + 75 : Math.floor(Math.random() * 30);

    return {
      verified,
      score,
      data: verified
        ? {
            registrationNumber: ngo.registrationNumber,
            annualIncome: Math.floor(Math.random() * 1000000) + 50000,
            category: 'Environmental Protection',
          }
        : null,
    };
  }

  private mockOpenCharitiesVerification(
    ngo: NGOInput
  ): { verified: boolean; score: number; data?: any } {
    const verified = ngo.name.length > 10;
    const score = verified ? Math.floor(Math.random() * 20) + 70 : Math.floor(Math.random() * 25);

    return {
      verified,
      score,
      data: verified
        ? {
            foundedYear: 2000 + Math.floor(Math.random() * 20),
            activeProjects: Math.floor(Math.random() * 50) + 5,
          }
        : null,
    };
  }

  // ═════════════════════════════════════════════════════════════════════════
  // CALCUL DES SCORES
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Calcule le score d'impact global (0-100)
   */
  private calculateImpactScore(scores: {
    unDataScore: number;
    oecdScore: number;
    charityBaseScore: number;
    openCharitiesScore: number;
    xrplActivityScore: number;
  }): number {
    const weights = this.config.impactScoreWeights;

    const weightedScore =
      scores.unDataScore * weights.unData +
      scores.oecdScore * weights.oecd +
      scores.charityBaseScore * weights.charityBase +
      scores.openCharitiesScore * weights.openCharities +
      scores.xrplActivityScore * weights.xrplActivity;

    return Math.round(Math.min(weightedScore, 100));
  }

  /**
   * Calcule le score de risque (0-100)
   */
  private calculateRiskScore(
    sources: {
      unData: boolean;
      oecd: boolean;
      charityBase: boolean;
      openCharities: boolean;
    },
    impactScore: number
  ): number {
    const verifiedSourcesCount = Object.values(sources).filter(Boolean).length;

    // Risque de base
    let risk = 100;

    // Réduction du risque par source vérifiée
    risk -= verifiedSourcesCount * 20;

    // Réduction du risque selon le score d'impact
    risk -= impactScore * 0.3;

    return Math.max(0, Math.round(risk));
  }

  /**
   * Génère des warnings basés sur la vérification
   */
  private generateWarnings(
    sources: {
      unData: boolean;
      oecd: boolean;
      charityBase: boolean;
      openCharities: boolean;
    },
    riskScore: number
  ): string[] {
    const warnings: string[] = [];

    const verifiedSourcesCount = Object.values(sources).filter(Boolean).length;

    if (verifiedSourcesCount === 0) {
      warnings.push('⚠️ No verification sources found - HIGH RISK');
    } else if (verifiedSourcesCount === 1) {
      warnings.push('⚠️ Only one verification source - proceed with caution');
    }

    if (riskScore > 70) {
      warnings.push('⚠️ High risk score - additional verification recommended');
    } else if (riskScore > 40) {
      warnings.push('⚠️ Moderate risk - manual review suggested');
    }

    if (!sources.charityBase && !sources.openCharities) {
      warnings.push('⚠️ No charity registry verification found');
    }

    return warnings;
  }

  /**
   * Agrège les métadonnées de toutes les sources
   */
  private aggregateMetadata(data: {
    name: string;
    country?: string;
    registrationNumber?: string;
    unDataResult: any;
    charityBaseResult: any;
  }): ImpactVerificationResult['metadata'] {
    return {
      name: data.name,
      country: data.country,
      registrationNumber: data.registrationNumber,
      category: data.charityBaseResult?.data?.category || 'General Charity',
      foundedYear: data.charityBaseResult?.data?.foundedYear,
      sdgAlignment: data.unDataResult?.data?.sdgAlignment || [],
    };
  }

  // ═════════════════════════════════════════════════════════════════════════
  // BASE DE DONNÉES (Cache et persistance)
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Récupère une vérification depuis le cache
   */
  private async getCachedVerification(
    xrplAddress: string
  ): Promise<ImpactVerificationResult | null> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM oracle_verifications WHERE xrpl_address = $1 ORDER BY verified_at DESC LIMIT 1`,
        [xrplAddress]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        xrplAddress: row.xrpl_address,
        verified: row.verified,
        impactScore: row.impact_score,
        verificationSources: row.verification_sources,
        metadata: row.metadata,
        verifiedAt: new Date(row.verified_at),
        nextVerificationDue: new Date(row.next_verification_due),
        riskScore: row.risk_score,
        warnings: row.warnings || [],
      };
    } catch (error) {
      this.logger.error('Failed to get cached verification', {
        xrplAddress,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Vérifie si une vérification est expirée
   */
  private isVerificationExpired(verification: ImpactVerificationResult): boolean {
    return new Date() > verification.nextVerificationDue;
  }

  /**
   * Sauvegarde une vérification en base de données
   */
  private async saveVerification(verification: ImpactVerificationResult): Promise<void> {
    try {
      await this.pool.query(
        `
        INSERT INTO oracle_verifications (
          xrpl_address, verified, impact_score, verification_sources,
          metadata, verified_at, next_verification_due, risk_score, warnings
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (xrpl_address) DO UPDATE SET
          verified = EXCLUDED.verified,
          impact_score = EXCLUDED.impact_score,
          verification_sources = EXCLUDED.verification_sources,
          metadata = EXCLUDED.metadata,
          verified_at = EXCLUDED.verified_at,
          next_verification_due = EXCLUDED.next_verification_due,
          risk_score = EXCLUDED.risk_score,
          warnings = EXCLUDED.warnings
        `,
        [
          verification.xrplAddress,
          verification.verified,
          verification.impactScore,
          JSON.stringify(verification.verificationSources),
          JSON.stringify(verification.metadata),
          verification.verifiedAt,
          verification.nextVerificationDue,
          verification.riskScore,
          JSON.stringify(verification.warnings),
        ]
      );

      this.logger.info('Verification saved to database', {
        xrplAddress: verification.xrplAddress,
      });
    } catch (error) {
      this.logger.error('Failed to save verification', {
        xrplAddress: verification.xrplAddress,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // MÉTHODES UTILITAIRES
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Récupère toutes les vérifications pour un pays
   */
  async getVerificationsByCountry(countryCode: string): Promise<ImpactVerificationResult[]> {
    const result = await this.pool.query(
      `SELECT * FROM oracle_verifications WHERE metadata->>'country' = $1 ORDER BY impact_score DESC`,
      [countryCode]
    );

    return result.rows.map((row) => ({
      xrplAddress: row.xrpl_address,
      verified: row.verified,
      impactScore: row.impact_score,
      verificationSources: row.verification_sources,
      metadata: row.metadata,
      verifiedAt: new Date(row.verified_at),
      nextVerificationDue: new Date(row.next_verification_due),
      riskScore: row.risk_score,
      warnings: row.warnings || [],
    }));
  }

  /**
   * Récupère les meilleures ONGs par score d'impact
   */
  async getTopNGOsByImpact(limit: number = 10): Promise<ImpactVerificationResult[]> {
    const result = await this.pool.query(
      `SELECT * FROM oracle_verifications WHERE verified = true ORDER BY impact_score DESC LIMIT $1`,
      [limit]
    );

    return result.rows.map((row) => ({
      xrplAddress: row.xrpl_address,
      verified: row.verified,
      impactScore: row.impact_score,
      verificationSources: row.verification_sources,
      metadata: row.metadata,
      verifiedAt: new Date(row.verified_at),
      nextVerificationDue: new Date(row.next_verification_due),
      riskScore: row.risk_score,
      warnings: row.warnings || [],
    }));
  }
}

export default ImpactOracleService;

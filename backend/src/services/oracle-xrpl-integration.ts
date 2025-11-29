/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ORACLE + XRPL INTEGRATION
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Intégration entre ImpactOracle et le service XRPL existant
 *
 * Fonctionnalités:
 * - Vérification automatique des ONGs lors de l'enregistrement
 * - Stockage du score d'impact on-chain (via Memo)
 * - Filtrage des donations basé sur le score d'impact
 * - API unifiée
 */

import { Pool } from 'pg';
import { ImpactOracleService, NGOInput } from './impact-oracle';
import { XRPLOnChainStorage } from './xrpl-onchain-storage';
import winston from 'winston';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface NGOWithVerification {
  id: string;
  name: string;
  walletAddress: string;
  country?: string;
  category?: string;
  website?: string;
  email?: string;
  registrationNumber?: string;

  // Données Oracle
  verified: boolean;
  impactScore: number;
  riskScore: number;
  verifiedAt?: Date;
  nextVerificationDue?: Date;
  warnings: string[];

  // Données XRPL
  txHash?: string;
  onChainVerified: boolean;
}

export interface DonationWithImpact {
  donorAddress: string;
  ngoAddress: string;
  amount: number;

  // Données Oracle
  ngoImpactScore: number;
  ngoVerified: boolean;
  impactMultiplier: number; // Multiplicateur de XP basé sur l'impact de l'ONG

  // Résultat
  xpGained: number;
  level: number;
  txHash?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// ORACLE + XRPL INTEGRATION SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export class OracleXRPLIntegration {
  private pool: Pool;
  private oracleService: ImpactOracleService;
  private xrplService: XRPLOnChainStorage;
  private logger: winston.Logger;

  constructor(
    pool: Pool,
    oracleService: ImpactOracleService,
    xrplService: XRPLOnChainStorage
  ) {
    this.pool = pool;
    this.oracleService = oracleService;
    this.xrplService = xrplService;

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'oracle-xrpl-integration' },
      transports: [
        new winston.transports.File({ filename: 'logs/integration.log' }),
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
  // ENREGISTREMENT D'ONG AVEC VÉRIFICATION
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Enregistre une ONG avec vérification Oracle et stockage on-chain
   */
  async registerNGOWithVerification(ngo: NGOInput): Promise<NGOWithVerification> {
    this.logger.info('Registering NGO with verification', {
      xrplAddress: ngo.xrplAddress,
      name: ngo.name,
    });

    try {
      // 1. Vérification via Oracle
      this.logger.info('Step 1: Verifying NGO with Oracle');
      const oracleResult = await this.oracleService.verifyNGOImpact(ngo);

      // 2. Stockage on-chain XRPL
      this.logger.info('Step 2: Storing NGO on-chain');
      const ngoOnChain = {
        id: `ngo_${Date.now()}`,
        name: ngo.name,
        walletAddress: ngo.xrplAddress,
        impactScore: oracleResult.impactScore,
        verified: oracleResult.verified,
        country: ngo.country,
        category: oracleResult.metadata.category,
        sdgAlignment: oracleResult.metadata.sdgAlignment,
        registrationNumber: ngo.registrationNumber,
      };

      const txHash = await this.xrplService.saveNGOOnChain(ngoOnChain);

      // 3. Stockage en base de données PostgreSQL (cache + référence)
      this.logger.info('Step 3: Storing NGO in database');
      await this.saveNGOToDatabase({
        ...ngoOnChain,
        txHash,
        riskScore: oracleResult.riskScore,
        verifiedAt: oracleResult.verifiedAt,
        nextVerificationDue: oracleResult.nextVerificationDue,
        warnings: oracleResult.warnings,
      });

      const result: NGOWithVerification = {
        id: ngoOnChain.id,
        name: ngo.name,
        walletAddress: ngo.xrplAddress,
        country: ngo.country,
        category: oracleResult.metadata.category,
        website: ngo.website,
        email: ngo.email,
        registrationNumber: ngo.registrationNumber,
        verified: oracleResult.verified,
        impactScore: oracleResult.impactScore,
        riskScore: oracleResult.riskScore,
        verifiedAt: oracleResult.verifiedAt,
        nextVerificationDue: oracleResult.nextVerificationDue,
        warnings: oracleResult.warnings,
        txHash,
        onChainVerified: true,
      };

      this.logger.info('NGO registration completed', {
        xrplAddress: ngo.xrplAddress,
        impactScore: oracleResult.impactScore,
        verified: oracleResult.verified,
        txHash,
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to register NGO', {
        xrplAddress: ngo.xrplAddress,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Sauvegarde l'ONG en base de données
   */
  private async saveNGOToDatabase(ngo: any): Promise<void> {
    await this.pool.query(
      `
      INSERT INTO ngos_verified (
        id, name, wallet_address, country, category,
        impact_score, risk_score, verified, tx_hash,
        verified_at, next_verification_due, warnings,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (wallet_address) DO UPDATE SET
        impact_score = EXCLUDED.impact_score,
        risk_score = EXCLUDED.risk_score,
        verified = EXCLUDED.verified,
        verified_at = EXCLUDED.verified_at,
        next_verification_due = EXCLUDED.next_verification_due,
        warnings = EXCLUDED.warnings,
        updated_at = CURRENT_TIMESTAMP
      `,
      [
        ngo.id,
        ngo.name,
        ngo.walletAddress,
        ngo.country,
        ngo.category,
        ngo.impactScore,
        ngo.riskScore,
        ngo.verified,
        ngo.txHash,
        ngo.verifiedAt,
        ngo.nextVerificationDue,
        JSON.stringify(ngo.warnings),
        new Date(),
      ]
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // DONATION AVEC IMPACT SCORE
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Traite une donation en tenant compte du score d'impact de l'ONG
   */
  async processDonationWithImpact(
    donorAddress: string,
    ngoAddress: string,
    amount: number
  ): Promise<DonationWithImpact> {
    this.logger.info('Processing donation with impact calculation', {
      donorAddress,
      ngoAddress,
      amount,
    });

    try {
      // 1. Récupérer le score d'impact de l'ONG
      const ngo = await this.getNGOByAddress(ngoAddress);

      if (!ngo) {
        throw new Error(`NGO not found: ${ngoAddress}`);
      }

      if (!ngo.verified) {
        this.logger.warn('Donation to unverified NGO', {
          ngoAddress,
          warnings: ngo.warnings,
        });
      }

      // 2. Calculer le multiplicateur d'impact
      // - Score 90-100: 2x XP
      // - Score 70-89: 1.5x XP
      // - Score 50-69: 1.2x XP
      // - Score 30-49: 1x XP
      // - Score 0-29: 0.5x XP (pénalité)
      const impactMultiplier = this.calculateImpactMultiplier(ngo.impactScore);

      // 3. Calculer XP et level
      const baseXP = amount * 10; // 1 XRP = 10 XP
      const xpGained = Math.floor(baseXP * impactMultiplier);
      const level = this.calculateLevel(xpGained);

      // 4. Créer la donation on-chain
      const donationData = {
        donorAddress,
        ngoAddress,
        amount,
        xpGained,
        level,
        ngoImpactScore: ngo.impactScore,
        impactMultiplier,
        timestamp: Date.now(),
      };

      const txHash = await this.xrplService.saveDonationWithMemo(donationData);

      // 5. Sauvegarder en base de données
      await this.saveDonationToDatabase({
        ...donationData,
        txHash,
        ngoVerified: ngo.verified,
      });

      const result: DonationWithImpact = {
        donorAddress,
        ngoAddress,
        amount,
        ngoImpactScore: ngo.impactScore,
        ngoVerified: ngo.verified,
        impactMultiplier,
        xpGained,
        level,
        txHash,
      };

      this.logger.info('Donation processed successfully', {
        donorAddress,
        ngoAddress,
        amount,
        xpGained,
        impactMultiplier,
        txHash,
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to process donation', {
        donorAddress,
        ngoAddress,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Calcule le multiplicateur d'impact basé sur le score
   */
  private calculateImpactMultiplier(impactScore: number): number {
    if (impactScore >= 90) return 2.0;
    if (impactScore >= 70) return 1.5;
    if (impactScore >= 50) return 1.2;
    if (impactScore >= 30) return 1.0;
    return 0.5; // Pénalité pour faible impact
  }

  /**
   * Calcule le level basé sur XP (formule simple)
   */
  private calculateLevel(xp: number): number {
    // Level = sqrt(XP / 100)
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  /**
   * Sauvegarde la donation en base de données
   */
  private async saveDonationToDatabase(donation: any): Promise<void> {
    await this.pool.query(
      `
      INSERT INTO donations_with_impact (
        donor_address, ngo_address, amount, xp_gained, level,
        ngo_impact_score, ngo_verified, impact_multiplier,
        tx_hash, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
      [
        donation.donorAddress,
        donation.ngoAddress,
        donation.amount,
        donation.xpGained,
        donation.level,
        donation.ngoImpactScore,
        donation.ngoVerified,
        donation.impactMultiplier,
        donation.txHash,
        new Date(),
      ]
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // QUERIES
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Récupère une ONG par adresse XRPL
   */
  async getNGOByAddress(walletAddress: string): Promise<NGOWithVerification | null> {
    const result = await this.pool.query(
      'SELECT * FROM ngos_verified WHERE wallet_address = $1',
      [walletAddress]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      walletAddress: row.wallet_address,
      country: row.country,
      category: row.category,
      website: row.website,
      email: row.email,
      registrationNumber: row.registration_number,
      verified: row.verified,
      impactScore: row.impact_score,
      riskScore: row.risk_score,
      verifiedAt: row.verified_at,
      nextVerificationDue: row.next_verification_due,
      warnings: row.warnings ? JSON.parse(row.warnings) : [],
      txHash: row.tx_hash,
      onChainVerified: !!row.tx_hash,
    };
  }

  /**
   * Récupère toutes les ONGs vérifiées
   */
  async getAllVerifiedNGOs(): Promise<NGOWithVerification[]> {
    const result = await this.pool.query(
      'SELECT * FROM ngos_verified WHERE verified = true ORDER BY impact_score DESC'
    );

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      walletAddress: row.wallet_address,
      country: row.country,
      category: row.category,
      website: row.website,
      email: row.email,
      registrationNumber: row.registration_number,
      verified: row.verified,
      impactScore: row.impact_score,
      riskScore: row.risk_score,
      verifiedAt: row.verified_at,
      nextVerificationDue: row.next_verification_due,
      warnings: row.warnings ? JSON.parse(row.warnings) : [],
      txHash: row.tx_hash,
      onChainVerified: !!row.tx_hash,
    }));
  }

  /**
   * Récupère l'historique des donations d'un donateur
   */
  async getDonorHistory(donorAddress: string): Promise<DonationWithImpact[]> {
    const result = await this.pool.query(
      `
      SELECT * FROM donations_with_impact
      WHERE donor_address = $1
      ORDER BY created_at DESC
      `,
      [donorAddress]
    );

    return result.rows.map((row) => ({
      donorAddress: row.donor_address,
      ngoAddress: row.ngo_address,
      amount: row.amount,
      ngoImpactScore: row.ngo_impact_score,
      ngoVerified: row.ngo_verified,
      impactMultiplier: row.impact_multiplier,
      xpGained: row.xp_gained,
      level: row.level,
      txHash: row.tx_hash,
    }));
  }

  /**
   * Récupère le total d'XP et le level actuel d'un donateur
   */
  async getDonorStats(donorAddress: string): Promise<{
    totalXP: number;
    currentLevel: number;
    totalDonations: number;
    totalAmount: number;
  }> {
    const result = await this.pool.query(
      `
      SELECT
        SUM(xp_gained) as total_xp,
        COUNT(*) as total_donations,
        SUM(amount) as total_amount
      FROM donations_with_impact
      WHERE donor_address = $1
      `,
      [donorAddress]
    );

    const row = result.rows[0];
    const totalXP = parseInt(row.total_xp || '0');
    const currentLevel = this.calculateLevel(totalXP);

    return {
      totalXP,
      currentLevel,
      totalDonations: parseInt(row.total_donations || '0'),
      totalAmount: parseFloat(row.total_amount || '0'),
    };
  }

  /**
   * Leaderboard des donateurs par XP
   */
  async getDonorLeaderboard(limit: number = 10): Promise<
    Array<{
      donorAddress: string;
      totalXP: number;
      level: number;
      totalDonations: number;
      totalAmount: number;
    }>
  > {
    const result = await this.pool.query(
      `
      SELECT
        donor_address,
        SUM(xp_gained) as total_xp,
        COUNT(*) as total_donations,
        SUM(amount) as total_amount
      FROM donations_with_impact
      GROUP BY donor_address
      ORDER BY total_xp DESC
      LIMIT $1
      `,
      [limit]
    );

    return result.rows.map((row) => ({
      donorAddress: row.donor_address,
      totalXP: parseInt(row.total_xp),
      level: this.calculateLevel(parseInt(row.total_xp)),
      totalDonations: parseInt(row.total_donations),
      totalAmount: parseFloat(row.total_amount),
    }));
  }
}

export default OracleXRPLIntegration;

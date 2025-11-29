/**
 * ═══════════════════════════════════════════════════════════════════════════
 * IMPACT ORACLE SERVER
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Serveur Express.js pour l'API ImpactOracle
 *
 * Endpoints:
 * - POST /oracle/verify - Vérifie une ONG et calcule son impact
 * - GET /oracle/verify/:xrplAddress - Récupère une vérification existante
 * - GET /oracle/top - Liste des meilleures ONGs
 * - GET /oracle/country/:countryCode - ONGs par pays
 * - GET /oracle/health - Health check
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Pool } from 'pg';
import { ImpactOracleService, NGOInput } from './impact-oracle';
import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const PORT = process.env.ORACLE_PORT || 3001;
const app = express();

// PostgreSQL Pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'xrpl_impact_fund',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Impact Oracle Service
const oracleService = new ImpactOracleService(pool, {
  enableMockData: process.env.ENABLE_MOCK_DATA === 'true',
  verificationIntervalDays: parseInt(process.env.VERIFICATION_INTERVAL_DAYS || '30'),
});

// ═══════════════════════════════════════════════════════════════════════════
// MIDDLEWARES
// ═══════════════════════════════════════════════════════════════════════════

app.use(helmet()); // Sécurité HTTP headers
app.use(cors()); // CORS
app.use(express.json()); // Parse JSON body
app.use(morgan('combined')); // Logging HTTP

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Health check
 */
app.get('/oracle/health', async (req: Request, res: Response) => {
  try {
    // Test database connection
    await pool.query('SELECT 1');

    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'impact-oracle',
      version: '1.0.0',
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /oracle/verify
 * Vérifie une ONG et calcule son score d'impact
 *
 * Body:
 * {
 *   "xrplAddress": "rNGO123...",
 *   "name": "Climate Action Network",
 *   "registrationNumber": "12345",
 *   "country": "US",
 *   "website": "https://example.org",
 *   "email": "contact@example.org"
 * }
 */
app.post('/oracle/verify', async (req: Request, res: Response) => {
  try {
    // Validation des données
    const ngoInput: NGOInput = {
      xrplAddress: req.body.xrplAddress,
      name: req.body.name,
      registrationNumber: req.body.registrationNumber,
      country: req.body.country,
      website: req.body.website,
      email: req.body.email,
    };

    // Vérification
    const result = await oracleService.verifyNGOImpact(ngoInput);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      });
    }
  }
});

/**
 * GET /oracle/verify/:xrplAddress
 * Récupère une vérification existante
 */
app.get('/oracle/verify/:xrplAddress', async (req: Request, res: Response) => {
  try {
    const { xrplAddress } = req.params;

    const result = await pool.query(
      'SELECT * FROM oracle_verifications WHERE xrpl_address = $1 ORDER BY verified_at DESC LIMIT 1',
      [xrplAddress]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'No verification found for this address',
      });
      return;
    }

    const row = result.rows[0];
    res.json({
      success: true,
      data: {
        xrplAddress: row.xrpl_address,
        verified: row.verified,
        impactScore: row.impact_score,
        verificationSources: row.verification_sources,
        metadata: row.metadata,
        verifiedAt: row.verified_at,
        nextVerificationDue: row.next_verification_due,
        riskScore: row.risk_score,
        warnings: row.warnings || [],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve verification',
    });
  }
});

/**
 * GET /oracle/top?limit=10
 * Liste des meilleures ONGs par score d'impact
 */
app.get('/oracle/top', async (req: Request, res: Response) => {
  try {
    const limit = parseInt((req.query.limit as string) || '10');

    const results = await oracleService.getTopNGOsByImpact(limit);

    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve top NGOs',
    });
  }
});

/**
 * GET /oracle/country/:countryCode
 * Liste des ONGs par pays (code ISO 3166-1 alpha-2)
 */
app.get('/oracle/country/:countryCode', async (req: Request, res: Response) => {
  try {
    const { countryCode } = req.params;

    if (countryCode.length !== 2) {
      res.status(400).json({
        success: false,
        error: 'Country code must be ISO 3166-1 alpha-2 (2 letters)',
      });
      return;
    }

    const results = await oracleService.getVerificationsByCountry(countryCode.toUpperCase());

    res.json({
      success: true,
      count: results.length,
      countryCode: countryCode.toUpperCase(),
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve NGOs by country',
    });
  }
});

/**
 * GET /oracle/stats
 * Statistiques globales de l'oracle
 */
app.get('/oracle/stats', async (req: Request, res: Response) => {
  try {
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM oracle_verifications');
    const verifiedResult = await pool.query(
      'SELECT COUNT(*) as verified FROM oracle_verifications WHERE verified = true'
    );
    const avgScoreResult = await pool.query(
      'SELECT AVG(impact_score) as avg_score FROM oracle_verifications WHERE verified = true'
    );
    const highRiskResult = await pool.query(
      'SELECT COUNT(*) as high_risk FROM oracle_verifications WHERE risk_score > 70'
    );

    res.json({
      success: true,
      stats: {
        totalVerifications: parseInt(totalResult.rows[0].total),
        verifiedNGOs: parseInt(verifiedResult.rows[0].verified),
        averageImpactScore: parseFloat(avgScoreResult.rows[0].avg_score || '0').toFixed(2),
        highRiskNGOs: parseInt(highRiskResult.rows[0].high_risk),
        lastUpdate: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve stats',
    });
  }
});

/**
 * POST /oracle/bulk-verify
 * Vérifie plusieurs ONGs en parallèle
 *
 * Body:
 * {
 *   "ngos": [
 *     { "xrplAddress": "rNGO1...", "name": "Org 1", ... },
 *     { "xrplAddress": "rNGO2...", "name": "Org 2", ... }
 *   ]
 * }
 */
app.post('/oracle/bulk-verify', async (req: Request, res: Response) => {
  try {
    const { ngos } = req.body;

    if (!Array.isArray(ngos) || ngos.length === 0) {
      res.status(400).json({
        success: false,
        error: 'ngos must be a non-empty array',
      });
      return;
    }

    if (ngos.length > 50) {
      res.status(400).json({
        success: false,
        error: 'Maximum 50 NGOs per batch',
      });
      return;
    }

    // Vérifications en parallèle
    const results = await Promise.allSettled(
      ngos.map((ngo) => oracleService.verifyNGOImpact(ngo))
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    res.json({
      success: true,
      total: ngos.length,
      successful,
      failed,
      results: results.map((r, index) => ({
        xrplAddress: ngos[index].xrplAddress,
        status: r.status,
        data: r.status === 'fulfilled' ? r.value : null,
        error: r.status === 'rejected' ? (r.reason as Error).message : null,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Bulk verification failed',
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════════════════

const server = app.listen(PORT, () => {
  console.log(`
  ═══════════════════════════════════════════════════════════════════════════
  🔮 IMPACT ORACLE SERVER
  ═══════════════════════════════════════════════════════════════════════════

  Status: ✅ Running
  Port: ${PORT}
  Environment: ${process.env.NODE_ENV || 'development'}
  Mock Data: ${process.env.ENABLE_MOCK_DATA === 'true' ? 'Enabled' : 'Disabled'}

  Available endpoints:
  - POST   /oracle/verify              - Verify NGO impact
  - GET    /oracle/verify/:address     - Get verification
  - GET    /oracle/top?limit=10        - Top NGOs by impact
  - GET    /oracle/country/:code       - NGOs by country
  - GET    /oracle/stats               - Global statistics
  - POST   /oracle/bulk-verify         - Bulk verification
  - GET    /oracle/health              - Health check

  ═══════════════════════════════════════════════════════════════════════════
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    pool.end();
    process.exit(0);
  });
});

export default app;

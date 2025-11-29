/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXPRESS INTEGRATION EXAMPLE - XRPL SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Exemple complet d'intégration du XRPLServiceEnhanced avec Express.js
 *
 * Routes implémentées:
 * - POST   /api/v1/donations              - Créer une donation
 * - GET    /api/v1/donations/:address     - Historique d'un donateur
 * - GET    /api/v1/pool/balance            - Solde du pool
 * - GET    /api/v1/pool/state              - État du pool
 * - POST   /api/v1/pool/calculate-profit   - Calculer les profits
 * - POST   /api/v1/pool/redistribute       - Redistribuer aux ONG
 * - POST   /api/v1/emergency/trigger       - Déclencher une urgence
 * - GET    /api/v1/stats                   - Statistiques du service
 * - GET    /api/v1/health                  - Health check
 *
 * @author XRPact Hack For Good Team
 * @version 1.0.0
 */

import express, { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { z } from 'zod';
import { XRPLServiceEnhanced } from './xrpl-service-enhanced';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const app = express();
app.use(express.json());

// PostgreSQL connection pool
const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/xrpl_impact_fund',
});

// XRPL Service instance (singleton)
let xrplService: XRPLServiceEnhanced;

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMAS DE VALIDATION (Zod)
// ═══════════════════════════════════════════════════════════════════════════

const DonationSchema = z.object({
  donorAddress: z.string().regex(/^r[a-zA-Z0-9]{24,34}$/, 'Invalid XRPL address'),
  amount: z.number().positive().max(1000000, 'Amount too large'),
  txHash: z.string().optional(),
});

const ProfitCalculationSchema = z.object({
  profitPercentage: z.number().min(0).max(10).optional(),
});

const RedistributionSchema = z.object({
  profitAmount: z.number().positive(),
});

const EmergencySchema = z.object({
  triggeredBy: z.string().regex(/^r[a-zA-Z0-9]{24,34}$/),
  reason: z.string().min(10).max(500),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  amountRequested: z.number().positive(),
  affectedNGOs: z.array(z.string()).min(1),
});

// ═══════════════════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Middleware de validation Zod
 */
const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      }
      next(error);
    }
  };
};

/**
 * Middleware de gestion d'erreurs
 */
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  res.status(500).json({
    success: false,
    error: err.message,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Middleware de logging des requêtes
 */
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });

  next();
};

app.use(requestLogger);

// ═══════════════════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Health check
 */
app.get('/api/v1/health', async (req: Request, res: Response) => {
  try {
    const poolBalance = await xrplService.getPoolBalance();

    res.json({
      success: true,
      status: 'healthy',
      service: 'XRPL Impact Fund',
      version: '3.0.0',
      timestamp: new Date().toISOString(),
      poolBalance: `${poolBalance.toFixed(2)} XRP`,
      mode: xrplService.getConfig().mockMode ? 'MOCK' : 'LIVE',
    });
  } catch (error: any) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
    });
  }
});

/**
 * POST /api/v1/donations - Créer une donation
 */
app.post(
  '/api/v1/donations',
  validate(DonationSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { donorAddress, amount, txHash } = req.body;

      const result = await xrplService.processDonation(donorAddress, amount, txHash);

      res.status(201).json({
        success: true,
        data: {
          txHash: result.txHash,
          donorAddress: result.donorAddress,
          amount: result.amount,
          xpGained: result.xpGained,
          newLevel: result.newLevel,
          levelUp: result.levelUp,
          nftMinted: result.nftMinted,
          nftTokenId: result.nftTokenId,
          poolBalance: result.poolBalance,
          timestamp: result.timestamp,
        },
        message: result.levelUp
          ? `Donation successful! Level up to ${result.newLevel}! 🎉`
          : 'Donation successful!',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/donations/:address - Historique des donations d'un donateur
 */
app.get('/api/v1/donations/:address', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    // Valider l'adresse
    if (!address.match(/^r[a-zA-Z0-9]{24,34}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid XRPL address',
      });
    }

    const history = await xrplService.getDonationHistory(address, limit);

    res.json({
      success: true,
      data: {
        address,
        donationCount: history.length,
        donations: history,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/pool/balance - Solde du pool
 */
app.get('/api/v1/pool/balance', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const balance = await xrplService.getPoolBalance();

    res.json({
      success: true,
      data: {
        balance,
        formattedBalance: `${balance.toFixed(2)} XRP`,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/pool/state - État complet du pool
 */
app.get('/api/v1/pool/state', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const state = xrplService.getPoolState();

    res.json({
      success: true,
      data: state,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/pool/calculate-profit - Calculer les profits (IA trading mock)
 */
app.post(
  '/api/v1/pool/calculate-profit',
  validate(ProfitCalculationSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { profitPercentage } = req.body;

      const profit = await xrplService.calculateProfit(profitPercentage);

      res.json({
        success: true,
        data: {
          profitAmount: profit.profitAmount,
          profitPercentage: profit.profitPercentage,
          poolBalanceBefore: profit.poolBalanceBefore,
          poolBalanceAfter: profit.poolBalanceAfter,
          strategy: profit.strategy,
          marketConditions: profit.marketConditions,
          simulationDetails: profit.simulationDetails,
          timestamp: profit.timestamp,
        },
        message: `Profit calculated: ${profit.profitAmount.toFixed(2)} XRP (${profit.profitPercentage}%)`,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/pool/redistribute - Redistribuer aux ONG
 */
app.post(
  '/api/v1/pool/redistribute',
  validate(RedistributionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { profitAmount } = req.body;

      const result = await xrplService.redistributeProfits(profitAmount);

      res.json({
        success: true,
        data: {
          totalAmount: result.totalAmount,
          ngoCount: result.ngoCount,
          distributions: result.distributions,
          failedDistributions: result.failedDistributions,
          executionTime: result.executionTime,
          timestamp: result.timestamp,
        },
        message: `Successfully distributed ${profitAmount.toFixed(2)} XRP to ${result.ngoCount} NGOs`,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/emergency/trigger - Déclencher une redistribution d'urgence
 */
app.post(
  '/api/v1/emergency/trigger',
  validate(EmergencySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const emergency = req.body;

      const result = await xrplService.triggerEmergencyRedistribution(emergency);

      res.status(result.success ? 201 : 400).json({
        success: result.success,
        data: {
          emergencyId: result.emergencyId,
          reason: result.reason,
          severity: result.severity,
          totalAmount: result.totalAmount,
          affectedNGOs: result.affectedNGOs,
          txHashes: result.txHashes,
          governance: {
            approvalVotes: result.approvalVotes,
            rejectionVotes: result.rejectionVotes,
            requiredVotes: result.requiredVotes,
            quorumReached: result.quorumReached,
            approved: result.approved,
          },
          timestamp: result.timestamp,
        },
        message: result.approved
          ? `Emergency approved and executed: ${result.totalAmount.toFixed(2)} XRP distributed`
          : 'Emergency rejected by governance',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/stats - Statistiques complètes du service
 */
app.get('/api/v1/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = xrplService.getStatistics();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/logs - Logs récents
 */
app.get('/api/v1/logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const logs = xrplService.getOperationLogs(limit);

    res.json({
      success: true,
      data: {
        count: logs.length,
        logs,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ERROR HANDLER (doit être le dernier middleware)
// ═══════════════════════════════════════════════════════════════════════════

app.use(errorHandler);

// ═══════════════════════════════════════════════════════════════════════════
// INITIALISATION & DÉMARRAGE
// ═══════════════════════════════════════════════════════════════════════════

async function startServer() {
  try {
    console.log('🚀 Starting XRPL Impact Fund API Server...\n');

    // Initialiser le service XRPL
    console.log('📡 Initializing XRPL service...');
    xrplService = new XRPLServiceEnhanced(
      {
        network: (process.env.XRPL_NETWORK as any) || 'mock',
        mockMode: process.env.XRPL_NETWORK === 'mock',
        enableLogging: true,
        logLevel: (process.env.LOG_LEVEL as any) || 'info',
      },
      dbPool
    );

    await xrplService.initialize();
    console.log('✅ XRPL service initialized\n');

    // Démarrer le serveur Express
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log('═'.repeat(80));
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log('═'.repeat(80));
      console.log('\n📚 Available endpoints:\n');
      console.log('  GET    /api/v1/health');
      console.log('  POST   /api/v1/donations');
      console.log('  GET    /api/v1/donations/:address');
      console.log('  GET    /api/v1/pool/balance');
      console.log('  GET    /api/v1/pool/state');
      console.log('  POST   /api/v1/pool/calculate-profit');
      console.log('  POST   /api/v1/pool/redistribute');
      console.log('  POST   /api/v1/emergency/trigger');
      console.log('  GET    /api/v1/stats');
      console.log('  GET    /api/v1/logs');
      console.log('\n' + '═'.repeat(80) + '\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Gérer les signaux de terminaison proprement
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down gracefully...');

  if (xrplService) {
    await xrplService.shutdown();
  }

  if (dbPool) {
    await dbPool.end();
  }

  console.log('✅ Shutdown complete');
  process.exit(0);
});

// Démarrer le serveur si exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export { app, startServer };

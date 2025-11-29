/**
 * XRPL Controller
 *
 * Expose les endpoints API pour le frontend.
 * Tous les endpoints retournent du JSON.
 *
 * Routes principales:
 * - POST /api/xrpl/deposit - Enregistrer une donation
 * - POST /api/xrpl/simulate-profit - Simuler des profits
 * - POST /api/xrpl/distribute - Distribuer les profits aux ONG
 * - GET  /api/xrpl/pool - Obtenir l'état du pool
 * - GET  /api/xrpl/donor/:address - Obtenir les infos d'un donateur
 * - GET  /api/xrpl/ngos - Lister les ONG
 * - POST /api/xrpl/validate-ngo - Valider une ONG
 */

import { Request, Response } from 'express';
import { XRPLClientService } from '../services/xrpl-client.service';
import { DonationPoolService } from '../services/donation-pool.service';
import { ImpactOracleService } from '../services/impact-oracle.service';
import { DepositRequest } from '../types/xrpl.types';

export class XRPLController {
  private xrplClient: XRPLClientService;
  private poolService: DonationPoolService;
  private oracleService: ImpactOracleService;

  constructor() {
    // Initialiser les services
    this.xrplClient = new XRPLClientService();
    this.poolService = new DonationPoolService(this.xrplClient);
    this.oracleService = new ImpactOracleService();

    // Connecter au réseau XRPL (mode MOCK si pas de config)
    this.initialize();
  }

  /**
   * Initialiser la connexion XRPL
   */
  private async initialize(): Promise<void> {
    try {
      await this.xrplClient.connect();
      console.log('[XRPLController] Services initialized successfully');
    } catch (error) {
      console.error('[XRPLController] Initialization failed:', error);
    }
  }

  // ==========================================================================
  // DEPOSIT - Enregistrer une donation
  // ==========================================================================

  /**
   * POST /api/xrpl/deposit
   *
   * Body: { donorAddress: string, amount: number, signature?: string }
   * Returns: { success, txHash, nftMinted, xpGained, newLevel, poolBalance }
   */
  deposit = async (req: Request, res: Response): Promise<void> => {
    try {
      const request: DepositRequest = req.body;

      // Validation
      if (!request.donorAddress || !request.amount) {
        res.status(400).json({
          error: 'Missing required fields',
          message: 'donorAddress and amount are required',
        });
        return;
      }

      if (request.amount <= 0) {
        res.status(400).json({
          error: 'Invalid amount',
          message: 'Amount must be positive',
        });
        return;
      }

      // Traiter la donation
      const result = await this.poolService.deposit(request);

      res.status(200).json(result);
    } catch (error: any) {
      console.error('[XRPLController] Deposit failed:', error);
      res.status(500).json({
        error: 'Deposit failed',
        message: error.message || 'Internal server error',
      });
    }
  };

  // ==========================================================================
  // SIMULATE PROFIT - Simuler des profits de trading
  // ==========================================================================

  /**
   * POST /api/xrpl/simulate-profit
   *
   * Body: { profitPercentage?: number }
   * Returns: { success, profitGenerated, poolBalance }
   */
  simulateProfit = async (req: Request, res: Response): Promise<void> => {
    try {
      const { profitPercentage = 0.67 } = req.body;

      // Générer le profit
      const profit = await this.poolService.simulateProfit(profitPercentage);

      // Obtenir l'état du pool
      const poolState = this.poolService.getPoolState();

      res.status(200).json({
        success: true,
        profitGenerated: profit,
        profitPercentage,
        poolBalance: poolState.totalBalance,
        totalProfitsGenerated: poolState.totalProfitsGenerated,
      });
    } catch (error: any) {
      console.error('[XRPLController] Simulate profit failed:', error);
      res.status(500).json({
        error: 'Simulation failed',
        message: error.message || 'Internal server error',
      });
    }
  };

  // ==========================================================================
  // DISTRIBUTE PROFITS - Distribuer les profits aux ONG
  // ==========================================================================

  /**
   * POST /api/xrpl/distribute
   *
   * Body: { profitAmount: number }
   * Returns: { success, totalProfit, distributions, txHashes }
   */
  distributeProfits = async (req: Request, res: Response): Promise<void> => {
    try {
      const { profitAmount } = req.body;

      if (!profitAmount || profitAmount <= 0) {
        res.status(400).json({
          error: 'Invalid profit amount',
          message: 'profitAmount must be positive',
        });
        return;
      }

      // Distribuer les profits
      const result = await this.poolService.distributeProfits(profitAmount);

      res.status(200).json(result);
    } catch (error: any) {
      console.error('[XRPLController] Distribution failed:', error);
      res.status(500).json({
        error: 'Distribution failed',
        message: error.message || 'Internal server error',
      });
    }
  };

  // ==========================================================================
  // GET POOL STATE - Obtenir l'état du pool
  // ==========================================================================

  /**
   * GET /api/xrpl/pool
   *
   * Returns: { totalBalance, totalDonations, totalProfitsGenerated, totalDistributed, donorCount, lastTradingRun }
   */
  getPoolState = async (req: Request, res: Response): Promise<void> => {
    try {
      const poolState = this.poolService.getPoolState();

      res.status(200).json({
        success: true,
        pool: poolState,
      });
    } catch (error: any) {
      console.error('[XRPLController] Get pool state failed:', error);
      res.status(500).json({
        error: 'Failed to get pool state',
        message: error.message || 'Internal server error',
      });
    }
  };

  // ==========================================================================
  // GET DONOR INFO - Obtenir les infos d'un donateur
  // ==========================================================================

  /**
   * GET /api/xrpl/donor/:address
   *
   * Returns: { success, donor: DonorInfo }
   */
  getDonorInfo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { address } = req.params;

      const donor = this.poolService.getDonor(address);

      if (!donor) {
        res.status(404).json({
          error: 'Donor not found',
          message: `No donor found with address ${address}`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        donor,
      });
    } catch (error: any) {
      console.error('[XRPLController] Get donor info failed:', error);
      res.status(500).json({
        error: 'Failed to get donor info',
        message: error.message || 'Internal server error',
      });
    }
  };

  // ==========================================================================
  // GET NGOS - Lister les ONG
  // ==========================================================================

  /**
   * GET /api/xrpl/ngos
   *
   * Query: ?validated=true (optionnel)
   * Returns: { success, ngos: NGO[] }
   */
  getNGOs = async (req: Request, res: Response): Promise<void> => {
    try {
      const { validated } = req.query;

      let ngos;
      if (validated === 'true') {
        ngos = this.poolService.getValidatedNGOs();
      } else {
        ngos = this.poolService.getAllNGOs();
      }

      res.status(200).json({
        success: true,
        ngos,
        total: ngos.length,
      });
    } catch (error: any) {
      console.error('[XRPLController] Get NGOs failed:', error);
      res.status(500).json({
        error: 'Failed to get NGOs',
        message: error.message || 'Internal server error',
      });
    }
  };

  // ==========================================================================
  // VALIDATE NGO - Valider une ONG via Impact Oracle
  // ==========================================================================

  /**
   * POST /api/xrpl/validate-ngo
   *
   * Body: { ngoId: string, registrationNumber?: string, website?: string, country?: string }
   * Returns: { success, validation: NGOValidationResult }
   */
  validateNGO = async (req: Request, res: Response): Promise<void> => {
    try {
      const request = req.body;

      if (!request.ngoId) {
        res.status(400).json({
          error: 'Missing required field',
          message: 'ngoId is required',
        });
        return;
      }

      // Valider l'ONG via Impact Oracle
      const validation = await this.oracleService.validateNGO(request);

      res.status(200).json({
        success: true,
        validation,
      });
    } catch (error: any) {
      console.error('[XRPLController] Validate NGO failed:', error);
      res.status(500).json({
        error: 'Validation failed',
        message: error.message || 'Internal server error',
      });
    }
  };

  // ==========================================================================
  // GET BALANCE - Obtenir le solde d'une adresse XRPL
  // ==========================================================================

  /**
   * GET /api/xrpl/balance/:address
   *
   * Returns: { success, address, balance }
   */
  getBalance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { address } = req.params;

      const balance = await this.xrplClient.getBalance(address);

      res.status(200).json({
        success: true,
        address,
        balance,
      });
    } catch (error: any) {
      console.error('[XRPLController] Get balance failed:', error);
      res.status(500).json({
        error: 'Failed to get balance',
        message: error.message || 'Internal server error',
      });
    }
  };

  // ==========================================================================
  // HEALTH CHECK
  // ==========================================================================

  /**
   * GET /api/xrpl/health
   *
   * Returns: { status, mode, connected }
   */
  healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const isMockMode = this.xrplClient.isMockMode();
      const poolState = this.poolService.getPoolState();

      res.status(200).json({
        status: 'ok',
        mode: isMockMode ? 'MOCK' : 'LIVE',
        connected: true,
        pool: {
          balance: poolState.totalBalance,
          donors: poolState.donorCount,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Health check failed',
      });
    }
  };
}

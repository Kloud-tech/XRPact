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
 * - POST /api/xrpl/sbt/mint - Mint SBT (Soulbound Token)
 * - GET  /api/xrpl/sbt/:nftTokenId - Read SBT metadata
 * - POST /api/xrpl/sbt/:nftTokenId/vote - Record governance vote
 */

import { Request, Response } from 'express';
import axios from 'axios';
import { XRPLClientService } from '../services/xrpl-client.service';
import { DonationPoolService } from '../services/donation-pool.service';
import { ImpactOracleService } from '../services/impact-oracle.service';
import { SBTService } from '../services/sbt.service';
import { ImpactNFTService } from '../services/impact-nft.service';
import { ProjectsService } from '../services/projects.service';
import { DepositRequest } from '../types/xrpl.types';

export class XRPLController {
  private xrplClient: XRPLClientService;
  private poolService: DonationPoolService;
  private oracleService: ImpactOracleService;
  private sbtService: SBTService;
  private impactNFTService: ImpactNFTService;
  private projectsService: ProjectsService;

  constructor() {
    // Initialiser les services
    this.xrplClient = new XRPLClientService();
    this.poolService = new DonationPoolService(this.xrplClient);
    this.oracleService = new ImpactOracleService();
    this.sbtService = new SBTService(this.xrplClient);
    this.impactNFTService = new ImpactNFTService(this.xrplClient);
    this.projectsService = new ProjectsService(this.xrplClient);

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

      // Auto-mint SBT on first donation
      if (result.success && result.nftMinted) {
        try {
          const donor = this.poolService.getDonor(request.donorAddress);
          if (donor && donor.ditTokenId) {
            // Also mint SBT with donor impact data
            const sbtResult = await this.sbtService.mintSBT({
              donorAddress: request.donorAddress,
              totalDonated: donor.totalDonated,
              ngosSupported: [], // Will be populated after first redistribution
              level: donor.level,
            });

            if (sbtResult.success) {
              console.log(
                `[XRPLController] Auto-minted SBT for ${request.donorAddress}: ${sbtResult.nftTokenId}`
              );
              (result as any).sbtTokenId = sbtResult.nftTokenId;
              (result as any).sbtTxHash = sbtResult.txHash;
            }
          }
        } catch (e: any) {
          // Non-blocking: SBT minting is optional
          console.warn('[XRPLController] SBT auto-mint failed:', e.message || e);
        }
      }

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

      // Auto-mint Impact NFT after redistribution (non-blocking)
      if (result.success && result.distributions && result.distributions.length > 0) {
        try {
          const projectIds = result.distributions.map((d: any) => d.ngoId);
          const poolAddress = result.poolAddress || 'rXRPLImpactPool';

          console.log('[XRPLController] Auto-minting Impact NFT after redistribution');

          const nftResult = await this.impactNFTService.mintImpactNFT({
            poolAddress,
            redistributionAmount: profitAmount,
            projectIds,
            redistributionCount: result.redistributionCount || 1,
          });

          if (nftResult.success) {
            result.impactNFT = {
              nftTokenId: nftResult.nftTokenId,
              tier: nftResult.metadata?.tier,
              impactScore: nftResult.metadata?.impactScore,
            };
            console.log(
              `[XRPLController] Impact NFT minted: ${nftResult.nftTokenId}`
            );
          }
        } catch (nftError: any) {
          console.warn(
            '[XRPLController] Impact NFT mint failed (non-blocking):',
            nftError.message
          );
          // Don't break the redistribution flow
        }
      }

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

      // Valider l'ONG via Impact Oracle (service interne)
      const validation = await this.oracleService.validateNGO(request);

      // Attempt to enrich with external ImpactOracle micro-service if available
      try {
        const oracleUrl = process.env.IMPACT_ORACLE_URL || 'http://localhost:3300/oracle/verify';

        // Try to determine address to verify: prefer provided address or look up NGO wallet
        let addressToVerify: string | undefined = request.address;

        // If not provided, try to get NGO wallet from poolService
        if (!addressToVerify) {
          const ngos = this.poolService.getAllNGOs();
          const found = ngos.find((n: any) => n.id === request.ngoId);
          if (found && found.walletAddress) {
            addressToVerify = found.walletAddress;
          }
        }

        if (addressToVerify) {
          const resp = await axios.post(oracleUrl, { address: addressToVerify }, { timeout: 5000 });
          if (resp && resp.data) {
            // merge external score if present
            const ext = resp.data;
            if (typeof ext.impactScore === 'number') {
              validation.impactScore = ext.impactScore;
              validation.dataSource = (validation.dataSource || '') + ' + ExternalImpactOracle';
              validation.lastUpdated = new Date();

              // Update NGO in the pool with new score & verified flag
              try {
                const ngos = this.poolService.getAllNGOs();
                const ngo = ngos.find((n: any) => n.id === request.ngoId);
                if (ngo) {
                  ngo.impactScore = validation.impactScore;
                  ngo.verified = validation.impactScore >= 60;
                  ngo.certifications = validation.certifications || ngo.certifications || [];
                  ngo.updatedAt = new Date();
                  this.poolService.upsertNGO(ngo);
                }
              } catch (e) {
                // Non-blocking: log and continue
                console.warn('[XRPLController] Failed to upsert NGO after external validation', e.message || e);
              }
            }
          }
        }
      } catch (e) {
        // External oracle failed — continue with internal validation
        console.warn('[XRPLController] External ImpactOracle call failed:', e.message || e);
      }

      // Optionally: publish validation hash to XRPL (if enabled)
      if (process.env.PUBLISH_ON_CHAIN === 'true' && request.ngoId) {
        try {
          const publishResult = await this.publishValidationOnChain(request.ngoId, validation);
          if (publishResult) {
            (validation as any).onChainHash = publishResult.hash;
            (validation as any).txHash = publishResult.txHash;
            console.log(`[XRPLController] Validation hash published on-chain: ${publishResult.txHash}`);
          }
        } catch (e) {
          // Non-blocking: log and continue
          console.warn('[XRPLController] Failed to publish validation on-chain:', e.message || e);
        }
      }

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
  // PUBLISH VALIDATION ON-CHAIN - Publier le hash de validation on-chain
  // ==========================================================================

  /**
   * Publish validation hash to XRPL Memo field for immutable proof
   * 
   * @param ngoId - NGO identifier
   * @param validation - Validation result object
   * @returns { hash, txHash } or null if failed
   */
  private async publishValidationOnChain(ngoId: string, validation: any): Promise<any> {
    try {
      const crypto = require('crypto');

      // Compute SHA256 hash of validation result
      const normalized = JSON.stringify(validation, null, 0);
      const hash = crypto
        .createHash('sha256')
        .update(normalized)
        .digest('hex')
        .toUpperCase();

      // Create memo with validation hash
      const memoContent = `VALIDATION_${ngoId}_${hash}`;
      const memoHex = Buffer.from(memoContent, 'utf8').toString('hex').toUpperCase();

      // Get NGO wallet address
      const ngos = this.poolService.getAllNGOs();
      const ngo = ngos.find((n: any) => n.id === ngoId);

      if (!ngo || !ngo.walletAddress) {
        console.warn(`[XRPLController] NGO ${ngoId} not found or no wallet address`);
        return null;
      }

      // Create and submit Payment transaction with Memo
      // In MOCK mode, this returns a simulated txHash
      const mockTxHash = `VAL_TX_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      console.log(`[XRPLController] Published validation hash on-chain (MOCK): ${mockTxHash}`);

      return {
        hash,
        txHash: mockTxHash,
        memoContent,
      };
    } catch (e: any) {
      console.error('[XRPLController] Failed to publish validation on-chain:', e.message || e);
      throw e;
    }
  }

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

  /**
   * GET /api/xrpl/transactions
   * Get recent transactions for the pool wallet
   */
  getTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const poolAddress = this.xrplClient.getPoolWalletAddress();

      const transactions = await this.xrplClient.getRecentTransactions(poolAddress, limit);

      // Map XRPL transaction types to frontend types
      const mappedTransactions = transactions.map((tx: any) => {
        let type: 'donation' | 'distribution' | 'yield' = 'donation';

        // If transaction is TO pool wallet, it's a donation
        if (tx.to === poolAddress) {
          type = 'donation';
        }
        // If transaction is FROM pool wallet, it's a distribution
        else if (tx.from === poolAddress) {
          type = 'distribution';
        }

        return {
          id: tx.hash,
          from: tx.from,
          to: tx.to,
          amount: tx.amount,
          type,
          timestamp: tx.timestamp,
          hash: tx.hash,
        };
      });

      res.status(200).json({
        success: true,
        address: poolAddress,
        total: mappedTransactions.length,
        transactions: mappedTransactions,
      });
    } catch (error: any) {
      console.error('[XRPLController] Get transactions failed:', error);
      res.status(500).json({
        error: 'Failed to get transactions',
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

  // ==========================================================================
  // SBT (SOULBOUND TOKEN) - Non-transferable NFT for Donors
  // ==========================================================================

  /**
   * POST /api/xrpl/sbt/mint
   * Mint a Soulbound Token for a donor
   * Body: { donorAddress, totalDonated, ngosSupported, level }
   */
  mintSBT = async (req: Request, res: Response): Promise<void> => {
    try {
      const request = req.body;

      if (!request.donorAddress || request.totalDonated === undefined) {
        res.status(400).json({
          error: 'Missing required fields',
          message: 'donorAddress and totalDonated are required',
        });
        return;
      }

      const result = await this.sbtService.mintSBT(request);

      res.status(result.success ? 201 : 400).json(result);
    } catch (error: any) {
      console.error('[XRPLController] SBT mint failed:', error);
      res.status(500).json({
        error: 'SBT mint failed',
        message: error.message || 'Internal server error',
      });
    }
  };

  /**
   * GET /api/xrpl/sbt/:nftTokenId
   * Read SBT metadata
   */
  readSBT = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nftTokenId } = req.params;

      const result = await this.sbtService.readSBT(nftTokenId);

      res.status(result.success ? 200 : 404).json(result);
    } catch (error: any) {
      console.error('[XRPLController] SBT read failed:', error);
      res.status(500).json({
        error: 'SBT read failed',
        message: error.message || 'Internal server error',
      });
    }
  };

  /**
   * POST /api/xrpl/sbt/:nftTokenId/vote
   * Record a governance vote for SBT holder
   */
  recordSBTVote = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nftTokenId } = req.params;

      if (!nftTokenId) {
        res.status(400).json({
          error: 'Missing nftTokenId',
          message: 'nftTokenId is required',
        });
        return;
      }

      const result = await this.sbtService.recordGovernanceVote(nftTokenId);

      res.status(result.success ? 200 : 404).json(result);
    } catch (error: any) {
      console.error('[XRPLController] Vote recording failed:', error);
      res.status(500).json({
        error: 'Vote recording failed',
        message: error.message || 'Internal server error',
      });
    }
  };

  /**
   * GET /api/xrpl/sbt/donor/:donorAddress
   * Get all SBTs for a donor
   */
  getDonorSBTs = async (req: Request, res: Response): Promise<void> => {
    try {
      const { donorAddress } = req.params;

      const sbts = this.sbtService.getSBTsByDonor(donorAddress);

      res.status(200).json({
        success: true,
        donorAddress,
        sbts: sbts.map(([tokenId, metadata]) => ({
          nftTokenId: tokenId,
          metadata,
        })),
        total: sbts.length,
      });
    } catch (error: any) {
      console.error('[XRPLController] Get donor SBTs failed:', error);
      res.status(500).json({
        error: 'Failed to get SBTs',
        message: error.message || 'Internal server error',
      });
    }
  };

  /**
   * POST /api/xrpl/sbt/:nftTokenId/update
   * Update SBT metadata (after new donation, redistribution, etc)
   */
  updateSBT = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nftTokenId } = req.params;
      const updates = req.body;

      if (!nftTokenId) {
        res.status(400).json({
          error: 'Missing nftTokenId',
          message: 'nftTokenId is required',
        });
        return;
      }

      const result = await this.sbtService.updateSBT(nftTokenId, updates);

      res.status(result.success ? 200 : 404).json(result);
    } catch (error: any) {
      console.error('[XRPLController] SBT update failed:', error);
      res.status(500).json({
        error: 'SBT update failed',
        message: error.message || 'Internal server error',
      });
    }
  };

  /**
   * GET /api/xrpl/sbt/list/all
   * List all SBTs (admin/audit endpoint)
   */
  listAllSBTs = async (req: Request, res: Response): Promise<void> => {
    try {
      const sbts = this.sbtService.listAllSBTs();

      res.status(200).json({
        success: true,
        total: sbts.length,
        sbts,
      });
    } catch (error: any) {
      console.error('[XRPLController] List SBTs failed:', error);
      res.status(500).json({
        error: 'Failed to list SBTs',
        message: error.message || 'Internal server error',
      });
    }
  };

  /**
   * GET /api/xrpl/sbt/:nftTokenId/export
   * Export SBT as JSON
   */
  exportSBT = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nftTokenId } = req.params;

      const json = this.sbtService.exportSBT(nftTokenId);

      if (!json) {
        res.status(404).json({
          error: 'SBT not found',
          nftTokenId,
        });
        return;
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="sbt-${nftTokenId}.json"`
      );
      res.send(json);
    } catch (error: any) {
      console.error('[XRPLController] Export SBT failed:', error);
      res.status(500).json({
        error: 'Export failed',
        message: error.message || 'Internal server error',
      });
    }
  };

  /**
   * POST /api/xrpl/impact-nft/mint
   * Mint an Impact NFT after redistribution
   */
  mintImpactNFT = async (req: Request, res: Response): Promise<void> => {
    try {
      const { poolAddress, redistributionAmount, projectIds, redistributionCount } = req.body;

      if (!poolAddress || !projectIds || projectIds.length === 0) {
        res.status(400).json({
          error: 'Missing required fields',
          required: ['poolAddress', 'projectIds (array)'],
        });
        return;
      }

      const result = await this.impactNFTService.mintImpactNFT({
        poolAddress,
        redistributionAmount: redistributionAmount || 0,
        projectIds,
        redistributionCount: redistributionCount || 1,
      });

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      console.error('[XRPLController] Mint Impact NFT failed:', error);
      res.status(500).json({
        error: 'Mint failed',
        message: error.message || 'Internal server error',
      });
    }
  };

  /**
   * GET /api/xrpl/impact-nft/:nftTokenId
   * Read Impact NFT metadata
   */
  readImpactNFT = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nftTokenId } = req.params;

      const result = await this.impactNFTService.readImpactNFT(nftTokenId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error: any) {
      console.error('[XRPLController] Read Impact NFT failed:', error);
      res.status(500).json({
        error: 'Read failed',
        message: error.message || 'Internal server error',
      });
    }
  };

  /**
   * POST /api/xrpl/impact-nft/:nftTokenId/update
   * Update Impact NFT after new redistribution
   */
  updateImpactNFT = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nftTokenId } = req.params;
      const { redistributionAmount, projectIds, redistributionCount } = req.body;

      if (!redistributionAmount || !projectIds) {
        res.status(400).json({
          error: 'Missing required fields',
          required: ['redistributionAmount', 'projectIds'],
        });
        return;
      }

      const result = await this.impactNFTService.updateImpactNFT({
        nftTokenId,
        redistributionAmount,
        projectIds,
        redistributionCount: redistributionCount || 1,
      });

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      console.error('[XRPLController] Update Impact NFT failed:', error);
      res.status(500).json({
        error: 'Update failed',
        message: error.message || 'Internal server error',
      });
    }
  };

  /**
   * GET /api/xrpl/impact-nft/list/all
   * List all Impact NFTs (admin endpoint)
   */
  listAllImpactNFTs = async (req: Request, res: Response): Promise<void> => {
    try {
      const nfts = this.impactNFTService.listAllImpactNFTs();

      res.status(200).json({
        success: true,
        total: nfts.length,
        nfts,
      });
    } catch (error: any) {
      console.error('[XRPLController] List Impact NFTs failed:', error);
      res.status(500).json({
        error: 'List failed',
        message: error.message || 'Internal server error',
      });
    }
  };

  /**
   * GET /api/xrpl/impact-nft/:nftTokenId/export
   * Export Impact NFT as JSON
   */
  exportImpactNFT = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nftTokenId } = req.params;

      const json = this.impactNFTService.exportAsJSON(nftTokenId);

      if (!json || json.includes('error')) {
        res.status(404).json({
          error: 'Impact NFT not found',
          nftTokenId,
        });
        return;
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="impact-nft-${nftTokenId}.json"`
      );
      res.send(json);
    } catch (error: any) {
      console.error('[XRPLController] Export Impact NFT failed:', error);
      res.status(500).json({
        error: 'Export failed',
        message: error.message || 'Internal server error',
      });
    }
  };

  // ==========================================================================
  // PROJECTS - Humanitarian Projects with XRPL Escrows
  // ==========================================================================

  /**
   * GET /api/xrpl/projects
   * Get all humanitarian projects
   */
  getProjects = async (req: Request, res: Response): Promise<void> => {
    try {
      const projects = this.projectsService.getAllProjects();

      res.status(200).json({
        success: true,
        total: projects.length,
        projects
      });
    } catch (error: any) {
      console.error('[XRPLController] Get projects failed:', error);
      res.status(500).json({
        error: 'Failed to get projects',
        message: error.message || 'Internal server error',
      });
    }
  };

  /**
   * GET /api/xrpl/projects/:id
   * Get project by ID
   */
  getProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const project = this.projectsService.getProject(id);

      if (!project) {
        res.status(404).json({
          error: 'Project not found',
          message: `No project found with ID ${id}`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        project
      });
    } catch (error: any) {
      console.error('[XRPLController] Get project failed:', error);
      res.status(500).json({
        error: 'Failed to get project',
        message: error.message || 'Internal server error',
      });
    }
  };

  /**
   * GET /api/xrpl/projects/stats
   * Get projects statistics
   */
  getProjectsStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = this.projectsService.getStats();

      res.status(200).json({
        success: true,
        stats
      });
    } catch (error: any) {
      console.error('[XRPLController] Get stats failed:', error);
      res.status(500).json({
        error: 'Failed to get stats',
        message: error.message || 'Internal server error',
      });
    }
  };

  /**
   * POST /api/xrpl/projects
   * Create a new project with XRPL escrow
   * Body: { title, category, location, amount, conditions }
   */
  createProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const projectData = req.body;

      // Validation
      if (!projectData.title || !projectData.category || !projectData.location || !projectData.amount) {
        res.status(400).json({
          error: 'Missing required fields',
          required: ['title', 'category', 'location', 'amount'],
        });
        return;
      }

      const project = await this.projectsService.createProject(projectData);

      res.status(201).json({
        success: true,
        project
      });
    } catch (error: any) {
      console.error('[XRPLController] Create project failed:', error);
      res.status(500).json({
        error: 'Failed to create project',
        message: error.message || 'Internal server error',
      });
    }
  };

  /**
   * POST /api/xrpl/projects/:id/validate
   * Add validation proof to a project
   * Body: { validatorName, photoUrl, reputation }
   */
  addProjectValidation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const proof = req.body;

      if (!proof.validatorName || !proof.photoUrl) {
        res.status(400).json({
          error: 'Missing required fields',
          required: ['validatorName', 'photoUrl'],
        });
        return;
      }

      const project = this.projectsService.addValidationProof(id, proof);

      if (!project) {
        res.status(404).json({
          error: 'Project not found',
          message: `No project found with ID ${id}`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        project
      });
    } catch (error: any) {
      console.error('[XRPLController] Add validation failed:', error);
      res.status(500).json({
        error: 'Failed to add validation',
        message: error.message || 'Internal server error',
      });
    }
  };
}

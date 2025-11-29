/**
 * XRPL Routes
 *
 * Définition des routes API pour le module XRPL
 */

import { Router } from 'express';
import { XRPLController } from './controllers/xrpl.controller';

const router = Router();
const controller = new XRPLController();

// ==========================================================================
// XRPL ROUTES
// ==========================================================================

/**
 * Health Check
 * GET /api/xrpl/health
 */
router.get('/health', controller.healthCheck);

/**
 * Deposit (Donation)
 * POST /api/xrpl/deposit
 * Body: { donorAddress: string, amount: number, signature?: string }
 */
router.post('/deposit', controller.deposit);

/**
 * Simulate Profit
 * POST /api/xrpl/simulate-profit
 * Body: { profitPercentage?: number }
 */
router.post('/simulate-profit', controller.simulateProfit);

/**
 * Distribute Profits to NGOs
 * POST /api/xrpl/distribute
 * Body: { profitAmount: number }
 */
router.post('/distribute', controller.distributeProfits);

/**
 * Get Pool State
 * GET /api/xrpl/pool
 */
router.get('/pool', controller.getPoolState);

/**
 * Get Donor Info
 * GET /api/xrpl/donor/:address
 */
router.get('/donor/:address', controller.getDonorInfo);

/**
 * Get NGOs List
 * GET /api/xrpl/ngos?validated=true
 */
router.get('/ngos', controller.getNGOs);

/**
 * Validate NGO (Impact Oracle)
 * POST /api/xrpl/validate-ngo
 * Body: { ngoId: string, registrationNumber?: string, website?: string, country?: string }
 */
router.post('/validate-ngo', controller.validateNGO);

/**
 * Get Balance of an XRPL Address
 * GET /api/xrpl/balance/:address
 */
router.get('/balance/:address', controller.getBalance);

// ==========================================================================
// SBT (SOULBOUND TOKEN) ROUTES
// ==========================================================================

/**
 * Mint SBT for a donor
 * POST /api/xrpl/sbt/mint
 * Body: { donorAddress, totalDonated, ngosSupported?, level? }
 */
router.post('/sbt/mint', controller.mintSBT);

/**
 * Read SBT metadata
 * GET /api/xrpl/sbt/:nftTokenId
 */
router.get('/sbt/:nftTokenId', controller.readSBT);

/**
 * Update SBT metadata
 * POST /api/xrpl/sbt/:nftTokenId/update
 * Body: { totalDonated?, redistributionsCount?, ngosSupported?, level? }
 */
router.post('/sbt/:nftTokenId/update', controller.updateSBT);

/**
 * Record governance vote for SBT holder
 * POST /api/xrpl/sbt/:nftTokenId/vote
 */
router.post('/sbt/:nftTokenId/vote', controller.recordSBTVote);

/**
 * Get all SBTs for a donor
 * GET /api/xrpl/sbt/donor/:donorAddress
 */
router.get('/sbt/donor/:donorAddress', controller.getDonorSBTs);

/**
 * List all SBTs (admin)
 * GET /api/xrpl/sbt/list/all
 */
router.get('/sbt/list/all', controller.listAllSBTs);

/**
 * Export SBT as JSON
 * GET /api/xrpl/sbt/:nftTokenId/export
 */
router.get('/sbt/:nftTokenId/export', controller.exportSBT);

export default router;

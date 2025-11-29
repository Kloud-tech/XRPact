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

export default router;

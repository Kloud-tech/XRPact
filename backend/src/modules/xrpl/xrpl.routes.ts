/**
 * XRPL Routes
 *
 * Définition des routes API pour le module XRPL
 */

import { Router } from 'express';
import { XRPLController } from './controllers/xrpl.controller';
import KYCController from './controllers/kyc.controller';
import XamanController from './controllers/xaman.controller';

const router = Router();
const controller = new XRPLController();
const kycController = new KYCController();
const xamanController = new XamanController();

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

// ==========================================================================
// IMPACT NFT ROUTES
// ==========================================================================

/**
 * Mint Impact NFT after redistribution
 * POST /api/xrpl/impact-nft/mint
 * Body: { poolAddress: string, redistributionAmount: number, projectIds: string[], redistributionCount?: number }
 */
router.post('/impact-nft/mint', controller.mintImpactNFT);

/**
 * Read Impact NFT metadata
 * GET /api/xrpl/impact-nft/:nftTokenId
 */
router.get('/impact-nft/:nftTokenId', controller.readImpactNFT);

/**
 * Update Impact NFT after new redistribution
 * POST /api/xrpl/impact-nft/:nftTokenId/update
 * Body: { redistributionAmount: number, projectIds: string[], redistributionCount?: number }
 */
router.post('/impact-nft/:nftTokenId/update', controller.updateImpactNFT);

/**
 * List all Impact NFTs (admin)
 * GET /api/xrpl/impact-nft/list/all
 */
router.get('/impact-nft/list/all', controller.listAllImpactNFTs);

/**
 * Export Impact NFT as JSON
 * GET /api/xrpl/impact-nft/:nftTokenId/export
 */
router.get('/impact-nft/:nftTokenId/export', controller.exportImpactNFT);

// ==========================================================================
// KYC ROUTES
// ==========================================================================

/**
 * Submit KYC Verification
 * POST /api/kyc/submit
 * Body: { entityType, address, fullName, email, countryCode, documentType, documentNumber }
 */
router.post('/kyc/submit', kycController.submitKYC);

/**
 * Get KYC Status
 * GET /api/kyc/:kycId
 */
router.get('/kyc/:kycId', kycController.getKYCStatus);

/**
 * Check KYC Verification
 * GET /api/kyc/check/:address
 */
router.get('/kyc/check/:address', kycController.checkKYCVerification);

/**
 * Update KYC Status (Admin)
 * POST /api/kyc/:kycId/update-status
 */
router.post('/kyc/:kycId/update-status', kycController.updateKYCStatus);

/**
 * List All KYC Records (Admin)
 * GET /api/kyc/list/all
 */
router.get('/kyc/list/all', kycController.listAllKYC);

/**
 * Export KYC Data
 * GET /api/kyc/:kycId/export
 */
router.get('/kyc/:kycId/export', kycController.exportKYC);

// ==========================================================================
// XAMAN MULTISIG ROUTES
// ==========================================================================

/**
 * Generate Wallet Connection QR Code
 * GET /api/xrpl/xaman/connect
 */
router.get('/xaman/connect', xamanController.generateConnectionQR);

/**
 * Create Multisig Transaction Request
 * POST /api/xrpl/xaman/multisig/request
 * Body: { transaction, signers[], requiredSignatures, description? }
 */
router.post('/xaman/multisig/request', xamanController.createMultisigRequest);

/**
 * Register Signature for Multisig
 * POST /api/xrpl/xaman/multisig/:multisigId/sign
 * Body: { address, signature, userToken? }
 */
router.post('/xaman/multisig/:multisigId/sign', xamanController.registerSignature);

/**
 * Get Multisig Transaction Status
 * GET /api/xrpl/xaman/multisig/:multisigId/status
 */
router.get('/xaman/multisig/:multisigId/status', xamanController.getMultisigStatus);

/**
 * Execute Multisig Transaction
 * POST /api/xrpl/xaman/multisig/:multisigId/execute
 */
router.post('/xaman/multisig/:multisigId/execute', xamanController.executeMultisig);

/**
 * Reject Multisig Transaction
 * POST /api/xrpl/xaman/multisig/:multisigId/reject
 * Body: { signer, reason? }
 */
router.post('/xaman/multisig/:multisigId/reject', xamanController.rejectMultisig);

/**
 * Get Wallet Multisig Information
 * GET /api/xrpl/xaman/wallet/:address/multisig-info
 */
router.get('/xaman/wallet/:address/multisig-info', xamanController.getWalletMultisigInfo);

/**
 * List Pending Multisig Transactions for Address
 * GET /api/xrpl/xaman/wallet/:address/pending
 */
router.get('/xaman/wallet/:address/pending', xamanController.listPendingMultisig);

/**
 * Export Multisig Data
 * GET /api/xrpl/xaman/multisig/:multisigId/export
 */
router.get('/xaman/multisig/:multisigId/export', xamanController.exportMultisigData);

/**
 * Xaman Webhook Callback
 * POST /api/xrpl/xaman/webhook
 * Body: { uuid, txid, meta }
 */
router.post('/xaman/webhook', xamanController.handleCallback);

export default router;

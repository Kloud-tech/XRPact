/**
 * Xaman Controller
 * Handles HTTP requests for multisig transactions via Xaman
 */

import { Request, Response } from 'express';
import XamanService, { XamanUser } from '../services/xaman.service';

export class XamanController {
  private xamanService: XamanService;

  constructor() {
    this.xamanService = new XamanService();
  }

  /**
   * Generate wallet connection QR code
   * GET /xaman/connect
   */
  async generateConnectionQR(_req: Request, res: Response): Promise<void> {
    try {
      const qrData = await this.xamanService.generateConnectionQR();

      res.json({
        success: true,
        data: qrData,
      });
    } catch (error) {
      console.error('[XamanController] Error generating connection QR:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate QR code',
      });
    }
  }

  /**
   * Create multisig transaction request
   * POST /xaman/multisig/request
   */
  async createMultisigRequest(req: Request, res: Response): Promise<void> {
    try {
      const { transaction, signers, requiredSignatures, description } = req.body;

      // Validation
      if (!transaction) {
        res.status(400).json({ success: false, error: 'Transaction object required' });
        return;
      }

      if (!signers || signers.length === 0) {
        res.status(400).json({ success: false, error: 'Signers array required' });
        return;
      }

      if (!requiredSignatures || requiredSignatures > signers.length) {
        res.status(400).json({ success: false, error: 'Invalid requiredSignatures count' });
        return;
      }

      const result = await this.xamanService.createMultisigRequest({
        transaction,
        signers,
        requiredSignatures,
        description,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('[XamanController] Error creating multisig request:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create multisig request',
      });
    }
  }

  /**
   * Register signer signature
   * POST /xaman/multisig/:multisigId/sign
   */
  async registerSignature(req: Request, res: Response): Promise<void> {
    try {
      const { multisigId } = req.params;
      const { address, signature, userToken } = req.body;

      if (!address || !signature) {
        res.status(400).json({ success: false, error: 'Address and signature required' });
        return;
      }

      const signer: XamanUser = {
        address,
        userToken,
        isMultisig: true,
      };

      const result = await this.xamanService.registerSigner(multisigId, signer, signature);

      if (result) {
        res.json({
          success: true,
          message: `Signature registered for ${address}`,
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Failed to register signature or already signed',
        });
      }
    } catch (error) {
      console.error('[XamanController] Error registering signature:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to register signature',
      });
    }
  }

  /**
   * Get multisig transaction status
   * GET /xaman/multisig/:multisigId/status
   */
  async getMultisigStatus(req: Request, res: Response): Promise<void> {
    try {
      const { multisigId } = req.params;

      const status = this.xamanService.getMultisigStatus(multisigId);

      if (!status) {
        res.status(404).json({
          success: false,
          error: 'Multisig transaction not found',
        });
        return;
      }

      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      console.error('[XamanController] Error getting multisig status:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get status',
      });
    }
  }

  /**
   * Execute multisig transaction
   * POST /xaman/multisig/:multisigId/execute
   */
  async executeMultisig(req: Request, res: Response): Promise<void> {
    try {
      const { multisigId } = req.params;

      const result = await this.xamanService.executeMultisigTransaction(multisigId);

      if (result.success) {
        res.json({
          success: true,
          data: {
            txHash: result.txHash,
            message: 'Transaction executed successfully',
          },
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      console.error('[XamanController] Error executing multisig:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute transaction',
      });
    }
  }

  /**
   * Reject multisig transaction
   * POST /xaman/multisig/:multisigId/reject
   */
  async rejectMultisig(req: Request, res: Response): Promise<void> {
    try {
      const { multisigId } = req.params;
      const { signer, reason } = req.body;

      if (!signer) {
        res.status(400).json({ success: false, error: 'Signer address required' });
        return;
      }

      const result = await this.xamanService.rejectMultisigTransaction(multisigId, signer, reason);

      if (result) {
        res.json({
          success: true,
          message: 'Multisig transaction rejected',
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Failed to reject multisig transaction',
        });
      }
    } catch (error) {
      console.error('[XamanController] Error rejecting multisig:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reject transaction',
      });
    }
  }

  /**
   * Get wallet multisig info
   * GET /xaman/wallet/:address/multisig-info
   */
  async getWalletMultisigInfo(req: Request, res: Response): Promise<void> {
    try {
      const { address } = req.params;

      const info = this.xamanService.getWalletMultisigInfo(address);

      if (!info) {
        res.status(404).json({
          success: false,
          error: 'Wallet not found in system',
        });
        return;
      }

      res.json({
        success: true,
        data: info,
      });
    } catch (error) {
      console.error('[XamanController] Error getting wallet info:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get wallet info',
      });
    }
  }

  /**
   * List pending multisig transactions for address
   * GET /xaman/wallet/:address/pending
   */
  async listPendingMultisig(req: Request, res: Response): Promise<void> {
    try {
      const { address } = req.params;

      const pending = this.xamanService.listPendingMultisig(address);

      res.json({
        success: true,
        data: {
          address,
          pendingCount: pending.length,
          transactions: pending,
        },
      });
    } catch (error) {
      console.error('[XamanController] Error listing pending multisig:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list pending transactions',
      });
    }
  }

  /**
   * Export multisig transaction data
   * GET /xaman/multisig/:multisigId/export
   */
  async exportMultisigData(req: Request, res: Response): Promise<void> {
    try {
      const { multisigId } = req.params;

      const data = this.xamanService.exportMultisigData(multisigId);

      if (data.error) {
        res.status(404).json({ success: false, error: data.error });
        return;
      }

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('[XamanController] Error exporting multisig data:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export data',
      });
    }
  }

  /**
   * Xaman webhook callback for transaction updates
   * POST /xaman/webhook
   */
  async handleCallback(req: Request, res: Response): Promise<void> {
    try {
      const { uuid, txid, meta } = req.body;

      console.log('[XamanController] Webhook received:', {
        uuid,
        txid,
        meta,
      });

      // In production, would validate signature and handle transaction updates
      res.json({
        success: true,
        message: 'Webhook processed',
      });
    } catch (error) {
      console.error('[XamanController] Error processing webhook:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process webhook',
      });
    }
  }
}

export default XamanController;

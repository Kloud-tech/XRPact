/**
 * KYC Controller
 * Handles KYC endpoints
 */

import { Request, Response } from 'express';
import KYCService, { KYCVerificationRequest } from '../services/kyc.service';

export class KYCController {
  private kycService: KYCService;

  constructor() {
    this.kycService = new KYCService();
  }

  /**
   * Submit KYC verification
   * POST /api/kyc/submit
   */
  submitKYC = async (req: Request, res: Response): Promise<void> => {
    try {
      const { entityType, address, fullName, email, countryCode, documentType, documentNumber } =
        req.body;

      if (!entityType || !address || !fullName || !email || !countryCode || !documentType || !documentNumber) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields',
        });
        return;
      }

      const request: KYCVerificationRequest = {
        entityType,
        address,
        fullName,
        email,
        countryCode,
        documentType,
        documentNumber,
      };

      const result = this.kycService.submitKYCVerification(request);

      res.json(result);
    } catch (error) {
      console.error('[KYCController] Error submitting KYC:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit KYC',
      });
    }
  };

  /**
   * Get KYC status
   * GET /api/kyc/:kycId
   */
  getKYCStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { kycId } = req.params;

      const kyc = this.kycService.getKYCStatus(kycId);
      if (!kyc) {
        res.status(404).json({
          success: false,
          error: 'KYC record not found',
        });
        return;
      }

      res.json({
        success: true,
        kyc: {
          id: kyc.id,
          entityType: kyc.entityType,
          address: kyc.address,
          fullName: kyc.fullName,
          email: kyc.email,
          verificationStatus: kyc.verificationStatus,
          riskScore: kyc.riskScore,
          verificationDate: kyc.verificationDate,
          expiryDate: kyc.expiryDate,
        },
      });
    } catch (error) {
      console.error('[KYCController] Error getting KYC status:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get KYC status',
      });
    }
  };

  /**
   * Check if address is KYC verified
   * GET /api/kyc/check/:address
   */
  checkKYCVerification = async (req: Request, res: Response): Promise<void> => {
    try {
      const { address } = req.params;

      const isVerified = this.kycService.isKYCVerified(address);
      const kyc = this.kycService.getKYCByAddress(address);

      res.json({
        success: true,
        address,
        isVerified,
        kyc: kyc
          ? {
              id: kyc.id,
              status: kyc.verificationStatus,
              riskScore: kyc.riskScore,
              expiryDate: kyc.expiryDate,
            }
          : null,
      });
    } catch (error) {
      console.error('[KYCController] Error checking KYC:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check KYC',
      });
    }
  };

  /**
   * Update KYC status (admin)
   * POST /api/kyc/:kycId/update-status
   */
  updateKYCStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { kycId } = req.params;
      const { status, notes } = req.body;

      if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Invalid status',
        });
        return;
      }

      const success = this.kycService.updateKYCStatus(kycId, status, notes);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'KYC record not found',
        });
        return;
      }

      res.json({
        success: true,
        message: `KYC status updated to ${status}`,
      });
    } catch (error) {
      console.error('[KYCController] Error updating KYC status:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update KYC status',
      });
    }
  };

  /**
   * List all KYC records (admin)
   * GET /api/kyc/list/all
   */
  listAllKYC = async (_req: Request, res: Response): Promise<void> => {
    try {
      const records = this.kycService.listAllKYCRecords();

      res.json({
        success: true,
        total: records.length,
        records: records.map((r) => ({
          id: r.id,
          entityType: r.entityType,
          address: r.address,
          fullName: r.fullName,
          status: r.verificationStatus,
          riskScore: r.riskScore,
          verificationDate: r.verificationDate,
        })),
      });
    } catch (error) {
      console.error('[KYCController] Error listing KYC records:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list KYC records',
      });
    }
  };

  /**
   * Export KYC data
   * GET /api/kyc/:kycId/export
   */
  exportKYC = async (req: Request, res: Response): Promise<void> => {
    try {
      const { kycId } = req.params;

      const data = this.kycService.exportKYCData(kycId);

      if (data.error) {
        res.status(404).json(data);
        return;
      }

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('[KYCController] Error exporting KYC:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export KYC',
      });
    }
  };
}

export default KYCController;

/**
 * KYC Service
 * Handles Know Your Customer verification for donors and NGOs
 */

export interface KYCData {
  id: string;
  entityType: 'donor' | 'ngo';
  address: string;
  fullName: string;
  email: string;
  countryCode: string;
  documentType: 'passport' | 'id' | 'license';
  documentNumber: string;
  documentHash: string; // Hash of encrypted document
  verificationStatus: 'pending' | 'approved' | 'rejected';
  riskScore: number; // 0-100, higher = higher risk
  verificationDate?: Date;
  expiryDate?: Date;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface KYCVerificationRequest {
  entityType: 'donor' | 'ngo';
  address: string;
  fullName: string;
  email: string;
  countryCode: string;
  documentType: 'passport' | 'id' | 'license';
  documentNumber: string;
  documentBase64?: string; // For document upload
}

export interface KYCVerificationResult {
  success: boolean;
  kycId: string;
  status: 'pending' | 'approved' | 'rejected';
  riskScore: number;
  message: string;
  details?: {
    nameMatches: boolean;
    documentValid: boolean;
    sanctions: boolean;
    pep: boolean; // Politically Exposed Person
    aml: boolean; // Anti-Money Laundering
  };
}

export class KYCService {
  private kycDatabase: Map<string, KYCData> = new Map();

  /**
   * Submit KYC verification
   */
  submitKYCVerification(request: KYCVerificationRequest): KYCVerificationResult {
    try {
      // Generate unique KYC ID
      const kycId = `kyc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Hash document
      const documentHash = this.hashDocument(request.documentNumber);

      // Perform risk assessment
      const riskScore = this.calculateRiskScore(request);

      // Check sanctions lists (mock)
      const sanctions = this.checkSanctions(request.fullName);
      const pep = this.checkPEP(request.fullName);
      const aml = this.checkAML(request.countryCode);

      // Determine initial status
      let status: 'pending' | 'approved' | 'rejected' = 'pending';
      if (sanctions || pep || aml) {
        status = 'rejected';
      } else if (riskScore < 30) {
        status = 'approved'; // Auto-approve low-risk
      }

      // Store KYC data
      const kycData: KYCData = {
        id: kycId,
        entityType: request.entityType,
        address: request.address,
        fullName: request.fullName,
        email: request.email,
        countryCode: request.countryCode,
        documentType: request.documentType,
        documentNumber: request.documentNumber,
        documentHash,
        verificationStatus: status,
        riskScore,
        verificationDate: status === 'approved' ? new Date() : undefined,
        expiryDate: status === 'approved' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : undefined,
      };

      this.kycDatabase.set(kycId, kycData);

      return {
        success: true,
        kycId,
        status,
        riskScore,
        message: status === 'approved' ? 'KYC approved' : 'KYC under review',
        details: {
          nameMatches: true,
          documentValid: true,
          sanctions,
          pep,
          aml,
        },
      };
    } catch (error) {
      return {
        success: false,
        kycId: '',
        status: 'rejected',
        riskScore: 100,
        message: `KYC submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get KYC status
   */
  getKYCStatus(kycId: string): KYCData | null {
    return this.kycDatabase.get(kycId) || null;
  }

  /**
   * Get KYC by address
   */
  getKYCByAddress(address: string): KYCData | null {
    for (const [, kycData] of this.kycDatabase) {
      if (kycData.address === address) {
        return kycData;
      }
    }
    return null;
  }

  /**
   * Verify KYC status
   */
  isKYCVerified(address: string): boolean {
    const kyc = this.getKYCByAddress(address);
    return kyc?.verificationStatus === 'approved' && (!kyc.expiryDate || kyc.expiryDate > new Date());
  }

  /**
   * Update KYC status (admin)
   */
  updateKYCStatus(
    kycId: string,
    status: 'pending' | 'approved' | 'rejected',
    notes?: string,
  ): boolean {
    const kyc = this.kycDatabase.get(kycId);
    if (!kyc) return false;

    kyc.verificationStatus = status;
    if (notes) kyc.notes = notes;
    if (status === 'approved') {
      kyc.verificationDate = new Date();
      kyc.expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    }

    return true;
  }

  /**
   * Calculate risk score (0-100)
   */
  private calculateRiskScore(request: KYCVerificationRequest): number {
    let score = 0;

    // High-risk countries (mock list)
    const highRiskCountries = ['IR', 'KP', 'SY', 'CU'];
    if (highRiskCountries.includes(request.countryCode)) {
      score += 40;
    } else if (['RU', 'CN'].includes(request.countryCode)) {
      score += 20;
    }

    // Document type risk
    const documentRisk: Record<string, number> = {
      passport: 10,
      id: 20,
      license: 30,
    };
    score += documentRisk[request.documentType] || 25;

    // Email validation
    if (!request.email.includes('@')) {
      score += 15;
    }

    return Math.min(100, score);
  }

  /**
   * Check sanctions lists (mock)
   */
  private checkSanctions(name: string): boolean {
    // Mock implementation - in production, use real API
    const sanctions = ['terrorist', 'criminal', 'blacklist'];
    return sanctions.some((s) => name.toLowerCase().includes(s));
  }

  /**
   * Check PEP (Politically Exposed Person)
   */
  private checkPEP(name: string): boolean {
    // Mock implementation - in production, use real API
    const peps = ['dictator', 'oligarch', 'minister'];
    return peps.some((p) => name.toLowerCase().includes(p));
  }

  /**
   * Check AML (Anti-Money Laundering)
   */
  private checkAML(countryCode: string): boolean {
    // Mock implementation
    const amlFlags = ['IR', 'KP']; // Iran, North Korea
    return amlFlags.includes(countryCode);
  }

  /**
   * Hash document number
   */
  private hashDocument(documentNumber: string): string {
    let hash = 0;
    for (let i = 0; i < documentNumber.length; i++) {
      const char = documentNumber.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `hash_${Math.abs(hash).toString(16)}`;
  }

  /**
   * List all KYC records (admin)
   */
  listAllKYCRecords(): KYCData[] {
    return Array.from(this.kycDatabase.values());
  }

  /**
   * Export KYC data as JSON
   */
  exportKYCData(kycId: string): Record<string, any> {
    const kyc = this.kycDatabase.get(kycId);
    if (!kyc) return { error: 'KYC not found' };

    return {
      kycId,
      entityType: kyc.entityType,
      address: kyc.address,
      name: kyc.fullName,
      email: kyc.email,
      country: kyc.countryCode,
      documentType: kyc.documentType,
      status: kyc.verificationStatus,
      riskScore: kyc.riskScore,
      verificationDate: kyc.verificationDate,
      expiryDate: kyc.expiryDate,
    };
  }
}

export default KYCService;

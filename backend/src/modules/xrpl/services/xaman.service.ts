/**
 * Xaman (Xumm) Integration Service
 * Handles multisig transactions and wallet integration with Xaman
 */

export interface XamanSignRequest {
  txjson: any; // XRPL transaction object
  custom_meta?: {
    instruction?: string;
    identifier?: string;
    return_url_app?: string;
    return_url_web?: string;
  };
  user_token?: string;
}

export interface XamanSignResponse {
  success: boolean;
  uuid: string;
  next?: {
    always: string;
    onSigning?: string;
  };
  pushed?: boolean;
  deeplink?: string;
  qrcode?: {
    url: string;
    png?: string;
  };
}

export interface MultisigTransaction {
  id: string;
  transactionHash: string;
  signers: string[];
  requiredSignatures: number;
  currentSignatures: number;
  status: 'pending' | 'signed' | 'rejected' | 'executed';
  createdAt: Date;
  expiresAt: Date;
  transaction: any;
  signatures: Map<string, string>;
}

export interface XamanUser {
  address: string;
  userToken?: string;
  isMultisig?: boolean;
}

export class XamanService {
  private readonly XAMAN_SIGN_API = 'https://xaman.app/sign';
  private multisigTransactions: Map<string, MultisigTransaction> = new Map();
  private xamanUsers: Map<string, XamanUser> = new Map();

  constructor() {}

  /**
   * Generate QR code for wallet connection
   */
  async generateConnectionQR(): Promise<{
    qrcode: string;
    deeplink: string;
    callbackUrl: string;
  }> {
    try {
      // In production, this would call Xaman API
      // For now, return mock data
      const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return {
        qrcode: `https://xaman.app/qr?data=${connectionId}`,
        deeplink: `xumm://xapp?identifier=${connectionId}`,
        callbackUrl: `/api/xrpl/xaman/callback/${connectionId}`,
      };
    } catch (error) {
      console.error('[XamanService] Error generating connection QR:', error);
      throw error;
    }
  }

  /**
   * Create multisig transaction request
   */
  async createMultisigRequest(request: {
    transaction: any;
    signers: string[];
    requiredSignatures: number;
    description?: string;
  }): Promise<{
    multisigId: string;
    qrcode: string;
    deeplink: string;
    signingUrl: string;
  }> {
    try {
      const multisigId = `msig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create multisig transaction record
      const multisigTx: MultisigTransaction = {
        id: multisigId,
        transactionHash: '',
        signers: request.signers,
        requiredSignatures: request.requiredSignatures,
        currentSignatures: 0,
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        transaction: request.transaction,
        signatures: new Map(),
      };

      this.multisigTransactions.set(multisigId, multisigTx);

      // Generate signing request for Xaman
      // const xamanRequest: XamanSignRequest = {
      //   txjson: request.transaction,
      //   custom_meta: {
      //     instruction: request.description || 'Sign multisig transaction',
      //     identifier: multisigId,
      //     return_url_web: `https://impact-fund.app/multisig/${multisigId}`,
      //     return_url_app: `xumm://deep?identifier=${multisigId}`,
      //   },
      // };

      return {
        multisigId,
        qrcode: `https://xaman.app/qr?data=${multisigId}`,
        deeplink: `xumm://sign?identifier=${multisigId}`,
        signingUrl: `${this.XAMAN_SIGN_API}?identifier=${multisigId}`,
      };
    } catch (error) {
      console.error('[XamanService] Error creating multisig request:', error);
      throw error;
    }
  }

  /**
   * Register signer for multisig transaction
   */
  async registerSigner(multisigId: string, signer: XamanUser, signature: string): Promise<boolean> {
    try {
      const multisigTx = this.multisigTransactions.get(multisigId);

      if (!multisigTx) {
        throw new Error(`Multisig transaction ${multisigId} not found`);
      }

      // Check if signer is authorized
      if (!multisigTx.signers.includes(signer.address)) {
        throw new Error(`${signer.address} is not authorized to sign this transaction`);
      }

      // Check if already signed
      if (multisigTx.signatures.has(signer.address)) {
        console.warn(`[XamanService] ${signer.address} already signed multisig ${multisigId}`);
        return false;
      }

      // Register signature
      multisigTx.signatures.set(signer.address, signature);
      multisigTx.currentSignatures = multisigTx.signatures.size;

      // Check if all signatures collected
      if (multisigTx.currentSignatures >= multisigTx.requiredSignatures) {
        multisigTx.status = 'signed';
        console.log(`[XamanService] Multisig ${multisigId} has all required signatures`);
      }

      // Store user info
      if (!this.xamanUsers.has(signer.address)) {
        this.xamanUsers.set(signer.address, signer);
      }

      return true;
    } catch (error) {
      console.error('[XamanService] Error registering signer:', error);
      throw error;
    }
  }

  /**
   * Get multisig transaction status
   */
  getMultisigStatus(multisigId: string): {
    id: string;
    status: string;
    currentSignatures: number;
    requiredSignatures: number;
    signers: string[];
    pendingSigners: string[];
    expiresAt: Date;
  } | null {
    try {
      const multisigTx = this.multisigTransactions.get(multisigId);

      if (!multisigTx) {
        return null;
      }

      const signedAddresses = Array.from(multisigTx.signatures.keys());
      const pendingSigners = multisigTx.signers.filter((s) => !signedAddresses.includes(s));

      return {
        id: multisigTx.id,
        status: multisigTx.status,
        currentSignatures: multisigTx.currentSignatures,
        requiredSignatures: multisigTx.requiredSignatures,
        signers: multisigTx.signers,
        pendingSigners,
        expiresAt: multisigTx.expiresAt,
      };
    } catch (error) {
      console.error('[XamanService] Error getting multisig status:', error);
      return null;
    }
  }

  /**
   * Execute multisig transaction
   */
  async executeMultisigTransaction(multisigId: string): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }> {
    try {
      const multisigTx = this.multisigTransactions.get(multisigId);

      if (!multisigTx) {
        return { success: false, error: 'Multisig transaction not found' };
      }

      if (multisigTx.status !== 'signed') {
        return { success: false, error: `Cannot execute: status is ${multisigTx.status}` };
      }

      if (multisigTx.currentSignatures < multisigTx.requiredSignatures) {
        return { success: false, error: 'Not enough signatures' };
      }

      // In production, would submit to XRPL with all signatures
      const txHash = `${multisigId}_${Date.now()}`;
      multisigTx.status = 'executed';
      multisigTx.transactionHash = txHash;

      console.log(`[XamanService] Multisig ${multisigId} executed with hash ${txHash}`);

      return { success: true, txHash };
    } catch (error) {
      console.error('[XamanService] Error executing multisig transaction:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Execution failed' };
    }
  }

  /**
   * Reject multisig transaction
   */
  async rejectMultisigTransaction(multisigId: string, signer: string, reason?: string): Promise<boolean> {
    try {
      const multisigTx = this.multisigTransactions.get(multisigId);

      if (!multisigTx) {
        throw new Error(`Multisig transaction ${multisigId} not found`);
      }

      multisigTx.status = 'rejected';
      console.log(`[XamanService] Multisig ${multisigId} rejected by ${signer}: ${reason || 'No reason provided'}`);

      return true;
    } catch (error) {
      console.error('[XamanService] Error rejecting multisig transaction:', error);
      return false;
    }
  }

  /**
   * Get wallet multisig info
   */
  getWalletMultisigInfo(address: string): {
    address: string;
    isMultisig: boolean;
    activeTransactions: number;
    signingHistory: number;
  } | null {
    try {
      const user = this.xamanUsers.get(address);

      if (!user) {
        return null;
      }

      // Count active transactions for this signer
      let activeCount = 0;
      let signingCount = 0;

      this.multisigTransactions.forEach((tx) => {
        if (tx.signers.includes(address)) {
          if (tx.status === 'pending' || tx.status === 'signed') {
            activeCount++;
          }
          if (tx.signatures.has(address)) {
            signingCount++;
          }
        }
      });

      return {
        address,
        isMultisig: user.isMultisig || false,
        activeTransactions: activeCount,
        signingHistory: signingCount,
      };
    } catch (error) {
      console.error('[XamanService] Error getting wallet info:', error);
      return null;
    }
  }

  /**
   * List pending multisig transactions for address
   */
  listPendingMultisig(address: string): Array<{
    id: string;
    status: string;
    pendingSigners: number;
    createdAt: Date;
    expiresAt: Date;
  }> {
    try {
      const pending: Array<{
        id: string;
        status: string;
        pendingSigners: number;
        createdAt: Date;
        expiresAt: Date;
      }> = [];

      this.multisigTransactions.forEach((tx) => {
        if (tx.signers.includes(address) && (tx.status === 'pending' || tx.status === 'signed')) {
          const pendingSigners = tx.signers.filter((s) => !Array.from(tx.signatures.keys()).includes(s)).length;
          pending.push({
            id: tx.id,
            status: tx.status,
            pendingSigners,
            createdAt: tx.createdAt,
            expiresAt: tx.expiresAt,
          });
        }
      });

      return pending;
    } catch (error) {
      console.error('[XamanService] Error listing pending multisig:', error);
      return [];
    }
  }

  /**
   * Export multisig data
   */
  exportMultisigData(multisigId: string): Record<string, any> {
    const multisigTx = this.multisigTransactions.get(multisigId);

    if (!multisigTx) {
      return { error: 'Multisig transaction not found' };
    }

    return {
      id: multisigTx.id,
      status: multisigTx.status,
      signers: multisigTx.signers,
      currentSignatures: multisigTx.currentSignatures,
      requiredSignatures: multisigTx.requiredSignatures,
      createdAt: multisigTx.createdAt,
      expiresAt: multisigTx.expiresAt,
      transaction: multisigTx.transaction,
      signatures: Array.from(multisigTx.signatures.entries()),
    };
  }
}

export default XamanService;

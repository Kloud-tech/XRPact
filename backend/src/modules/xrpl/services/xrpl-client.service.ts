/**
 * XRPL Client Service
 *
 * Gère la connexion au réseau XRPL et les opérations de base.
 * Supporte le mode MOCK pour le développement sans connexion réelle.
 *
 * Usage:
 *   const client = new XRPLClientService();
 *   await client.connect();
 *   const balance = await client.getBalance('rAddress...');
 */

import { Client, Wallet, Payment, dropsToXrp, xrpToDrops } from 'xrpl';
import { XRPLConfig, XRPLTransaction } from '../types/xrpl.types';

export class XRPLClientService {
  private client: Client | null = null;
  private config: XRPLConfig;
  private poolWallet: Wallet | null = null;
  private mockMode: boolean;

  constructor() {
    // Configuration depuis les variables d'environnement
    console.log('[XRPLClient] Environment check:', {
      XRPL_NETWORK: process.env.XRPL_NETWORK,
      XRPL_WEBSOCKET_URL: process.env.XRPL_WEBSOCKET_URL,
      hasWalletSeed: !!process.env.XRPL_POOL_WALLET_SEED,
      hasWalletAddress: !!process.env.XRPL_POOL_WALLET_ADDRESS
    });

    this.config = {
      network: (process.env.XRPL_NETWORK as any) || 'mock',
      websocketUrl: process.env.XRPL_WEBSOCKET_URL || 'wss://s.altnet.rippletest.net:51233',
      poolWalletSeed: process.env.XRPL_POOL_WALLET_SEED,
      poolWalletAddress: process.env.XRPL_POOL_WALLET_ADDRESS || 'rMockPoolWallet123',
      mockMode: process.env.XRPL_NETWORK === 'mock' || !process.env.XRPL_WEBSOCKET_URL,
    };

    this.mockMode = this.config.mockMode;

    console.log(`[XRPLClient] Initialized in ${this.mockMode ? 'MOCK' : 'LIVE'} mode`);
  }

  /**
   * Connexion au réseau XRPL
   * En mode MOCK, simule une connexion réussie
   */
  async connect(): Promise<void> {
    if (this.mockMode) {
      console.log('[XRPLClient] MOCK mode: Simulating connection');
      await this.delay(100);
      return;
    }

    try {
      this.client = new Client(this.config.websocketUrl);
      await this.client.connect();

      // Initialiser le wallet du pool si seed disponible
      if (this.config.poolWalletSeed) {
        this.poolWallet = Wallet.fromSeed(this.config.poolWalletSeed);
        console.log(`[XRPLClient] Pool wallet initialized: ${this.poolWallet.address}`);
      }

      console.log('[XRPLClient] Connected to XRPL network');
    } catch (error) {
      console.error('[XRPLClient] Connection failed:', error);
      throw new Error('Failed to connect to XRPL network');
    }
  }

  /**
   * Déconnexion du réseau XRPL
   */
  async disconnect(): Promise<void> {
    if (this.mockMode) {
      console.log('[XRPLClient] MOCK mode: Simulating disconnection');
      return;
    }

    if (this.client) {
      await this.client.disconnect();
      this.client = null;
      console.log('[XRPLClient] Disconnected from XRPL network');
    }
  }

  /**
   * Récupérer le solde d'une adresse
   * En mode MOCK, retourne un solde aléatoire
   */
  async getBalance(address: string): Promise<number> {
    if (this.mockMode) {
      // Mock: retourne un solde aléatoire entre 100 et 10000 XRP
      const mockBalance = Math.random() * 9900 + 100;
      console.log(`[XRPLClient] MOCK: Balance for ${address}: ${mockBalance.toFixed(2)} XRP`);
      return mockBalance;
    }

    try {
      if (!this.client) {
        throw new Error('XRPL client not connected');
      }

      const response = await this.client.request({
        command: 'account_info',
        account: address,
        ledger_index: 'validated',
      });

      const balance = Number(dropsToXrp(response.result.account_data.Balance));
      return balance;
    } catch (error) {
      console.error(`[XRPLClient] Failed to get balance for ${address}:`, error);
      throw error;
    }
  }

  /**
   * Envoyer une transaction de paiement
   * En mode MOCK, simule une transaction réussie
   */
  async sendPayment(
    destination: string,
    amount: number,
    memo?: string
  ): Promise<XRPLTransaction> {
    if (this.mockMode) {
      // Mock: simule une transaction réussie
      await this.delay(500);
      const mockTx: XRPLTransaction = {
        type: 'Payment',
        from: this.config.poolWalletAddress,
        to: destination,
        amount,
        hash: `MOCK_TX_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        timestamp: new Date(),
        validated: true,
      };
      console.log(`[XRPLClient] MOCK: Payment sent to ${destination}: ${amount} XRP`);
      return mockTx;
    }

    try {
      if (!this.client) {
        throw new Error('XRPL client not connected');
      }

      if (!this.poolWallet) {
        throw new Error('Pool wallet not initialized');
      }

      // Préparer la transaction de paiement
      const payment: Payment = {
        TransactionType: 'Payment',
        Account: this.poolWallet.address,
        Destination: destination,
        Amount: xrpToDrops(amount),
      };

      // Ajouter un memo si fourni
      if (memo) {
        payment.Memos = [
          {
            Memo: {
              MemoData: Buffer.from(memo, 'utf8').toString('hex'),
            },
          },
        ];
      }

      // Soumettre et attendre la validation
      const result = await this.client.submitAndWait(payment, { wallet: this.poolWallet });

      const transaction: XRPLTransaction = {
        type: 'Payment',
        from: this.poolWallet.address,
        to: destination,
        amount,
        hash: result.result.hash,
        timestamp: new Date(),
        validated: result.result.validated || false,
      };

      console.log(`[XRPLClient] Payment sent: ${transaction.hash}`);
      return transaction;
    } catch (error) {
      console.error('[XRPLClient] Payment failed:', error);
      throw error;
    }
  }

  /**
   * Vérifier qu'une transaction existe et est validée
   * En mode MOCK, simule toujours une transaction valide
   */
  async verifyTransaction(txHash: string): Promise<boolean> {
    if (this.mockMode) {
      // Mock: toujours valide si le hash commence par "MOCK_TX_"
      const isValid = txHash.startsWith('MOCK_TX_');
      console.log(`[XRPLClient] MOCK: Transaction ${txHash} is ${isValid ? 'valid' : 'invalid'}`);
      return isValid;
    }

    try {
      if (!this.client) {
        throw new Error('XRPL client not connected');
      }

      const response = await this.client.request({
        command: 'tx',
        transaction: txHash,
      });

      return response.result.validated || false;
    } catch (error) {
      console.error(`[XRPLClient] Transaction verification failed:`, error);
      return false;
    }
  }

  /**
   * Obtenir les transactions récentes d'une adresse
   * En mode MOCK, retourne des transactions simulées
   */
  async getRecentTransactions(address: string, limit: number = 10): Promise<XRPLTransaction[]> {
    if (this.mockMode) {
      // Mock: génère des transactions simulées
      const mockTxs: XRPLTransaction[] = [];
      for (let i = 0; i < limit; i++) {
        mockTxs.push({
          type: 'Payment',
          from: `rMockDonor${i}`,
          to: address,
          amount: Math.random() * 1000,
          hash: `MOCK_TX_${Date.now() - i * 10000}_${i}`,
          timestamp: new Date(Date.now() - i * 3600000),
          validated: true,
        });
      }
      console.log(`[XRPLClient] MOCK: Retrieved ${mockTxs.length} transactions`);
      return mockTxs;
    }

    try {
      if (!this.client) {
        throw new Error('XRPL client not connected');
      }

      const response = await this.client.request({
        command: 'account_tx',
        account: address,
        limit,
      });

      const transactions: XRPLTransaction[] = response.result.transactions.map((tx: any) => ({
        type: tx.tx.TransactionType,
        from: tx.tx.Account,
        to: tx.tx.Destination || '',
        amount: tx.tx.Amount ? Number(dropsToXrp(tx.tx.Amount)) : 0,
        hash: tx.tx.hash,
        timestamp: new Date(tx.tx.date * 1000 + 946684800000), // Ripple epoch to Unix
        validated: tx.validated,
      }));

      return transactions;
    } catch (error) {
      console.error('[XRPLClient] Failed to get transactions:', error);
      throw error;
    }
  }

  /**
   * Obtenir l'adresse du wallet du pool
   */
  getPoolWalletAddress(): string {
    if (this.poolWallet) {
      return this.poolWallet.address;
    }
    return this.config.poolWalletAddress;
  }

  /**
   * Vérifier si le client est en mode MOCK
   */
  isMockMode(): boolean {
    return this.mockMode;
  }

  /**
   * Create an escrow for a project
   * Funds are locked until conditions are met
   */
  async createEscrow(
    destination: string,
    amount: number,
    finishAfter: Date,
    condition?: string
  ): Promise<{ hash: string; sequence: number }> {
    if (this.mockMode) {
      // Mock: simulate escrow creation
      await this.delay(500);
      const mockEscrow = {
        hash: `ESCROW_MOCK_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        sequence: Math.floor(Math.random() * 1000000)
      };
      console.log(`[XRPLClient] MOCK: Escrow created: ${mockEscrow.hash}`);
      return mockEscrow;
    }

    try {
      if (!this.client) {
        throw new Error('XRPL client not connected');
      }

      if (!this.poolWallet) {
        throw new Error('Pool wallet not initialized');
      }

      // Prepare escrow creation transaction
      const escrowCreate = {
        TransactionType: 'EscrowCreate',
        Account: this.poolWallet.address,
        Destination: destination,
        Amount: xrpToDrops(amount),
        FinishAfter: this.dateToRippleTime(finishAfter),
      };

      // Add condition if provided
      if (condition) {
        (escrowCreate as any).Condition = condition;
      }

      // Submit and wait for validation
      const result = await this.client.submitAndWait(escrowCreate, { wallet: this.poolWallet });

      const escrowData = {
        hash: result.result.hash,
        sequence: (result.result as any).Sequence || 0
      };

      console.log(`[XRPLClient] Escrow created: ${escrowData.hash} (Seq: ${escrowData.sequence})`);
      return escrowData;
    } catch (error) {
      console.error('[XRPLClient] Escrow creation failed:', error);
      throw error;
    }
  }

  /**
   * Finish an escrow (release funds)
   */
  async finishEscrow(
    owner: string,
    escrowSequence: number,
    fulfillment?: string
  ): Promise<XRPLTransaction> {
    if (this.mockMode) {
      // Mock: simulate escrow finish
      await this.delay(500);
      const mockTx: XRPLTransaction = {
        type: 'EscrowFinish',
        from: this.config.poolWalletAddress,
        to: owner,
        amount: 0, // Amount is already in escrow
        hash: `ESCROW_FINISH_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        timestamp: new Date(),
        validated: true,
      };
      console.log(`[XRPLClient] MOCK: Escrow finished: ${mockTx.hash}`);
      return mockTx;
    }

    try {
      if (!this.client) {
        throw new Error('XRPL client not connected');
      }

      if (!this.poolWallet) {
        throw new Error('Pool wallet not initialized');
      }

      // Prepare escrow finish transaction
      const escrowFinish: any = {
        TransactionType: 'EscrowFinish',
        Account: this.poolWallet.address,
        Owner: owner,
        OfferSequence: escrowSequence,
      };

      // Add fulfillment if provided
      if (fulfillment) {
        escrowFinish.Fulfillment = fulfillment;
      }

      // Submit and wait for validation
      const result = await this.client.submitAndWait(escrowFinish, { wallet: this.poolWallet });

      const transaction: XRPLTransaction = {
        type: 'EscrowFinish',
        from: this.poolWallet.address,
        to: owner,
        amount: 0,
        hash: result.result.hash,
        timestamp: new Date(),
        validated: result.result.validated || false,
      };

      console.log(`[XRPLClient] Escrow finished: ${transaction.hash}`);
      return transaction;
    } catch (error) {
      console.error('[XRPLClient] Escrow finish failed:', error);
      throw error;
    }
  }

  /**
   * Cancel an escrow
   */
  async cancelEscrow(
    owner: string,
    escrowSequence: number
  ): Promise<XRPLTransaction> {
    if (this.mockMode) {
      // Mock: simulate escrow cancel
      await this.delay(500);
      const mockTx: XRPLTransaction = {
        type: 'EscrowCancel',
        from: this.config.poolWalletAddress,
        to: owner,
        amount: 0,
        hash: `ESCROW_CANCEL_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        timestamp: new Date(),
        validated: true,
      };
      console.log(`[XRPLClient] MOCK: Escrow cancelled: ${mockTx.hash}`);
      return mockTx;
    }

    try {
      if (!this.client) {
        throw new Error('XRPL client not connected');
      }

      if (!this.poolWallet) {
        throw new Error('Pool wallet not initialized');
      }

      // Prepare escrow cancel transaction
      const escrowCancel = {
        TransactionType: 'EscrowCancel',
        Account: this.poolWallet.address,
        Owner: owner,
        OfferSequence: escrowSequence,
      };

      // Submit and wait for validation
      const result = await this.client.submitAndWait(escrowCancel, { wallet: this.poolWallet });

      const transaction: XRPLTransaction = {
        type: 'EscrowCancel',
        from: this.poolWallet.address,
        to: owner,
        amount: 0,
        hash: result.result.hash,
        timestamp: new Date(),
        validated: result.result.validated || false,
      };

      console.log(`[XRPLClient] Escrow cancelled: ${transaction.hash}`);
      return transaction;
    } catch (error) {
      console.error('[XRPLClient] Escrow cancel failed:', error);
      throw error;
    }
  }

  /**
   * Convert JavaScript Date to Ripple Time
   * Ripple epoch: January 1, 2000 (946684800 seconds after Unix epoch)
   */
  private dateToRippleTime(date: Date): number {
    return Math.floor(date.getTime() / 1000) - 946684800;
  }

  /**
   * Utilitaire: délai pour simulation
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

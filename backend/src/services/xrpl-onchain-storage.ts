/**
 * ═══════════════════════════════════════════════════════════════════════════
 * XRPL ON-CHAIN STORAGE SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Service utilisant les technologies XRPL natives pour le stockage on-chain:
 *
 * 1. **MEMOS** - Stockage de données dans les transactions (max 1KB)
 *    https://xrpl.org/docs/references/protocol/transactions/common-fields
 *
 * 2. **XRPL HOOKS** - Smart contracts WebAssembly sur Xahau
 *    https://hooks.xrpl.org/
 *
 * 3. **NFT METADATA** - Données dans les URI NFT
 *    https://xrpl.org/docs/tutorials/nfts/
 *
 * Au lieu de PostgreSQL, toutes les données sont stockées on-chain!
 *
 * @author XRPact Hack For Good Team
 * @version 4.0.0 - Full On-Chain
 * @date 2025-01-29
 *
 * Sources:
 * - Memos: https://github.com/XRPLF/XRPL-Standards/discussions/103
 * - Hooks: https://blog.xaman.app/hooksxrpl
 * - Smart Contracts: https://github.com/XRPLF/XRPL-Standards/discussions/271
 */

import { Client, Wallet, convertStringToHex, convertHexToString, xrpToDrops } from 'xrpl';
import { createLogger, Logger } from 'winston';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Structure des données de donation stockées on-chain
 */
interface DonationOnChain {
  donorAddress: string;
  amount: number;
  timestamp: number;
  xpGained: number;
  level: number;
  nftTokenId?: string;
  txHash: string;
}

/**
 * Memo XRPL pour stockage on-chain
 */
interface XRPLMemo {
  Memo: {
    MemoType?: string;
    MemoData?: string;
    MemoFormat?: string;
  };
}

/**
 * Configuration du service on-chain
 */
interface OnChainServiceConfig {
  network: 'testnet' | 'xahau' | 'mainnet';
  websocketUrl: string;
  poolWalletSeed: string;
  poolWalletAddress: string;
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';

  // Hooks configuration (Xahau network)
  useHooks: boolean;
  hookHash?: string;
  hookNamespace?: string;
}

/**
 * Structure des données ONG on-chain
 */
interface NGOOnChain {
  id: string;
  name: string;
  walletAddress: string;
  category: string;
  impactScore: number;
  weight: number;
  verified: boolean;
  certifications: string[];
  totalReceived: number;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE PRINCIPAL ON-CHAIN
// ═══════════════════════════════════════════════════════════════════════════

export class XRPLOnChainStorage {
  private client: Client;
  private wallet: Wallet;
  private config: OnChainServiceConfig;
  private logger: Logger;

  // Cache en mémoire (optionnel, pour performance)
  private donationsCache: Map<string, DonationOnChain[]> = new Map();
  private ngosCache: Map<string, NGOOnChain> = new Map();

  constructor(config: Partial<OnChainServiceConfig>) {
    this.config = {
      network: 'testnet',
      websocketUrl: 'wss://s.altnet.rippletest.net:51233',
      poolWalletSeed: process.env.XRPL_POOL_WALLET_SEED || '',
      poolWalletAddress: process.env.XRPL_POOL_WALLET_ADDRESS || '',
      enableLogging: true,
      logLevel: 'info',
      useHooks: false,
      ...config,
    };

    this.client = new Client(this.config.websocketUrl);
    this.wallet = Wallet.fromSeed(this.config.poolWalletSeed);

    this.logger = this.createLogger();

    this.logger.info('🚀 XRPL On-Chain Storage Service initialized', {
      network: this.config.network,
      useHooks: this.config.useHooks,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALISATION
  // ═══════════════════════════════════════════════════════════════════════════

  private createLogger(): Logger {
    return createLogger({
      level: this.config.logLevel,
      format: require('winston').format.combine(
        require('winston').format.timestamp(),
        require('winston').format.json()
      ),
      transports: [
        new require('winston').transports.Console({
          format: require('winston').format.simple(),
        }),
      ],
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
    this.logger.info('✅ Connected to XRPL', {
      address: this.wallet.address,
      network: this.config.network,
    });
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
    this.logger.info('✅ Disconnected from XRPL');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. STOCKAGE AVEC MEMOS (Transaction Memos)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Enregistrer une donation ON-CHAIN avec MEMO
   *
   * Utilise le champ Memos des transactions XRPL pour stocker les données.
   * Max 1KB par transaction.
   *
   * Format:
   * - MemoType: "donation" (hex encoded)
   * - MemoData: JSON stringified (hex encoded)
   * - MemoFormat: "application/json" (hex encoded)
   *
   * @param donation - Données de la donation
   * @returns Hash de transaction
   */
  async saveDonationWithMemo(donation: DonationOnChain): Promise<string> {
    this.logger.info('💾 Saving donation ON-CHAIN with MEMO', {
      donor: donation.donorAddress,
      amount: donation.amount,
    });

    // 1. Préparer les données JSON
    const donationData = {
      type: 'donation',
      donor: donation.donorAddress,
      amount: donation.amount,
      timestamp: donation.timestamp,
      xpGained: donation.xpGained,
      level: donation.level,
      nftTokenId: donation.nftTokenId,
    };

    const dataJson = JSON.stringify(donationData);

    // Vérifier la taille (max 1KB)
    if (Buffer.byteLength(dataJson, 'utf8') > 1024) {
      throw new Error('Donation data exceeds 1KB memo limit');
    }

    // 2. Créer le memo XRPL
    const memos: XRPLMemo[] = [
      {
        Memo: {
          MemoType: convertStringToHex('donation'),
          MemoData: convertStringToHex(dataJson),
          MemoFormat: convertStringToHex('application/json'),
        },
      },
    ];

    // 3. Envoyer une transaction Payment avec le memo
    // (Montant minimal pour ancrer les données sur le ledger)
    const tx = await this.client.submitAndWait(
      {
        TransactionType: 'Payment',
        Account: this.wallet.address,
        Destination: this.wallet.address, // Self-payment pour ancrage
        Amount: xrpToDrops(0.000001), // Montant minimal
        Memos: memos,
      },
      { wallet: this.wallet }
    );

    const txHash = (tx.result as any).hash;

    this.logger.info('✅ Donation saved ON-CHAIN', {
      txHash,
      size: `${Buffer.byteLength(dataJson, 'utf8')} bytes`,
    });

    // 4. Mettre à jour le cache
    const donorDonations = this.donationsCache.get(donation.donorAddress) || [];
    donorDonations.push({ ...donation, txHash });
    this.donationsCache.set(donation.donorAddress, donorDonations);

    return txHash;
  }

  /**
   * Lire une donation depuis ON-CHAIN (via MEMO)
   *
   * @param txHash - Hash de la transaction
   * @returns Données de la donation
   */
  async readDonationFromMemo(txHash: string): Promise<DonationOnChain | null> {
    this.logger.debug('📖 Reading donation from ON-CHAIN MEMO', { txHash });

    try {
      // 1. Récupérer la transaction depuis le ledger
      const tx = await this.client.request({
        command: 'tx',
        transaction: txHash,
      });

      // 2. Extraire les memos
      const memos = (tx.result as any).Memos;

      if (!memos || memos.length === 0) {
        this.logger.warn('No memos found in transaction', { txHash });
        return null;
      }

      // 3. Décoder le premier memo
      const memo = memos[0].Memo;
      const memoType = convertHexToString(memo.MemoType);
      const memoData = convertHexToString(memo.MemoData);

      if (memoType !== 'donation') {
        this.logger.warn('Not a donation memo', { memoType });
        return null;
      }

      // 4. Parser les données JSON
      const donationData = JSON.parse(memoData);

      this.logger.info('✅ Donation read from ON-CHAIN', {
        donor: donationData.donor,
        amount: donationData.amount,
      });

      return {
        donorAddress: donationData.donor,
        amount: donationData.amount,
        timestamp: donationData.timestamp,
        xpGained: donationData.xpGained,
        level: donationData.level,
        nftTokenId: donationData.nftTokenId,
        txHash,
      };
    } catch (error: any) {
      this.logger.error('Failed to read donation from memo', {
        txHash,
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Récupérer toutes les donations d'un donateur depuis ON-CHAIN
   *
   * @param donorAddress - Adresse du donateur
   * @returns Liste des donations
   */
  async getDonationHistory(donorAddress: string): Promise<DonationOnChain[]> {
    this.logger.info('📜 Fetching donation history from ON-CHAIN', {
      donor: donorAddress,
    });

    // 1. Vérifier le cache
    if (this.donationsCache.has(donorAddress)) {
      this.logger.debug('Cache hit for donation history');
      return this.donationsCache.get(donorAddress)!;
    }

    // 2. Scanner les transactions du compte
    const donations: DonationOnChain[] = [];

    try {
      // Récupérer l'historique des transactions
      const accountTxs = await this.client.request({
        command: 'account_tx',
        account: this.wallet.address,
        ledger_index_min: -1,
        ledger_index_max: -1,
        limit: 1000,
      });

      // 3. Filtrer les transactions avec memos "donation"
      for (const txEntry of (accountTxs.result as any).transactions) {
        const tx = txEntry.tx;

        if (!tx.Memos) continue;

        for (const memoWrapper of tx.Memos) {
          const memo = memoWrapper.Memo;
          const memoType = convertHexToString(memo.MemoType);

          if (memoType === 'donation') {
            const memoData = convertHexToString(memo.MemoData);
            const donationData = JSON.parse(memoData);

            // Filtrer par donateur
            if (donationData.donor === donorAddress) {
              donations.push({
                donorAddress: donationData.donor,
                amount: donationData.amount,
                timestamp: donationData.timestamp,
                xpGained: donationData.xpGained,
                level: donationData.level,
                nftTokenId: donationData.nftTokenId,
                txHash: tx.hash,
              });
            }
          }
        }
      }

      // 4. Mettre à jour le cache
      this.donationsCache.set(donorAddress, donations);

      this.logger.info('✅ Donation history fetched from ON-CHAIN', {
        donor: donorAddress,
        count: donations.length,
      });

      return donations;
    } catch (error: any) {
      this.logger.error('Failed to fetch donation history', {
        donor: donorAddress,
        error: error.message,
      });
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. STOCKAGE AVEC NFT METADATA
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Mint un NFT avec metadata on-chain
   *
   * Les données sont stockées dans:
   * - URI: Lien vers les métadonnées (IPFS, on-chain, etc.)
   * - Memos: Données additionnelles (max 1KB)
   *
   * @param donorAddress - Adresse du donateur
   * @param level - Niveau atteint
   * @param xp - XP total
   * @returns Token ID du NFT
   */
  async mintImpactNFTWithMetadata(
    donorAddress: string,
    level: number,
    xp: number
  ): Promise<string> {
    this.logger.info('🎨 Minting Impact NFT with ON-CHAIN metadata', {
      donor: donorAddress,
      level,
      xp,
    });

    // 1. Préparer les métadonnées
    const metadata = {
      name: `Impact NFT - Level ${level}`,
      description: `Donor Impact Token for reaching level ${level}`,
      attributes: [
        { trait_type: 'Level', value: level },
        { trait_type: 'XP', value: xp },
        { trait_type: 'Donor', value: donorAddress },
        { trait_type: 'Timestamp', value: Date.now() },
      ],
    };

    const metadataJson = JSON.stringify(metadata);

    // 2. Créer le memo avec métadonnées
    const memos: XRPLMemo[] = [
      {
        Memo: {
          MemoType: convertStringToHex('impact_nft'),
          MemoData: convertStringToHex(metadataJson),
          MemoFormat: convertStringToHex('application/json'),
        },
      },
    ];

    // 3. Mint le NFT
    const nftMintTx = await this.client.submitAndWait(
      {
        TransactionType: 'NFTokenMint',
        Account: this.wallet.address,
        URI: convertStringToHex(`data:application/json,${metadataJson}`),
        Flags: 8, // tfTransferable
        TransferFee: 0,
        NFTokenTaxon: 0,
        Memos: memos,
      },
      { wallet: this.wallet }
    );

    // 4. Extraire le TokenID
    const nftTokenId = this.extractNFTokenID(nftMintTx);

    this.logger.info('✅ Impact NFT minted ON-CHAIN', {
      tokenId: nftTokenId,
      level,
      donor: donorAddress,
    });

    // 5. Transférer le NFT au donateur
    if (donorAddress !== this.wallet.address) {
      await this.transferNFT(nftTokenId, donorAddress);
    }

    return nftTokenId;
  }

  /**
   * Extraire le NFTokenID depuis une transaction de mint
   */
  private extractNFTokenID(mintTxResponse: any): string {
    const meta = mintTxResponse.result.meta;

    if (!meta || !meta.AffectedNodes) {
      throw new Error('Cannot extract NFTokenID from mint transaction');
    }

    for (const node of meta.AffectedNodes) {
      if (node.CreatedNode && node.CreatedNode.LedgerEntryType === 'NFTokenPage') {
        const nfTokens = node.CreatedNode.NewFields.NFTokens;
        if (nfTokens && nfTokens.length > 0) {
          return nfTokens[0].NFToken.NFTokenID;
        }
      }
    }

    throw new Error('NFTokenID not found in transaction metadata');
  }

  /**
   * Transférer un NFT à un autre compte
   */
  private async transferNFT(tokenId: string, destination: string): Promise<void> {
    this.logger.debug('🎁 Transferring NFT', { tokenId, destination });

    await this.client.submitAndWait(
      {
        TransactionType: 'NFTokenCreateOffer',
        Account: this.wallet.address,
        NFTokenID: tokenId,
        Amount: xrpToDrops(0), // Free transfer
        Destination: destination,
        Flags: 1, // tfSellNFToken
      },
      { wallet: this.wallet }
    );

    this.logger.info('✅ NFT transferred', { tokenId, destination });
  }

  /**
   * Lire les métadonnées d'un NFT depuis ON-CHAIN
   */
  async readNFTMetadata(tokenId: string): Promise<any> {
    this.logger.debug('📖 Reading NFT metadata from ON-CHAIN', { tokenId });

    try {
      // Récupérer les NFTs du compte
      const nfts = await this.client.request({
        command: 'account_nfts',
        account: this.wallet.address,
      });

      // Trouver le NFT
      const nft = (nfts.result as any).account_nfts.find(
        (n: any) => n.NFTokenID === tokenId
      );

      if (!nft) {
        throw new Error('NFT not found');
      }

      // Décoder l'URI
      const uri = convertHexToString(nft.URI);

      // Si l'URI est un data URI, extraire les données
      if (uri.startsWith('data:application/json,')) {
        const metadataJson = uri.replace('data:application/json,', '');
        return JSON.parse(metadataJson);
      }

      // Sinon, c'est une URL externe (IPFS, etc.)
      return { uri };
    } catch (error: any) {
      this.logger.error('Failed to read NFT metadata', {
        tokenId,
        error: error.message,
      });
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. STOCKAGE AVEC XRPL HOOKS (Xahau Network)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Enregistrer une donation via XRPL Hook (Xahau)
   *
   * Les hooks permettent d'exécuter de la logique WebAssembly sur le ledger.
   * Les données sont stockées dans l'état du hook.
   *
   * Note: Nécessite le réseau Xahau (testnet hooks)
   *
   * @param donation - Données de la donation
   * @returns Hash de transaction
   */
  async saveDonationWithHook(donation: DonationOnChain): Promise<string> {
    if (!this.config.useHooks) {
      throw new Error('Hooks not enabled. Set useHooks: true and connect to Xahau network');
    }

    this.logger.info('⚡ Saving donation with XRPL HOOK', {
      donor: donation.donorAddress,
      amount: donation.amount,
    });

    // 1. Préparer le payload pour le hook
    const hookData = {
      action: 'save_donation',
      donor: donation.donorAddress,
      amount: donation.amount,
      timestamp: donation.timestamp,
      xpGained: donation.xpGained,
      level: donation.level,
    };

    const hookDataHex = convertStringToHex(JSON.stringify(hookData));

    // 2. Appeler le hook via un Invoke transaction
    const tx = await this.client.submitAndWait(
      {
        TransactionType: 'Invoke',
        Account: this.wallet.address,
        Destination: this.config.hookHash!, // Adresse du hook
        // HookParameters: [
        //   {
        //     HookParameter: {
        //       HookParameterName: convertStringToHex('donation_data'),
        //       HookParameterValue: hookDataHex,
        //     },
        //   },
        // ],
      } as any,
      { wallet: this.wallet }
    );

    const txHash = (tx.result as any).hash;

    this.logger.info('✅ Donation saved via HOOK', { txHash });

    return txHash;
  }

  /**
   * Lire les données depuis un XRPL Hook
   *
   * Les hooks peuvent stocker un état persistant sur le ledger.
   *
   * @param hookNamespace - Namespace du hook
   * @param key - Clé des données
   * @returns Données stockées
   */
  async readFromHookState(hookNamespace: string, key: string): Promise<any> {
    if (!this.config.useHooks) {
      throw new Error('Hooks not enabled');
    }

    this.logger.debug('📖 Reading from HOOK state', { hookNamespace, key });

    try {
      // Lire l'état du hook
      const hookState = await this.client.request({
        command: 'ledger_entry',
        hook_state: {
          account: this.wallet.address,
          namespace_id: hookNamespace,
          key: convertStringToHex(key),
        },
      } as any);

      const stateData = (hookState.result as any).node.HookStateData;

      if (!stateData) {
        return null;
      }

      // Décoder les données
      const dataJson = convertHexToString(stateData);
      return JSON.parse(dataJson);
    } catch (error: any) {
      this.logger.error('Failed to read from hook state', {
        hookNamespace,
        key,
        error: error.message,
      });
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. STOCKAGE DES ONG ON-CHAIN
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Enregistrer une ONG ON-CHAIN avec MEMO
   */
  async saveNGOOnChain(ngo: NGOOnChain): Promise<string> {
    this.logger.info('🏛️  Saving NGO ON-CHAIN', {
      ngoId: ngo.id,
      name: ngo.name,
    });

    const ngoData = {
      type: 'ngo',
      ...ngo,
    };

    const dataJson = JSON.stringify(ngoData);

    const memos: XRPLMemo[] = [
      {
        Memo: {
          MemoType: convertStringToHex('ngo'),
          MemoData: convertStringToHex(dataJson),
          MemoFormat: convertStringToHex('application/json'),
        },
      },
    ];

    const tx = await this.client.submitAndWait(
      {
        TransactionType: 'Payment',
        Account: this.wallet.address,
        Destination: this.wallet.address,
        Amount: xrpToDrops(0.000001),
        Memos: memos,
      },
      { wallet: this.wallet }
    );

    const txHash = (tx.result as any).hash;

    // Mettre à jour le cache
    this.ngosCache.set(ngo.id, ngo);

    this.logger.info('✅ NGO saved ON-CHAIN', { txHash, ngoId: ngo.id });

    return txHash;
  }

  /**
   * Récupérer toutes les ONG depuis ON-CHAIN
   */
  async getAllNGOs(): Promise<NGOOnChain[]> {
    this.logger.info('📜 Fetching all NGOs from ON-CHAIN');

    const ngos: NGOOnChain[] = [];

    try {
      const accountTxs = await this.client.request({
        command: 'account_tx',
        account: this.wallet.address,
        ledger_index_min: -1,
        ledger_index_max: -1,
        limit: 1000,
      });

      for (const txEntry of (accountTxs.result as any).transactions) {
        const tx = txEntry.tx;

        if (!tx.Memos) continue;

        for (const memoWrapper of tx.Memos) {
          const memo = memoWrapper.Memo;
          const memoType = convertHexToString(memo.MemoType);

          if (memoType === 'ngo') {
            const memoData = convertHexToString(memo.MemoData);
            const ngoData = JSON.parse(memoData);
            ngos.push(ngoData);
          }
        }
      }

      this.logger.info('✅ NGOs fetched from ON-CHAIN', { count: ngos.length });

      return ngos;
    } catch (error: any) {
      this.logger.error('Failed to fetch NGOs', { error: error.message });
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Obtenir les statistiques du service
   */
  getStatistics() {
    return {
      network: this.config.network,
      useHooks: this.config.useHooks,
      cachedDonations: this.donationsCache.size,
      cachedNGOs: this.ngosCache.size,
    };
  }

  /**
   * Vider le cache
   */
  clearCache(): void {
    this.donationsCache.clear();
    this.ngosCache.clear();
    this.logger.info('✅ Cache cleared');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default XRPLOnChainStorage;

/**
 * SOURCES & RÉFÉRENCES:
 *
 * 1. Memos Format Standard
 *    https://github.com/XRPLF/XRPL-Standards/discussions/103
 *
 * 2. XRPL Hooks - Smart Contracts
 *    https://hooks.xrpl.org/
 *    https://blog.xaman.app/hooksxrpl
 *
 * 3. XRPL Smart Contracts (XLS-101d)
 *    https://github.com/XRPLF/XRPL-Standards/discussions/271
 *
 * 4. Transaction Common Fields (Memos)
 *    https://xrpl.org/docs/references/protocol/transactions/common-fields
 *
 * 5. Writing and Reading Memos
 *    https://docs.xrpl-commons.org/xrpl-basics/writing-and-reading-memos
 *
 * 6. NFTokens (XLS-20)
 *    https://xrpl.org/docs/tutorials/nfts/
 */

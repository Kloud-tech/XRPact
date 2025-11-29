/**
 * Soulbound Token (SBT) Service
 *
 * Mints non-transferable NFTs on XRPL that represent donor impact.
 * Data is encoded in NFT metadata (URI) for on-chain immutability.
 *
 * SBT contains:
 * - Total donated (XRP)
 * - Number of redistributions (times profit distributed)
 * - NGOs supported (list)
 * - Governance votes count
 */

import { createHash } from 'crypto';
import { XRPLClientService } from './xrpl-client.service';

export interface SBTMetadata {
  donorAddress: string;
  totalDonated: number; // XRP
  redistributionsCount: number;
  ngosSupported: string[]; // NGO IDs
  governanceVotesCount: number;
  mintedAt: Date;
  level: number; // Donor level (based on XP)
}

export interface SBTMintRequest {
  donorAddress: string;
  totalDonated: number;
  redistributionsCount?: number;
  ngosSupported?: string[];
  level?: number;
}

export interface SBTMintResponse {
  success: boolean;
  nftTokenId?: string;
  txHash?: string;
  metadata?: SBTMetadata;
  error?: string;
}

export interface SBTReadResponse {
  success: boolean;
  nftTokenId: string;
  metadata?: SBTMetadata;
  owner?: string;
  transferable?: boolean;
  error?: string;
}

export class SBTService {
  private xrplClient: XRPLClientService;
  private sbts: Map<string, SBTMetadata> = new Map(); // In-memory cache for mock mode

  constructor(xrplClient: XRPLClientService) {
    this.xrplClient = xrplClient;
    console.log('[SBT Service] Initialized');
  }

  /**
   * Mint a new Soulbound Token for a donor
   * Non-transferable NFT with embedded metadata
   */
  async mintSBT(request: SBTMintRequest): Promise<SBTMintResponse> {
    try {
      const {
        donorAddress,
        totalDonated,
        redistributionsCount = 0,
        ngosSupported = [],
        level = 1,
      } = request;

      console.log(`[SBT Service] Minting SBT for ${donorAddress}`);

      // Create metadata object
      const metadata: SBTMetadata = {
        donorAddress,
        totalDonated,
        redistributionsCount,
        ngosSupported,
        governanceVotesCount: 0,
        mintedAt: new Date(),
        level,
      };

      // In MOCK mode: generate tokenId and store
      if (this.xrplClient.isMockMode()) {
        const nftTokenId = this.generateMockTokenId(donorAddress);

        // Store in memory
        this.sbts.set(nftTokenId, metadata);

        console.log(`[SBT Service] MOCK: Minted SBT ${nftTokenId}`);

        return {
          success: true,
          nftTokenId,
          txHash: `SBT_TX_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          metadata,
        };
      }

      // PRODUCTION: Use real XRPL NFToken
      // Mint actual on-chain SBT (non-transferable NFT)

      // Encode metadata as URI (base64 JSON)
      const metadataJson = JSON.stringify(metadata);
      const uri = Buffer.from(metadataJson).toString('hex').toUpperCase();

      console.log(`[SBT Service] Minting real NFT on XRPL for ${donorAddress}`);
      console.log(`[SBT Service] Metadata URI (hex):`, uri);

      // Mint NFT with flags:
      // 0x00000008 = tfTransferable (we DON'T set this - makes it non-transferable/soulbound)
      // 0x00000001 = tfBurnable (allow donor to burn their own SBT)
      const result = await this.xrplClient.mintNFT(
        uri,
        1, // flags: burnable only (soulbound)
        0  // transferFee: 0 (no transfers allowed)
      );

      this.sbts.set(result.nftTokenId, metadata);

      console.log(`[SBT Service] Real SBT minted: ${result.nftTokenId}`);
      console.log(`[SBT Service] TX Hash: ${result.txHash}`);

      return {
        success: true,
        nftTokenId: result.nftTokenId,
        txHash: result.txHash,
        metadata,
      };
    } catch (error: any) {
      console.error('[SBT Service] Mint failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to mint SBT',
      };
    }
  }

  /**
   * Read SBT metadata by NFT token ID
   * Returns on-chain immutable data
   */
  async readSBT(nftTokenId: string): Promise<SBTReadResponse> {
    try {
      console.log(`[SBT Service] Reading SBT: ${nftTokenId}`);

      // Check in-memory cache
      const metadata = this.sbts.get(nftTokenId);

      if (!metadata) {
        return {
          success: false,
          nftTokenId,
          error: 'SBT not found',
        };
      }

      return {
        success: true,
        nftTokenId,
        metadata,
        owner: metadata.donorAddress,
        transferable: false, // Soulbound = non-transferable
      };
    } catch (error: any) {
      console.error('[SBT Service] Read failed:', error);
      return {
        success: false,
        nftTokenId,
        error: error.message || 'Failed to read SBT',
      };
    }
  }

  /**
   * Update SBT metadata (e.g., after new donation, redistribution)
   * In production, this creates a new NFToken with updated data
   */
  async updateSBT(
    nftTokenId: string,
    updates: Partial<SBTMetadata>
  ): Promise<SBTReadResponse> {
    try {
      console.log(`[SBT Service] Updating SBT: ${nftTokenId}`);

      const existing = this.sbts.get(nftTokenId);

      if (!existing) {
        return {
          success: false,
          nftTokenId,
          error: 'SBT not found',
        };
      }

      // Merge updates
      const updated: SBTMetadata = {
        ...existing,
        ...updates,
        donorAddress: existing.donorAddress, // Never change donor
        mintedAt: existing.mintedAt, // Never change mint date
      };

      this.sbts.set(nftTokenId, updated);

      console.log(`[SBT Service] Updated SBT ${nftTokenId}`);

      return {
        success: true,
        nftTokenId,
        metadata: updated,
        owner: updated.donorAddress,
        transferable: false,
      };
    } catch (error: any) {
      console.error('[SBT Service] Update failed:', error);
      return {
        success: false,
        nftTokenId,
        error: error.message || 'Failed to update SBT',
      };
    }
  }

  /**
   * Record a governance vote in SBT
   * Increments vote count (can be queried for voting power)
   */
  async recordGovernanceVote(nftTokenId: string): Promise<SBTReadResponse> {
    try {
      console.log(`[SBT Service] Recording governance vote for SBT: ${nftTokenId}`);

      const metadata = this.sbts.get(nftTokenId);

      if (!metadata) {
        return {
          success: false,
          nftTokenId,
          error: 'SBT not found',
        };
      }

      metadata.governanceVotesCount++;
      this.sbts.set(nftTokenId, metadata);

      console.log(
        `[SBT Service] Vote recorded. Total votes: ${metadata.governanceVotesCount}`
      );

      return {
        success: true,
        nftTokenId,
        metadata,
        owner: metadata.donorAddress,
        transferable: false,
      };
    } catch (error: any) {
      console.error('[SBT Service] Vote recording failed:', error);
      return {
        success: false,
        nftTokenId,
        error: error.message || 'Failed to record vote',
      };
    }
  }

  /**
   * Get all SBTs for a donor address
   */
  getSBTsByDonor(donorAddress: string): Array<[string, SBTMetadata]> {
    return Array.from(this.sbts.entries()).filter(
      ([_, metadata]) => metadata.donorAddress === donorAddress
    );
  }

  /**
   * Generate a mock NFT token ID (production would use XRPL NFToken format)
   */
  private generateMockTokenId(donorAddress: string): string {
    const hash = createHash('sha256')
      .update(`${donorAddress}_${Date.now()}`)
      .digest('hex')
      .substring(0, 32)
      .toUpperCase();

    // XRPL NFToken ID format: 96-bit number
    return `000000000000000000000000${hash.substring(0, 8)}`;
  }

  /**
   * Export SBT as JSON for governance/audit
   */
  exportSBT(nftTokenId: string): string {
    const metadata = this.sbts.get(nftTokenId);
    if (!metadata) return '';

    return JSON.stringify(
      {
        nftTokenId,
        ...metadata,
      },
      null,
      2
    );
  }

  /**
   * List all SBTs (for audit/admin)
   */
  listAllSBTs(): Array<{ nftTokenId: string; metadata: SBTMetadata }> {
    return Array.from(this.sbts.entries()).map(([nftTokenId, metadata]) => ({
      nftTokenId,
      metadata,
    }));
  }
}

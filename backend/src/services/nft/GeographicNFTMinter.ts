/**
 * Geographic NFT Minter
 *
 * Creates location-based NFTs as proof of impact
 * Each NFT represents a geographic "tile" of the area helped by the donor
 */

import { Client, Wallet, NFTokenMint, convertStringToHex } from 'xrpl';
import { ProjectEscrow } from '../escrow/EscrowManager';

export interface GeographicNFTMetadata {
  name: string;
  description: string;
  image: string; // IPFS or data URL
  attributes: {
    projectId: string;
    projectTitle: string;
    category: string;
    location: {
      lat: number;
      lng: number;
      country: string;
      region: string;
    };
    amount: number; // XRP funded
    fundedDate: string;
    escrowHash: string;
    validationProofs: {
      validator: string;
      photoUrl: string;
      timestamp: string;
    }[];
    impactMetrics?: {
      waterLiters?: number;
      co2Offset?: number;
      peopleHelped?: number;
      treesPlanted?: number;
    };
  };
  externalUrl?: string; // Link to XRPL Impact Map
}

export interface GeographicNFT {
  tokenId: string;
  owner: string;
  metadata: GeographicNFTMetadata;
  mintedAt: Date;
  transactionHash: string;
}

export class GeographicNFTMinter {
  private client: Client;
  private issuerWallet: Wallet;

  constructor(client: Client, issuerWallet: Wallet) {
    this.client = client;
    this.issuerWallet = issuerWallet;
  }

  /**
   * Mint a Geographic NFT for a completed project
   */
  async mintProjectNFT(
    project: ProjectEscrow,
    donorAddress: string
  ): Promise<GeographicNFT> {
    // Build metadata
    const metadata = this.buildMetadata(project);

    // Create NFT URI (in production, upload to IPFS)
    const uri = this.createMetadataURI(metadata);

    try {
      // Prepare NFT mint transaction
      const mintTx: NFTokenMint = {
        TransactionType: 'NFTokenMint',
        Account: this.issuerWallet.address,
        URI: convertStringToHex(uri),
        Flags: 8, // tfTransferable (can be gifted/sold)
        TransferFee: 0, // No royalties
        NFTokenTaxon: 0,
      };

      // Submit transaction
      const prepared = await this.client.autofill(mintTx);
      const signed = this.issuerWallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);

      console.log(`[NFT] Geographic NFT minted for project "${project.title}":`, result.result.hash);

      // Extract token ID from transaction metadata
      const tokenId = this.extractTokenId(result);

      const nft: GeographicNFT = {
        tokenId,
        owner: donorAddress,
        metadata,
        mintedAt: new Date(),
        transactionHash: result.result.hash as string,
      };

      return nft;
    } catch (error) {
      console.error('[NFT] Error minting geographic NFT:', error);
      throw error;
    }
  }

  /**
   * Build NFT metadata from project data
   */
  private buildMetadata(project: ProjectEscrow): GeographicNFTMetadata {
    // Generate satellite image URL (mock - in production use Mapbox Static API)
    const imageUrl = this.generateSatelliteImage(project.location.lat, project.location.lng);

    // Calculate impact metrics based on category
    const impactMetrics = this.calculateImpactMetrics(project);

    const metadata: GeographicNFTMetadata = {
      name: `Impact NFT: ${project.title}`,
      description: `You helped fund ${project.title} in ${project.location.region}, ${project.location.country}. This NFT represents your permanent contribution to this location on Earth.`,
      image: imageUrl,
      attributes: {
        projectId: project.id,
        projectTitle: project.title,
        category: project.category,
        location: {
          lat: project.location.lat,
          lng: project.location.lng,
          country: project.location.country,
          region: project.location.region,
        },
        amount: project.amount,
        fundedDate: project.fundedAt?.toISOString() || new Date().toISOString(),
        escrowHash: project.escrowHash || '',
        validationProofs: project.validationProofs.map(proof => ({
          validator: proof.validatorName,
          photoUrl: proof.photoUrl,
          timestamp: proof.approvedAt.toISOString(),
        })),
        impactMetrics,
      },
      externalUrl: `https://xrplimpactmap.org/project/${project.id}`,
    };

    return metadata;
  }

  /**
   * Calculate impact metrics based on project category
   */
  private calculateImpactMetrics(project: ProjectEscrow): GeographicNFTMetadata['attributes']['impactMetrics'] {
    const metrics: GeographicNFTMetadata['attributes']['impactMetrics'] = {};

    switch (project.category) {
      case 'Water':
        metrics.waterLiters = project.amount * 5000; // Estimate: 1 XRP = 5000L/year
        metrics.peopleHelped = Math.floor(project.amount / 10); // 10 XRP per person
        break;

      case 'Climate':
        metrics.co2Offset = project.amount * 0.5; // Estimate: 1 XRP = 0.5 tons CO2
        metrics.treesPlanted = Math.floor(project.amount * 2); // 1 XRP = 2 trees
        break;

      case 'Education':
        metrics.peopleHelped = Math.floor(project.amount / 50); // 50 XRP per student/year
        break;

      case 'Health':
        metrics.peopleHelped = Math.floor(project.amount / 100); // 100 XRP per treatment
        break;

      case 'Infrastructure':
        metrics.peopleHelped = Math.floor(project.amount / 5); // 5 XRP per person benefiting
        break;
    }

    return metrics;
  }

  /**
   * Generate satellite image URL for the location
   * In production, use Mapbox Static Images API
   */
  private generateSatelliteImage(lat: number, lng: number): string {
    // Mock implementation - returns placeholder
    // Production: https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/{lng},{lat},12,0/400x400?access_token=...

    return `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${lng},${lat},12,0/600x400@2x?access_token=YOUR_MAPBOX_TOKEN`;
  }

  /**
   * Create metadata URI (in production, upload to IPFS)
   */
  private createMetadataURI(metadata: GeographicNFTMetadata): string {
    // Mock implementation - in production, upload to IPFS via Pinata/NFT.Storage
    const jsonString = JSON.stringify(metadata);

    // For demo, we can use data URI (not recommended for production)
    // return `data:application/json;base64,${Buffer.from(jsonString).toString('base64')}`;

    // Production would return:
    return `ipfs://QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`;
  }

  /**
   * Extract NFT token ID from transaction result
   */
  private extractTokenId(result: any): string {
    // In production, parse the transaction metadata to extract actual token ID
    // For now, return a mock ID
    return `NFT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Batch mint NFTs for multiple donors of the same project
   */
  async batchMintProjectNFTs(
    project: ProjectEscrow,
    donorAddresses: string[]
  ): Promise<GeographicNFT[]> {
    const nfts: GeographicNFT[] = [];

    for (const donorAddress of donorAddresses) {
      try {
        const nft = await this.mintProjectNFT(project, donorAddress);
        nfts.push(nft);
      } catch (error) {
        console.error(`[NFT] Error minting for donor ${donorAddress}:`, error);
      }
    }

    console.log(`[NFT] Batch minted ${nfts.length}/${donorAddresses.length} NFTs`);
    return nfts;
  }

  /**
   * Generate NFT preview card for social sharing
   */
  generateShareCard(nft: GeographicNFT): string {
    const { metadata } = nft;

    // In production, generate an image with:
    // - Satellite view of the location
    // - Project title and category
    // - Impact metrics
    // - XRPL logo

    const shareText = `I helped fund ${metadata.attributes.projectTitle} in ${metadata.attributes.location.country}! 🌍\n\n` +
      `💧 Impact: ${this.formatImpactMetrics(metadata.attributes.impactMetrics)}\n` +
      `✅ Verified by ${metadata.attributes.validationProofs.length} local validators\n` +
      `🔗 View on XRPL Impact Map: ${metadata.externalUrl}`;

    return shareText;
  }

  /**
   * Format impact metrics for display
   */
  private formatImpactMetrics(metrics?: GeographicNFTMetadata['attributes']['impactMetrics']): string {
    if (!metrics) return 'Project completed';

    const parts: string[] = [];

    if (metrics.waterLiters) {
      parts.push(`${metrics.waterLiters.toLocaleString()}L clean water/year`);
    }
    if (metrics.co2Offset) {
      parts.push(`${metrics.co2Offset} tons CO₂ offset`);
    }
    if (metrics.treesPlanted) {
      parts.push(`${metrics.treesPlanted} trees planted`);
    }
    if (metrics.peopleHelped) {
      parts.push(`${metrics.peopleHelped} people helped`);
    }

    return parts.join(', ');
  }

  /**
   * Generate mock NFTs for demo
   */
  static generateMockNFTs(): GeographicNFT[] {
    return [
      {
        tokenId: 'NFT_SENEGAL_WELL_001',
        owner: 'rDonor1XXXXXXXXXXXXXXXXXXXXXXXXX',
        metadata: {
          name: 'Impact NFT: Puits au Sénégal',
          description: 'You helped fund a water well in Dakar, Senegal. This NFT represents your permanent contribution to this location on Earth.',
          image: 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/-14.4524,14.4974,12,0/600x400@2x',
          attributes: {
            projectId: 'PRJ_001',
            projectTitle: 'Puits au Sénégal',
            category: 'Water',
            location: {
              lat: 14.4974,
              lng: -14.4524,
              country: 'Senegal',
              region: 'Dakar',
            },
            amount: 5000,
            fundedDate: new Date().toISOString(),
            escrowHash: '0xABC123DEF456789',
            validationProofs: [
              {
                validator: 'Amadou Diallo',
                photoUrl: '/assets/senegal-well-1.jpg',
                timestamp: new Date().toISOString(),
              }
            ],
            impactMetrics: {
              waterLiters: 25000000,
              peopleHelped: 500,
            },
          },
          externalUrl: 'https://xrplimpactmap.org/project/PRJ_001',
        },
        mintedAt: new Date(),
        transactionHash: '0xNFT_MINT_HASH_001',
      }
    ];
  }
}

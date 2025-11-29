/**
 * Mock Data Generator for XRPL Impact Fund Demo
 *
 * Provides realistic mock data for:
 * - XRPL transactions
 * - Market data for AI trading
 * - Donor addresses
 * - NGO information
 * - Transaction hashes
 */

import { MarketCandle } from '../../../shared-types';

export class MockDataGenerator {
  /**
   * Generate realistic market candlestick data for AI trading simulation
   * Uses random walk with slight upward bias to simulate market conditions
   *
   * @param candles Number of candles to generate (default: 200 for MA200 calculation)
   * @param startPrice Starting price (default: 0.5 XRP)
   * @returns Array of market candles
   */
  static generateMarketData(
    candles: number = 200,
    startPrice: number = 0.5
  ): MarketCandle[] {
    const data: MarketCandle[] = [];
    let price = startPrice;
    const now = Date.now();

    for (let i = 0; i < candles; i++) {
      // Random walk with slight upward bias (52% chance of increase)
      const change = (Math.random() - 0.48) * 0.02;
      price = Math.max(0.3, Math.min(2.0, price * (1 + change)));

      // Generate OHLC with realistic spreads
      const high = price * (1 + Math.random() * 0.01);
      const low = price * (1 - Math.random() * 0.01);
      const open = low + Math.random() * (high - low);
      const close = low + Math.random() * (high - low);

      // Generate volume (higher volume on price changes)
      const volumeBase = 500000 + Math.random() * 500000;
      const volumeMultiplier = 1 + Math.abs(change) * 10;
      const volume = volumeBase * volumeMultiplier;

      data.push({
        timestamp: now - (candles - i) * 3600000, // Hourly candles
        open,
        high,
        low,
        close,
        volume
      });

      // Update price for next candle
      price = close;
    }

    return data;
  }

  /**
   * Generate a realistic XRPL wallet address
   * Format: r + base58 characters (33-34 chars total)
   *
   * @param prefix Optional prefix for categorization (e.g., 'Donor', 'NGO')
   * @returns Mock XRPL address
   */
  static generateAddress(prefix?: string): string {
    const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const length = 32 + Math.floor(Math.random() * 2); // 32-33 chars
    let address = 'r';

    for (let i = 0; i < length; i++) {
      address += base58Chars[Math.floor(Math.random() * base58Chars.length)];
    }

    return address;
  }

  /**
   * Generate a realistic XRPL transaction hash
   * Format: 64 hexadecimal characters
   *
   * @param prefix Optional prefix for mock identification
   * @returns Mock transaction hash
   */
  static generateTxHash(prefix?: string): string {
    if (prefix) {
      return `MOCK_TX_${prefix}_${Date.now()}_${this.randomHex(8)}`;
    }

    return Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('').toUpperCase();
  }

  /**
   * Generate a realistic NFT token ID
   * Format: Mock identifier with timestamp and address reference
   *
   * @param donorAddress Donor's XRPL address
   * @param level NFT level
   * @returns Mock NFT token ID
   */
  static generateNFTTokenId(donorAddress: string, level: number): string {
    const addressSuffix = donorAddress.slice(-8);
    const timestamp = Date.now();
    const randomSuffix = this.randomHex(6);

    return `MOCK_NFT_L${level}_${timestamp}_${addressSuffix}_${randomSuffix}`;
  }

  /**
   * Generate a realistic DIT (Donor Impact Token) ID
   *
   * @param donorAddress Donor's XRPL address
   * @returns Mock DIT token ID
   */
  static generateDITTokenId(donorAddress: string): string {
    const addressSuffix = donorAddress.slice(-8);
    const timestamp = Date.now();
    const randomSuffix = this.randomHex(6);

    return `MOCK_DIT_${timestamp}_${addressSuffix}_${randomSuffix}`;
  }

  /**
   * Generate mock donor names for leaderboard display
   *
   * @returns Random donor name
   */
  static generateDonorName(): string {
    const adjectives = [
      'Generous', 'Noble', 'Kind', 'Caring', 'Brave',
      'Wise', 'Swift', 'Mighty', 'Gentle', 'Bold'
    ];
    const nouns = [
      'Whale', 'Dolphin', 'Eagle', 'Lion', 'Phoenix',
      'Dragon', 'Hawk', 'Wolf', 'Bear', 'Tiger'
    ];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${adjective} ${noun}`;
  }

  /**
   * Generate realistic donation amounts with distribution
   * - 70% small donations (10-100 XRP)
   * - 20% medium donations (100-500 XRP)
   * - 10% large donations (500-2000 XRP)
   *
   * @returns Random donation amount
   */
  static generateDonationAmount(): number {
    const rand = Math.random();

    if (rand < 0.7) {
      // Small donation
      return Math.floor(Math.random() * 90 + 10);
    } else if (rand < 0.9) {
      // Medium donation
      return Math.floor(Math.random() * 400 + 100);
    } else {
      // Large donation
      return Math.floor(Math.random() * 1500 + 500);
    }
  }

  /**
   * Generate mock NGO data
   *
   * @param id NGO identifier
   * @returns NGO configuration object
   */
  static generateNGO(id: string) {
    const ngoTemplates = [
      {
        name: 'Global Climate Action Fund',
        category: 'climate' as const,
        description: 'Fighting climate change through reforestation and renewable energy',
        certifications: ['UN Climate Neutral', 'OECD Verified'],
        website: 'https://globalclimate.org'
      },
      {
        name: 'World Health Initiative',
        category: 'health' as const,
        description: 'Providing essential healthcare to underserved communities',
        certifications: ['WHO Approved', 'Global Health Council'],
        website: 'https://worldhealth.org'
      },
      {
        name: 'Education for All Foundation',
        category: 'education' as const,
        description: 'Ensuring quality education access for children worldwide',
        certifications: ['UNESCO Partner', 'Global Partnership for Education'],
        website: 'https://educationforall.org'
      },
      {
        name: 'Clean Water Project',
        category: 'water' as const,
        description: 'Bringing clean water to communities in need',
        certifications: ['UN Water Partner', 'WaterAid Certified'],
        website: 'https://cleanwaterproject.org'
      },
      {
        name: 'Humanitarian Relief Network',
        category: 'other' as const,
        description: 'Emergency relief and disaster response worldwide',
        certifications: ['Red Cross Partner', 'UN OCHA Verified'],
        website: 'https://humanitarianrelief.org'
      }
    ];

    const index = parseInt(id.replace('ngo_', '')) - 1;
    const template = ngoTemplates[index % ngoTemplates.length];

    return {
      ...template,
      id,
      walletAddress: this.generateAddress('NGO'),
      impactScore: Math.floor(Math.random() * 20 + 75), // 75-95 score
      weight: 0.2, // Will be normalized by service
      totalReceived: 0,
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Generate mock trading profit percentage
   * Based on realistic daily returns for conservative strategy
   *
   * @returns Profit percentage (-0.5% to 2%)
   */
  static generateProfitPercentage(): number {
    // 60% chance of profit, 40% chance of loss
    if (Math.random() < 0.6) {
      // Profit: 0.1% to 2%
      return Math.random() * 1.9 + 0.1;
    } else {
      // Loss: -0.5% to 0%
      return Math.random() * -0.5;
    }
  }

  /**
   * Generate random hexadecimal string
   *
   * @param length Length of hex string
   * @returns Hex string
   */
  private static randomHex(length: number): string {
    return Array.from({ length }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('').toUpperCase();
  }

  /**
   * Simulate network delay for realistic mock behavior
   *
   * @param minMs Minimum delay in milliseconds
   * @param maxMs Maximum delay in milliseconds
   * @returns Promise that resolves after delay
   */
  static async simulateNetworkDelay(minMs: number = 500, maxMs: number = 1500): Promise<void> {
    const delay = Math.floor(Math.random() * (maxMs - minMs) + minMs);
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Generate mock transaction fee (realistic XRPL fees)
   *
   * @returns Fee in XRP (0.00001 - 0.0001)
   */
  static generateTransactionFee(): string {
    const fee = Math.random() * 0.00009 + 0.00001;
    return fee.toFixed(5);
  }

  /**
   * Generate mock ledger index
   *
   * @returns Random ledger index
   */
  static generateLedgerIndex(): number {
    return Math.floor(Math.random() * 10000000 + 80000000);
  }

  /**
   * Generate mock NFT metadata URI
   *
   * @param donorAddress Donor address
   * @param level NFT level
   * @returns IPFS-style URI
   */
  static generateNFTMetadataURI(donorAddress: string, level: number): string {
    const hash = this.randomHex(46);
    return `ipfs://Qm${hash}/nft-level-${level}.json`;
  }

  /**
   * Generate realistic validation checks for NGO Impact Oracle
   *
   * @param ngoId NGO identifier
   * @returns Validation check results
   */
  static generateValidationChecks(ngoId: string) {
    // Most NGOs should pass validation
    const isValid = Math.random() > 0.2;

    return {
      registrationVerified: isValid,
      financialTransparency: isValid && Math.random() > 0.1,
      impactMetrics: isValid && Math.random() > 0.15,
      certifications: isValid
        ? this.selectRandomCertifications()
        : [],
      redFlags: !isValid
        ? this.generateRedFlags()
        : []
    };
  }

  /**
   * Select random certifications from pool
   */
  private static selectRandomCertifications(): string[] {
    const allCerts = [
      'UN Verified',
      'OECD Approved',
      'Charity Navigator 4-Star',
      'GuideStar Platinum',
      'ISO 9001 Certified',
      'B Corp Certified'
    ];

    const count = Math.floor(Math.random() * 3 + 1); // 1-3 certifications
    return allCerts
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
  }

  /**
   * Generate random red flags for invalid NGOs
   */
  private static generateRedFlags(): string[] {
    const flags = [
      'Missing financial reports',
      'Unverified registration',
      'Lack of transparency',
      'No impact metrics available',
      'Failed background check'
    ];

    const count = Math.floor(Math.random() * 2 + 1); // 1-2 flags
    return flags
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
  }
}

/**
 * Pre-seeded mock donors for demo
 */
export const MOCK_DONORS = [
  {
    address: 'rDemoAlice1234567890ABCDEFGH',
    name: 'Alice the Philanthropist',
    totalDonated: 500,
    xp: 5000,
    level: 8
  },
  {
    address: 'rDemoBob1234567890ABCDEFGHIJ',
    name: 'Bob the Generous',
    totalDonated: 250,
    xp: 2500,
    level: 6
  },
  {
    address: 'rDemoCarol1234567890ABCDEFG',
    name: 'Carol the Caring',
    totalDonated: 750,
    xp: 7500,
    level: 9
  }
];

/**
 * Export singleton instance
 */
export default MockDataGenerator;

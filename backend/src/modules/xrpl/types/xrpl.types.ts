/**
 * XRPL Core Types
 *
 * Définition de tous les types utilisés par le module XRPL
 */

// ============================================================================
// NGO (Organisation Non-Gouvernementale)
// ============================================================================

export interface NGO {
  id: string;
  name: string;
  walletAddress: string;
  category: NGOCategory;
  impactScore: number; // 0-100
  weight: number; // Distribution weight (0-1)
  totalReceived: number;
  verified: boolean;
  certifications: string[];
  website?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum NGOCategory {
  CLIMATE = 'climate',
  HEALTH = 'health',
  EDUCATION = 'education',
  WATER = 'water',
  OTHER = 'other',
}

// ============================================================================
// Donation Pool
// ============================================================================

export interface PoolState {
  totalBalance: number;
  totalDonations: number;
  totalProfitsGenerated: number;
  totalDistributed: number;
  lastTradingRun: Date;
  donorCount: number;
}

export interface DonorInfo {
  address: string;
  totalDonated: number;
  xp: number;
  level: number;
  nftTokenId?: string;
  ditTokenId?: string;
  firstDonationDate: Date;
  lastDonationDate: Date;
  donationCount: number;
}

// ============================================================================
// Transactions
// ============================================================================

export interface DepositRequest {
  donorAddress: string;
  amount: number;
  signature?: string; // XRPL signature (optionnel en mode mock)
}

export interface DepositResponse {
  success: boolean;
  txHash: string;
  nftMinted: boolean;
  nftTokenId?: string;
  xpGained: number;
  newLevel: number;
  poolBalance: number;
}

export interface DistributionRecord {
  id: string;
  ngoId: string;
  ngoName: string;
  amount: number;
  txHash: string;
  timestamp: Date;
}

export interface ProfitDistributionResult {
  success: boolean;
  totalProfit: number;
  distributions: DistributionRecord[];
  txHashes: string[];
}

// ============================================================================
// XRPL Client Configuration
// ============================================================================

export interface XRPLConfig {
  network: 'mainnet' | 'testnet' | 'devnet' | 'mock';
  websocketUrl: string;
  poolWalletSeed?: string;
  poolWalletAddress: string;
  mockMode: boolean; // Si true, utilise des données simulées
}

// ============================================================================
// XRPL Transactions
// ============================================================================

export interface XRPLTransaction {
  type: 'Payment' | 'NFTokenMint' | 'TrustSet';
  from: string;
  to: string;
  amount: number;
  hash: string;
  timestamp: Date;
  validated: boolean;
}

// ============================================================================
// Impact Oracle
// ============================================================================

export interface NGOValidationRequest {
  ngoId: string;
  registrationNumber?: string;
  website?: string;
  country?: string;
}

export interface NGOValidationResult {
  isValid: boolean;
  impactScore: number;
  certifications: string[];
  redFlags: string[];
  dataSource: string;
  lastUpdated: Date;
}

// ============================================================================
// Hooks / Smart Contracts
// ============================================================================

export interface HookDeployment {
  hookHash: string;
  hookNamespace: string;
  hookOn: string;
  deployedAt: Date;
  deploymentTxHash: string;
}

export interface HookEvent {
  type: 'DonationReceived' | 'ProfitDistributed' | 'NFTMinted' | 'GovernanceVote';
  data: any;
  timestamp: Date;
  txHash: string;
}

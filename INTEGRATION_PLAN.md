# XRPL Impact Fund - Full System Integration Plan

## Overview

This document outlines the complete integration strategy for the XRPL Impact Fund platform, connecting the Backend API, AI Trading Engine, and Frontend into a unified, demo-ready system.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Port 5173)                     │
│  React + TypeScript + Zustand + TailwindCSS + Recharts          │
│  - Dashboard UI                                                  │
│  - Donation Interface                                            │
│  - NFT Gallery                                                   │
│  - Governance Panel                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │ REST API (HTTP)
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    BACKEND API (Port 3000)                       │
│  Express + TypeScript + XRPL.js                                  │
│  - /api/xrpl/* endpoints                                         │
│  - DonationPoolService                                           │
│  - XRPLClientService (MOCK/LIVE mode)                           │
│  - ImpactOracleService                                           │
└────────────┬──────────────────────┬─────────────────────────────┘
             │                      │
             │                      │ Internal Service Call
             │                      │
             │           ┌──────────▼──────────┐
             │           │   AI Trading Engine  │
             │           │   TradingAlgorithm   │
             │           │   MA/RSI Strategy    │
             │           └─────────────────────┘
             │
             │ XRPL Network Integration
             │
┌────────────▼────────────────────────────────────────────────────┐
│                      XRPL NETWORK LAYER                          │
│  MOCK Mode (Demo) | Testnet | Mainnet                           │
│  - Payment Transactions                                          │
│  - NFT Minting (XLS-20)                                          │
│  - Trust Lines                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 1. Backend ↔ AI Engine Integration

### Current State
- AI Trading Engine: TradingAlgorithm service in [backend/src/services/ai-trading/TradingAlgorithm.ts](backend/src/services/ai-trading/TradingAlgorithm.ts)
- Integrated directly into Backend as internal service
- No separate microservice or API layer

### Integration Strategy

#### Option A: Embedded Service (Current - Recommended for Demo)
**Pros**: Simple, no network overhead, fast development
**Cons**: Tightly coupled, harder to scale independently

**Implementation**:
```typescript
// backend/src/services/donation-pool.service.ts
import { TradingAlgorithm } from './ai-trading/TradingAlgorithm';

class DonationPoolService {
  private tradingEngine: TradingAlgorithm;

  constructor(xrplClient: XRPLClientService) {
    this.tradingEngine = new TradingAlgorithm();
  }

  async simulateProfit(customProfitPercentage?: number): Promise<SimulationResult> {
    // Generate mock market data
    const mockData = this.generateMockMarketData();

    // Get AI trading signal
    const signal = this.tradingEngine.generateSignal(mockData);

    // Calculate profit based on signal confidence
    const profitPercentage = customProfitPercentage ??
                             this.calculateProfitFromSignal(signal);

    const profitAmount = this.poolState.totalBalance * (profitPercentage / 100);

    // Update pool state
    this.poolState.totalBalance += profitAmount;
    this.poolState.totalProfitsGenerated += profitAmount;

    return {
      profitAmount,
      profitPercentage,
      newBalance: this.poolState.totalBalance,
      signal: signal.action,
      confidence: signal.confidence
    };
  }
}
```

#### Option B: Separate Microservice (Future Scalability)
**Pros**: Independent scaling, language-agnostic, better separation
**Cons**: Network latency, more complex deployment

**Implementation** (if needed later):
```yaml
# docker-compose.yml
services:
  ai-engine:
    build: ./ai-engine
    ports:
      - "5000:5000"
    environment:
      - MODEL_PATH=/models/trading-model.pkl
      - API_KEY=${AI_ENGINE_API_KEY}
```

```typescript
// backend/src/services/ai-client.service.ts
class AITradingClient {
  async getPrediction(marketData: MarketData): Promise<TradingSignal> {
    const response = await axios.post('http://ai-engine:5000/predict', {
      data: marketData
    });
    return response.data;
  }
}
```

### Recommended Approach for Demo
**Use embedded service (Option A)** with these enhancements:
1. Mock market data generator for realistic simulation
2. Configurable profit ranges (0.5% - 2% daily)
3. Performance metrics tracking
4. Signal visualization for frontend dashboard

---

## 2. Backend ↔ Frontend Integration

### API Endpoints Mapping

| Frontend Action | API Endpoint | Method | Request Body | Response |
|----------------|--------------|--------|--------------|----------|
| Load Dashboard | `/api/xrpl/pool` | GET | - | PoolState |
| Submit Donation | `/api/xrpl/deposit` | POST | `{donorAddress, amount, signature?}` | DonorInfo + NFT |
| Fetch Donor Profile | `/api/xrpl/donor/:address` | GET | - | DonorInfo |
| List NGOs | `/api/xrpl/ngos` | GET | `?validated=true` | NGO[] |
| Validate NGO | `/api/xrpl/validate-ngo` | POST | `{ngoId, registrationNumber, website}` | ValidationResult |
| Simulate AI Profit | `/api/xrpl/simulate-profit` | POST | `{profitPercentage?}` | SimulationResult |
| Distribute Profits | `/api/xrpl/distribute` | POST | `{profitAmount}` | DistributionRecord[] |
| Check Health | `/api/xrpl/health` | GET | - | HealthStatus |

### Frontend Service Layer

**File**: [frontend/src/services/api.ts](frontend/src/services/api.ts)

```typescript
// Unified API client
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = {
  // Pool operations
  getPoolState: () => axios.get(`${API_BASE_URL}/api/xrpl/pool`),

  // Donations
  submitDonation: (data: DonationRequest) =>
    axios.post(`${API_BASE_URL}/api/xrpl/deposit`, data),

  getDonorProfile: (address: string) =>
    axios.get(`${API_BASE_URL}/api/xrpl/donor/${address}`),

  // NGO operations
  getNGOs: (validated?: boolean) =>
    axios.get(`${API_BASE_URL}/api/xrpl/ngos`, { params: { validated } }),

  validateNGO: (data: NGOValidationRequest) =>
    axios.post(`${API_BASE_URL}/api/xrpl/validate-ngo`, data),

  // AI Trading
  simulateProfit: (profitPercentage?: number) =>
    axios.post(`${API_BASE_URL}/api/xrpl/simulate-profit`, { profitPercentage }),

  distributeProfit: (profitAmount: number) =>
    axios.post(`${API_BASE_URL}/api/xrpl/distribute`, { profitAmount }),

  // Health check
  checkHealth: () => axios.get(`${API_BASE_URL}/api/xrpl/health`)
};
```

### State Management Integration

**File**: [frontend/src/store/index.ts](frontend/src/store/index.ts)

```typescript
interface AppState {
  // Pool state
  poolBalance: number;
  totalDonations: number;
  totalProfits: number;
  totalDistributed: number;

  // Donor state
  currentDonor: DonorInfo | null;
  donorAddress: string | null;

  // NGO state
  ngos: NGO[];
  validatedNGOs: NGO[];

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPoolState: () => Promise<void>;
  submitDonation: (address: string, amount: number) => Promise<void>;
  simulateProfit: (percentage?: number) => Promise<void>;
  fetchNGOs: () => Promise<void>;
  validateNGO: (ngoId: string) => Promise<void>;
}
```

### Real-time Updates Strategy

**Polling Approach** (Current):
```typescript
// Auto-refresh every 5 seconds
useEffect(() => {
  const interval = setInterval(() => {
    fetchPoolState();
  }, 5000);

  return () => clearInterval(interval);
}, []);
```

**WebSocket Approach** (Future Enhancement):
```typescript
// backend/src/index.ts
import { Server } from 'socket.io';

const io = new Server(server, {
  cors: { origin: 'http://localhost:5173' }
});

io.on('connection', (socket) => {
  console.log('Client connected');

  // Emit pool updates
  poolUpdateEmitter.on('update', (poolState) => {
    socket.emit('pool:update', poolState);
  });

  // Emit new donations
  donationEmitter.on('new', (donation) => {
    socket.emit('donation:new', donation);
  });
});
```

---

## 3. XRPL Mock Implementation for Demo

### Mock Mode Configuration

**File**: [backend/src/modules/xrpl/services/xrpl-client.service.ts](backend/src/modules/xrpl/services/xrpl-client.service.ts)

### Mock Features

#### 1. Mock Balance Queries
```typescript
async getBalance(address: string): Promise<number> {
  if (this.config.mockMode) {
    // Return realistic mock balances
    const mockBalances: Record<string, number> = {
      [this.config.poolWalletAddress]: 10000, // Pool wallet
      'rDonor1...': 5000,
      'rDonor2...': 3000,
      'rNGO1...': 1000
    };

    return mockBalances[address] ?? Math.random() * 1000 + 100;
  }

  // Real XRPL query
  const response = await this.client.getXrpBalance(address);
  return parseFloat(response);
}
```

#### 2. Mock Payment Transactions
```typescript
async sendPayment(params: PaymentParams): Promise<TransactionResult> {
  if (this.config.mockMode) {
    const mockTxHash = `MOCK_TX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      txHash: mockTxHash,
      fee: '0.00001',
      timestamp: new Date().toISOString(),
      validated: true
    };
  }

  // Real XRPL transaction
  const prepared = await this.client.autofill({
    TransactionType: 'Payment',
    Account: params.from,
    Destination: params.to,
    Amount: xrpToDrops(params.amount)
  });

  const signed = this.wallet.sign(prepared);
  const result = await this.client.submitAndWait(signed.tx_blob);

  return this.parseTransactionResult(result);
}
```

#### 3. Mock NFT Minting
```typescript
async mintNFT(params: NFTMintParams): Promise<NFTMintResult> {
  if (this.config.mockMode) {
    const mockTokenId = `MOCK_NFT_${Date.now()}_${params.donorAddress.substr(-8)}`;

    // Simulate minting delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      success: true,
      tokenId: mockTokenId,
      uri: params.uri,
      ownerAddress: params.donorAddress,
      txHash: `MOCK_MINT_TX_${Date.now()}`,
      metadata: {
        level: params.metadata.level,
        xp: params.metadata.xp,
        tier: params.metadata.tier,
        evolution: params.metadata.evolution
      }
    };
  }

  // Real NFT minting (XLS-20)
  const tx = await this.client.autofill({
    TransactionType: 'NFTokenMint',
    Account: this.config.poolWalletAddress,
    URI: convertStringToHex(params.uri),
    Flags: 8, // Transferable
    NFTokenTaxon: 0
  });

  const signed = this.wallet.sign(tx);
  const result = await this.client.submitAndWait(signed.tx_blob);

  return this.parseNFTMintResult(result);
}
```

#### 4. Mock Transaction Verification
```typescript
async verifyTransaction(txHash: string): Promise<VerificationResult> {
  if (this.config.mockMode) {
    // Mock transactions are always valid
    if (txHash.startsWith('MOCK_TX_')) {
      return {
        validated: true,
        success: true,
        timestamp: new Date(parseInt(txHash.split('_')[2])).toISOString(),
        fee: '0.00001'
      };
    }

    return {
      validated: false,
      success: false,
      error: 'Transaction not found in mock ledger'
    };
  }

  // Real XRPL verification
  const response = await this.client.request({
    command: 'tx',
    transaction: txHash
  });

  return {
    validated: response.result.validated,
    success: response.result.meta?.TransactionResult === 'tesSUCCESS',
    timestamp: response.result.date,
    fee: dropsToXrp(response.result.Fee)
  };
}
```

### Mock Data Generators

**File**: [backend/src/utils/mock-data.ts](backend/src/utils/mock-data.ts)

```typescript
export const mockDataGenerator = {
  // Generate realistic market data for AI trading
  generateMarketData(candles: number = 200): MarketCandle[] {
    const data: MarketCandle[] = [];
    let price = 0.5; // Starting XRP price

    for (let i = 0; i < candles; i++) {
      const change = (Math.random() - 0.48) * 0.02; // Slight upward bias
      price = Math.max(0.3, price * (1 + change));

      data.push({
        timestamp: Date.now() - (candles - i) * 3600000, // Hourly candles
        open: price,
        high: price * (1 + Math.random() * 0.01),
        low: price * (1 - Math.random() * 0.01),
        close: price,
        volume: Math.random() * 1000000
      });
    }

    return data;
  },

  // Generate donor addresses
  generateDonorAddress(): string {
    return `rDonor${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  },

  // Generate NGO wallet addresses
  generateNGOAddress(): string {
    return `rNGO${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  },

  // Generate transaction hashes
  generateTxHash(): string {
    return Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('').toUpperCase();
  }
};
```

---

## 4. Unified Types & Interfaces

### Shared Type Definitions

**File**: [shared-types.ts](shared-types.ts) (to be created at root)

```typescript
// Core domain types
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

export interface NGO {
  id: string;
  name: string;
  walletAddress: string;
  category: 'climate' | 'health' | 'education' | 'water' | 'other';
  impactScore: number;
  weight: number;
  totalReceived: number;
  verified: boolean;
  certifications: string[];
  website?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PoolState {
  totalBalance: number;
  totalDonations: number;
  totalProfitsGenerated: number;
  totalDistributed: number;
  lastTradingRun: Date | null;
  donorCount: number;
}

export interface DistributionRecord {
  id: string;
  ngoId: string;
  ngoName: string;
  amount: number;
  txHash: string;
  timestamp: Date;
}

// API request/response types
export interface DonationRequest {
  donorAddress: string;
  amount: number;
  signature?: string;
}

export interface DonationResponse {
  donor: DonorInfo;
  nft?: NFTMintResult;
  dit?: DITMintResult;
  poolState: PoolState;
}

export interface SimulationResult {
  profitAmount: number;
  profitPercentage: number;
  newBalance: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  tradingMetrics?: TradingMetrics;
}

export interface NGOValidationRequest {
  ngoId: string;
  registrationNumber?: string;
  website?: string;
  country?: string;
}

export interface ValidationResult {
  ngoId: string;
  impactScore: number;
  checks: {
    registrationVerified: boolean;
    financialTransparency: boolean;
    impactMetrics: boolean;
    certifications: string[];
    redFlags: string[];
  };
  validated: boolean;
  timestamp: Date;
}

// Trading types
export interface TradingSignal {
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  indicators: {
    sma50: number;
    sma200: number;
    rsi: number;
  };
  timestamp: Date;
}

export interface TradingMetrics {
  totalTrades: number;
  profitableTrades: number;
  totalProfit: number;
  roi: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

// XRPL types
export interface TransactionResult {
  success: boolean;
  txHash: string;
  fee: string;
  timestamp: string;
  validated: boolean;
  error?: string;
}

export interface NFTMintResult {
  success: boolean;
  tokenId: string;
  uri: string;
  ownerAddress: string;
  txHash: string;
  metadata: NFTMetadata;
}

export interface NFTMetadata {
  level: number;
  xp: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  evolution: number;
  attributes?: Record<string, any>;
}

// Health check
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  mode: 'MOCK' | 'TESTNET' | 'MAINNET';
  services: {
    xrpl: boolean;
    database: boolean;
    redis: boolean;
    aiTrading: boolean;
  };
  poolInfo: {
    balance: number;
    donorCount: number;
    ngoCount: number;
  };
  timestamp: Date;
}
```

### Type Export Strategy

**Backend** ([backend/src/types/index.ts](backend/src/types/index.ts)):
```typescript
export * from '../../../shared-types';
```

**Frontend** ([frontend/src/types/index.ts](frontend/src/types/index.ts)):
```typescript
export * from '../../../shared-types';
```

---

## 5. Environment Configuration

### Global .env.example

See `.env.example` file (created separately)

### Environment Loading Strategy

**Backend**:
```typescript
// backend/src/config/env.ts
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: '../.env' });

const envSchema = z.object({
  // XRPL
  XRPL_NETWORK: z.enum(['mock', 'testnet', 'mainnet']).default('mock'),
  XRPL_WEBSOCKET_URL: z.string().url().optional(),
  XRPL_POOL_WALLET_SEED: z.string().optional(),
  XRPL_POOL_WALLET_ADDRESS: z.string().optional(),

  // Server
  PORT: z.string().transform(Number).default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  DATABASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),

  // AI Trading
  AI_TRADING_ENABLED: z.string().transform(v => v === 'true').default('true'),

  // Security
  JWT_SECRET: z.string().optional(),
  CORS_ORIGIN: z.string().default('http://localhost:5173')
});

export const env = envSchema.parse(process.env);
```

**Frontend**:
```typescript
// frontend/src/config/env.ts
const envSchema = {
  VITE_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  VITE_XRPL_NETWORK: import.meta.env.VITE_XRPL_NETWORK || 'mock',
  VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true'
};

export const config = envSchema;
```

---

## 6. Docker Compose Configuration

See `docker-compose.yml` file (created separately)

---

## 7. Clean Demo Scenario Flow

### Scenario: "Impact Fund Complete Cycle"

#### Phase 1: Initial Setup (Pre-Demo)
1. Start all services: `docker-compose up -d`
2. Verify health: `curl http://localhost:3000/api/xrpl/health`
3. Seed NGOs: Backend auto-seeds 5 NGOs on startup
4. Frontend accessible at: `http://localhost:5173`

#### Phase 2: User Donation
**Actor**: Demo User (Alice)
**Wallet**: `rDemoAlice123...` (mock address)

1. **Open Frontend Dashboard**
   - Pool Balance: 0 XRP
   - Total Donors: 0
   - NGOs Listed: 5 (auto-seeded)

2. **Click "Donate Now"**
   - Enter amount: 100 XRP
   - Enter wallet address: `rDemoAlice123...`
   - Click "Submit Donation"

3. **Backend Processing** ([backend/src/modules/xrpl/services/donation-pool.service.ts](backend/src/modules/xrpl/services/donation-pool.service.ts)):
   ```
   POST /api/xrpl/deposit
   {
     "donorAddress": "rDemoAlice123...",
     "amount": 100
   }
   ```

   - XRPLClientService.sendPayment() → Returns mock TX hash
   - DonationPoolService.registerDonation()
     - Pool balance: 0 → 100 XRP
     - Alice's XP: 0 → 1000 (100 XRP × 10)
     - Alice's Level: 0 → 4 (floor(sqrt(1000/100)) + 1)
   - DonationPoolService.mintNFT()
     - Generates Impact NFT with Level 4 metadata
     - Returns tokenId: `MOCK_NFT_1234567890_alice123`

4. **Frontend Update**
   - Pool Balance: 100 XRP
   - Total Donors: 1
   - Alice's Profile Card appears:
     - Level: 4
     - XP: 1000
     - NFT: Display evolving badge (Bronze tier)

#### Phase 3: AI Generates Profit
**Actor**: System (Automated or manual trigger)

1. **Trigger AI Trading Simulation**
   - Click "Simulate Trading" button on admin dashboard
   - OR wait for auto-trigger (if scheduled)

2. **Backend Processing**:
   ```
   POST /api/xrpl/simulate-profit
   {
     "profitPercentage": 0.67
   }
   ```

   - TradingAlgorithm generates mock market data (200 candles)
   - Calculates MA50, MA200, RSI14
   - Generates signal: BUY (confidence: 72%)
   - Profit calculation: 100 XRP × 0.67% = 0.67 XRP
   - Pool balance: 100 → 100.67 XRP
   - Total profits generated: 0 → 0.67 XRP

3. **Frontend Update**:
   - Pool Balance: 100.67 XRP ⬆️
   - Trading Signal Widget:
     - Action: BUY
     - Confidence: 72%
     - Profit: +0.67 XRP (+0.67%)
   - Chart updates with new balance

#### Phase 4: Profit Redistribution
**Actor**: System Admin or Automated Scheduler

1. **Trigger Distribution**
   - Click "Distribute Profits" button
   - Confirms profit amount: 0.67 XRP

2. **Backend Processing**:
   ```
   POST /api/xrpl/distribute
   {
     "profitAmount": 0.67
   }
   ```

   - DonationPoolService.distributeToNGOs()
   - Calculates weighted distribution:
     - NGO 1 (Climate): 0.20 × 0.67 = 0.134 XRP
     - NGO 2 (Health): 0.25 × 0.67 = 0.168 XRP
     - NGO 3 (Education): 0.30 × 0.67 = 0.201 XRP
     - NGO 4 (Water): 0.15 × 0.67 = 0.100 XRP
     - NGO 5 (Other): 0.10 × 0.67 = 0.067 XRP

   - XRPLClientService.sendPayment() × 5 (mock transactions)
   - Generates distribution records with TX hashes
   - Pool balance: 100.67 → 100 XRP (profit distributed)
   - Total distributed: 0 → 0.67 XRP

3. **Frontend Update**:
   - Pool Balance: 100 XRP
   - Distribution Feed shows 5 new entries:
     - "0.134 XRP → Climate Action Fund (TX: MOCK_TX_...)"
     - "0.168 XRP → Global Health Initiative (TX: MOCK_TX_...)"
     - etc.
   - NGO cards update totalReceived amounts

#### Phase 5: NFT Evolution
**Actor**: Alice (User)

1. **Alice Donates Again**
   - Amount: 150 XRP
   - Total donated: 250 XRP

2. **Backend Processing**:
   - Alice's XP: 1000 → 2500 (250 XRP × 10)
   - Alice's Level: 4 → 5 (floor(sqrt(2500/100)) + 1)
   - Level-up detected!
   - DonationPoolService.evolveNFT()
     - Updates NFT metadata to Level 5, Silver tier
     - New tokenId or updated URI

3. **Frontend Update**:
   - Alice's Profile:
     - Level: 4 → 5 ⬆️
     - XP: 2500
     - NFT evolves: Bronze → Silver badge animation
   - Notification: "Congratulations! Your Impact NFT evolved to Silver tier!"

#### Phase 6: Dashboard Updates
**Actor**: All Users (Real-time)

1. **Real-time Metrics**:
   - Auto-refresh every 5 seconds
   - Pool balance updates
   - Donation feed (latest 10 donations)
   - Distribution history
   - Leaderboard (top donors by XP)

2. **Charts & Visualizations**:
   - Pool Growth Chart: Line graph showing balance over time
   - Donation Distribution: Pie chart showing NGO allocation
   - Trading Performance: Profit/loss timeline
   - Impact Metrics: Total donations, total redistributed, ROI

3. **Governance Panel**:
   - Alice can vote on NGO selection (using DIT token)
   - View active proposals
   - See voting power based on donation history

---

## 8. Integration Testing Checklist

### Pre-Demo Verification

- [ ] **Docker Services Running**
  ```bash
  docker-compose ps
  # All services: backend, frontend should be "Up"
  ```

- [ ] **Backend Health Check**
  ```bash
  curl http://localhost:3000/api/xrpl/health
  # Should return: {"status": "healthy", "mode": "MOCK", ...}
  ```

- [ ] **Frontend Accessible**
  ```bash
  curl http://localhost:5173
  # Should return HTML
  ```

- [ ] **NGOs Seeded**
  ```bash
  curl http://localhost:3000/api/xrpl/ngos
  # Should return array of 5 NGOs
  ```

- [ ] **Pool Initialized**
  ```bash
  curl http://localhost:3000/api/xrpl/pool
  # Should return initial state with 0 balance
  ```

### End-to-End Flow Testing

- [ ] **Test Donation Flow**
  ```bash
  curl -X POST http://localhost:3000/api/xrpl/deposit \
    -H "Content-Type: application/json" \
    -d '{"donorAddress": "rTestDonor123", "amount": 100}'
  # Should return donor info with XP, level, NFT
  ```

- [ ] **Test AI Profit Simulation**
  ```bash
  curl -X POST http://localhost:3000/api/xrpl/simulate-profit \
    -H "Content-Type: application/json" \
    -d '{"profitPercentage": 0.67}'
  # Should return profit amount, signal, updated balance
  ```

- [ ] **Test Distribution**
  ```bash
  curl -X POST http://localhost:3000/api/xrpl/distribute \
    -H "Content-Type: application/json" \
    -d '{"profitAmount": 0.67}'
  # Should return distribution records for all NGOs
  ```

- [ ] **Test NGO Validation**
  ```bash
  curl -X POST http://localhost:3000/api/xrpl/validate-ngo \
    -H "Content-Type: application/json" \
    -d '{"ngoId": "ngo_1", "registrationNumber": "12345"}'
  # Should return impact score and validation result
  ```

- [ ] **Test Donor Profile**
  ```bash
  curl http://localhost:3000/api/xrpl/donor/rTestDonor123
  # Should return complete donor info
  ```

### Frontend Integration Testing

- [ ] Dashboard loads without errors
- [ ] Pool balance displays correctly
- [ ] Donation form accepts input and submits
- [ ] NFT gallery shows minted NFTs
- [ ] NGO list renders with validation status
- [ ] Charts render with data
- [ ] Real-time updates work (5s polling)
- [ ] Error handling shows user-friendly messages

---

## 9. Deployment Architecture

### Development Mode
```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

### Docker Production Mode
```bash
# Build and start all services
docker-compose up --build

# Access services:
# - Frontend: http://localhost:5173
# - Backend: http://localhost:3000
# - PostgreSQL: localhost:5433
# - Redis: localhost:6379
```

### Cloud Deployment (Future)
```yaml
# Kubernetes deployment example
apiVersion: apps/v1
kind: Deployment
metadata:
  name: xrpl-backend
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: backend
        image: xrpl-impact-fund/backend:latest
        env:
        - name: XRPL_NETWORK
          value: "mainnet"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
```

---

## 10. Security Considerations

### API Security
- Input validation with Zod schemas
- Rate limiting on donation endpoints
- CORS configuration for frontend origin
- Environment variable protection

### XRPL Security
- Wallet seed stored in environment (never committed)
- Transaction signing on backend only
- Verification of all transactions before processing
- Multi-signature support for large transfers (future)

### Data Privacy
- Donor addresses are pseudonymous
- No PII stored in database
- GDPR compliance for EU users (future)

---

## 11. Monitoring & Observability

### Metrics to Track
- Donation volume (total XRP, count)
- Pool growth rate
- AI trading performance (ROI, Sharpe ratio)
- Distribution accuracy
- NFT mint success rate
- API response times
- Error rates

### Logging Strategy
```typescript
// backend/src/utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

// Usage
logger.info('Donation received', { address, amount, txHash });
logger.error('XRPL connection failed', { error: err.message });
```

---

## 12. Future Enhancements

### Phase 2 Features
- Real XRPL Testnet integration
- Persistent PostgreSQL storage
- Redis caching for performance
- WebSocket real-time updates
- User authentication (JWT)
- Advanced governance voting

### Phase 3 Features
- Mainnet deployment
- Real AI trading integration (DEX APIs)
- Mobile app (React Native)
- Advanced NFT metadata (IPFS storage)
- Multi-chain support (Ethereum, Polygon)
- DAO governance smart contracts

---

## Summary

This integration plan provides a complete blueprint for connecting all system components into a unified, demo-ready platform. The mock XRPL implementation enables realistic demonstrations without blockchain dependencies, while the architecture supports seamless migration to production XRPL networks.

**Key Deliverables**:
1. ✅ Backend ↔ AI Engine integration strategy
2. ✅ Frontend ↔ Backend API mapping
3. ✅ XRPL mock implementation
4. ✅ Unified type definitions
5. ✅ Docker Compose configuration (see separate file)
6. ✅ Clean demo scenario with step-by-step flow
7. ✅ Testing checklist and deployment guide

**Next Steps**:
1. Review this plan
2. Create `.env.example` file
3. Create `docker-compose.yml` file
4. Create `shared-types.ts` file
5. Test end-to-end demo scenario
6. Prepare presentation materials

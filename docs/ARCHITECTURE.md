# XRPL Impact Fund - Technical Architecture

## System Overview

This document describes the technical architecture of the XRPL Impact Fund platform.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Web App    │  │  Mobile App  │  │   Admin      │             │
│  │  (React)     │  │ (React Native)│  │  Dashboard   │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/WSS
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API Layer                                   │
│  ┌──────────────────────────────────────────────────────┐          │
│  │  Express.js REST API + WebSocket Server              │          │
│  │  - Authentication (JWT)                               │          │
│  │  - Rate limiting                                      │          │
│  │  - Request validation (Zod)                          │          │
│  └──────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
│  Business Logic  │ │   Database   │ │  External APIs   │
│  Layer           │ │   Layer      │ │  & Services      │
│                  │ │              │ │                  │
│ • Smart Contract │ │ PostgreSQL   │ │ • XRPL Network   │
│   Manager        │ │              │ │ • UN Data API    │
│ • NFT Manager    │ │ Redis Cache  │ │ • OECD API       │
│ • Impact Oracle  │ │              │ │ • Pinata (IPFS)  │
│ • AI Trading     │ │              │ │ • Mapbox         │
│   Service        │ │              │ │                  │
│ • Distribution   │ │              │ │                  │
│   Engine         │ │              │ │                  │
└──────────────────┘ └──────────────┘ └──────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Blockchain Layer                               │
│  ┌──────────────────────────────────────────────────────┐          │
│  │  XRPL Network (Mainnet/Testnet)                      │          │
│  │  - Smart Hooks / Xahau Contracts                     │          │
│  │  - NFT Ledger (XLS-20)                               │          │
│  │  - Payment Transactions                               │          │
│  │  - Account Management                                 │          │
│  └──────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Smart Contract Layer (XRPL Hooks)

**Purpose**: Handle on-chain logic for donations, distributions, and token management

**Key Contracts**:
- `ImpactFundHook`: Main contract managing pool state
- `NFTMinter`: Handles Impact NFT creation and evolution
- `DITManager`: Manages soulbound Donor Impact Tokens
- `DistributionEngine`: Automates profit distribution to NGOs

**Functions**:
```typescript
// Deposit handling
onDeposit(amount: number, donorAddress: string)
  -> Updates pool balance
  -> Mints/evolves Impact NFT
  -> Awards XP
  -> Emits DonationReceived event

// Profit distribution
onProfitGenerated(profit: number)
  -> Queries Impact Oracle for validated NGOs
  -> Calculates shares based on weights
  -> Transfers to NGO wallets
  -> Creates Donation Stories
  -> Emits ProfitDistributed events

// Governance
onGovernanceVote(donorAddress: string, ngoId: string)
  -> Validates DIT token ownership
  -> Records vote weighted by XP
  -> Evolves voter's NFT
  -> Updates NGO weights
```

**State Management**:
```typescript
interface PoolState {
  totalBalance: number
  totalDonations: number
  totalProfitsGenerated: number
  totalDistributed: number
  lastTradingRun: Date
  donors: Map<address, DonorInfo>
  ngos: Map<id, NGOInfo>
}
```

### 2. AI Trading Service

**Purpose**: Generate yield from pool capital using conservative algorithmic trading

**Strategy**: Baseline MA Crossover + RSI
- SMA 50/200 for trend detection
- RSI 14 for overbought/oversold signals
- Max 10% of pool per trade
- Stop-loss at 5%

**Architecture**:
```
┌─────────────────┐
│ Market Data     │
│ Aggregator      │
│ (Hourly OHLCV)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Trading         │
│ Algorithm       │
│ (Python)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌─────────────────┐
│ Signal          │─────▶│ Execution       │
│ Generator       │      │ Engine          │
└─────────────────┘      └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ XRPL DEX        │
                         │ (or External    │
                         │  Exchange API)  │
                         └─────────────────┘
```

**Risk Management**:
- Maximum position size: 10% of pool
- Daily loss limit: 2%
- Monthly drawdown limit: 5%
- Auto-pause if limits breached

**Performance Tracking**:
```typescript
interface TradingPerformance {
  totalTrades: number
  profitableTrades: number
  totalProfit: number
  totalLoss: number
  roi: number
  sharpeRatio: number
  maxDrawdown: number
}
```

### 3. Impact Oracle

**Purpose**: Validate NGO legitimacy and calculate Impact Scores

**Data Sources**:
- UN Data API
- OECD Statistics
- Charity Navigator API (when available)
- GiveWell recommendations
- OpenCharities.org

**Validation Process**:
```
NGO Input
    │
    ▼
┌─────────────────────────────┐
│ 1. Registration Check       │
│    - Official registry      │
│    - Tax ID verification    │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ 2. Financial Transparency   │
│    - Published reports      │
│    - Audited statements     │
│    - Overhead ratio         │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ 3. Impact Metrics           │
│    - Lives impacted         │
│    - Cost per beneficiary   │
│    - ROI on donations       │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ 4. Certifications           │
│    - UN SDG partner         │
│    - B-Corp                 │
│    - ISO standards          │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ 5. Red Flag Scan            │
│    - Legal issues           │
│    - Fraud reports          │
│    - Negative news          │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ Impact Score (0-100)        │
│ + Recommendation            │
└─────────────────────────────┘
```

**Scoring Algorithm**:
```typescript
Impact Score =
  Registration (25 pts) +
  Transparency (25 pts) +
  Impact Metrics (25 pts) +
  Certifications (25 pts) -
  Red Flags (penalty)

Minimum valid score: 60/100
```

### 4. NFT Evolution System

**Purpose**: Gamify donations with evolving visual NFTs

**Metadata Structure**:
```json
{
  "name": "Impact NFT #1234",
  "description": "Dynamic Impact NFT for donor rDon...x7k9",
  "image": "ipfs://QmXXX.../level_5_gold.png",
  "attributes": [
    { "trait_type": "Level", "value": 5 },
    { "trait_type": "XP", "value": 2500 },
    { "trait_type": "Tier", "value": "Gold" },
    { "trait_type": "Total Donated", "value": "5000 XRP" },
    { "trait_type": "Donation Count", "value": 12 },
    { "trait_type": "Color", "value": "Gold" },
    { "trait_type": "Shape", "value": "Hexagon" },
    { "trait_type": "Aura", "value": "Rare" }
  ],
  "evolution_history": [
    { "date": "2025-01-15", "event": "Minted at Level 1" },
    { "date": "2025-02-20", "event": "Evolved to Level 3 (Silver)" },
    { "date": "2025-03-10", "event": "Evolved to Level 5 (Gold)" }
  ]
}
```

**Evolution Triggers**:
- New donation: +10 XP per XRP donated
- Governance vote: +10 XP
- Profit distribution (passive): +5 XP
- Referral: +50 XP

**Level Calculation**:
```typescript
level = floor(sqrt(XP / 100)) + 1

Examples:
  100 XP   -> Level 2
  400 XP   -> Level 3
  900 XP   -> Level 4
  2500 XP  -> Level 6
  10000 XP -> Level 11
```

**Visual Attributes by Tier**:
| Tier | Level | Color | Shape | Aura |
|------|-------|-------|-------|------|
| Bronze | 1-3 | Bronze | Circle/Pentagon | None/Uncommon |
| Silver | 4-5 | Silver | Pentagon | Uncommon |
| Gold | 6-7 | Gold | Hexagon | Rare |
| Platinum | 8-9 | Platinum | Hexagon | Epic |
| Diamond | 10+ | Diamond | Star | Legendary |

### 5. Donation Story Generator

**Purpose**: Create shareable impact stories for each NGO distribution

**Story Components**:
```typescript
interface DonationStory {
  id: string
  timestamp: Date
  ngo: {
    name: string
    logo: string
    category: string
  }
  amount: number
  xrplTxHash: string
  project: {
    title: string
    description: string
    impact: string // "500 trees planted", "20 children educated"
  }
  media: {
    image: string
    qrCode: string // Links to XRPL explorer
  }
  shareUrl: string
}
```

**Generation Flow**:
```
Profit Distribution
        │
        ▼
┌────────────────────┐
│ Select NGO         │
│ Calculate Amount   │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Execute Transfer   │
│ Get TX Hash        │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Fetch NGO Project  │
│ Data from DB       │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Generate Visual    │
│ (Image + QR Code)  │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Store Story in DB  │
│ Upload to IPFS     │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Display in         │
│ Dashboard Feed     │
└────────────────────┘
```

### 6. Governance System

**Purpose**: Enable decentralized decision-making via DIT tokens

**Voting Power**:
```typescript
votingPower = donorXP * ditTokenMultiplier

ditTokenMultiplier = {
  Bronze: 1.0,
  Silver: 1.2,
  Gold: 1.5,
  Platinum: 2.0,
  Diamond: 3.0
}
```

**Governance Actions**:
1. **NGO Weight Adjustment**
   - Vote to increase/decrease NGO funding allocation
   - Requires 10% quorum
   - Simple majority wins

2. **New NGO Addition**
   - Propose new NGO to fund
   - Requires Impact Score > 70
   - Requires 20% quorum
   - 60% supermajority needed

3. **Trading Strategy Changes**
   - Adjust risk parameters
   - Requires 30% quorum
   - 75% supermajority

4. **Emergency Actions**
   - Pause trading
   - Pause distributions
   - Requires 40% quorum
   - 80% supermajority

**Vote Lifecycle**:
```
Proposal Created
     │
     ▼
┌──────────────┐
│ 7-day voting │
│ period       │
└──────┬───────┘
       │
       ▼
  Quorum met? ──No──▶ Proposal fails
       │
      Yes
       │
       ▼
  Majority? ──No──▶ Proposal fails
       │
      Yes
       │
       ▼
┌──────────────┐
│ 2-day        │
│ timelock     │
└──────┬───────┘
       │
       ▼
Execute Proposal
```

## Database Schema

### PostgreSQL Tables

```sql
-- Donors
CREATE TABLE donors (
  address VARCHAR(34) PRIMARY KEY,
  total_donated NUMERIC(20, 6) NOT NULL DEFAULT 0,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  nft_token_id VARCHAR(64),
  dit_token_id VARCHAR(64),
  first_donation_at TIMESTAMP,
  last_donation_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- NGOs
CREATE TABLE ngos (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(34) NOT NULL,
  registration_number VARCHAR(100),
  country VARCHAR(2),
  category VARCHAR(20),
  website VARCHAR(255),
  impact_score INTEGER,
  total_received NUMERIC(20, 6) DEFAULT 0,
  weight NUMERIC(3, 2) DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Donations
CREATE TABLE donations (
  id SERIAL PRIMARY KEY,
  donor_address VARCHAR(34) REFERENCES donors(address),
  amount NUMERIC(20, 6) NOT NULL,
  xrpl_tx_hash VARCHAR(64) UNIQUE NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Distributions
CREATE TABLE distributions (
  id SERIAL PRIMARY KEY,
  ngo_id VARCHAR(36) REFERENCES ngos(id),
  amount NUMERIC(20, 6) NOT NULL,
  xrpl_tx_hash VARCHAR(64) UNIQUE NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Donation Stories
CREATE TABLE donation_stories (
  id VARCHAR(36) PRIMARY KEY,
  distribution_id INTEGER REFERENCES distributions(id),
  ngo_id VARCHAR(36) REFERENCES ngos(id),
  project_title VARCHAR(255),
  project_description TEXT,
  impact_description VARCHAR(255),
  image_url VARCHAR(512),
  qr_code_url VARCHAR(512),
  share_url VARCHAR(512),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Governance Proposals
CREATE TABLE governance_proposals (
  id SERIAL PRIMARY KEY,
  proposal_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  proposer_address VARCHAR(34) REFERENCES donors(address),
  data JSONB, -- Proposal-specific data
  status VARCHAR(20) DEFAULT 'active',
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  quorum_required NUMERIC(3, 2),
  majority_required NUMERIC(3, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  voting_ends_at TIMESTAMP,
  execution_at TIMESTAMP
);

-- Votes
CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  proposal_id INTEGER REFERENCES governance_proposals(id),
  voter_address VARCHAR(34) REFERENCES donors(address),
  vote_power INTEGER NOT NULL,
  vote_choice BOOLEAN NOT NULL, -- true = for, false = against
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(proposal_id, voter_address)
);

-- Trading History
CREATE TABLE trading_history (
  id SERIAL PRIMARY KEY,
  action VARCHAR(10), -- BUY, SELL, HOLD
  amount NUMERIC(20, 6),
  entry_price NUMERIC(20, 6),
  exit_price NUMERIC(20, 6),
  profit_loss NUMERIC(20, 6),
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Redis Cache Structure

```
# Pool state
pool:state -> { totalBalance, totalDonations, ... }

# Donor cache (1 hour TTL)
donor:{address} -> { ...donorInfo }

# NGO cache (24 hour TTL)
ngo:{id} -> { ...ngoInfo }

# Impact Oracle cache (24 hour TTL)
oracle:validation:{ngoId} -> { ...validationResult }

# Leaderboard (sorted set)
leaderboard:donations -> { address: totalDonated }
leaderboard:xp -> { address: xp }

# Recent donations feed (list, max 100 items)
feed:donations -> [{ donation1 }, { donation2 }, ...]

# Rate limiting
ratelimit:{ip}:{endpoint} -> requestCount (1 min TTL)
```

## API Endpoints

### Public Endpoints

```
GET  /api/pool/stats
GET  /api/donations/recent
GET  /api/ngos
GET  /api/ngos/:id
GET  /api/leaderboard
GET  /api/stories
GET  /api/stories/:id
```

### Authenticated Endpoints

```
POST /api/auth/connect (wallet signature)
GET  /api/donor/me
GET  /api/donor/nft
POST /api/donate
POST /api/governance/proposals
POST /api/governance/vote
```

### Admin Endpoints

```
POST /api/admin/ngos
PUT  /api/admin/ngos/:id
POST /api/admin/ngos/:id/validate
POST /api/admin/trading/pause
POST /api/admin/trading/resume
```

## Security Considerations

### Smart Contract Security
- Multi-sig wallet for pool funds (3-of-5)
- Time-locked upgrades (48 hours)
- Circuit breaker for emergencies
- Regular audits (quarterly)

### API Security
- JWT authentication
- Rate limiting (100 req/min per IP)
- Input validation (Zod schemas)
- CORS whitelist
- HTTPS only

### Data Security
- Encrypted database backups
- No private keys stored on servers
- Regular penetration testing
- Bug bounty program

## Monitoring & Logging

### Metrics to Track
- Pool balance (real-time)
- Trading performance (daily)
- API response times (real-time)
- Error rates (real-time)
- NGO distribution amounts (daily)
- User engagement (daily)

### Logging Strategy
```typescript
// Winston logger setup
logger.info('Donation received', {
  amount,
  donor,
  txHash,
  timestamp
})

logger.error('Trading execution failed', {
  error,
  signal,
  timestamp
})
```

### Alerts
- Pool balance < 10% threshold
- Trading loss > 5% daily
- API downtime > 1 minute
- Abnormal transaction patterns
- Smart contract errors

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│           Load Balancer (Nginx)         │
└────────────┬────────────────────────────┘
             │
    ┌────────┴────────┐
    ▼                 ▼
┌────────┐        ┌────────┐
│ API    │        │ API    │
│ Server │        │ Server │
│ (PM2)  │        │ (PM2)  │
└────┬───┘        └───┬────┘
     │                │
     └────────┬───────┘
              ▼
      ┌──────────────┐
      │  PostgreSQL  │
      │  (Primary)   │
      └──────┬───────┘
             │
      ┌──────▼───────┐
      │  PostgreSQL  │
      │  (Replica)   │
      └──────────────┘
```

### Infrastructure
- **Hosting**: AWS (EC2 + RDS)
- **CDN**: CloudFront
- **Storage**: S3 (images, backups)
- **Monitoring**: CloudWatch + Sentry
- **CI/CD**: GitHub Actions

## Future Enhancements

1. **Advanced RL Trading Algorithm**
2. **Mobile Apps** (iOS/Android)
3. **Multi-chain Support** (Ethereum, Solana)
4. **DAO Transition** (full decentralization)
5. **Impact Verification** (IoT sensors, satellite data)
6. **Corporate API** (ESG reporting integration)

---

**Last Updated**: 2025-11-29

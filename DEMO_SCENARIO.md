# XRPL Impact Fund - Clean Demo Scenario

## Overview

This document provides step-by-step instructions for running a complete demo of the XRPL Impact Fund platform, showcasing the full cycle:

1. User donates XRP
2. AI generates trading profit
3. Profit gets redistributed to NGOs
4. NFT evolves with donor level
5. Dashboard updates in real-time

---

## Prerequisites

Before running the demo, ensure you have:

- Docker and Docker Compose installed
- Node.js 20+ (for local development)
- Git (to clone the repository)
- Web browser (Chrome, Firefox, or Edge recommended)
- Terminal/Command prompt

---

## Quick Start (Docker)

### Option 1: Docker Compose (Recommended for Demo)

```bash
# 1. Clone the repository (if not already done)
git clone <repository-url>
cd XRPact\ Hack\ For\ Good

# 2. Copy environment file
cp .env.example .env

# 3. Start all services
docker-compose up -d

# 4. Wait for services to be ready (30-40 seconds)
docker-compose logs -f backend

# 5. Verify services are running
curl http://localhost:3000/api/xrpl/health

# 6. Open frontend in browser
# Navigate to: http://localhost:5173
```

### Option 2: Local Development

```bash
# Terminal 1: Start Backend
cd backend
npm install
npm run dev

# Terminal 2: Start Frontend
cd frontend
npm install
npm run dev

# Frontend will be available at: http://localhost:5173
# Backend API at: http://localhost:3000
```

---

## Demo Scenario: Complete Impact Fund Cycle

### Phase 1: Initial Setup & Verification

#### Step 1.1: Verify System Health

```bash
# Check backend health
curl http://localhost:3000/api/xrpl/health

# Expected Response:
{
  "status": "healthy",
  "mode": "MOCK",
  "services": {
    "xrpl": true,
    "database": true,
    "redis": true,
    "aiTrading": true
  },
  "poolInfo": {
    "balance": 0,
    "donorCount": 0,
    "ngoCount": 5
  },
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

#### Step 1.2: Verify NGO Seeding

```bash
# List all NGOs
curl http://localhost:3000/api/xrpl/ngos

# Should return 5 NGOs:
# 1. Global Climate Action Fund (climate)
# 2. World Health Initiative (health)
# 3. Education for All Foundation (education)
# 4. Clean Water Project (water)
# 5. Humanitarian Relief Network (other)
```

#### Step 1.3: Open Frontend Dashboard

1. Open browser to: `http://localhost:5173`
2. Observe initial state:
   - Pool Balance: 0 XRP
   - Total Donors: 0
   - Total Distributed: 0 XRP
   - NGO cards displayed with 0 received
   - Empty donation feed

---

### Phase 2: User Donation

#### Step 2.1: Submit First Donation (Alice)

**Via Frontend UI:**

1. Click **"Donate Now"** button
2. Enter donor details:
   - Wallet Address: `rDemoAlice123456789ABCDEFGH`
   - Amount: `100` XRP
3. Click **"Submit Donation"**
4. Wait for confirmation (1-2 seconds)

**Via API (Alternative):**

```bash
curl -X POST http://localhost:3000/api/xrpl/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "donorAddress": "rDemoAlice123456789ABCDEFGH",
    "amount": 100
  }'
```

#### Step 2.2: Verify Donation Results

**Frontend Updates:**
- Pool Balance: **0 → 100 XRP**
- Total Donors: **0 → 1**
- Donation feed shows new entry: "Alice donated 100 XRP"
- Alice's donor card appears:
  - Level: **4** (floor(sqrt(1000/100)) + 1)
  - XP: **1000** (100 XRP × 10)
  - NFT Badge: **Bronze Tier** displayed

**API Response:**
```json
{
  "donor": {
    "address": "rDemoAlice123456789ABCDEFGH",
    "totalDonated": 100,
    "xp": 1000,
    "level": 4,
    "nftTokenId": "MOCK_NFT_L4_1705315200000_ABCDEFGH_A1B2C3",
    "ditTokenId": "MOCK_DIT_1705315200000_ABCDEFGH_D4E5F6",
    "donationCount": 1
  },
  "nft": {
    "success": true,
    "tokenId": "MOCK_NFT_L4_...",
    "metadata": {
      "level": 4,
      "xp": 1000,
      "tier": "Bronze",
      "evolution": 0
    }
  },
  "poolState": {
    "totalBalance": 100,
    "totalDonations": 100,
    "donorCount": 1
  }
}
```

#### Step 2.3: Submit Second Donation (Bob)

```bash
curl -X POST http://localhost:3000/api/xrpl/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "donorAddress": "rDemoBob9876543210ZYXWVUTSR",
    "amount": 50
  }'
```

**Frontend Updates:**
- Pool Balance: **100 → 150 XRP**
- Total Donors: **1 → 2**
- Bob appears on leaderboard:
  - Level: 3
  - XP: 500
  - NFT: Bronze Tier

#### Step 2.4: Submit Third Donation (Carol - Large Donor)

```bash
curl -X POST http://localhost:3000/api/xrpl/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "donorAddress": "rDemoCarol555666777PQRSTU",
    "amount": 250
  }'
```

**Frontend Updates:**
- Pool Balance: **150 → 400 XRP**
- Total Donors: **2 → 3**
- Carol appears at top of leaderboard:
  - Level: 6
  - XP: 2500
  - NFT: Silver Tier (level 5+ = Silver)

---

### Phase 3: AI Trading Simulation

#### Step 3.1: Trigger AI Profit Generation

**Via Frontend:**
1. Click **"Simulate Trading"** button (admin panel)
2. Or use default auto-profit setting

**Via API:**
```bash
curl -X POST http://localhost:3000/api/xrpl/simulate-profit \
  -H "Content-Type: application/json" \
  -d '{
    "profitPercentage": 0.67
  }'
```

#### Step 3.2: Observe AI Trading Process

**Backend Processing:**
1. Generates 200 candles of mock market data
2. Calculates technical indicators:
   - SMA 50: ~0.52
   - SMA 200: ~0.50
   - RSI 14: ~58
3. Generates trading signal: **BUY** (confidence: 72%)
4. Calculates profit: `400 XRP × 0.67% = 2.68 XRP`
5. Updates pool balance: **400 → 402.68 XRP**

**API Response:**
```json
{
  "profitAmount": 2.68,
  "profitPercentage": 0.67,
  "newBalance": 402.68,
  "signal": "BUY",
  "confidence": 0.72,
  "tradingMetrics": {
    "totalTrades": 1,
    "profitableTrades": 1,
    "totalProfit": 2.68,
    "roi": 0.67,
    "sharpeRatio": 1.85,
    "maxDrawdown": 0
  }
}
```

**Frontend Updates:**
- Pool Balance: **400 → 402.68 XRP** (animated)
- Trading Signal Widget shows:
  - Signal: **BUY** (green indicator)
  - Confidence: **72%**
  - Profit: **+2.68 XRP (+0.67%)**
- Pool growth chart updates with new data point

#### Step 3.3: Simulate Multiple Trading Cycles (Optional)

```bash
# Simulate 5 trading days
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/xrpl/simulate-profit
  sleep 2
done

# Pool balance should grow ~0.5-2% per cycle
# Final balance: ~410-420 XRP (from 400 XRP)
```

---

### Phase 4: Profit Redistribution to NGOs

#### Step 4.1: Trigger Distribution

**Via Frontend:**
1. Click **"Distribute Profits"** button
2. Confirm distribution amount: 2.68 XRP

**Via API:**
```bash
curl -X POST http://localhost:3000/api/xrpl/distribute \
  -H "Content-Type: application/json" \
  -d '{
    "profitAmount": 2.68
  }'
```

#### Step 4.2: Observe Distribution Process

**Backend Processing:**

NGO distribution based on weights (example with 2.68 XRP profit):

| NGO | Category | Weight | Amount | TX Hash |
|-----|----------|--------|--------|---------|
| Global Climate Action Fund | Climate | 20% | 0.536 XRP | MOCK_TX_DIST_... |
| World Health Initiative | Health | 25% | 0.670 XRP | MOCK_TX_DIST_... |
| Education for All | Education | 30% | 0.804 XRP | MOCK_TX_DIST_... |
| Clean Water Project | Water | 15% | 0.402 XRP | MOCK_TX_DIST_... |
| Humanitarian Relief | Other | 10% | 0.268 XRP | MOCK_TX_DIST_... |

**API Response:**
```json
{
  "distributions": [
    {
      "id": "dist_1",
      "ngoId": "ngo_1",
      "ngoName": "Global Climate Action Fund",
      "amount": 0.536,
      "txHash": "MOCK_TX_DIST_1705315300000_ABC123",
      "timestamp": "2024-01-15T10:15:00.000Z"
    },
    // ... 4 more distributions
  ],
  "totalDistributed": 2.68,
  "newPoolBalance": 400,
  "transactionCount": 5
}
```

**Frontend Updates:**
- Pool Balance: **402.68 → 400 XRP** (profit distributed)
- Total Distributed: **0 → 2.68 XRP**
- Distribution Feed shows 5 new entries:
  - "0.536 XRP → Global Climate Action Fund"
  - "0.670 XRP → World Health Initiative"
  - etc.
- NGO Cards update `totalReceived`:
  - Climate: 0 → 0.536 XRP
  - Health: 0 → 0.670 XRP
  - etc.
- Distribution pie chart updates with new data

#### Step 4.3: Verify NGO Balances

```bash
# Check all NGOs
curl http://localhost:3000/api/xrpl/ngos

# Each NGO should show updated totalReceived field
```

---

### Phase 5: NFT Evolution

#### Step 5.1: Alice Donates Again to Trigger Evolution

```bash
curl -X POST http://localhost:3000/api/xrpl/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "donorAddress": "rDemoAlice123456789ABCDEFGH",
    "amount": 150
  }'
```

**Alice's Stats Update:**
- Total Donated: 100 → 250 XRP
- XP: 1000 → 2500
- Level: 4 → 5 (triggers evolution!)
- NFT Tier: Bronze → **Silver**

**API Response:**
```json
{
  "donor": {
    "address": "rDemoAlice123456789ABCDEFGH",
    "totalDonated": 250,
    "xp": 2500,
    "level": 5,
    "nftTokenId": "MOCK_NFT_L5_1705315400000_ABCDEFGH_X9Y8Z7",
    "donationCount": 2
  },
  "nft": {
    "success": true,
    "evolved": true,
    "previousTier": "Bronze",
    "newTier": "Silver",
    "metadata": {
      "level": 5,
      "xp": 2500,
      "tier": "Silver",
      "evolution": 1
    }
  }
}
```

**Frontend Updates:**
- Alice's card shows **level up animation**
- NFT badge evolves: Bronze → Silver (visual animation)
- Notification appears: "Congratulations! Your Impact NFT evolved to Silver tier!"
- Leaderboard position updates (Alice overtakes Bob)

#### Step 5.2: Demonstrate Higher Tier Evolution

```bash
# Carol donates to reach Gold tier (level 10)
curl -X POST http://localhost:3000/api/xrpl/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "donorAddress": "rDemoCarol555666777PQRSTU",
    "amount": 750
  }'

# Carol's new stats:
# - Total: 1000 XRP
# - XP: 10000
# - Level: 10 (triggers Gold tier!)
# - NFT: Silver → Gold
```

---

### Phase 6: Dashboard Real-Time Updates

#### Step 6.1: Verify Auto-Refresh

**Observation:**
1. Dashboard auto-refreshes every 5 seconds
2. Pool balance updates automatically
3. Donation feed scrolls with new entries
4. Leaderboard sorts dynamically
5. Charts animate on data changes

**Test Auto-Refresh:**
```bash
# In another terminal, submit donations rapidly
for i in {1..3}; do
  curl -X POST http://localhost:3000/api/xrpl/deposit \
    -H "Content-Type: application/json" \
    -d "{\"donorAddress\": \"rDonor$i\", \"amount\": $((10 + RANDOM % 90))}"
  sleep 2
done

# Watch frontend dashboard update automatically
```

#### Step 6.2: Explore Dashboard Features

**Pool Overview:**
- Real-time balance ticker
- Total donations counter
- Donor count
- Distribution history

**Charts & Visualizations:**
1. **Pool Growth Chart** (Line graph)
   - X-axis: Time
   - Y-axis: Balance in XRP
   - Shows donations and trading profits

2. **NGO Distribution** (Pie chart)
   - Breakdown by category
   - Percentage and XRP amounts
   - Interactive tooltips

3. **Trading Performance** (Area chart)
   - Profit/loss over time
   - ROI percentage
   - Sharpe ratio indicator

4. **Impact Metrics** (Gauge charts)
   - Lives impacted (estimated)
   - CO2 offset
   - Education reach
   - Water access

**Leaderboard:**
- Top 10 donors by XP
- Shows level, tier, total donated
- Updates in real-time
- Click donor to see profile

**NFT Gallery:**
- Grid of donor NFTs
- Filtering by tier
- Evolution timeline
- Rarity indicators

---

### Phase 7: Governance & Voting (Advanced)

#### Step 7.1: View Governance Panel

**Via Frontend:**
1. Navigate to "Governance" tab
2. View active proposals
3. See voting power based on DIT tokens

#### Step 7.2: Create a Proposal (Optional)

```bash
# Example: Propose adding a new NGO
curl -X POST http://localhost:3000/api/governance/proposals \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Add Ocean Cleanup Initiative",
    "description": "Proposal to add ocean cleanup NGO to distribution list",
    "type": "add_ngo",
    "proposer": "rDemoAlice123456789ABCDEFGH",
    "options": ["Yes", "No"],
    "votingDuration": 7
  }'
```

#### Step 7.3: Cast Votes

Alice votes (has 250 XRP donated = high voting power):
```bash
curl -X POST http://localhost:3000/api/governance/vote \
  -H "Content-Type: application/json" \
  -d '{
    "proposalId": "prop_1",
    "voterAddress": "rDemoAlice123456789ABCDEFGH",
    "option": "Yes"
  }'
```

---

## Demo Validation Checklist

Use this checklist to ensure all features work correctly during the demo:

### Core Functionality
- [ ] Backend health endpoint returns healthy status
- [ ] 5 NGOs are seeded on startup
- [ ] Frontend loads without errors
- [ ] Pool starts at 0 XRP balance

### Donation Flow
- [ ] Donation form accepts valid input
- [ ] Donation submits successfully (1-2 second delay)
- [ ] Pool balance increases correctly
- [ ] Donor XP calculated: 1 XRP = 10 XP
- [ ] Donor level calculated: floor(sqrt(XP/100)) + 1
- [ ] NFT minted on first donation
- [ ] DIT token minted on first donation

### AI Trading
- [ ] Simulate profit button works
- [ ] Trading signal generated (BUY/SELL/HOLD)
- [ ] Profit calculated correctly (0.1-2% of pool)
- [ ] Pool balance increases by profit amount
- [ ] Trading metrics displayed

### Profit Distribution
- [ ] Distribute button works
- [ ] 5 transactions created (one per NGO)
- [ ] Amounts distributed based on weights (sum to 100%)
- [ ] Pool balance decreases by distributed amount
- [ ] NGO totalReceived values update
- [ ] Distribution feed shows new entries

### NFT Evolution
- [ ] Level up detection works
- [ ] NFT evolves on level thresholds:
  - Level 1-4: Bronze
  - Level 5-9: Silver
  - Level 10-19: Gold
  - Level 20-49: Platinum
  - Level 50+: Diamond
- [ ] Evolution animation displays
- [ ] Notification shows tier upgrade

### Dashboard Updates
- [ ] Auto-refresh every 5 seconds
- [ ] Pool balance updates in real-time
- [ ] Donation feed scrolls
- [ ] Leaderboard sorts by XP
- [ ] Charts render correctly
- [ ] NGO cards show updated data

### Error Handling
- [ ] Invalid donation amount rejected
- [ ] Invalid address format rejected
- [ ] Zero/negative amounts rejected
- [ ] Network errors show user-friendly messages

---

## Demo Script for Presentation

### Introduction (2 minutes)

"Welcome to the XRPL Impact Fund demo. This platform combines blockchain technology, AI trading, and social impact to create a sustainable donation ecosystem."

### Demo Flow (8 minutes)

**1. Show Initial State (30 seconds)**
- "Here's our dashboard. Pool starts at 0 XRP with 5 verified NGOs ready to receive funds."

**2. Submit Donation (1 minute)**
- "Alice donates 100 XRP. Watch as she instantly earns 1000 XP and levels up to level 4."
- "She receives a Bronze tier Impact NFT as proof of her contribution."
- "The pool balance is now 100 XRP."

**3. AI Trading (1.5 minutes)**
- "Our AI trading algorithm uses MA crossover and RSI indicators to grow the pool."
- "Let's simulate a trading cycle... The AI generates a BUY signal with 72% confidence."
- "The pool grows by 0.67% - that's 2.68 XRP in profit."

**4. Profit Distribution (1.5 minutes)**
- "Now we distribute that profit to our 5 verified NGOs."
- "Each NGO receives funds based on their impact score and category weight."
- "Climate gets 20%, Health gets 25%, Education 30%, Water 15%, Other 10%."
- "All transactions are recorded on the XRPL ledger."

**5. NFT Evolution (1 minute)**
- "Alice donates again - 150 XRP this time."
- "Her XP jumps to 2500, pushing her to level 5."
- "Watch her NFT evolve from Bronze to Silver tier!"

**6. Real-Time Updates (1 minute)**
- "The dashboard updates every 5 seconds automatically."
- "Charts show pool growth, distributions, and trading performance."
- "The leaderboard tracks top donors and encourages friendly competition."

**7. Governance (1 minute)**
- "Donors receive DIT tokens for governance rights."
- "They can vote on which NGOs to support and platform parameters."
- "This creates a truly community-driven impact fund."

**8. Wrap-up (30 seconds)**
- "That's the complete cycle: Donate → AI Grows → Redistribute → Evolve → Repeat."
- "All powered by XRPL's fast, low-cost transactions."

---

## Troubleshooting

### Backend Not Starting

**Symptom:** Backend container crashes or exits

**Solutions:**
```bash
# Check logs
docker-compose logs backend

# Verify environment variables
cat .env | grep XRPL_NETWORK

# Should be: XRPL_NETWORK=mock

# Restart services
docker-compose down
docker-compose up -d
```

### Frontend Can't Connect to Backend

**Symptom:** "Network Error" in browser console

**Solutions:**
```bash
# Check CORS settings in .env
CORS_ORIGIN=http://localhost:5173

# Verify backend is running
curl http://localhost:3000/api/xrpl/health

# Check frontend environment
# In frontend/.env:
VITE_API_URL=http://localhost:3000
```

### NGOs Not Seeded

**Symptom:** GET /api/xrpl/ngos returns empty array

**Solutions:**
```bash
# Check auto-seed setting
AUTO_SEED_NGOS=true

# Restart backend to trigger seeding
docker-compose restart backend

# Manually seed via API
curl -X POST http://localhost:3000/api/admin/seed-ngos
```

### Donations Not Processing

**Symptom:** POST /api/xrpl/deposit returns error

**Solutions:**
```bash
# Verify request format
curl -X POST http://localhost:3000/api/xrpl/deposit \
  -H "Content-Type: application/json" \
  -d '{"donorAddress": "rTest123", "amount": 100}'

# Check XRPL_NETWORK is set to mock
# In .env: XRPL_NETWORK=mock

# Check backend logs
docker-compose logs -f backend
```

### Dashboard Not Updating

**Symptom:** Frontend shows stale data

**Solutions:**
```bash
# Hard refresh browser: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

# Check auto-refresh setting
# In frontend/.env:
VITE_REFRESH_INTERVAL=5000

# Clear browser cache
# Open DevTools → Application → Clear Storage → Clear site data
```

---

## Next Steps

After completing this demo:

1. **Explore Advanced Features:**
   - NGO validation with Impact Oracle
   - Climate mode impact tracking
   - Detailed analytics dashboard

2. **Test Edge Cases:**
   - Multiple simultaneous donations
   - Large donation amounts
   - Rapid trading simulations

3. **Customize Configuration:**
   - Adjust AI trading parameters
   - Modify NGO distribution weights
   - Change XP/level calculations

4. **Deploy to Testnet:**
   - Set `XRPL_NETWORK=testnet` in .env
   - Generate real testnet wallets
   - Test with actual XRPL transactions

5. **Prepare for Production:**
   - Review security settings
   - Set up monitoring (Sentry)
   - Configure database backups
   - Implement rate limiting

---

## Support

For issues or questions:

- **Documentation:** See [INTEGRATION_PLAN.md](INTEGRATION_PLAN.md)
- **API Reference:** See [TEST_XRPL_ENDPOINTS.md](TEST_XRPL_ENDPOINTS.md)
- **Architecture:** See [ARCHITECTURE.md](ARCHITECTURE.md)
- **Hackathon Status:** See [HACKATHON_READY.md](HACKATHON_READY.md)

---

## Summary

This demo showcases the complete XRPL Impact Fund ecosystem:

✅ **Seamless Donations** - Easy XRP contributions with instant XP and NFT rewards
✅ **AI Trading** - Automated profit generation using MA/RSI strategy
✅ **Fair Distribution** - Weighted redistribution to verified NGOs
✅ **NFT Evolution** - Gamified donor journey with tier upgrades
✅ **Real-Time Dashboard** - Live updates and comprehensive analytics
✅ **Community Governance** - DIT token voting on platform decisions
✅ **Impact Transparency** - Every transaction tracked on XRPL ledger

**The result:** A sustainable, transparent, and engaging platform that multiplies the impact of every donation through AI-powered trading and community-driven governance.

# XRPL Impact Fund - Quick Start Guide

## 🚀 Get Running in 5 Minutes

This guide gets you from zero to a working demo in minutes.

---

## Prerequisites

- **Docker Desktop** installed and running
- **Git** (to clone if needed)
- **Web Browser** (Chrome/Firefox/Edge)

---

## Option 1: Docker (Fastest - Recommended)

### 1. Setup Environment

```bash
# Navigate to project directory
cd "XRPact Hack For Good"

# Copy environment file
cp .env.example .env

# (Optional) Edit .env if needed - defaults work for demo
```

### 2. Start All Services

```bash
# Start everything with one command
docker-compose up -d

# This starts:
# - PostgreSQL (port 5433)
# - Redis (port 6379)
# - Backend API (port 3000)
# - Frontend (port 5173)
```

### 3. Wait for Services (30-40 seconds)

```bash
# Watch backend startup
docker-compose logs -f backend

# Wait for: "Server running on port 3000"
# Press Ctrl+C to stop watching logs
```

### 4. Verify Everything Works

```bash
# Check health
curl http://localhost:3000/api/xrpl/health

# Should return: {"status": "healthy", "mode": "MOCK", ...}
```

### 5. Open Dashboard

Open browser to: **http://localhost:5173**

You should see:
- Pool Balance: 0 XRP
- 5 NGOs listed
- Empty donation feed
- "Donate Now" button

---

## Option 2: Local Development

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

### 2. Setup Environment

```bash
# In project root
cp .env.example .env
```

### 3. Start Services

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 4. Access Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **API Health:** http://localhost:3000/api/xrpl/health

---

## Quick Demo Test

### Test 1: Submit a Donation

```bash
curl -X POST http://localhost:3000/api/xrpl/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "donorAddress": "rDemoAlice123456789ABCDEFGH",
    "amount": 100
  }'
```

**Expected:**
- Pool balance increases to 100 XRP
- Alice gets 1000 XP and level 4
- Bronze NFT minted

### Test 2: Simulate AI Trading

```bash
curl -X POST http://localhost:3000/api/xrpl/simulate-profit \
  -H "Content-Type: application/json" \
  -d '{"profitPercentage": 0.67}'
```

**Expected:**
- Pool grows by ~0.67 XRP
- Trading signal returned (BUY/SELL/HOLD)

### Test 3: Distribute Profits

```bash
curl -X POST http://localhost:3000/api/xrpl/distribute \
  -H "Content-Type: application/json" \
  -d '{"profitAmount": 0.67}'
```

**Expected:**
- 5 distributions to NGOs
- Pool returns to 100 XRP
- NGO balances updated

---

## Dashboard Features

### Main Dashboard (http://localhost:5173)

**Pool Overview Panel:**
- Real-time balance
- Total donations
- Donor count
- Distribution stats

**Donate Section:**
- Enter wallet address
- Choose amount
- Submit donation
- See instant XP/level update

**NGO Directory:**
- 5 pre-seeded NGOs
- Impact scores
- Distribution weights
- Total received

**Leaderboard:**
- Top donors by XP
- Level badges
- NFT tiers
- Total contributed

**Charts:**
- Pool growth timeline
- Distribution breakdown
- Trading performance
- Impact metrics

---

## Configuration

### Environment Variables (.env)

**Key Settings:**

```bash
# Network Mode
XRPL_NETWORK=mock          # Use 'mock' for demo (no blockchain needed)

# Auto-seed Data
AUTO_SEED_NGOS=true        # Creates 5 NGOs on startup
DEMO_MODE=true             # Enables demo features

# Trading
AI_TRADING_ENABLED=true    # Enable AI trading simulation
AI_RISK_TOLERANCE=conservative

# Frontend
VITE_API_URL=http://localhost:3000
VITE_REFRESH_INTERVAL=5000  # Dashboard auto-refresh (ms)
```

### Database

**Note:** Database is optional for demo. By default, the system uses in-memory storage.

To enable persistent database:
```bash
DATABASE_ENABLED=true
```

---

## API Endpoints

### Core Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/xrpl/health` | GET | System health check |
| `/api/xrpl/pool` | GET | Pool state |
| `/api/xrpl/deposit` | POST | Submit donation |
| `/api/xrpl/simulate-profit` | POST | AI trading simulation |
| `/api/xrpl/distribute` | POST | Distribute profits |
| `/api/xrpl/ngos` | GET | List NGOs |
| `/api/xrpl/donor/:address` | GET | Donor profile |

**Full API Documentation:** See [TEST_XRPL_ENDPOINTS.md](TEST_XRPL_ENDPOINTS.md)

---

## Common Issues

### Docker: Services Not Starting

```bash
# Check Docker is running
docker --version

# View all container logs
docker-compose logs

# Restart everything
docker-compose down
docker-compose up -d
```

### Port Already in Use

```bash
# If port 3000 is busy:
# Edit .env:
PORT=3001

# Then update docker-compose.yml ports section
```

### Frontend Can't Reach Backend

```bash
# Check backend is running:
curl http://localhost:3000/api/xrpl/health

# Check CORS in .env:
CORS_ORIGIN=http://localhost:5173

# Restart backend:
docker-compose restart backend
```

### NGOs Not Showing

```bash
# Verify auto-seed is enabled in .env:
AUTO_SEED_NGOS=true

# Restart backend:
docker-compose restart backend

# Check NGOs:
curl http://localhost:3000/api/xrpl/ngos
```

---

## Stopping Services

### Docker

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v
```

### Local Development

```bash
# Press Ctrl+C in each terminal running npm
```

---

## Next Steps

1. **Run Full Demo:** See [DEMO_SCENARIO.md](DEMO_SCENARIO.md)
2. **Understand Architecture:** See [INTEGRATION_PLAN.md](INTEGRATION_PLAN.md)
3. **Review Code:** Start with [backend/src/index.ts](backend/src/index.ts)
4. **Customize:** Edit NGOs, weights, XP calculations
5. **Deploy to Testnet:** Change `XRPL_NETWORK=testnet`

---

## Project Structure

```
XRPact Hack For Good/
├── backend/                 # Express API
│   ├── src/
│   │   ├── modules/xrpl/   # XRPL integration
│   │   ├── services/       # Business logic
│   │   └── index.ts        # Entry point
│   └── Dockerfile
├── frontend/               # React app
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── store/         # State management
│   │   └── services/      # API client
│   └── Dockerfile
├── shared-types.ts        # Unified types
├── docker-compose.yml     # Multi-service setup
├── .env.example          # Configuration template
└── DEMO_SCENARIO.md      # Full demo guide
```

---

## Support & Documentation

- **Quick Start:** You are here
- **Full Demo:** [DEMO_SCENARIO.md](DEMO_SCENARIO.md)
- **Integration Plan:** [INTEGRATION_PLAN.md](INTEGRATION_PLAN.md)
- **API Tests:** [TEST_XRPL_ENDPOINTS.md](TEST_XRPL_ENDPOINTS.md)
- **Architecture:** [ARCHITECTURE.md](ARCHITECTURE.md)

---

## Technology Stack

**Backend:**
- Node.js 20 + TypeScript
- Express.js
- xrpl.js v3.0
- PostgreSQL 15 (optional)
- Redis 7 (optional)

**Frontend:**
- React 18 + TypeScript
- Vite
- TailwindCSS
- Zustand (state)
- Recharts (visualizations)

**Infrastructure:**
- Docker + Docker Compose
- XRPL Testnet/Mock

---

## Success Checklist

After quick start, you should have:

- ✅ Backend running on port 3000
- ✅ Frontend accessible at http://localhost:5173
- ✅ Health endpoint returns "healthy"
- ✅ 5 NGOs visible in frontend
- ✅ Can submit donation via UI or API
- ✅ Pool balance updates correctly
- ✅ AI trading simulation works
- ✅ Profit distribution functions
- ✅ Dashboard auto-refreshes

---

**Ready to go deeper?** Continue to [DEMO_SCENARIO.md](DEMO_SCENARIO.md) for the complete walkthrough.

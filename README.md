# 🌍 XRPL Impact Fund

**A perpetual humanitarian funding platform built on XRPL Testnet**

Turn your XRP donation into a sustainable engine for good. Your principal generates yield through XRPL AMM pools, and 100% of profits fund verified humanitarian projects with complete on-chain transparency.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Git
- GemWallet browser extension (for donations)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd "XRPact Hack For Good"

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the Application

**Start Backend (Terminal 1):**
```bash
cd backend
npm run dev
```
Backend runs on: `http://localhost:3000`

**Start Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:5173`

---

## 💡 Key Features

✅ **Real XRPL Integration** - Live Testnet, Real NFTs, Verified Transactions  
✅ **GemWallet Support** - Connect wallet, Make donations, Track impact  
✅ **Smart Fund Management** - Perpetual pool, AMM yield, 100% profit distribution  
✅ **Complete Transparency** - On-chain data, Real-time tracking, Immutable records  

---

## 🎯 How It Works

1. **Donate XRP** → Your donation enters the perpetual pool
2. **Generate Yield** → Pool participates in XRPL AMM to earn profits
3. **Fund Projects** → 100% of profits go to verified humanitarian projects
4. **Track Impact** → Receive non-transferable SBT showing your lifetime impact
5. **Governance** → Vote on project selection based on your contribution level

---

## 📊 Current Pool State (Live from XRPL Testnet)

All data is real-time from blockchain:
- Pool Balance
- Total Donors  
- Profits Generated
- Projects Funded
- Live Transactions

---

## 🔑 API Endpoints

### Pool Management
- `GET /api/xrpl/pool` - Get pool state
- `POST /api/xrpl/deposit` - Make donation
- `POST /api/xrpl/simulate-profit` - Simulate AMM yield

### Projects
- `GET /api/xrpl/projects` - List all projects
- `POST /api/xrpl/projects` - Create new project

### SBTs (Soulbound Tokens)
- `POST /api/xrpl/sbt/mint` - Mint impact SBT
- `GET /api/xrpl/sbt/:tokenId` - Read SBT metadata

### Transactions
- `GET /api/xrpl/transactions` - Get recent XRPL transactions

---

## 🧪 Testing

### Add Test Donation
```bash
curl -X POST http://localhost:3000/api/xrpl/deposit \
  -H "Content-Type: application/json" \
  -d '{"donorAddress":"rTestWallet123", "amount":1000}'
```

### Simulate Yield
```bash
curl -X POST http://localhost:3000/api/xrpl/simulate-profit \
  -H "Content-Type: application/json" \
  -d '{"profitPercentage":0.67}'
```

---

## 🌐 Environment Variables

Create `.env` in `/backend`:

```env
XRPL_POOL_WALLET_SEED=sXXXXXXXXXXXXXX
XRPL_POOL_WALLET_ADDRESS=rXXXXXXXXXXXXXX
PORT=3000
NODE_ENV=development
```

---

## 🏗️ Tech Stack

**Backend:** TypeScript, Express.js, XRPL.js, Socket.io  
**Frontend:** React 18, TypeScript, Tailwind CSS, Framer Motion, @gemwallet/api  

---

## 📝 Project Structure

```
├── backend/
│   └── src/modules/xrpl/
│       ├── controllers/
│       ├── services/
│       └── xrpl.routes.ts
├── frontend/
│   └── src/
│       ├── components/
│       ├── hooks/
│       └── lib/
└── README.md
```

---

**Built with ❤️ for humanitarian impact on XRPL**

# Soulbound Token (SBT) - Implementation Guide

## Overview

Soulbound Token (SBT) is a non-transferable NFT on XRPL that represents a donor's impact.
- **Non-transferable** (immutable ownership)
- **On-chain** (stored as XRPL NFToken)
- **Grows with donations** (metadata updates with each donation/redistribution)
- **Governance enabled** (voting power based on participation)

## Endpoints

### 1. Mint SBT
**POST** `/api/xrpl/sbt/mint`

**Request:**
```json
{
  "donorAddress": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  "totalDonated": 5000,
  "ngosSupported": ["ngo-001", "ngo-002"],
  "level": 2
}
```

**Response:**
```json
{
  "success": true,
  "nftTokenId": "000000000000000000000000ABCD1234",
  "txHash": "SBT_TX_1732895156789_xyz123",
  "metadata": {
    "donorAddress": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
    "totalDonated": 5000,
    "redistributionsCount": 0,
    "ngosSupported": ["ngo-001", "ngo-002"],
    "governanceVotesCount": 0,
    "mintedAt": "2025-11-29T14:11:13.725Z",
    "level": 2
  }
}
```

---

### 2. Read SBT
**GET** `/api/xrpl/sbt/:nftTokenId`

**Response:**
```json
{
  "success": true,
  "nftTokenId": "000000000000000000000000ABCD1234",
  "metadata": {
    "donorAddress": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
    "totalDonated": 5000,
    "redistributionsCount": 0,
    "ngosSupported": ["ngo-001", "ngo-002"],
    "governanceVotesCount": 5,
    "mintedAt": "2025-11-29T14:11:13.725Z",
    "level": 2
  },
  "owner": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  "transferable": false
}
```

---

### 3. Update SBT
**POST** `/api/xrpl/sbt/:nftTokenId/update`

Updates metadata when donor makes new donation or receives redistribution.

**Request:**
```json
{
  "totalDonated": 7500,
  "redistributionsCount": 1,
  "ngosSupported": ["ngo-001", "ngo-002", "ngo-003"],
  "level": 3
}
```

**Response:**
```json
{
  "success": true,
  "nftTokenId": "000000000000000000000000ABCD1234",
  "metadata": {
    "donorAddress": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
    "totalDonated": 7500,
    "redistributionsCount": 1,
    "ngosSupported": ["ngo-001", "ngo-002", "ngo-003"],
    "governanceVotesCount": 5,
    "mintedAt": "2025-11-29T14:11:13.725Z",
    "level": 3
  },
  "owner": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  "transferable": false
}
```

---

### 4. Record Governance Vote
**POST** `/api/xrpl/sbt/:nftTokenId/vote`

Increments `governanceVotesCount`. Voting power = votes × 1.5

**Response:**
```json
{
  "success": true,
  "nftTokenId": "000000000000000000000000ABCD1234",
  "metadata": {
    "donorAddress": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
    "totalDonated": 5000,
    "redistributionsCount": 0,
    "ngosSupported": ["ngo-001", "ngo-002"],
    "governanceVotesCount": 6,
    "mintedAt": "2025-11-29T14:11:13.725Z",
    "level": 2
  },
  "owner": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  "transferable": false
}
```

---

### 5. Get All SBTs for Donor
**GET** `/api/xrpl/sbt/donor/:donorAddress`

**Response:**
```json
{
  "success": true,
  "donorAddress": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  "sbts": [
    {
      "nftTokenId": "000000000000000000000000ABCD1234",
      "metadata": { ... }
    }
  ],
  "total": 1
}
```

---

### 6. List All SBTs (Admin)
**GET** `/api/xrpl/sbt/list/all`

**Response:**
```json
{
  "success": true,
  "total": 42,
  "sbts": [
    {
      "nftTokenId": "000000000000000000000000ABCD1234",
      "metadata": { ... }
    },
    ...
  ]
}
```

---

### 7. Export SBT as JSON
**GET** `/api/xrpl/sbt/:nftTokenId/export`

Downloads SBT data as JSON file.

---

## Auto-Mint Flow

When a donor makes their **first donation**:

1. **Backend** receives `POST /api/xrpl/deposit`
2. **DonationPoolService** processes donation → mints DIT (Donor Impact Token)
3. **XRPLController** triggers **auto-mint SBT**:
   - Calls `SBTService.mintSBT()`
   - Creates metadata with initial donation amount
   - Returns `sbtTokenId` in response

**Response includes:**
```json
{
  "success": true,
  "txHash": "...",
  "nftMinted": true,
  "sbtTokenId": "000000000000000000000000ABCD1234",
  "sbtTxHash": "SBT_TX_1732895156789_xyz123",
  "xpGained": 10000,
  "newLevel": 1,
  "poolBalance": 125000
}
```

---

## Frontend Usage

```tsx
import { SBTDisplay } from './components/SBTDisplay';

// Display SBT for a donor (auto-fetches if tokenId provided)
<SBTDisplay nftTokenId="000000000000000000000000ABCD1234" />

// Show mint button for donor without SBT
<SBTDisplay donorAddress="rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH" />
```

**Features:**
- ✅ Display impact metrics (total donated, redistributions, NGOs supported)
- ✅ Show governance voting power
- ✅ Cast votes (increments `governanceVotesCount`)
- ✅ Export SBT as JSON
- ✅ Real-time updates

---

## Data Schema

```typescript
interface SBTMetadata {
  donorAddress: string;           // XRPL address (immutable)
  totalDonated: number;           // XRP total
  redistributionsCount: number;   // Times profits were distributed
  ngosSupported: string[];        // NGO IDs supported
  governanceVotesCount: number;   // Votes cast
  mintedAt: Date;                 // Original mint date (immutable)
  level: number;                  // Donor level based on XP
}
```

---

## Production Checklist

- [ ] Replace MOCK mode with real XRPL NFTokenMint transactions
- [ ] Set NFToken flags:
  - `burnable = true` (donor can burn SBT)
  - `transferable = false` (soulbound)
- [ ] Add `TransferFee = 0` (no transfer allowed)
- [ ] Store metadata in NFToken URI field (compressed JSON)
- [ ] Add on-chain event logging via Hooks/Xahau
- [ ] Implement SBT upgrade logic (burn old → mint new with updated data)
- [ ] Add verification endpoint for governance votes
- [ ] Create audit trail for all SBT changes

---

## Test Commands

```bash
# Mint SBT
curl -X POST http://localhost:3000/api/xrpl/sbt/mint \
  -H "Content-Type: application/json" \
  -d '{
    "donorAddress": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
    "totalDonated": 5000,
    "level": 1
  }'

# Read SBT
curl http://localhost:3000/api/xrpl/sbt/000000000000000000000000ABCD1234

# Record vote
curl -X POST http://localhost:3000/api/xrpl/sbt/000000000000000000000000ABCD1234/vote

# List all SBTs
curl http://localhost:3000/api/xrpl/sbt/list/all
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend (React)                                             │
│ ├─ SBTDisplay component                                      │
│ └─ Mint / Vote / Export buttons                              │
└────────────┬────────────────────────────────────────────────┘
             │ HTTP
┌────────────▼────────────────────────────────────────────────┐
│ Backend (Node.js)                                            │
│ ├─ POST /api/xrpl/sbt/mint                                   │
│ ├─ GET /api/xrpl/sbt/:nftTokenId                             │
│ ├─ POST /api/xrpl/sbt/:nftTokenId/vote                       │
│ └─ SBTService (in-memory + XRPL)                             │
└────────────┬────────────────────────────────────────────────┘
             │ XRPL JSON-RPC
┌────────────▼────────────────────────────────────────────────┐
│ XRPL Ledger                                                  │
│ ├─ NFTokenMint (on TESTNET/MAINNET)                          │
│ ├─ Metadata in URI                                           │
│ └─ Non-transferable flag (immutable)                         │
└──────────────────────────────────────────────────────────────┘
```

No database needed—everything on-chain! 🚀

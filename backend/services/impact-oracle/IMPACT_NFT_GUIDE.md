# Impact NFT Module Documentation

## 🎨 Overview

The **Impact NFT Module** generates and manages evolving non-transferable NFTs on XRPL that track and visualize the impact of redistribution cycles. These NFTs automatically mint after profit distributions and their metadata evolves with each redistribution cycle.

## ✨ Features

### 1. **Automatic Minting**
- 🔄 Impact NFTs are auto-minted after each profit redistribution
- 📍 Non-blocking operation (doesn't interrupt redistribution)
- 🌍 One NFT per redistribution cycle with unique characteristics

### 2. **Tier Progression System**
NFTs evolve through 4 tiers based on total redistributed amount:

```
🥉 BRONZE    : 0-50 XRP
🥈 SILVER    : 50-200 XRP
🥇 GOLD      : 200-1000 XRP
👑 PLATINUM  : 1000+ XRP
```

### 3. **Dynamic Metadata Evolution**

Each Impact NFT contains:
- **Tier**: Current achievement level (bronze → silver → gold → platinum)
- **Impact Score**: 0-100, calculated as:
  - 70% based on redistribution amount (amount/10)
  - 30% based on number of projects supported (projectCount * 5)
- **Total Redistributed**: Cumulative XRP redistributed
- **Projects Supported**: List of NGO IDs receiving redistribution
- **Redistribution Count**: Number of distribution cycles
- **ASCII Art**: Dynamically generated visual representation with tier badge and impact score bar

### 4. **Generated Imagery**

ASCII art includes:
```
╔════════════════════════════════════╗
║  IMPACT NFT - GOLD                 ║
║  🥇 Tier: gold                     ║
╠════════════════════════════════════╣
║  Impact Score: 085/100             ║
║  [██████████████████████░░░░]      ║
╠════════════════════════════════════╣
║  🌍 Regenerative Impact Verified   ║
║  ⛓️  On-Chain Immutable Record      ║
║  💚 Donations Create Change         ║
╚════════════════════════════════════╝
```

### 5. **XRPL Compatibility**

- ✅ Mock mode for development/testing
- ✅ Production-ready for XRPL NFTokenMint
- ✅ Supports non-transferable flags (soulbound)
- ✅ On-chain metadata storage
- ✅ Export to JSON for external integrations

## 🔗 API Endpoints

### POST /api/xrpl/impact-nft/mint

**Mint a new Impact NFT after redistribution**

```bash
curl -X POST http://localhost:3000/api/xrpl/impact-nft/mint \
  -H "Content-Type: application/json" \
  -d '{
    "poolAddress": "rXRPLImpactPool",
    "redistributionAmount": 150,
    "projectIds": ["ong-climate", "ong-water", "ong-education"],
    "redistributionCount": 3
  }'
```

**Response:**
```json
{
  "success": true,
  "nftTokenId": "IMPACT_A1B2C3D4E5F6...",
  "txHash": "IMPACT_TX_1234567890",
  "metadata": {
    "nftTokenId": "IMPACT_A1B2C3D4E5F6...",
    "poolAddress": "rXRPLImpactPool",
    "tier": "silver",
    "impactScore": 65,
    "totalRedistributed": 150,
    "projectsSupported": ["ong-climate", "ong-water", "ong-education"],
    "redistributionCount": 3,
    "asciiArt": "╔════════...",
    "mintedAt": "2025-11-29T10:00:00Z",
    "lastUpdated": "2025-11-29T10:00:00Z"
  }
}
```

---

### GET /api/xrpl/impact-nft/:nftTokenId

**Read Impact NFT metadata**

```bash
curl http://localhost:3000/api/xrpl/impact-nft/IMPACT_A1B2C3D4E5F6
```

**Response:**
```json
{
  "success": true,
  "nftTokenId": "IMPACT_A1B2C3D4E5F6...",
  "metadata": { ... }
}
```

---

### POST /api/xrpl/impact-nft/:nftTokenId/update

**Update Impact NFT metadata after new redistribution**

```bash
curl -X POST http://localhost:3000/api/xrpl/impact-nft/IMPACT_A1B2C3D4E5F6/update \
  -H "Content-Type: application/json" \
  -d '{
    "redistributionAmount": 200,
    "projectIds": ["ong-climate", "ong-water", "ong-education", "ong-health"],
    "redistributionCount": 4
  }'
```

**Response:**
```json
{
  "success": true,
  "nftTokenId": "IMPACT_A1B2C3D4E5F6...",
  "metadata": {
    "tier": "gold",
    "impactScore": 75,
    "totalRedistributed": 350,
    "projectsSupported": ["ong-climate", "ong-water", "ong-education", "ong-health"],
    ...
  }
}
```

---

### GET /api/xrpl/impact-nft/list/all

**List all Impact NFTs (admin endpoint)**

```bash
curl http://localhost:3000/api/xrpl/impact-nft/list/all
```

**Response:**
```json
{
  "success": true,
  "total": 5,
  "nfts": [
    { "nftTokenId": "IMPACT_...", "tier": "silver", ... },
    { "nftTokenId": "IMPACT_...", "tier": "gold", ... }
  ]
}
```

---

### GET /api/xrpl/impact-nft/:nftTokenId/export

**Export Impact NFT as JSON file**

```bash
curl http://localhost:3000/api/xrpl/impact-nft/IMPACT_A1B2C3D4E5F6/export \
  --output impact-nft-data.json
```

Returns downloadable JSON with complete metadata.

---

## 🔄 Integration Flow

### After Profit Redistribution

```
1. distributeProfits() called
   ↓
2. Profits calculated and distributed to NGOs
   ↓
3. Impact NFT auto-mint (non-blocking)
   ├─ Collect distributed amount
   ├─ Collect project IDs
   ├─ Calculate tier
   ├─ Generate ASCII art
   └─ Store metadata
   ↓
4. Response includes impactNFT data
```

### Example Response from /api/xrpl/distribute:

```json
{
  "success": true,
  "totalAmount": 150,
  "ngoCount": 3,
  "distributions": [...],
  "impactNFT": {
    "nftTokenId": "IMPACT_A1B2C3D4E5F6",
    "tier": "silver",
    "impactScore": 65
  }
}
```

## 🎯 Impact Score Calculation

The impact score ranges from 0-100 and is calculated as:

```typescript
const amountScore = Math.min(70, amount / 10);      // Max 70 points
const projectScore = Math.min(30, projectCount * 5); // Max 30 points
const impactScore = amountScore + projectScore;
```

**Examples:**
- 50 XRP to 2 projects = 5 + 10 = **15 score** 🥉 Bronze
- 150 XRP to 3 projects = 15 + 15 = **30 score** 🥈 Silver
- 300 XRP to 5 projects = 30 + 25 = **55 score** 🥇 Gold
- 1000 XRP to 6 projects = 70 + 30 = **100 score** 👑 Platinum

## 💾 Data Schema

```typescript
interface ImpactNFTMetadata {
  nftTokenId?: string;
  poolAddress: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  impactScore: number;           // 0-100
  totalRedistributed: number;    // XRP
  projectsSupported: string[];   // NGO IDs
  redistributionCount: number;   // Cycle count
  asciiArt: string;              // Dynamic visual
  mintedAt: Date;                // Creation timestamp
  lastUpdated: Date;             // Last modification
}
```

## 🌐 Frontend Integration

### Display All Impact NFTs

```tsx
import { ImpactNFTDisplay } from '@/components/ImpactNFTDisplay';

export function DashboardPage() {
  return (
    <section>
      <ImpactNFTDisplay autoRefresh={false} />
    </section>
  );
}
```

### Display Specific NFT

```tsx
<ImpactNFTDisplay 
  nftTokenId="IMPACT_A1B2C3D4E5F6"
  autoRefresh={true}
/>
```

## 🚀 Usage Examples

### JavaScript/TypeScript

```typescript
// Mint after redistribution
const mintResponse = await fetch('http://localhost:3000/api/xrpl/impact-nft/mint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    poolAddress: 'rXRPLImpactPool',
    redistributionAmount: 250,
    projectIds: ['ong-1', 'ong-2', 'ong-3'],
    redistributionCount: 5
  })
});

const nft = await mintResponse.json();
console.log(`✅ Impact NFT minted: ${nft.nftTokenId}`);
console.log(`   Tier: ${nft.metadata.tier}`);
console.log(`   Score: ${nft.metadata.impactScore}/100`);
```

### Get All NFTs

```typescript
const allNFTs = await fetch('http://localhost:3000/api/xrpl/impact-nft/list/all')
  .then(r => r.json());

console.log(`Total Impact NFTs: ${allNFTs.total}`);
allNFTs.nfts.forEach(nft => {
  console.log(`- ${nft.tier.toUpperCase()}: ${nft.impactScore} impact score`);
});
```

## ⚙️ Configuration

### Environment Variables

```env
# Backend
XRPL_NETWORK=mock|testnet|mainnet
XRPL_POOL_WALLET_SEED=s...  # Optional for production

# Frontend
VITE_API_URL=http://localhost:3000
```

### Mode Selection

- **MOCK MODE** (default): No XRPL seed required, simulated transactions
- **TESTNET**: Requires testnet seed, real XRPL testnet
- **MAINNET**: Production mode with real XRP

## 🔐 Security Considerations

- ✅ Non-transferable tokens (soulbound)
- ✅ Immutable creation date
- ✅ Cryptographic token ID generation
- ✅ On-chain storage for immutability
- ✅ No database dependency (on-chain only)

## 📊 Monitoring & Analytics

Track Impact NFTs over time:

```bash
# Get latest NFT generation rate
curl http://localhost:3000/api/xrpl/impact-nft/list/all | jq '.total'

# Calculate total impact
curl http://localhost:3000/api/xrpl/impact-nft/list/all | \
  jq '[.nfts[].totalRedistributed] | add'

# Distribution by tier
curl http://localhost:3000/api/xrpl/impact-nft/list/all | \
  jq 'group_by(.tier) | map({tier: .[0].tier, count: length})'
```

## 🎓 Best Practices

1. **Auto-mint after redistribution** - Don't require manual minting
2. **Non-blocking operations** - Use try/catch to not interrupt main flow
3. **Track project support** - Always include ONG IDs in metadata
4. **Audit trails** - Export NFTs for regulatory compliance
5. **Tier progression** - Celebrate milestones with visual tier upgrades

## 🐛 Troubleshooting

### NFT Not Minting

```
Error: "Mint failed: undefined"
→ Check projectIds array is not empty
→ Verify redistributionAmount > 0
```

### Can't Read NFT

```
Error: "Impact NFT not found"
→ Verify nftTokenId is correct
→ Check NFT was created before reading
```

### Export Not Working

```
Error: 404 Not Found
→ Ensure Impact NFT exists
→ Check token ID in URL
```

## 📚 Related Documentation

- [SBT Module](./SBT_API_GUIDE.md) - Donor impact tokens
- [Oracle Integration](./XRPL_SERVICE_DOCUMENTATION.md) - NGO validation
- [XRPL Service](./XRPL_SERVICE_SUMMARY.md) - Blockchain backend
- [Architecture](../docs/ARCHITECTURE.md) - System design

---

**Version:** 1.0.0  
**Last Updated:** November 29, 2025  
**Status:** ✅ Production Ready  
**Mode:** MOCK (Development)

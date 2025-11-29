# XRPL Impact Fund - Architecture Senior pour Hackathon

## 🎯 Vision du Projet

**Fonds caritatif géré par IA avec redistribution automatique sur XRPL**

- Cagnotte publique XRPL transparente
- Algorithme IA pour maximiser les donations (mocké pour demo)
- Impact NFTs évolutifs (gamification donateurs)
- Donor Impact Tokens (SBT pour gouvernance)
- Impact Oracle (validation ONG + scoring)
- Dashboard temps réel
- Emergency Mode (déblocage fonds urgence)
- Donation Stories QR (partage impact)

---

## 📐 Architecture Globale

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                             │
│  • Dashboard temps réel    • Impact NFT Gallery                     │
│  • Donation Interface      • QR Code Stories                        │
│  • Emergency Mode UI       • Governance Panel                       │
└────────────────────┬────────────────────────────────────────────────┘
                     │ REST API + WebSocket (temps réel)
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND API (Express)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ XRPL Module  │  │ Impact       │  │ Emergency    │             │
│  │ • Donations  │  │ Oracle       │  │ Module       │             │
│  │ • NFT Mint   │  │ • Validation │  │ • Triggers   │             │
│  │ • DIT Mint   │  │ • Scoring    │  │ • Releases   │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ AI Trading   │  │ Distribution │  │ Stories      │             │
│  │ Engine       │  │ Engine       │  │ Generator    │             │
│  │ (Mock)       │  │ • Weighted   │  │ • QR Codes   │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└────────────┬───────────────┬──────────────┬────────────────────────┘
             │               │              │
             ▼               ▼              ▼
┌──────────────────┐  ┌─────────────┐  ┌────────────────┐
│ XRPL Network     │  │ PostgreSQL  │  │ Redis Cache    │
│ • Testnet/Mock   │  │ • Donors    │  │ • API Cache    │
│ • Payments       │  │ • NGOs      │  │ • Real-time    │
│ • NFTs (XLS-20)  │  │ • Stories   │  │ • Sessions     │
│ • Hooks (future) │  │ • Emergency │  │                │
└──────────────────┘  └─────────────┘  └────────────────┘
```

---

## 🗂️ Structure de Fichiers Optimale

```
xrpl-impact-fund/
├── backend/
│   ├── src/
│   │   ├── core/                           # Code métier central
│   │   │   ├── domain/                     # Domain models (DDD)
│   │   │   │   ├── donor.entity.ts
│   │   │   │   ├── ngo.entity.ts
│   │   │   │   ├── donation.entity.ts
│   │   │   │   ├── impact-nft.entity.ts
│   │   │   │   └── emergency-fund.entity.ts
│   │   │   ├── usecases/                   # Business logic
│   │   │   │   ├── process-donation.usecase.ts
│   │   │   │   ├── mint-impact-nft.usecase.ts
│   │   │   │   ├── distribute-profits.usecase.ts
│   │   │   │   └── trigger-emergency.usecase.ts
│   │   │   └── ports/                      # Interfaces (Hexagonal)
│   │   │       ├── xrpl-gateway.port.ts
│   │   │       ├── ai-trading.port.ts
│   │   │       └── oracle.port.ts
│   │   │
│   │   ├── infrastructure/                 # Adapters externes
│   │   │   ├── xrpl/
│   │   │   │   ├── xrpl-client.adapter.ts
│   │   │   │   ├── nft-minter.service.ts
│   │   │   │   ├── payment-processor.service.ts
│   │   │   │   └── hooks/
│   │   │   │       └── impact-fund.hook.ts
│   │   │   ├── ai-trading/
│   │   │   │   ├── trading-engine.adapter.ts
│   │   │   │   ├── strategies/
│   │   │   │   │   ├── ma-crossover.strategy.ts
│   │   │   │   │   └── rsi.strategy.ts
│   │   │   │   └── mock-market-data.service.ts
│   │   │   ├── oracle/
│   │   │   │   ├── impact-oracle.adapter.ts
│   │   │   │   ├── validators/
│   │   │   │   │   ├── registration.validator.ts
│   │   │   │   │   ├── financial.validator.ts
│   │   │   │   │   └── impact.validator.ts
│   │   │   │   └── scoring.engine.ts
│   │   │   └── database/
│   │   │       ├── repositories/
│   │   │       │   ├── donor.repository.ts
│   │   │       │   ├── ngo.repository.ts
│   │   │       │   └── donation.repository.ts
│   │   │       └── migrations/
│   │   │
│   │   ├── api/                            # HTTP Layer
│   │   │   ├── routes/
│   │   │   │   ├── donation.routes.ts
│   │   │   │   ├── ngo.routes.ts
│   │   │   │   ├── nft.routes.ts
│   │   │   │   ├── emergency.routes.ts
│   │   │   │   └── stories.routes.ts
│   │   │   ├── controllers/
│   │   │   │   ├── donation.controller.ts
│   │   │   │   ├── ngo.controller.ts
│   │   │   │   └── emergency.controller.ts
│   │   │   ├── middlewares/
│   │   │   │   ├── error-handler.middleware.ts
│   │   │   │   ├── rate-limiter.middleware.ts
│   │   │   │   └── validator.middleware.ts
│   │   │   └── dto/                        # Data Transfer Objects
│   │   │       ├── donation.dto.ts
│   │   │       └── ngo.dto.ts
│   │   │
│   │   ├── shared/                         # Code partagé
│   │   │   ├── types/
│   │   │   │   ├── xrpl.types.ts
│   │   │   │   ├── api.types.ts
│   │   │   │   └── common.types.ts
│   │   │   ├── utils/
│   │   │   │   ├── logger.util.ts
│   │   │   │   ├── crypto.util.ts
│   │   │   │   └── mock-data.util.ts
│   │   │   ├── constants/
│   │   │   │   ├── xrpl.constants.ts
│   │   │   │   └── nft-tiers.constants.ts
│   │   │   └── errors/
│   │   │       ├── xrpl.error.ts
│   │   │       └── validation.error.ts
│   │   │
│   │   ├── config/                         # Configuration
│   │   │   ├── env.config.ts
│   │   │   ├── database.config.ts
│   │   │   ├── xrpl.config.ts
│   │   │   └── redis.config.ts
│   │   │
│   │   └── index.ts                        # Entry point
│   │
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   │
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── features/                       # Feature-based organization
│   │   │   ├── donations/
│   │   │   │   ├── components/
│   │   │   │   │   ├── DonationForm.tsx
│   │   │   │   │   ├── DonationFeed.tsx
│   │   │   │   │   └── DonationSuccess.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useDonation.ts
│   │   │   │   └── api/
│   │   │   │       └── donationApi.ts
│   │   │   │
│   │   │   ├── impact-nfts/
│   │   │   │   ├── components/
│   │   │   │   │   ├── NFTGallery.tsx
│   │   │   │   │   ├── NFTCard.tsx
│   │   │   │   │   └── NFTEvolution.tsx
│   │   │   │   └── hooks/
│   │   │   │       └── useNFT.ts
│   │   │   │
│   │   │   ├── ngos/
│   │   │   │   ├── components/
│   │   │   │   │   ├── NGOList.tsx
│   │   │   │   │   ├── NGOCard.tsx
│   │   │   │   │   └── OracleScore.tsx
│   │   │   │   └── hooks/
│   │   │   │       └── useNGOs.ts
│   │   │   │
│   │   │   ├── emergency/
│   │   │   │   ├── components/
│   │   │   │   │   ├── EmergencyTrigger.tsx
│   │   │   │   │   ├── EmergencyStatus.tsx
│   │   │   │   │   └── EmergencyHistory.tsx
│   │   │   │   └── hooks/
│   │   │   │       └── useEmergency.ts
│   │   │   │
│   │   │   ├── stories/
│   │   │   │   ├── components/
│   │   │   │   │   ├── StoryCard.tsx
│   │   │   │   │   ├── QRCodeGenerator.tsx
│   │   │   │   │   └── StoryShare.tsx
│   │   │   │   └── hooks/
│   │   │   │       └── useStories.ts
│   │   │   │
│   │   │   └── dashboard/
│   │   │       ├── components/
│   │   │       │   ├── PoolStats.tsx
│   │   │       │   ├── TradingChart.tsx
│   │   │       │   ├── DistributionPie.tsx
│   │   │       │   └── Leaderboard.tsx
│   │   │       └── hooks/
│   │   │           └── useDashboard.ts
│   │   │
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── LoadingSpinner.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useWebSocket.ts
│   │   │   │   └── usePolling.ts
│   │   │   └── utils/
│   │   │       ├── formatters.ts
│   │   │       └── validators.ts
│   │   │
│   │   ├── store/                          # State management
│   │   │   ├── slices/
│   │   │   │   ├── pool.slice.ts
│   │   │   │   ├── donor.slice.ts
│   │   │   │   ├── ngos.slice.ts
│   │   │   │   └── emergency.slice.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── api/                            # API client
│   │   │   ├── client.ts
│   │   │   └── endpoints.ts
│   │   │
│   │   ├── types/
│   │   │   └── index.ts
│   │   │
│   │   └── App.tsx
│   │
│   ├── Dockerfile
│   └── package.json
│
├── shared/                                  # Types partagés
│   └── types/
│       ├── donor.types.ts
│       ├── ngo.types.ts
│       └── api.types.ts
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🔧 Stack Technique

### Backend
```json
{
  "runtime": "Node.js 20 + TypeScript",
  "framework": "Express.js 4.18",
  "architecture": "Hexagonal (Ports & Adapters)",

  "xrpl": {
    "xrpl": "^3.0.0",
    "xrpl-hooks": "^1.0.0 (future)"
  },

  "database": {
    "postgresql": "^15.0",
    "typeorm": "^0.3.0",
    "redis": "^4.6.0"
  },

  "validation": {
    "zod": "^3.22.0",
    "class-validator": "^0.14.0"
  },

  "ai-trading": {
    "technicalindicators": "^3.1.0",
    "ccxt": "^4.0.0 (future - real DEX)"
  },

  "utilities": {
    "winston": "^3.11.0",
    "dotenv": "^16.0.0",
    "axios": "^1.6.0",
    "bull": "^4.11.0"
  }
}
```

### Frontend
```json
{
  "framework": "React 18 + TypeScript + Vite",
  "routing": "React Router 6",
  "state": "Zustand + React Query",

  "ui": {
    "tailwindcss": "^3.4.0",
    "framer-motion": "^10.16.0",
    "lucide-react": "^0.294.0",
    "recharts": "^2.10.0"
  },

  "xrpl": {
    "xrpl": "^3.0.0",
    "xumm-sdk": "^1.7.0 (wallet connect)"
  },

  "qr-codes": {
    "qrcode.react": "^3.1.0",
    "react-qr-reader": "^3.0.0"
  },

  "real-time": {
    "socket.io-client": "^4.6.0"
  }
}
```

---

## 🌐 API Endpoints Complets

### 1. Donations Module
```typescript
POST   /api/v1/donations
GET    /api/v1/donations/recent
GET    /api/v1/donations/:txHash
POST   /api/v1/donations/:id/story
```

### 2. Donors Module
```typescript
GET    /api/v1/donors/:address
GET    /api/v1/donors/:address/nfts
GET    /api/v1/donors/:address/history
GET    /api/v1/donors/leaderboard
```

### 3. NGOs Module
```typescript
GET    /api/v1/ngos
GET    /api/v1/ngos/:id
POST   /api/v1/ngos/:id/validate        # Impact Oracle
GET    /api/v1/ngos/:id/impact-score
GET    /api/v1/ngos/:id/distributions
```

### 4. Pool Module
```typescript
GET    /api/v1/pool/stats
GET    /api/v1/pool/balance
GET    /api/v1/pool/history
POST   /api/v1/pool/simulate-trading
POST   /api/v1/pool/distribute
```

### 5. NFTs Module
```typescript
GET    /api/v1/nfts
GET    /api/v1/nfts/:tokenId
POST   /api/v1/nfts/mint
GET    /api/v1/nfts/:tokenId/metadata
GET    /api/v1/nfts/:tokenId/evolution
```

### 6. Emergency Module
```typescript
GET    /api/v1/emergency/status
POST   /api/v1/emergency/trigger
GET    /api/v1/emergency/history
POST   /api/v1/emergency/vote          # Governance
```

### 7. Stories Module
```typescript
GET    /api/v1/stories
GET    /api/v1/stories/:id
POST   /api/v1/stories
GET    /api/v1/stories/:id/qr
POST   /api/v1/stories/:id/share
```

### 8. Governance Module
```typescript
GET    /api/v1/governance/proposals
POST   /api/v1/governance/proposals
POST   /api/v1/governance/vote
GET    /api/v1/governance/voting-power/:address
```

---

## 🔄 Flux de Données Principaux

### 1. Flux Donation Complète
```
User → Frontend → POST /donations
              ↓
         DonationController
              ↓
     ProcessDonationUseCase
              ↓
    ┌────────┴────────┐
    ▼                 ▼
XRPLGateway    DonorRepository
    │                 │
    │ (payment)       │ (save donor)
    ↓                 ↓
XRPL Network    PostgreSQL
    │                 │
    ↓                 ▼
 TX Success    CalculateXP & Level
    │                 │
    ↓                 ↓
MintImpactNFT    Update Donor
    │                 │
    ▼                 ▼
 NFT Token      Emit WebSocket
    │                 │
    └────────┬────────┘
             ↓
     Return to Frontend
             ↓
   Update UI (real-time)
```

### 2. Flux AI Trading & Distribution
```
Cron Job (24h) → TriggerTradingUseCase
                      ↓
            AITradingEngine (Mock)
                      ↓
         Generate Market Data (200 candles)
                      ↓
         Calculate MA50, MA200, RSI
                      ↓
         Generate Signal (BUY/SELL/HOLD)
                      ↓
         Calculate Profit (0.5-2%)
                      ↓
         Update Pool Balance
                      ↓
         DistributeProfitsUseCase
                      ↓
         For each NGO (weighted):
         ├─ Calculate share
         ├─ XRPL Payment
         ├─ Save Distribution Record
         └─ Emit WebSocket
                      ↓
         Update Frontend Dashboard
```

### 3. Flux Impact Oracle
```
POST /ngos/:id/validate
         ↓
  ImpactOracleAdapter
         ↓
  ┌──────┴──────┐
  ▼             ▼
RegistrationValidator  FinancialValidator
  │             │
  │ (UN Data)   │ (OECD Data)
  ↓             ↓
Check DB    Check Transparency
  │             │
  └──────┬──────┘
         ▼
  ImpactValidator
         │
         │ (Impact Metrics)
         ↓
  CalculateScore (0-100)
         │
         ├─ Registration: 30%
         ├─ Financial: 30%
         ├─ Impact: 40%
         ↓
  ScoringEngine
         ↓
  Save to Cache (24h)
         ↓
  Return Score + Certifications
```

### 4. Flux Emergency Mode
```
Emergency Event (natural disaster, etc.)
         ↓
POST /emergency/trigger
         ↓
  EmergencyController
         ↓
  TriggerEmergencyUseCase
         ↓
  Validate Conditions:
  ├─ Severity >= threshold
  ├─ Governance quorum
  └─ Pool has funds
         ↓
  Create Emergency Release
         ↓
  For each affected NGO:
  ├─ Calculate allocation
  ├─ XRPL instant payment
  ├─ Bypass normal distribution
  └─ Log emergency record
         ↓
  Emit notifications (WebSocket)
         ↓
  Update Frontend (alert banner)
```

---

## 📦 Fichiers MVP Essentiels

### Backend (20 fichiers core)
```
1.  src/core/domain/donor.entity.ts
2.  src/core/domain/ngo.entity.ts
3.  src/core/domain/donation.entity.ts
4.  src/core/usecases/process-donation.usecase.ts
5.  src/core/usecases/distribute-profits.usecase.ts
6.  src/infrastructure/xrpl/xrpl-client.adapter.ts
7.  src/infrastructure/xrpl/nft-minter.service.ts
8.  src/infrastructure/ai-trading/trading-engine.adapter.ts
9.  src/infrastructure/oracle/impact-oracle.adapter.ts
10. src/infrastructure/database/repositories/donor.repository.ts
11. src/infrastructure/database/repositories/ngo.repository.ts
12. src/api/routes/donation.routes.ts
13. src/api/routes/ngo.routes.ts
14. src/api/controllers/donation.controller.ts
15. src/api/controllers/ngo.controller.ts
16. src/api/middlewares/error-handler.middleware.ts
17. src/shared/utils/mock-data.util.ts
18. src/config/env.config.ts
19. src/config/xrpl.config.ts
20. src/index.ts
```

### Frontend (15 fichiers core)
```
1.  src/features/donations/components/DonationForm.tsx
2.  src/features/donations/hooks/useDonation.ts
3.  src/features/impact-nfts/components/NFTGallery.tsx
4.  src/features/ngos/components/NGOList.tsx
5.  src/features/dashboard/components/PoolStats.tsx
6.  src/features/dashboard/components/TradingChart.tsx
7.  src/features/emergency/components/EmergencyStatus.tsx
8.  src/features/stories/components/QRCodeGenerator.tsx
9.  src/store/slices/pool.slice.ts
10. src/store/slices/donor.slice.ts
11. src/store/slices/ngos.slice.ts
12. src/api/client.ts
13. src/shared/hooks/useWebSocket.ts
14. src/shared/components/LoadingSpinner.tsx
15. src/App.tsx
```

---

## ✅ Bonnes Pratiques Anti-Dette Technique

### 1. Architecture
- ✅ **Hexagonal Architecture** - Domain isolé des adapters
- ✅ **SOLID Principles** - Single responsibility par fichier
- ✅ **Dependency Injection** - Facilite les tests
- ✅ **Repository Pattern** - Abstraction base de données

### 2. Code Quality
```typescript
// ❌ BAD: Business logic dans le controller
app.post('/donate', (req, res) => {
  const xp = req.body.amount * 10;
  const level = Math.floor(Math.sqrt(xp/100)) + 1;
  // ...
});

// ✅ GOOD: UseCase isolé testable
class ProcessDonationUseCase {
  execute(command: DonateCommand): Promise<DonationResult> {
    // Logic pure, testable
  }
}
```

### 3. Type Safety
```typescript
// ✅ Zod validation à l'entrée
const DonationSchema = z.object({
  donorAddress: z.string().regex(/^r[a-zA-Z0-9]{24,34}$/),
  amount: z.number().positive().max(1000000),
});

// ✅ TypeScript strict mode
"strict": true,
"noImplicitAny": true,
"strictNullChecks": true
```

### 4. Error Handling
```typescript
// ✅ Custom errors typées
class XRPLPaymentError extends Error {
  constructor(
    public code: string,
    public txHash: string,
    message: string
  ) {
    super(message);
  }
}

// ✅ Middleware global
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(err.statusCode || 500).json({
    error: err.message,
    code: err.code,
  });
});
```

### 5. Testing Strategy
```typescript
// ✅ Unit tests pour UseCases
describe('ProcessDonationUseCase', () => {
  it('should calculate XP correctly', () => {
    // Arrange
    const usecase = new ProcessDonationUseCase(mockGateway);

    // Act
    const result = usecase.calculateXP(100);

    // Assert
    expect(result).toBe(1000);
  });
});

// ✅ Integration tests pour API
describe('POST /donations', () => {
  it('should create donation and mint NFT', async () => {
    const response = await request(app)
      .post('/api/v1/donations')
      .send({ donorAddress: 'rTest123', amount: 100 });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('nftTokenId');
  });
});
```

### 6. Performance
```typescript
// ✅ Redis cache pour données fréquentes
const cachedNGOs = await redis.get('ngos:validated');
if (cachedNGOs) return JSON.parse(cachedNGOs);

// ✅ Database indexes
@Index(['address'])
@Index(['createdAt'])
class Donor { }

// ✅ Pagination obligatoire
GET /api/v1/donations?page=1&limit=20
```

### 7. Security
```typescript
// ✅ Rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests
});

app.use('/api/v1/donations', limiter);

// ✅ Input sanitization
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

app.use(helmet());
app.use(mongoSanitize());
```

### 8. Logging
```typescript
// ✅ Winston structured logging
logger.info('Donation processed', {
  donorAddress,
  amount,
  txHash,
  timestamp: new Date(),
});

// ✅ Different levels
logger.error('XRPL payment failed', { error, txHash });
logger.warn('Low pool balance', { balance });
logger.debug('Market data generated', { candles: 200 });
```

### 9. Configuration
```typescript
// ✅ Environment-based config
class EnvConfig {
  static get xrpl() {
    return {
      network: process.env.XRPL_NETWORK || 'testnet',
      websocketUrl: process.env.XRPL_WS_URL,
      poolWallet: process.env.POOL_WALLET_ADDRESS,
    };
  }
}

// ✅ Validation au démarrage
if (!process.env.POOL_WALLET_SEED) {
  throw new Error('POOL_WALLET_SEED is required');
}
```

### 10. Documentation
```typescript
// ✅ OpenAPI/Swagger
/**
 * @swagger
 * /api/v1/donations:
 *   post:
 *     summary: Create a new donation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DonationRequest'
 */

// ✅ JSDoc pour fonctions complexes
/**
 * Calcule le niveau d'un donateur basé sur son XP
 * Formule: level = floor(sqrt(xp/100)) + 1
 *
 * @param xp - Points d'expérience totaux
 * @returns Niveau calculé (minimum 1)
 */
function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}
```

---

## 🚀 Priorités MVP Hackathon

### Phase 1 - Foundation (Jour 1)
1. ✅ Setup architecture hexagonale
2. ✅ XRPL client + mock mode
3. ✅ Donation endpoint basique
4. ✅ Impact Oracle mock
5. ✅ Frontend dashboard de base

### Phase 2 - Core Features (Jour 2)
1. ✅ NFT minting automatique
2. ✅ AI trading simulation
3. ✅ Distribution engine
4. ✅ Real-time dashboard updates
5. ✅ NGO validation UI

### Phase 3 - Innovation (Jour 3)
1. ✅ Emergency Mode
2. ✅ Donation Stories + QR
3. ✅ Governance voting
4. ✅ Advanced analytics
5. ✅ Mobile-responsive UI

### Phase 4 - Polish (Jour 4)
1. ✅ Tests critiques
2. ✅ Performance optimization
3. ✅ Documentation démo
4. ✅ Vidéo pitch
5. ✅ Déploiement testnet

---

## 📊 Métriques de Succès

- ✅ **< 500ms** response time moyenne API
- ✅ **100%** uptime pendant démo
- ✅ **0** erreurs critiques frontend
- ✅ **< 2s** temps mint NFT
- ✅ **Real-time** updates < 1s latence
- ✅ **Mobile-first** design responsive

---

## 🎯 Points Forts Hackathon

1. **Innovation XRPL**
   - Impact NFTs évolutifs (gamification)
   - Donor Impact Tokens SBT
   - Emergency Mode unique

2. **Impact Social**
   - Transparence totale (ledger public)
   - AI maximise donations
   - Validation Oracle rigoureuse

3. **UX Exceptionnelle**
   - Dashboard temps réel
   - QR code stories partageables
   - Mobile-first design

4. **Architecture Scalable**
   - Hexagonal clean
   - Type-safe end-to-end
   - Tests automatisés

---

Cette architecture est production-ready et optimisée pour gagner un hackathon ! 🏆

# 📘 XRPL Service Enhanced - Documentation Complète

## 🎯 Vue d'ensemble

Le **XRPLServiceEnhanced** est un module Node.js/TypeScript complet et production-ready pour gérer toutes les opérations XRPL d'un fonds caritatif avec redistribution automatique.

### Fonctionnalités principales

✅ **Envoi/dépôt XRPL** avec validation complète
✅ **Lecture de solde XRPL** en temps réel
✅ **Enregistrement des donations** en base PostgreSQL
✅ **Calcul mock du profit** (simulation IA trading)
✅ **Redistribution automatique XRPL** aux ONG
✅ **Logging Winston professionnel** avec niveaux
✅ **Vérification exhaustive** des transactions
✅ **Mode Emergency Redistribution** avec gouvernance
✅ **Gestion d'erreurs robuste** avec retry
✅ **Mode MOCK et LIVE** (testnet/mainnet)

---

## 📦 Installation

### Dépendances requises

```bash
npm install xrpl winston pg zod
```

```json
{
  "dependencies": {
    "xrpl": "^3.0.0",
    "winston": "^3.11.0",
    "pg": "^8.11.3",
    "zod": "^3.22.4"
  }
}
```

### Variables d'environnement

Créer un fichier `.env` :

```env
# XRPL Configuration
XRPL_NETWORK=mock                    # mock | testnet | devnet | mainnet
XRPL_WEBSOCKET_URL=wss://s.altnet.rippletest.net:51233
XRPL_POOL_WALLET_SEED=sXXXXXXXXXXXXXXXXXXXXXXXXXXX
XRPL_POOL_WALLET_ADDRESS=rXXXXXXXXXXXXXXXXXXXXXXXX

# Logging
ENABLE_LOGGING=true
LOG_LEVEL=info                       # debug | info | warn | error

# Emergency
EMERGENCY_THRESHOLD=20               # % de votes requis
EMERGENCY_QUORUM=30                  # % de participation minimale

# Trading
DEFAULT_PROFIT_PERCENTAGE=0.67       # % mensuel (8% annuel)
MAX_PROFIT_PERCENTAGE=2.0            # % max par période

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/xrpl_impact_fund
```

---

## 🚀 Usage rapide

### Initialisation basique

```typescript
import { XRPLServiceEnhanced } from './services/xrpl-service-enhanced';

// Créer le service
const xrplService = new XRPLServiceEnhanced({
  network: 'mock',
  mockMode: true,
  enableLogging: true,
  logLevel: 'info',
});

// Initialiser la connexion
await xrplService.initialize();
```

### 1. Lecture de solde XRPL

```typescript
// Solde d'une adresse spécifique
const balance = await xrplService.getBalance('rDonorAddress123...');
console.log(`Solde: ${balance} XRP`);

// Solde du pool
const poolBalance = await xrplService.getPoolBalance();
console.log(`Pool: ${poolBalance} XRP`);
```

### 2. Traiter une donation

```typescript
const donation = await xrplService.processDonation(
  'rDonorAddress123...',  // Adresse du donateur
  100,                     // Montant en XRP
  'ABC123...'             // Hash de transaction (optionnel en MOCK)
);

console.log(`XP gagné: ${donation.xpGained}`);
console.log(`Niveau: ${donation.newLevel}`);
console.log(`NFT minté: ${donation.nftMinted}`);
```

### 3. Calculer les profits (Mock IA Trading)

```typescript
const profit = await xrplService.calculateProfit(0.67); // 0.67% mensuel

console.log(`Profit: ${profit.profitAmount} XRP`);
console.log(`Stratégie: ${profit.strategy}`);
console.log(`Indicateurs:`, profit.simulationDetails);
```

### 4. Redistribuer aux ONG

```typescript
const redistribution = await xrplService.redistributeProfits(50); // 50 XRP

console.log(`ONG bénéficiaires: ${redistribution.ngoCount}`);
redistribution.distributions.forEach(dist => {
  console.log(`${dist.ngoName}: ${dist.amount} XRP (${dist.percentage}%)`);
});
```

### 5. Mode Emergency Redistribution

```typescript
const emergency = await xrplService.triggerEmergencyRedistribution({
  triggeredBy: 'rGovernanceAddress...',
  reason: 'Earthquake Nepal 7.8 - Immediate aid needed',
  severity: 'critical',
  amountRequested: 5000,
  affectedNGOs: ['ngo_1', 'ngo_2'],
});

console.log(`Emergency ID: ${emergency.emergencyId}`);
console.log(`Approved: ${emergency.approved}`);
console.log(`Votes: ${emergency.approvalVotes} / ${emergency.requiredVotes}`);
```

### 6. Statistiques & Monitoring

```typescript
const stats = xrplService.getStatistics();

console.log('Service:', stats.service);
console.log('Operations:', stats.operations);
console.log('Pool:', stats.pool);
console.log('Emergency:', stats.emergency);

// Logs récents
const logs = xrplService.getOperationLogs(50); // 50 derniers logs
```

---

## 📚 API Complète

### Configuration

```typescript
interface XRPLServiceConfig {
  // Réseau XRPL
  network: 'mock' | 'testnet' | 'devnet' | 'mainnet';
  websocketUrl?: string;

  // Wallet du pool
  poolWalletSeed?: string;
  poolWalletAddress: string;

  // Mode opératoire
  mockMode: boolean;
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';

  // Emergency
  emergencyThreshold: number;
  emergencyQuorum: number;

  // Trading
  defaultProfitPercentage: number;
  maxProfitPercentage: number;

  // Retry & Timeouts
  maxRetries: number;
  retryDelay: number;
  transactionTimeout: number;
}
```

### Méthodes principales

#### `initialize(): Promise<void>`
Initialise la connexion au réseau XRPL.

#### `shutdown(): Promise<void>`
Ferme proprement toutes les connexions.

#### `getBalance(address: string): Promise<number>`
Obtient le solde d'une adresse XRPL.

**Paramètres:**
- `address`: Adresse XRPL (format: `rXXXXXXX...`)

**Retourne:** Solde en XRP

#### `getPoolBalance(): Promise<number>`
Obtient le solde du pool de donations.

**Retourne:** Solde du pool en XRP

#### `processDonation(donorAddress, amount, txHash?): Promise<DonationResult>`
Traite une donation complète avec XP, NFT et enregistrement en base.

**Paramètres:**
- `donorAddress`: Adresse XRPL du donateur
- `amount`: Montant en XRP
- `txHash`: Hash de transaction (optionnel en MOCK)

**Retourne:**
```typescript
interface DonationResult {
  success: boolean;
  txHash: string;
  donorAddress: string;
  amount: number;
  xpGained: number;
  newLevel: number;
  levelUp: boolean;
  nftMinted: boolean;
  nftTokenId?: string;
  poolBalance: number;
  totalDonations: number;
  dbRecordId: string;
  timestamp: Date;
}
```

#### `calculateProfit(profitPercentage?): Promise<ProfitCalculation>`
Calcule les profits générés par l'algorithme de trading IA (MOCK).

**Paramètres:**
- `profitPercentage`: Pourcentage cible (défaut: 0.67% = mensuel)

**Retourne:**
```typescript
interface ProfitCalculation {
  profitAmount: number;
  profitPercentage: number;
  poolBalanceBefore: number;
  poolBalanceAfter: number;
  strategy: string;
  marketConditions: string;
  timestamp: Date;
  simulationDetails?: {
    ma50: number;
    ma200: number;
    rsi: number;
    signal: 'BUY' | 'SELL' | 'HOLD';
  };
}
```

#### `redistributeProfits(profitAmount): Promise<RedistributionResult>`
Redistribue automatiquement les profits aux ONG validées.

**Paramètres:**
- `profitAmount`: Montant total à redistribuer (en XRP)

**Retourne:**
```typescript
interface RedistributionResult {
  success: boolean;
  totalAmount: number;
  ngoCount: number;
  distributions: Array<{
    ngoId: string;
    ngoName: string;
    amount: number;
    percentage: number;
    txHash: string;
    validated: boolean;
  }>;
  failedDistributions: Array<{ ngoId: string; error: string }>;
  timestamp: Date;
  executionTime: number;
}
```

#### `triggerEmergencyRedistribution(emergency): Promise<EmergencyRedistributionResult>`
Déclenche une redistribution d'urgence avec vote de gouvernance.

**Paramètres:**
```typescript
{
  triggeredBy: string;           // Adresse du déclencheur
  reason: string;                // Raison de l'urgence
  severity: 'low' | 'medium' | 'high' | 'critical';
  amountRequested: number;       // Montant en XRP
  affectedNGOs: string[];        // IDs des ONG affectées
}
```

**Retourne:**
```typescript
interface EmergencyRedistributionResult {
  success: boolean;
  emergencyId: string;
  reason: string;
  severity: string;
  totalAmount: number;
  affectedNGOs: string[];
  txHashes: string[];
  approvalVotes: number;
  rejectionVotes: number;
  requiredVotes: number;
  quorumReached: boolean;
  approved: boolean;
  timestamp: Date;
  triggeredBy: string;
}
```

#### `getStatistics(): object`
Obtient les statistiques complètes du service.

#### `getOperationLogs(limit): OperationLog[]`
Obtient l'historique des opérations.

---

## 🗄️ Intégration PostgreSQL

### Schéma de base de données

```sql
CREATE TABLE donations (
  id VARCHAR(255) PRIMARY KEY,
  donor_address VARCHAR(64) NOT NULL,
  amount DECIMAL(20, 6) NOT NULL,
  tx_hash VARCHAR(128) UNIQUE NOT NULL,
  xp_gained INTEGER NOT NULL,
  level INTEGER NOT NULL,
  nft_token_id VARCHAR(128),
  dit_token_id VARCHAR(128),
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_donor_address (donor_address),
  INDEX idx_created_at (created_at)
);
```

### Connexion

```typescript
import { Pool } from 'pg';

const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const xrplService = new XRPLServiceEnhanced(config, dbPool);
```

### Récupérer l'historique

```typescript
const history = await xrplService.getDonationHistory(
  'rDonorAddress...',
  50 // limite
);
```

---

## 📝 Logging avec Winston

Le service utilise **Winston** pour un logging professionnel :

### Niveaux de log

- `error`: Erreurs critiques
- `warn`: Avertissements (emergency, quorum non atteint, etc.)
- `info`: Informations importantes (donations, redistribution)
- `debug`: Détails techniques (vérification TX, indicateurs)

### Fichiers de logs

```
logs/
├── xrpl-error.log      # Erreurs uniquement
└── xrpl-combined.log   # Tous les logs
```

### Format des logs

```
2025-01-29 14:32:15 [INFO] 📥 Processing donation
   {
     "donor": "rDonor...ABCD",
     "amount": "100 XRP",
     "txHash": "MOCK_..."
   }
```

---

## 🔒 Sécurité & Bonnes Pratiques

### 1. Validation stricte

Toutes les entrées sont validées :
- Adresses XRPL (format `rXXXXX...`)
- Montants (positifs, finis)
- Transactions (vérifiées sur le ledger en mode LIVE)

### 2. Retry automatique

Les paiements XRPL sont retryés automatiquement en cas d'échec :
- Max retries: 3 (configurable)
- Backoff exponentiel: 1s, 2s, 3s

### 3. Masquage des données sensibles

Les adresses et seeds sont masquées dans les logs :
```
rDonor...ABCD  au lieu de  rDonorFullAddress123456789
```

### 4. Mode MOCK

En développement, utiliser le mode MOCK :
```typescript
mockMode: true,
network: 'mock'
```

### 5. Timeout des transactions

Timeout par défaut: 30 secondes (configurable)

---

## 🧪 Tests

### Exécuter le script de test complet

```bash
tsx backend/src/services/test-xrpl-enhanced.ts
```

### Tests unitaires (à implémenter)

```typescript
import { describe, it, expect } from 'vitest';
import { XRPLServiceEnhanced } from './xrpl-service-enhanced';

describe('XRPLServiceEnhanced', () => {
  it('should process a donation', async () => {
    const service = new XRPLServiceEnhanced({ mockMode: true });
    await service.initialize();

    const result = await service.processDonation('rTest...', 100);

    expect(result.success).toBe(true);
    expect(result.amount).toBe(100);
    expect(result.xpGained).toBeGreaterThan(0);
  });
});
```

---

## 🔄 Workflow complet (Exemple réel)

```typescript
import { XRPLServiceEnhanced } from './xrpl-service-enhanced';
import { Pool } from 'pg';

async function dailyTradingCycle() {
  // 1. Initialiser
  const db = new Pool({ connectionString: process.env.DATABASE_URL });
  const service = new XRPLServiceEnhanced({
    network: 'testnet',
    mockMode: false,
    logLevel: 'info',
  }, db);

  await service.initialize();

  try {
    // 2. Vérifier le solde du pool
    const poolBalance = await service.getPoolBalance();
    console.log(`💰 Pool balance: ${poolBalance} XRP`);

    // 3. Calculer les profits (IA trading)
    const profit = await service.calculateProfit(0.67); // 0.67% mensuel
    console.log(`📈 Profit: ${profit.profitAmount} XRP`);

    // 4. Redistribuer aux ONG
    if (profit.profitAmount > 0) {
      const distribution = await service.redistributeProfits(profit.profitAmount);
      console.log(`🎁 Distributed to ${distribution.ngoCount} NGOs`);
    }

    // 5. Statistiques
    const stats = service.getStatistics();
    console.log(`✅ Success rate: ${stats.operations.successRate}%`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await service.shutdown();
  }
}

// Exécuter tous les jours à 00:00 UTC
import cron from 'node-cron';
cron.schedule('0 0 * * *', dailyTradingCycle);
```

---

## 🚨 Emergency Mode - Détails

### Sévérités d'urgence

- **low**: Situations normales, pas d'urgence réelle
- **medium**: Besoin modéré, planification possible
- **high**: Urgence importante, action rapide requise
- **critical**: Catastrophe majeure, action immédiate

### Processus de vote

1. **Déclenchement** par un membre de gouvernance
2. **Notification** de tous les stakeholders
3. **Collecte des votes** (DIT token holders)
4. **Vérification du quorum** (30% par défaut)
5. **Calcul de l'approbation** (>50% de pour)
6. **Exécution** si approuvé

### Exemple d'urgence

```typescript
// Tsunami en Indonésie
await service.triggerEmergencyRedistribution({
  triggeredBy: 'rGovernance...',
  reason: 'Tsunami Indonesia - 10,000+ affected - Medical supplies needed',
  severity: 'critical',
  amountRequested: 10000, // 10k XRP
  affectedNGOs: ['red_cross_indonesia', 'doctors_without_borders'],
});
```

---

## 🎯 Bonnes Pratiques XRPL

### 1. Réserves XRPL

Toujours garder au moins **10 XRP** sur le wallet du pool pour les réserves XRPL.

### 2. Fees

Les fees XRPL sont généralement de **0.00001 XRP** (10 drops) par transaction.

### 3. Memo

Utiliser les memos pour tracer les transactions :
```typescript
await service.processDonation(address, 100, txHash);
// Memo automatique: "Donation from rXXX..."
```

### 4. Validation

Toujours attendre la validation du ledger en mode LIVE :
```typescript
const isValid = await service.verifyTransaction(txHash);
```

---

## 📊 Métriques & Monitoring

### Métriques clés à surveiller

1. **Taux de succès des opérations** (> 99%)
2. **Temps de réponse moyen** (< 500ms)
3. **Solde du pool** (ne doit jamais être négatif)
4. **Nombre de donations/jour**
5. **Profit généré vs objectif**
6. **Uptime du service**

### Exemple avec Prometheus

```typescript
import { Registry, Counter, Histogram } from 'prom-client';

const register = new Registry();

const donationCounter = new Counter({
  name: 'xrpl_donations_total',
  help: 'Total number of donations',
  registers: [register],
});

const profitHistogram = new Histogram({
  name: 'xrpl_profit_xrp',
  help: 'Profit generated in XRP',
  registers: [register],
});
```

---

## 🐛 Debugging

### Mode debug

```typescript
const service = new XRPLServiceEnhanced({
  logLevel: 'debug',
  enableLogging: true,
});
```

### Logs détaillés

```
2025-01-29 14:32:15 [DEBUG] Fetching balance
   { "address": "rDonor...ABCD" }

2025-01-29 14:32:16 [DEBUG] Balance retrieved
   { "address": "rDonor...ABCD", "balance": "1000.00 XRP" }
```

---

## 📞 Support

Pour toute question ou problème :

1. Consulter la documentation XRPL : https://xrpl.org/docs.html
2. Ouvrir une issue sur GitHub
3. Contacter l'équipe XRPact Hack For Good

---

## 📄 Licence

MIT License - XRPact Hack For Good Team

---

**Version:** 3.0.0 - Production Ready
**Dernière mise à jour:** 2025-01-29
**Auteur:** XRPact Hack For Good Team

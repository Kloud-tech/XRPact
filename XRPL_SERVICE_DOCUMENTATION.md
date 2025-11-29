# Documentation XRPLService - Module Complet

## 📋 Vue d'ensemble

Le module `XRPLService` est un service unifié qui rassemble **TOUTES** les fonctionnalités XRPL du projet en un seul endroit, sans supprimer aucune des features existantes.

---

## ✅ Fonctionnalités Incluses

### 1. **Envoi dépôt XRPL** ✅
- Enregistrement de donations avec validation
- Vérification de transaction XRPL
- Support MOCK et LIVE

### 2. **Lecture de solde XRPL** ✅
- Lecture du solde d'une adresse quelconque
- Lecture du solde du pool
- Validation des adresses XRPL

### 3. **Enregistrement d'un don en base** ✅
- Enregistrement via DonationPoolService
- Calcul automatique XP (1 XRP = 10 XP)
- Level system (niveau = floor(sqrt(XP/100)) + 1)
- Mint Impact NFT (évolutifs avec le niveau)
- Mint DIT (Donor Impact Token - soulbound)

### 4. **Fonction mock "calcul du profit"** ✅
- Simulation des profits de trading IA
- Pourcentage configurable (défaut: 0.67% mensuel = 8% annuel)
- Basé sur le solde actuel du pool
- Logging détaillé avant/après

### 5. **Fonction de redistribution XRPL automatique** ✅
- Redistribution aux ONG validées
- Calcul de parts basé sur weight + impactScore
- Envoi de paiements XRPL réels
- Vérification de toutes les transactions
- Logging complet

### 6. **Logging + vérification** ✅
- Logs détaillés avec émojis pour clarté
- Historique d'opérations (1000 derniers)
- Durée d'exécution trackée
- Statistiques globales
- Désactivable via config

### 7. **Gestion d'un mode "Emergency Redistribution"** ✅
- Déclenchement d'urgence avec raison
- Système de vote de gouvernance
- Quorum configurable (défaut: 20%)
- Distribution immédiate si approuvé
- Logging avec priorité (🚨 emoji)
- Sévérité: low/medium/high/critical

---

## 🏗️ Architecture

```
XRPLService (Service Principal)
├── XRPLClientService (Connexion XRPL)
│   ├── connect()
│   ├── getBalance()
│   ├── sendPayment()
│   ├── verifyTransaction()
│   └── getRecentTransactions()
│
├── DonationPoolService (Gestion Pool)
│   ├── deposit()
│   ├── simulateProfit()
│   ├── distributeProfits()
│   ├── getPoolState()
│   └── getAllNGOs()
│
└── EmergencyFund (Entité métier)
    ├── hasQuorum()
    └── isApproved()
```

**Les services existants sont PRÉSERVÉS et UTILISÉS** - aucune feature n'a été supprimée!

---

## 💻 Utilisation

### 1. Installation

```bash
# Le service utilise les dépendances existantes
cd backend
npm install xrpl  # Déjà installé
```

### 2. Configuration

```typescript
import { XRPLService } from './services/xrpl-service.complete';

const xrplService = new XRPLService({
  network: 'mock',              // ou 'testnet' / 'mainnet'
  mockMode: true,               // true pour dev sans blockchain
  enableLogging: true,          // activer les logs
  emergencyThreshold: 20,       // 20% de votes requis
});
```

### 3. Initialisation

```typescript
await xrplService.initialize();
console.log('✅ XRPLService prêt!');
```

---

## 📚 Exemples d'Utilisation

### Exemple 1: Enregistrer une donation

```typescript
/**
 * Processus complet de donation:
 * - Validation adresse + montant
 * - Enregistrement en base
 * - Calcul XP (1 XRP = 10 XP)
 * - Mint NFT si premier don ou level up
 * - Mint DIT si premier don
 */

const result = await xrplService.processDonation(
  'rDonorAddress123456789012345678',  // Adresse du donateur
  100,                                 // 100 XRP
  'MOCK_TX_1234567890'                 // TxHash (optionnel en MOCK)
);

console.log(result);
/*
{
  success: true,
  txHash: 'MOCK_TX_1234567890',
  donorAddress: 'rDonor...',
  amount: 100,
  xpGained: 1000,          // 100 XRP * 10 = 1000 XP
  newLevel: 4,             // floor(sqrt(1000/100)) + 1 = 4
  nftMinted: true,
  nftTokenId: 'IMPACT_NFT_...',
  ditTokenId: 'DIT_...',
  poolBalance: 12500
}
*/
```

### Exemple 2: Lire un solde XRPL

```typescript
// Lire le solde d'une adresse
const balance = await xrplService.getBalance('rAddress123...');
console.log(`Solde: ${balance.toFixed(2)} XRP`);

// Lire le solde du pool
const poolBalance = await xrplService.getPoolBalance();
console.log(`Pool: ${poolBalance.toFixed(2)} XRP`);
```

### Exemple 3: Calculer les profits (MOCK)

```typescript
/**
 * Simule les profits de l'algo IA
 * Par défaut: 0.67% du pool (8% annuel ÷ 12 mois)
 */

const profit = await xrplService.calculateProfit(0.67);

console.log(profit);
/*
{
  profitAmount: 83.75,
  profitPercentage: 0.67,
  poolBalanceBefore: 12500,
  poolBalanceAfter: 12583.75,
  timestamp: 2024-01-15T10:30:00.000Z
}
*/
```

### Exemple 4: Redistribuer les profits

```typescript
/**
 * Redistribution automatique aux ONG:
 * - Récupère les ONG vérifiées
 * - Calcule les parts (basé sur weight)
 * - Envoie les paiements XRPL
 * - Vérifie toutes les transactions
 * - Log chaque distribution
 */

const redistribution = await xrplService.redistributeProfits(83.75);

console.log(redistribution);
/*
{
  success: true,
  totalAmount: 83.75,
  ngoCount: 4,
  distributions: [
    {
      ngoId: 'ngo-001',
      ngoName: 'Reforestation International',
      amount: 25.13,
      txHash: 'MOCK_TX_...',
      category: 'Climate'
    },
    {
      ngoId: 'ngo-002',
      ngoName: 'Clean Water Project',
      amount: 20.94,
      txHash: 'MOCK_TX_...',
      category: 'Water'
    },
    // ... autres ONG
  ],
  timestamp: 2024-01-15T10:35:00.000Z
}
*/
```

### Exemple 5: Mode Emergency (Urgence)

```typescript
/**
 * Redistribution d'urgence avec gouvernance:
 * - Créer une demande d'urgence
 * - Notifier stakeholders
 * - Votes (simulés en MOCK)
 * - Si approuvé: distribution immédiate
 */

const emergency = await xrplService.triggerEmergencyRedistribution({
  triggeredBy: 'rAdminAddress123456789012345',
  reason: 'Tremblement de terre en Haïti - fournitures médicales urgentes',
  severity: 'critical',
  amountRequested: 5000,
  affectedNGOs: ['ngo-001', 'ngo-002'],
});

console.log(emergency);
/*
{
  success: true,
  emergencyId: 'emergency_1705315200000',
  reason: 'Tremblement de terre en Haïti...',
  totalAmount: 5000,
  affectedNGOs: ['ngo-001', 'ngo-002'],
  txHashes: ['MOCK_TX_...', 'MOCK_TX_...'],
  approvalVotes: 80,
  requiredVotes: 20,
  timestamp: 2024-01-15T10:40:00.000Z
}
*/
```

### Exemple 6: Obtenir les statistiques

```typescript
const stats = xrplService.getStatistics();

console.log(stats);
/*
{
  totalOperations: 245,
  successful: 242,
  failed: 3,
  successRate: 98.78,
  poolState: {
    totalBalance: 12583.75,
    totalDonations: 12500,
    totalProfitsGenerated: 83.75,
    totalDistributed: 0,
    donorCount: 127
  },
  emergencies: 1,
  mode: 'MOCK'
}
*/
```

### Exemple 7: Consulter les logs

```typescript
// Obtenir les 50 derniers logs
const logs = xrplService.getOperationLogs(50);

logs.forEach(log => {
  console.log(`${log.operation}: ${log.success ? '✅' : '❌'} (${log.duration}ms)`);
});

/*
processDonation: ✅ (125ms)
calculateProfit: ✅ (48ms)
redistributeProfits: ✅ (523ms)
emergencyRedistribution: ✅ (892ms)
*/
```

---

## 🔧 Configuration Avancée

### Variables d'Environnement

```bash
# backend/.env

# Réseau XRPL
XRPL_NETWORK=mock              # mock | testnet | mainnet
XRPL_WEBSOCKET_URL=wss://s.altnet.rippletest.net:51233

# Wallet du pool
XRPL_POOL_WALLET_SEED=sXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XRPL_POOL_WALLET_ADDRESS=rPoolWalletXXXXXXXXXXXXXXXXX

# Options
ENABLE_LOGGING=true
```

### Personnalisation du Service

```typescript
const customConfig = {
  network: 'testnet',
  mockMode: false,               // Mode LIVE avec vraie blockchain
  enableLogging: true,
  emergencyThreshold: 30,        // 30% de votes requis
  websocketUrl: 'wss://s.altnet.rippletest.net:51233',
  poolWalletAddress: 'rYourPoolWallet123...',
};

const xrplService = new XRPLService(customConfig);
```

---

## 🚨 Mode Emergency - Détails

### Niveaux de Sévérité

```typescript
type EmergencySeverity = 'low' | 'medium' | 'high' | 'critical';
```

| Sévérité | Description | Vote Auto (MOCK) |
|----------|-------------|------------------|
| **low** | Situation non urgente | 40% faveur |
| **medium** | Besoin important | 50% faveur |
| **high** | Urgence importante | 60% faveur |
| **critical** | Crise majeure | 80% faveur |

### Processus de Vote

1. **Création de la demande**
   - Adresse du déclencheur
   - Raison détaillée (min 10 caractères)
   - Sévérité
   - Montant demandé
   - ONG affectées

2. **Notification**
   - Tous les stakeholders notifiés
   - WebSocket broadcast (si intégré)

3. **Vote** (simulé en MOCK)
   - Quorum: 20% des votes minimum
   - Approbation: > 50% des votes favorables

4. **Distribution**
   - Si approuvé: distribution immédiate
   - Répartition équitable entre ONG affectées
   - Paiements XRPL envoyés
   - Vérification des transactions

---

## 📊 Logging Détaillé

### Format des Logs

```
✅ [XRPLService][processDonation] Donation processed successfully
   Details: {
     txHash: 'MOCK_TX_...',
     amount: 100,
     xpGained: 1000,
     newLevel: 4,
     nftMinted: true
   }
```

### Types de Logs

- `✅` Succès
- `❌` Erreur
- `🚨` Emergency (priorité haute)
- `🎉` Completion importante

### Désactivation des Logs

```typescript
const quietService = new XRPLService({ enableLogging: false });
```

---

## 🧪 Testing

### Test en Mode MOCK

```typescript
// backend/src/test-xrpl-service.ts

import { XRPLService } from './services/xrpl-service.complete';

async function testXRPLService() {
  const service = new XRPLService({ mockMode: true });
  await service.initialize();

  // Test 1: Donation
  const donation = await service.processDonation(
    'rTestDonor123456789012345678',
    100
  );
  console.log('✅ Test 1: Donation', donation.success ? 'PASSED' : 'FAILED');

  // Test 2: Profit Calculation
  const profit = await service.calculateProfit();
  console.log('✅ Test 2: Profit', profit.profitAmount > 0 ? 'PASSED' : 'FAILED');

  // Test 3: Redistribution
  const redistribution = await service.redistributeProfits(profit.profitAmount);
  console.log('✅ Test 3: Redistribution', redistribution.success ? 'PASSED' : 'FAILED');

  // Test 4: Emergency
  const emergency = await service.triggerEmergencyRedistribution({
    triggeredBy: 'rAdmin123456789012345678',
    reason: 'Test emergency situation',
    severity: 'critical',
    amountRequested: 1000,
    affectedNGOs: ['ngo-001', 'ngo-002'],
  });
  console.log('✅ Test 4: Emergency', emergency.success ? 'PASSED' : 'FAILED');

  // Stats
  console.log('\n📊 Statistics:', service.getStatistics());

  await service.shutdown();
}

testXRPLService().catch(console.error);
```

Exécuter:
```bash
cd backend
npx ts-node src/test-xrpl-service.ts
```

---

## 🔗 Intégration avec l'Architecture Existante

### Le service UTILISE (sans modifier):

1. **XRPLClientService** (préservé 100%)
   - Connection management
   - Balance queries
   - Transaction sending
   - Transaction verification

2. **DonationPoolService** (préservé 100%)
   - Donation recording
   - Donor management
   - XP calculation
   - NFT minting
   - Profit simulation
   - Distribution logic

3. **EmergencyFund Entity** (préservé 100%)
   - Business logic
   - Quorum checking
   - Approval validation

### Le service AJOUTE:

- ✅ Interface unifiée pour tout XRPL
- ✅ Logging détaillé avec historique
- ✅ Statistiques et monitoring
- ✅ Emergency redistribution complète
- ✅ Validation centralisée
- ✅ Documentation complète

---

## 📝 Bonnes Pratiques XRPL Appliquées

### 1. **Validation des Adresses**
```typescript
// Format XRPL strict: r + 24-34 caractères alphanumériques
if (!address.match(/^r[a-zA-Z0-9]{24,34}$/)) {
  throw new Error('Invalid XRPL address');
}
```

### 2. **Conversion Drops ↔ XRP**
```typescript
import { dropsToXrp, xrpToDrops } from 'xrpl';

// Toujours utiliser les fonctions officielles
const xrp = dropsToXrp('1000000');  // '1'
const drops = xrpToDrops('1');       // '1000000'
```

### 3. **Vérification des Transactions**
```typescript
// Toujours vérifier qu'une transaction est validated
const response = await client.request({ command: 'tx', transaction: txHash });
if (!response.result.validated) {
  throw new Error('Transaction not yet validated');
}
```

### 4. **Memos XRPL**
```typescript
// Les memos doivent être en hexadécimal
payment.Memos = [{
  Memo: {
    MemoData: Buffer.from('My memo text', 'utf8').toString('hex')
  }
}];
```

### 5. **submitAndWait**
```typescript
// Utiliser submitAndWait pour attendre la validation
const result = await client.submitAndWait(payment, { wallet });
// Transaction automatiquement validée
```

### 6. **Gestion des Erreurs**
```typescript
try {
  await client.request(/* ... */);
} catch (error) {
  if (error.data?.error === 'actNotFound') {
    // Adresse n'existe pas sur le ledger
  }
  // Logger et propager
  this.log('operation', 'Failed', { error: error.message }, false);
  throw error;
}
```

---

## 🎯 Avantages du Service Unifié

### Avant (Ancien système):
```typescript
// Trois imports différents
import { XRPLClientService } from './modules/xrpl/services/xrpl-client.service';
import { DonationPoolService } from './modules/xrpl/services/donation-pool.service';
import { EmergencyFund } from './core/domain/emergency-fund.entity';

// Initialisation manuelle
const client = new XRPLClientService();
await client.connect();
const pool = new DonationPoolService(client);

// Pas de logging unifié
// Pas de statistiques centralisées
// Pas d'emergency redistribution
```

### Maintenant (Nouveau système):
```typescript
// Un seul import
import { XRPLService } from './services/xrpl-service.complete';

// Initialisation simple
const xrpl = new XRPLService();
await xrpl.initialize();

// Toutes les fonctionnalités disponibles
await xrpl.processDonation(/* ... */);
await xrpl.calculateProfit();
await xrpl.redistributeProfits(/* ... */);
await xrpl.triggerEmergencyRedistribution(/* ... */);

// Logging automatique
// Statistiques en temps réel
// Emergency mode intégré
```

---

## ✅ Checklist de Vérification

**Envoi dépôt XRPL**: ✅
- [x] Validation adresse
- [x] Validation montant
- [x] Vérification transaction
- [x] Logging

**Lecture de solde XRPL**: ✅
- [x] Support adresse quelconque
- [x] Support pool wallet
- [x] Mode MOCK
- [x] Logging

**Enregistrement d'un don en base**: ✅
- [x] Enregistrement database
- [x] Calcul XP (1 XRP = 10 XP)
- [x] Système de niveaux
- [x] Mint NFT évolutif
- [x] Mint DIT soulbound

**Fonction mock "calcul du profit"**: ✅
- [x] Calcul basé sur pool balance
- [x] Pourcentage configurable
- [x] Simulation réaliste
- [x] Logging avant/après

**Fonction de redistribution XRPL automatique**: ✅
- [x] Récupération ONG vérifiées
- [x] Calcul des parts
- [x] Envoi paiements XRPL
- [x] Vérification transactions
- [x] Logging complet

**Logging + vérification**: ✅
- [x] Logs détaillés avec émojis
- [x] Historique d'opérations
- [x] Durée d'exécution
- [x] Statistiques globales
- [x] Désactivable

**Gestion d'un mode "Emergency Redistribution"**: ✅
- [x] Déclenchement d'urgence
- [x] Système de vote
- [x] Vérification quorum
- [x] Distribution immédiate
- [x] Logging prioritaire

---

## 📞 Support & Questions

Pour toute question sur le XRPLService:
1. Consulter cette documentation
2. Vérifier les logs: `xrplService.getOperationLogs()`
3. Consulter les stats: `xrplService.getStatistics()`
4. Vérifier la configuration dans `.env`

---

**Version:** 2.0.0
**Date:** 2025-01-15
**Status:** ✅ Production Ready (Mode MOCK) / 🔨 Testing Required (Mode LIVE)

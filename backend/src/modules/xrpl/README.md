# 🔗 XRPL Core Module

Module backend responsable de toutes les opérations XRPL pour le projet Impact Fund.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture](#architecture)
- [Services](#services)
- [API Endpoints](#api-endpoints)
- [Mode MOCK vs LIVE](#mode-mock-vs-live)
- [Installation](#installation)
- [Tests](#tests)
- [Hooks/Xahau](#hooksxahau)

---

## 🎯 Vue d'ensemble

Le module XRPL gère:

✅ **Donations** - Enregistrement des dons dans le pool
✅ **Profit Simulation** - Simulation des profits de trading AI
✅ **Distribution** - Redistribution automatique aux ONG
✅ **Impact Oracle** - Validation des ONG et calcul de scores
✅ **NFT Management** - Mint et évolution des Impact NFTs
✅ **Donor Tracking** - Suivi des donateurs (XP, levels, badges)

**Mode Hackathon:** Fonctionne en mode MOCK par défaut (pas besoin de vraie blockchain).

---

## 🏗️ Architecture

```
backend/src/modules/xrpl/
├── types/
│   └── xrpl.types.ts           # Types TypeScript
├── services/
│   ├── xrpl-client.service.ts  # Connexion XRPL
│   ├── donation-pool.service.ts # Gestion du pool
│   └── impact-oracle.service.ts # Validation ONG
├── controllers/
│   └── xrpl.controller.ts      # API Endpoints
├── hooks/
│   └── ImpactFundHook.example.ts # Proof of concept
├── xrpl.routes.ts              # Routes Express
├── test-xrpl-module.ts         # Script de test
├── API_CONTRACT.md             # Documentation API
└── README.md                   # Ce fichier
```

---

## 🛠️ Services

### 1. XRPLClientService

**Responsabilité:** Connexion au réseau XRPL et opérations de base.

**Fonctions principales:**

```typescript
connect(): Promise<void>
disconnect(): Promise<void>
getBalance(address: string): Promise<number>
sendPayment(destination: string, amount: number, memo?: string): Promise<XRPLTransaction>
verifyTransaction(txHash: string): Promise<boolean>
getRecentTransactions(address: string, limit?: number): Promise<XRPLTransaction[]>
```

**Mode MOCK:**
- Toutes les opérations sont simulées
- Pas de connexion réseau requise
- Parfait pour le développement et la démo

### 2. DonationPoolService

**Responsabilité:** Gestion du pool de donations.

**Fonctions principales:**

```typescript
deposit(request: DepositRequest): Promise<DepositResponse>
simulateProfit(profitPercentage?: number): Promise<number>
distributeProfits(profitAmount: number): Promise<ProfitDistributionResult>
getPoolState(): PoolState
getDonor(address: string): DonorInfo | undefined
getAllNGOs(): NGO[]
getValidatedNGOs(): NGO[]
```

**Processus de donation:**
1. Vérifier la transaction XRPL
2. Mettre à jour le solde du pool
3. Mettre à jour les infos du donateur
4. Calculer et attribuer XP (1 XRP = 10 XP)
5. Mint NFT si première donation ou level up
6. Mint DIT (soulbound token) si première donation

### 3. ImpactOracleService

**Responsabilité:** Validation des ONG et calcul de scores d'impact.

**Fonctions principales:**

```typescript
validateNGO(request: NGOValidationRequest): Promise<NGOValidationResult>
getImpactScore(ngoId: string): Promise<number>
getTopNGOs(limit?: number): Promise<NGOValidationResult[]>
```

**Critères de validation:**
- ✅ Enregistrement officiel (25 pts)
- ✅ Transparence financière (25 pts)
- ✅ Métriques d'impact (25 pts)
- ✅ Certifications (25 pts)
- ⚠️  Red flags (pénalités)

**Score minimum:** 60/100 pour être validée

---

## 📡 API Endpoints

Voir [API_CONTRACT.md](./API_CONTRACT.md) pour la documentation complète.

**Résumé:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/deposit` | Enregistrer une donation |
| POST | `/simulate-profit` | Simuler des profits |
| POST | `/distribute` | Distribuer les profits |
| GET | `/pool` | État du pool |
| GET | `/donor/:address` | Infos donateur |
| GET | `/ngos` | Liste des ONG |
| POST | `/validate-ngo` | Valider une ONG |
| GET | `/balance/:address` | Solde XRPL |

**Base URL:** `http://localhost:3000/api/xrpl`

---

## 🔀 Mode MOCK vs LIVE

### Mode MOCK (Développement)

**Quand:** Par défaut, si `XRPL_NETWORK=mock` ou pas de `XRPL_WEBSOCKET_URL`

**Caractéristiques:**
- ✅ Pas de connexion XRPL requise
- ✅ Données simulées
- ✅ Idéal pour démo hackathon
- ✅ Tous les txHash préfixés par `MOCK_`
- ✅ Balances générées aléatoirement
- ✅ Transactions toujours validées

**Usage:**
```bash
# .env
XRPL_NETWORK=mock
```

### Mode LIVE (Production)

**Quand:** Si `XRPL_NETWORK=testnet` ou `mainnet` et `XRPL_WEBSOCKET_URL` défini

**Caractéristiques:**
- ✅ Connexion au vrai réseau XRPL
- ✅ Vraies transactions blockchain
- ✅ Vérification des signatures
- ✅ Nécessite wallet seed configuré

**Usage:**
```bash
# .env
XRPL_NETWORK=testnet
XRPL_WEBSOCKET_URL=wss://s.altnet.rippletest.net:51233
XRPL_POOL_WALLET_SEED=sEdXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XRPL_POOL_WALLET_ADDRESS=rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 🚀 Installation

### Prérequis

- Node.js 18+
- npm 9+

### Étapes

1. **Installer les dépendances**

```bash
cd backend
npm install
```

2. **Configurer les variables d'environnement**

```bash
cp .env.example .env
# Éditer .env avec vos valeurs
```

3. **Démarrer le serveur**

```bash
npm run dev
```

Le module XRPL sera accessible sur `http://localhost:3000/api/xrpl`

---

## 🧪 Tests

### Test complet du module

```bash
npx tsx backend/src/modules/xrpl/test-xrpl-module.ts
```

**Ce script teste:**
1. ✅ Connexion XRPL Client
2. ✅ Enregistrement de donations
3. ✅ Calcul de XP et levels
4. ✅ Mint de NFTs
5. ✅ Simulation de profits
6. ✅ Distribution aux ONG
7. ✅ Validation Impact Oracle

### Tests via cURL

```bash
# Health check
curl http://localhost:3000/api/xrpl/health

# Donation
curl -X POST http://localhost:3000/api/xrpl/deposit \
  -H "Content-Type: application/json" \
  -d '{"donorAddress":"rTest123","amount":100}'

# Pool state
curl http://localhost:3000/api/xrpl/pool

# Simulate profit
curl -X POST http://localhost:3000/api/xrpl/simulate-profit \
  -H "Content-Type: application/json" \
  -d '{"profitPercentage":0.67}'

# Distribute
curl -X POST http://localhost:3000/api/xrpl/distribute \
  -H "Content-Type: application/json" \
  -d '{"profitAmount":1000}'
```

---

## 🪝 Hooks/Xahau

### Proof of Concept

Le fichier `hooks/ImpactFundHook.example.ts` contient un exemple de Hook XRPL qui pourrait être déployé sur Xahau.

**Fonctionnalités du Hook:**
- Détecte les donations entrantes
- Émet des événements pour le backend
- Déclenche le mint de NFTs
- Gère les distributions automatiques

**Pour le hackathon:**
- ✅ Montrer ce code comme proof of concept
- ✅ Expliquer au jury comment ça fonctionnerait
- ❌ Pas besoin de déployer un vrai hook

**Pour déployer un vrai hook:**
1. Installer XRPL Hooks Builder
2. Compiler le code C en WebAssembly
3. Déployer sur le testnet Hooks V3 ou Xahau
4. Utiliser `SetHook` transaction

**Documentation:** https://xrpl-hooks.readme.io/

---

## 📊 Données Mock

### ONG initialisées par défaut

Le module initialise 4 ONG par défaut en mode MOCK:

1. **Reforestation International** (Climate, Score: 95, Weight: 30%)
2. **Clean Water Project** (Water, Score: 92, Weight: 25%)
3. **Education for All** (Education, Score: 90, Weight: 25%)
4. **Global Health Initiative** (Health, Score: 88, Weight: 20%)

### Exemples de données

**Donation:**
```json
{
  "donorAddress": "rDonor123",
  "amount": 100
}
```

**Response:**
```json
{
  "success": true,
  "txHash": "MOCK_DEPOSIT_1234567890_abc",
  "nftMinted": true,
  "xpGained": 1000,
  "newLevel": 4,
  "poolBalance": 125100
}
```

---

## 🎯 Pour l'équipe frontend

### Intégration simple

```typescript
// Faire une donation
const donate = async (address: string, amount: number) => {
  const response = await fetch('http://localhost:3000/api/xrpl/deposit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ donorAddress: address, amount }),
  });

  return response.json();
};

// Obtenir le pool state
const getPoolState = async () => {
  const response = await fetch('http://localhost:3000/api/xrpl/pool');
  const data = await response.json();
  return data.pool;
};

// Obtenir les infos d'un donateur
const getDonor = async (address: string) => {
  const response = await fetch(`http://localhost:3000/api/xrpl/donor/${address}`);
  const data = await response.json();
  return data.donor;
};
```

### Types TypeScript

Importez les types depuis `backend/src/modules/xrpl/types/xrpl.types.ts` pour avoir l'autocomplétion.

---

## 🐛 Troubleshooting

### Le serveur ne démarre pas

```bash
# Vérifier les dépendances
cd backend
npm install

# Vérifier les ports
lsof -i :3000
```

### Erreur "XRPL client not connected"

Le module fonctionne en mode MOCK par défaut. Cette erreur ne devrait pas apparaître.

Si elle apparaît en mode LIVE:
1. Vérifier que `XRPL_WEBSOCKET_URL` est correct
2. Vérifier la connexion internet
3. Essayer un autre node XRPL

### Les donations ne s'enregistrent pas

1. Vérifier que le serveur est démarré
2. Vérifier les logs dans la console
3. Tester avec cURL pour isoler le problème

---

## 📝 Notes importantes

1. **Mode MOCK par défaut**: Le module fonctionne en mode MOCK par défaut. Parfait pour le hackathon.

2. **Tous les endpoints retournent JSON**: Facile à intégrer avec React/fetch.

3. **XP et Levels automatiques**: Pas besoin de les calculer côté frontend.

4. **NFTs mintés automatiquement**: Le backend s'occupe de tout.

5. **CORS activé**: Pas de problème pour appeler depuis le frontend.

6. **Error handling**: Tous les endpoints retournent des erreurs au format JSON.

---

## 🤝 Contribution

Pour ajouter de nouvelles fonctionnalités:

1. Créer un nouveau service dans `services/`
2. Ajouter les types dans `types/xrpl.types.ts`
3. Créer les endpoints dans `controllers/xrpl.controller.ts`
4. Ajouter les routes dans `xrpl.routes.ts`
5. Documenter dans `API_CONTRACT.md`
6. Ajouter des tests dans `test-xrpl-module.ts`

---

## 📞 Support

Questions? Consultez:
- [API_CONTRACT.md](./API_CONTRACT.md) - Documentation API complète
- [test-xrpl-module.ts](./test-xrpl-module.ts) - Exemples d'usage
- [XRPL Docs](https://xrpl.org/docs) - Documentation officielle XRPL

---

**Built with ❤️ for XRPL Hackathon 2025**

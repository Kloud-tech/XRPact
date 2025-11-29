# 📡 XRPL Module - API Contract

## Base URL

```
http://localhost:3000/api/xrpl
```

---

## 🔹 Endpoints

### 1. Health Check

**GET** `/health`

Vérifier que le module XRPL est actif.

**Response:**

```json
{
  "status": "ok",
  "mode": "MOCK" | "LIVE",
  "connected": true,
  "pool": {
    "balance": 125000,
    "donors": 342
  },
  "timestamp": "2025-11-29T10:00:00.000Z"
}
```

---

### 2. Deposit (Donation)

**POST** `/deposit`

Enregistrer une donation dans le pool.

**Request Body:**

```json
{
  "donorAddress": "rDonorAddress123...",
  "amount": 100,
  "signature": "optional_xrpl_signature"
}
```

**Response (Success):**

```json
{
  "success": true,
  "txHash": "MOCK_DEPOSIT_1234567890_abc123",
  "nftMinted": true,
  "nftTokenId": "IMPACT_NFT_rDonor_1234567890",
  "xpGained": 1000,
  "newLevel": 4,
  "poolBalance": 125100
}
```

**Response (Error):**

```json
{
  "error": "Invalid amount",
  "message": "Amount must be positive"
}
```

---

### 3. Simulate Profit

**POST** `/simulate-profit`

Simuler des profits générés par le trading AI.

**Request Body:**

```json
{
  "profitPercentage": 0.67
}
```

**Response:**

```json
{
  "success": true,
  "profitGenerated": 838.75,
  "profitPercentage": 0.67,
  "poolBalance": 125838.75,
  "totalProfitsGenerated": 45838.75
}
```

---

### 4. Distribute Profits

**POST** `/distribute`

Distribuer les profits aux ONG validées.

**Request Body:**

```json
{
  "profitAmount": 838.75
}
```

**Response:**

```json
{
  "success": true,
  "totalProfit": 838.75,
  "distributions": [
    {
      "id": "DIST_1234567890_ngo-001",
      "ngoId": "ngo-001",
      "ngoName": "Reforestation International",
      "amount": 251.62,
      "txHash": "MOCK_TX_1234567890_xyz",
      "timestamp": "2025-11-29T10:00:00.000Z"
    },
    {
      "id": "DIST_1234567890_ngo-002",
      "ngoId": "ngo-002",
      "ngoName": "Clean Water Project",
      "amount": 209.69,
      "txHash": "MOCK_TX_1234567891_abc",
      "timestamp": "2025-11-29T10:00:01.000Z"
    }
  ],
  "txHashes": [
    "MOCK_TX_1234567890_xyz",
    "MOCK_TX_1234567891_abc"
  ]
}
```

---

### 5. Get Pool State

**GET** `/pool`

Obtenir l'état actuel du pool de donations.

**Response:**

```json
{
  "success": true,
  "pool": {
    "totalBalance": 125000,
    "totalDonations": 180000,
    "totalProfitsGenerated": 45000,
    "totalDistributed": 100000,
    "lastTradingRun": "2025-11-29T09:00:00.000Z",
    "donorCount": 342
  }
}
```

---

### 6. Get Donor Info

**GET** `/donor/:address`

Obtenir les informations d'un donateur.

**Example:** `/donor/rDonorAddress123`

**Response (Success):**

```json
{
  "success": true,
  "donor": {
    "address": "rDonorAddress123",
    "totalDonated": 5000,
    "xp": 50000,
    "level": 8,
    "nftTokenId": "IMPACT_NFT_rDonor_123",
    "ditTokenId": "DIT_rDonor_123",
    "firstDonationDate": "2025-01-15T10:00:00.000Z",
    "lastDonationDate": "2025-11-29T10:00:00.000Z",
    "donationCount": 12
  }
}
```

**Response (Not Found):**

```json
{
  "error": "Donor not found",
  "message": "No donor found with address rDonorAddress123"
}
```

---

### 7. Get NGOs List

**GET** `/ngos`

Lister toutes les ONG ou seulement les validées.

**Query Parameters:**

- `validated` (optional): `true` pour obtenir seulement les ONG validées

**Example:** `/ngos?validated=true`

**Response:**

```json
{
  "success": true,
  "ngos": [
    {
      "id": "ngo-001",
      "name": "Reforestation International",
      "walletAddress": "rNGO1Address123",
      "category": 0,
      "impactScore": 95,
      "weight": 0.3,
      "totalReceived": 12000,
      "verified": true,
      "certifications": ["UN SDG Partner", "Gold Standard Certified"],
      "website": "https://reforest-intl.org",
      "description": "Global reforestation and carbon offset projects",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-11-29T10:00:00.000Z"
    }
  ],
  "total": 4
}
```

---

### 8. Validate NGO (Impact Oracle)

**POST** `/validate-ngo`

Valider une ONG via l'Impact Oracle.

**Request Body:**

```json
{
  "ngoId": "ngo-005",
  "registrationNumber": "UN-RF-2019-001",
  "website": "https://new-ngo.org",
  "country": "KE"
}
```

**Response:**

```json
{
  "success": true,
  "validation": {
    "isValid": true,
    "impactScore": 87,
    "certifications": ["UN SDG Partner", "GiveWell Recommended"],
    "redFlags": [],
    "dataSource": "UN Data + OECD + Charity Navigator (simulated)",
    "lastUpdated": "2025-11-29T10:00:00.000Z"
  }
}
```

---

### 9. Get Balance

**GET** `/balance/:address`

Obtenir le solde d'une adresse XRPL.

**Example:** `/balance/rAddress123`

**Response:**

```json
{
  "success": true,
  "address": "rAddress123",
  "balance": 5432.12
}
```

---

## 🔹 Error Responses

Tous les endpoints retournent des erreurs au format JSON:

**400 Bad Request:**

```json
{
  "error": "Missing required fields",
  "message": "donorAddress and amount are required"
}
```

**404 Not Found:**

```json
{
  "error": "Donor not found",
  "message": "No donor found with address rAddress123"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Deposit failed",
  "message": "Internal server error"
}
```

---

## 🔹 Mode MOCK vs LIVE

Le module XRPL fonctionne en 2 modes:

### Mode MOCK (Développement)

- ✅ Pas de connexion XRPL requise
- ✅ Données simulées
- ✅ Idéal pour démo hackathon
- ✅ Activé par défaut si `XRPL_NETWORK=mock` ou pas de `XRPL_WEBSOCKET_URL`

**Comportement:**

- Tous les txHash sont préfixés par `MOCK_`
- Les balances sont générées aléatoirement
- Les transactions sont toujours validées
- Les ONG sont initialisées automatiquement

### Mode LIVE (Production)

- ✅ Connexion au vrai réseau XRPL (testnet ou mainnet)
- ✅ Vraies transactions blockchain
- ✅ Vérification des signatures
- ✅ Nécessite wallet seed configuré

**Configuration:**

```env
XRPL_NETWORK=testnet
XRPL_WEBSOCKET_URL=wss://s.altnet.rippletest.net:51233
XRPL_POOL_WALLET_SEED=sEdXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XRPL_POOL_WALLET_ADDRESS=rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 🔹 Usage Examples (Frontend)

### Deposit Donation

```typescript
const response = await fetch('http://localhost:3000/api/xrpl/deposit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    donorAddress: 'rDonorAddress123',
    amount: 100,
  }),
});

const result = await response.json();
console.log('Donation successful:', result.txHash);
console.log('XP gained:', result.xpGained);
console.log('New level:', result.newLevel);
```

### Get Pool Stats

```typescript
const response = await fetch('http://localhost:3000/api/xrpl/pool');
const data = await response.json();

console.log('Pool balance:', data.pool.totalBalance);
console.log('Total donors:', data.pool.donorCount);
```

### Distribute Profits

```typescript
const response = await fetch('http://localhost:3000/api/xrpl/distribute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    profitAmount: 1000,
  }),
});

const result = await response.json();
console.log('Distributed to', result.distributions.length, 'NGOs');
result.distributions.forEach((d) => {
  console.log(`${d.ngoName}: ${d.amount} XRP`);
});
```

---

## 🔹 Testing with cURL

```bash
# Health check
curl http://localhost:3000/api/xrpl/health

# Deposit
curl -X POST http://localhost:3000/api/xrpl/deposit \
  -H "Content-Type: application/json" \
  -d '{"donorAddress":"rTest123","amount":100}'

# Get pool state
curl http://localhost:3000/api/xrpl/pool

# Get NGOs
curl http://localhost:3000/api/xrpl/ngos?validated=true

# Simulate profit
curl -X POST http://localhost:3000/api/xrpl/simulate-profit \
  -H "Content-Type: application/json" \
  -d '{"profitPercentage":0.67}'

# Distribute profits
curl -X POST http://localhost:3000/api/xrpl/distribute \
  -H "Content-Type: application/json" \
  -d '{"profitAmount":1000}'
```

---

## 🔹 Notes pour l'équipe frontend

1. **Mode MOCK**: Le module fonctionne en mode mock par défaut. Pas besoin de vraie blockchain pour tester.

2. **Tous les endpoints retournent JSON**: Facile à intégrer avec React/fetch.

3. **XP et Levels**: Automatiquement calculés lors des donations (1 XRP = 10 XP).

4. **NFTs**: Mintés automatiquement lors de la première donation et à chaque level up.

5. **Error Handling**: Tous les endpoints retournent des erreurs au format JSON avec `error` et `message`.

6. **CORS**: Activé par défaut, donc pas de problème pour appeler depuis `localhost:5173`.

---

**Happy Coding! 🚀**

# 🧪 Test XRPL Endpoints - Guide Rapide

## 🎯 URLs de Base

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **XRPL Module**: http://localhost:3000/api/xrpl

---

## ✅ Tests Rapides (copier-coller)

### 1. Health Check

```bash
curl http://localhost:3000/api/xrpl/health
```

**Résultat attendu:**
```json
{
  "status": "ok",
  "mode": "MOCK",
  "connected": true,
  "pool": { "balance": 0, "donors": 0 }
}
```

---

### 2. Donation (100 XRP)

```bash
curl -X POST http://localhost:3000/api/xrpl/deposit \
  -H "Content-Type: application/json" \
  -d '{"donorAddress":"rDonor123","amount":100}'
```

**Résultat attendu:**
```json
{
  "success": true,
  "txHash": "MOCK_DEPOSIT_...",
  "nftMinted": true,
  "xpGained": 1000,
  "newLevel": 4,
  "poolBalance": 100
}
```

---

### 3. Pool State

```bash
curl http://localhost:3000/api/xrpl/pool
```

**Résultat attendu:**
```json
{
  "success": true,
  "pool": {
    "totalBalance": 100,
    "totalDonations": 100,
    "donorCount": 1
  }
}
```

---

### 4. Liste des ONG

```bash
curl http://localhost:3000/api/xrpl/ngos
```

**Résultat attendu:**
```json
{
  "success": true,
  "ngos": [
    {
      "id": "ngo-001",
      "name": "Reforestation International",
      "impactScore": 95,
      "weight": 0.3
    }
  ],
  "total": 4
}
```

---

### 5. Simuler Profit (0.67%)

```bash
curl -X POST http://localhost:3000/api/xrpl/simulate-profit \
  -H "Content-Type: application/json" \
  -d '{"profitPercentage":0.67}'
```

**Résultat attendu:**
```json
{
  "success": true,
  "profitGenerated": 0.67,
  "poolBalance": 100.67
}
```

---

### 6. Distribuer Profits (500 XRP)

```bash
curl -X POST http://localhost:3000/api/xrpl/distribute \
  -H "Content-Type: application/json" \
  -d '{"profitAmount":500}'
```

**Résultat attendu:**
```json
{
  "success": true,
  "totalProfit": 500,
  "distributions": [
    {
      "ngoName": "Reforestation International",
      "amount": 150,
      "txHash": "MOCK_TX_..."
    }
  ]
}
```

---

### 7. Infos Donateur

```bash
curl http://localhost:3000/api/xrpl/donor/rDonor123
```

**Résultat attendu:**
```json
{
  "success": true,
  "donor": {
    "address": "rDonor123",
    "totalDonated": 100,
    "xp": 1000,
    "level": 4,
    "nftTokenId": "IMPACT_NFT_...",
    "donationCount": 1
  }
}
```

---

### 8. Valider une ONG

```bash
curl -X POST http://localhost:3000/api/xrpl/validate-ngo \
  -H "Content-Type: application/json" \
  -d '{"ngoId":"ngo-001","registrationNumber":"UN-RF-2019-001","website":"https://example.org"}'
```

**Résultat attendu:**
```json
{
  "success": true,
  "validation": {
    "isValid": true,
    "impactScore": 87,
    "certifications": ["UN SDG Partner", "GiveWell Recommended"],
    "redFlags": []
  }
}
```

---

### 9. Balance XRPL

```bash
curl http://localhost:3000/api/xrpl/balance/rAddress123
```

**Résultat attendu:**
```json
{
  "success": true,
  "address": "rAddress123",
  "balance": 5432.12
}
```

---

## 🎬 Scénario de Démo Complet

### Étape 1: Vérifier que tout fonctionne

```bash
curl http://localhost:3000/api/xrpl/health
```

### Étape 2: Faire 3 donations

```bash
# Donation 1: 100 XRP
curl -X POST http://localhost:3000/api/xrpl/deposit \
  -H "Content-Type: application/json" \
  -d '{"donorAddress":"rDonor1","amount":100}'

# Donation 2: 500 XRP
curl -X POST http://localhost:3000/api/xrpl/deposit \
  -H "Content-Type: application/json" \
  -d '{"donorAddress":"rDonor2","amount":500}'

# Donation 3: 200 XRP (même donateur que #1)
curl -X POST http://localhost:3000/api/xrpl/deposit \
  -H "Content-Type: application/json" \
  -d '{"donorAddress":"rDonor1","amount":200}'
```

### Étape 3: Vérifier le pool

```bash
curl http://localhost:3000/api/xrpl/pool
# Devrait montrer: balance=800, donors=2
```

### Étape 4: Simuler un profit

```bash
curl -X POST http://localhost:3000/api/xrpl/simulate-profit \
  -H "Content-Type: application/json" \
  -d '{"profitPercentage":0.67}'
# Profit ≈ 5.36 XRP
```

### Étape 5: Distribuer aux ONG

```bash
curl -X POST http://localhost:3000/api/xrpl/distribute \
  -H "Content-Type: application/json" \
  -d '{"profitAmount":5.36}'
# Distribue aux 4 ONG selon leurs weights
```

### Étape 6: Vérifier les ONG

```bash
curl http://localhost:3000/api/xrpl/ngos
# Chaque ONG devrait avoir totalReceived > 0
```

### Étape 7: Vérifier un donateur

```bash
curl http://localhost:3000/api/xrpl/donor/rDonor1
# Devrait montrer: totalDonated=300, level plus élevé
```

---

## 🖥️ Depuis le navigateur

Ouvrez la console du navigateur (F12) et testez:

```javascript
// Health check
fetch('http://localhost:3000/api/xrpl/health')
  .then(r => r.json())
  .then(console.log);

// Donation
fetch('http://localhost:3000/api/xrpl/deposit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    donorAddress: 'rDonor123',
    amount: 100
  })
})
  .then(r => r.json())
  .then(console.log);

// Pool state
fetch('http://localhost:3000/api/xrpl/pool')
  .then(r => r.json())
  .then(console.log);

// NGOs
fetch('http://localhost:3000/api/xrpl/ngos')
  .then(r => r.json())
  .then(console.log);
```

---

## 🔍 Vérifier les Logs Backend

Dans le terminal du backend, vous devriez voir:

```
[XRPLClient] Initialized in MOCK mode
[DonationPool] Initialized 4 mock NGOs
[DonationPool] Processing deposit: 100 XRP from rDonor123
[DonationPool] MOCK: Generated txHash: MOCK_DEPOSIT_...
[DonationPool] Deposit successful: 100 XRP, +1000 XP, Level 4
```

---

## ✅ Checklist de Test

- [ ] Health check retourne `"status": "ok"`
- [ ] Donation crée un NFT (`nftMinted: true`)
- [ ] XP est calculé correctement (1 XRP = 10 XP)
- [ ] Level augmente (niveau = floor(sqrt(XP / 100)) + 1)
- [ ] Pool balance augmente après donation
- [ ] Simulation de profit met à jour le pool
- [ ] Distribution envoie à toutes les ONG validées
- [ ] Infos donateur affichent le total et l'XP
- [ ] Liste ONG retourne 4 ONG par défaut
- [ ] Validation ONG retourne un score

---

## 🐛 Troubleshooting

### Le serveur ne répond pas

```bash
# Vérifier que le backend tourne
curl http://localhost:3000/health

# Si erreur, redémarrer le serveur
cd backend
npm run dev
```

### Erreur CORS

Le CORS est activé par défaut. Si problème:
1. Vérifier que le frontend est sur `localhost:5173`
2. Vérifier que l'API est sur `localhost:3000`

### Données incohérentes

Le pool est en mémoire. Pour reset:
1. Redémarrer le serveur backend
2. Toutes les données seront réinitialisées

---

## 📊 Données Mock Attendues

### ONG par défaut

1. **Reforestation International**
   - Category: Climate
   - Impact Score: 95
   - Weight: 30%
   - Wallet: rMockNGO1ReforestationXXXXXXXXX

2. **Clean Water Project**
   - Category: Water
   - Impact Score: 92
   - Weight: 25%
   - Wallet: rMockNGO2CleanWaterXXXXXXXXXX

3. **Education for All**
   - Category: Education
   - Impact Score: 90
   - Weight: 25%
   - Wallet: rMockNGO3EducationXXXXXXXXXXX

4. **Global Health Initiative**
   - Category: Health
   - Impact Score: 88
   - Weight: 20%
   - Wallet: rMockNGO4HealthXXXXXXXXXXXXXX

---

**Happy Testing! 🚀**

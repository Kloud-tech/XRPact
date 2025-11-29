# 🧪 XRPL Service API - Guide de Test

## 🚀 Démarrage rapide

### 1. Installation

```bash
# Installer les dépendances
npm install

# Créer le fichier .env
cp .env.example .env

# Configurer la base de données
psql -U postgres -f database-schema.sql
```

### 2. Démarrer le serveur

```bash
# Mode développement avec auto-reload
npm run dev

# Ou directement
tsx backend/src/services/express-integration-example.ts
```

Le serveur démarre sur `http://localhost:3000`

---

## 📡 Tests avec curl

### Health Check

```bash
curl http://localhost:3000/api/v1/health
```

**Réponse attendue:**
```json
{
  "success": true,
  "status": "healthy",
  "service": "XRPL Impact Fund",
  "version": "3.0.0",
  "timestamp": "2025-01-29T14:32:15.123Z",
  "poolBalance": "0.00 XRP",
  "mode": "MOCK"
}
```

---

### 1. Créer une donation

```bash
curl -X POST http://localhost:3000/api/v1/donations \
  -H "Content-Type: application/json" \
  -d '{
    "donorAddress": "rDonor123456789ABCDEFGHIJKLMNOP",
    "amount": 100,
    "txHash": "ABC123DEF456"
  }'
```

**Réponse attendue:**
```json
{
  "success": true,
  "data": {
    "txHash": "ABC123DEF456",
    "donorAddress": "rDonor123456789ABCDEFGHIJKLMNOP",
    "amount": 100,
    "xpGained": 1000,
    "newLevel": 4,
    "levelUp": true,
    "nftMinted": true,
    "nftTokenId": "NFT_TOKEN_123...",
    "poolBalance": 100,
    "timestamp": "2025-01-29T14:32:15.123Z"
  },
  "message": "Donation successful! Level up to 4! 🎉"
}
```

---

### 2. Obtenir le solde du pool

```bash
curl http://localhost:3000/api/v1/pool/balance
```

**Réponse attendue:**
```json
{
  "success": true,
  "data": {
    "balance": 100,
    "formattedBalance": "100.00 XRP",
    "timestamp": "2025-01-29T14:32:15.123Z"
  }
}
```

---

### 3. Obtenir l'état du pool

```bash
curl http://localhost:3000/api/v1/pool/state
```

**Réponse attendue:**
```json
{
  "success": true,
  "data": {
    "totalBalance": 100,
    "totalDonations": 100,
    "totalProfitsGenerated": 0,
    "totalDistributed": 0,
    "lastTradingRun": "2025-01-29T14:32:15.123Z",
    "donorCount": 1
  }
}
```

---

### 4. Calculer les profits (IA Trading Mock)

```bash
curl -X POST http://localhost:3000/api/v1/pool/calculate-profit \
  -H "Content-Type: application/json" \
  -d '{
    "profitPercentage": 0.67
  }'
```

**Réponse attendue:**
```json
{
  "success": true,
  "data": {
    "profitAmount": 0.67,
    "profitPercentage": 0.67,
    "poolBalanceBefore": 100,
    "poolBalanceAfter": 100.67,
    "strategy": "MA Crossover + RSI",
    "marketConditions": "Bullish",
    "simulationDetails": {
      "ma50": 47523.45,
      "ma200": 45123.67,
      "rsi": 45.32,
      "signal": "BUY"
    },
    "timestamp": "2025-01-29T14:32:15.123Z"
  },
  "message": "Profit calculated: 0.67 XRP (0.67%)"
}
```

---

### 5. Redistribuer aux ONG

```bash
curl -X POST http://localhost:3000/api/v1/pool/redistribute \
  -H "Content-Type: application/json" \
  -d '{
    "profitAmount": 0.67
  }'
```

**Réponse attendue:**
```json
{
  "success": true,
  "data": {
    "totalAmount": 0.67,
    "ngoCount": 5,
    "distributions": [
      {
        "ngoId": "ngo_1",
        "ngoName": "Climate Action Network",
        "ngoCategory": "climate",
        "amount": 0.1675,
        "percentage": 25,
        "txHash": "TX_HASH_1",
        "validated": true,
        "impactScore": 95
      },
      {
        "ngoId": "ngo_2",
        "ngoName": "Water For All",
        "ngoCategory": "water",
        "amount": 0.134,
        "percentage": 20,
        "txHash": "TX_HASH_2",
        "validated": true,
        "impactScore": 92
      }
      // ... autres ONG
    ],
    "failedDistributions": [],
    "executionTime": 523,
    "timestamp": "2025-01-29T14:32:15.123Z"
  },
  "message": "Successfully distributed 0.67 XRP to 5 NGOs"
}
```

---

### 6. Déclencher une urgence

```bash
curl -X POST http://localhost:3000/api/v1/emergency/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "triggeredBy": "rGovernance123456789ABCDEFGHIJKL",
    "reason": "Earthquake Nepal 7.8 magnitude - Immediate medical aid needed",
    "severity": "critical",
    "amountRequested": 5000,
    "affectedNGOs": ["ngo_1", "ngo_2"]
  }'
```

**Réponse attendue:**
```json
{
  "success": true,
  "data": {
    "emergencyId": "emergency_1706539935123",
    "reason": "Earthquake Nepal 7.8 magnitude - Immediate medical aid needed",
    "severity": "critical",
    "totalAmount": 5000,
    "affectedNGOs": ["ngo_1", "ngo_2"],
    "txHashes": ["TX_EMERGENCY_1", "TX_EMERGENCY_2"],
    "governance": {
      "approvalVotes": 85,
      "rejectionVotes": 15,
      "requiredVotes": 30,
      "quorumReached": true,
      "approved": true
    },
    "timestamp": "2025-01-29T14:32:15.123Z"
  },
  "message": "Emergency approved and executed: 5000.00 XRP distributed"
}
```

---

### 7. Obtenir les statistiques

```bash
curl http://localhost:3000/api/v1/stats
```

**Réponse attendue:**
```json
{
  "success": true,
  "data": {
    "service": {
      "mode": "MOCK",
      "network": "mock",
      "uptime": 123.45
    },
    "operations": {
      "total": 15,
      "successful": 14,
      "failed": 1,
      "successRate": 93.33,
      "avgDuration": "125.45ms"
    },
    "pool": {
      "totalBalance": 100.67,
      "totalDonations": 100,
      "totalProfitsGenerated": 0.67,
      "totalDistributed": 0.67,
      "donorCount": 1
    },
    "emergency": {
      "active": 1,
      "history": [...]
    },
    "database": {
      "connected": true
    }
  }
}
```

---

### 8. Obtenir les logs récents

```bash
curl "http://localhost:3000/api/v1/logs?limit=10"
```

**Réponse attendue:**
```json
{
  "success": true,
  "data": {
    "count": 10,
    "logs": [
      {
        "operation": "processDonation",
        "success": true,
        "details": {...},
        "timestamp": "2025-01-29T14:32:15.123Z",
        "duration": 125
      },
      // ... autres logs
    ]
  }
}
```

---

### 9. Historique des donations d'un donateur

```bash
curl http://localhost:3000/api/v1/donations/rDonor123456789ABCDEFGHIJKLMNOP?limit=50
```

**Réponse attendue:**
```json
{
  "success": true,
  "data": {
    "address": "rDonor123456789ABCDEFGHIJKLMNOP",
    "donationCount": 3,
    "donations": [
      {
        "id": "donation_1706539935123",
        "donor_address": "rDonor123456789ABCDEFGHIJKLMNOP",
        "amount": 100,
        "tx_hash": "ABC123DEF456",
        "xp_gained": 1000,
        "level": 4,
        "created_at": "2025-01-29T14:32:15.123Z"
      }
      // ... autres donations
    ]
  }
}
```

---

## 🧪 Tests avec Postman

### Importer la collection

Créer une collection Postman avec les requêtes ci-dessus.

### Variables d'environnement Postman

```json
{
  "baseUrl": "http://localhost:3000",
  "donorAddress": "rDonor123456789ABCDEFGHIJKLMNOP",
  "poolAddress": "rPoolTestWallet123456789ABCDEF"
}
```

---

## 🐛 Tests d'erreurs

### Adresse XRPL invalide

```bash
curl -X POST http://localhost:3000/api/v1/donations \
  -H "Content-Type: application/json" \
  -d '{
    "donorAddress": "INVALID_ADDRESS",
    "amount": 100
  }'
```

**Réponse attendue (400):**
```json
{
  "success": false,
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_string",
      "message": "Invalid XRPL address",
      "path": ["donorAddress"]
    }
  ]
}
```

---

### Montant négatif

```bash
curl -X POST http://localhost:3000/api/v1/donations \
  -H "Content-Type: application/json" \
  -d '{
    "donorAddress": "rDonor123456789ABCDEFGHIJKLMNOP",
    "amount": -100
  }'
```

**Réponse attendue (400):**
```json
{
  "success": false,
  "error": "Validation error",
  "details": [
    {
      "code": "too_small",
      "message": "Number must be greater than 0",
      "path": ["amount"]
    }
  ]
}
```

---

## 🔄 Workflow complet de test

### Scénario : Cycle complet de donation et redistribution

```bash
# 1. Vérifier la santé du service
curl http://localhost:3000/api/v1/health

# 2. Créer une première donation de 100 XRP
curl -X POST http://localhost:3000/api/v1/donations \
  -H "Content-Type: application/json" \
  -d '{
    "donorAddress": "rDonor1ABC123456789ABCDEFGHIJK",
    "amount": 100
  }'

# 3. Créer une deuxième donation de 250 XRP
curl -X POST http://localhost:3000/api/v1/donations \
  -H "Content-Type: application/json" \
  -d '{
    "donorAddress": "rDonor2DEF456789ABCDEFGHIJKLM",
    "amount": 250
  }'

# 4. Vérifier l'état du pool
curl http://localhost:3000/api/v1/pool/state

# 5. Calculer les profits (0.67% du pool)
curl -X POST http://localhost:3000/api/v1/pool/calculate-profit \
  -H "Content-Type: application/json" \
  -d '{"profitPercentage": 0.67}'

# 6. Redistribuer les profits aux ONG
curl -X POST http://localhost:3000/api/v1/pool/redistribute \
  -H "Content-Type: application/json" \
  -d '{"profitAmount": 2.345}'

# 7. Vérifier les statistiques finales
curl http://localhost:3000/api/v1/stats
```

---

## 📊 Tests de charge avec Apache Bench

### Installation

```bash
# macOS
brew install apache2

# Ubuntu/Debian
sudo apt-get install apache2-utils

# Windows (WSL)
sudo apt-get install apache2-utils
```

### Test de 100 donations concurrentes

```bash
ab -n 100 -c 10 -p donation.json -T application/json \
  http://localhost:3000/api/v1/donations
```

**Fichier donation.json:**
```json
{
  "donorAddress": "rLoadTest123456789ABCDEFGHIJK",
  "amount": 10
}
```

---

## 🔍 Tests avec Jest/Vitest

### Exemple de test unitaire

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from './express-integration-example';

describe('XRPL Service API', () => {
  beforeAll(async () => {
    // Setup
  });

  afterAll(async () => {
    // Cleanup
  });

  describe('POST /api/v1/donations', () => {
    it('should create a donation successfully', async () => {
      const response = await request(app)
        .post('/api/v1/donations')
        .send({
          donorAddress: 'rTest123456789ABCDEFGHIJKLMNO',
          amount: 100,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.amount).toBe(100);
      expect(response.body.data.xpGained).toBeGreaterThan(0);
    });

    it('should reject invalid address', async () => {
      const response = await request(app)
        .post('/api/v1/donations')
        .send({
          donorAddress: 'INVALID',
          amount: 100,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/pool/balance', () => {
    it('should return pool balance', async () => {
      const response = await request(app)
        .get('/api/v1/pool/balance');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('balance');
    });
  });
});
```

---

## 📈 Monitoring & Debugging

### Activer les logs détaillés

```bash
LOG_LEVEL=debug tsx backend/src/services/express-integration-example.ts
```

### Utiliser les logs en temps réel

```bash
tail -f logs/xrpl-combined.log
```

### Filtrer les erreurs uniquement

```bash
tail -f logs/xrpl-error.log
```

---

## 🔐 Tests de sécurité

### 1. Test d'injection SQL

```bash
curl -X POST http://localhost:3000/api/v1/donations \
  -H "Content-Type: application/json" \
  -d '{
    "donorAddress": "rTest'; DROP TABLE donations; --",
    "amount": 100
  }'
```

Devrait être bloqué par la validation Zod.

### 2. Test de dépassement de limite

```bash
curl -X POST http://localhost:3000/api/v1/donations \
  -H "Content-Type: application/json" \
  -d '{
    "donorAddress": "rTest123456789ABCDEFGHIJKLMNO",
    "amount": 99999999999999
  }'
```

Devrait retourner une erreur 400.

---

## 🎯 Checklist de test

Avant de déployer en production, vérifier:

- [ ] Health check répond correctement
- [ ] Toutes les routes retournent les bons status codes
- [ ] Validation des inputs fonctionne
- [ ] Gestion d'erreurs est robuste
- [ ] Logs sont écrits correctement
- [ ] Base de données est accessible
- [ ] Transactions XRPL sont vérifiées (en mode LIVE)
- [ ] Emergency mode fonctionne
- [ ] Statistiques sont précises
- [ ] Performance est acceptable (< 500ms par requête)

---

## 📞 Support

Pour toute question ou problème de test:

1. Consulter les logs: `logs/xrpl-combined.log`
2. Vérifier la configuration: `.env`
3. Tester le health check: `curl http://localhost:3000/api/v1/health`
4. Ouvrir une issue sur GitHub

---

**Version:** 1.0.0
**Dernière mise à jour:** 2025-01-29

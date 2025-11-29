# API Escrow Management - Documentation

## 🚀 Démarrage Rapide

### 1. Configuration MongoDB

L'URL MongoDB se met dans le fichier **`.env`** :

```bash
# Créez le fichier .env (s'il n'existe pas)
cd backend
cp .env.example .env

# Éditez .env et ajoutez votre URL MongoDB
```

**2 options** :

#### Option A: MongoDB Atlas (Cloud - Recommandé)
```bash
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/xrpl-impact-map
```
📖 Voir [MONGODB_SETUP.md](./MONGODB_SETUP.md) pour le guide complet

#### Option B: MongoDB Local
```bash
MONGODB_URI=mongodb://localhost:27017/xrpl-impact-map
```

### 2. Générer les clés

```bash
# Clé de chiffrement
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# → Copiez dans ENCRYPTION_KEY=

# Wallet Oracle (après avoir démarré le serveur)
curl -X POST http://localhost:3001/api/wallet/generate
# → Copiez le "seed" dans ORACLE_SEED=
```

### 3. Démarrer le serveur

```bash
npm start
```

Vous devriez voir :
```
✅ Connecté à MongoDB
✅ Connecté à XRPL Testnet
🔑 Oracle Wallet: rXXXXXXXXXXXXXXXXXXXX
```

---

## 📚 Routes API

### Escrows

#### `POST /api/escrows` - Créer un escrow

```bash
curl -X POST http://localhost:3001/api/escrows \
  -H "Content-Type: application/json" \
  -d '{
    "donorSeed": "sXXXXXXXXXXXXXXXXXXXXX",
    "amount": "100",
    "beneficiaryAddress": "rYYYYYYYYYYYYYYYYYYYYY",
    "projectId": "puits-senegal-001",
    "projectName": "Construction puits au Sénégal",
    "projectDescription": "Puits pour village de 500 habitants",
    "deadlineDays": 30
  }'
```

**Réponse** :
```json
{
  "success": true,
  "escrow": {
    "escrowId": "uuid-1234",
    "projectName": "Construction puits au Sénégal",
    "amountXRP": 100,
    "status": "pending",
    "ownerAddress": "rXXXX...",
    "beneficiaryAddress": "rYYYY...",
    "explorerUrl": "https://testnet.xrpl.org/transactions/..."
  }
}
```

#### `GET /api/escrows/:id` - Détails d'un escrow

```bash
curl http://localhost:3001/api/escrows/uuid-1234
```

#### `GET /api/escrows` - Lister les escrows

```bash
# Tous les escrows
curl http://localhost:3001/api/escrows

# Filtrer par projet
curl http://localhost:3001/api/escrows?projectId=puits-senegal-001

# Filtrer par status
curl http://localhost:3001/api/escrows?status=pending

# Pagination
curl http://localhost:3001/api/escrows?limit=10&skip=0
```

#### `POST /api/escrows/:id/validate` - Valider avec photos

```bash
curl -X POST http://localhost:3001/api/escrows/uuid-1234/validate \
  -H "Content-Type: application/json" \
  -d '{
    "photos": [
      "https://storage.com/photo1.jpg",
      "https://storage.com/photo2.jpg"
    ],
    "autoUnlock": true
  }'
```

**Réponse** :
```json
{
  "success": true,
  "validated": true,
  "unlocked": true,
  "unlockTxHash": "ABCD1234...",
  "escrow": { ... }
}
```

#### `POST /api/escrows/:id/unlock` - Débloquer manuellement

```bash
curl -X POST http://localhost:3001/api/escrows/uuid-1234/unlock
```

#### `POST /api/escrows/:id/cancel` - Annuler (clawback)

```bash
curl -X POST http://localhost:3001/api/escrows/uuid-1234/cancel
```

---

## 🧪 Tester l'API

```bash
# Test complet automatique
node test-api.js
```

Ce script va :
1. ✅ Vérifier la connexion
2. ✅ Générer des wallets
3. ✅ Les financer via faucet
4. ✅ Créer un escrow
5. ✅ Soumettre des photos
6. ✅ Débloquer automatiquement

---

## 📁 Structure du Projet

```
backend/
├── models/
│   └── Escrow.js              # Schema MongoDB
├── routes/
│   └── escrows.js             # Routes API escrow
├── services/
│   └── encryptionService.js   # Chiffrement des secrets
├── SmartEscrowService.ts      # Service XRPL escrow
├── server.js                  # Serveur Express principal
├── test-api.js                # Tests API
├── .env                       # Configuration (À CRÉER!)
├── .env.example               # Template de configuration
└── MONGODB_SETUP.md           # Guide MongoDB
```

---

## 🔐 Sécurité

### Secrets Chiffrés

Les `oracleSecret` et `fulfillment` sont automatiquement chiffrés en AES-256-CBC avant stockage.

### Variables d'Environnement

⚠️ **Ne committez JAMAIS le fichier `.env`** (déjà dans `.gitignore`)

### Production

Pour la production :
- Utilisez MongoDB Atlas avec IP whitelisting
- Stockez `ORACLE_SEED` dans un KMS (AWS KMS, Google Secret Manager)
- Utilisez HTTPS
- Ajoutez une authentification JWT

---

## 📊 Workflow Complet

```
1. Frontend → POST /api/escrows
              ↓
2. Backend crée escrow XRPL + stocke en DB (secrets chiffrés)
              ↓
3. ONG envoie photos → POST /api/escrows/:id/validate
              ↓
4. IA analyse les photos
              ↓
5. Si validé → Déchiffre secret → Débloque escrow
              ↓
6. Status: "unlocked", fonds transférés
```

---

## ❓ FAQ

### Où trouver mon URL MongoDB ?

Voir [MONGODB_SETUP.md](./MONGODB_SETUP.md)

### Comment générer un wallet Oracle ?

```bash
npm start
# Dans un autre terminal:
curl -X POST http://localhost:3001/api/wallet/generate
```

### L'API ne se connecte pas à MongoDB

Vérifiez :
1. MongoDB est démarré (si local)
2. L'URL dans `.env` est correcte
3. Votre IP est autorisée (si Atlas)

### Comment intégrer mon IA ?

Dans `routes/escrows.js`, ligne ~189, remplacez la simulation par votre appel IA :

```javascript
// TODO: Appeler votre service IA ici
const aiResult = await yourAIService.validate({
  photos: photos,
  projectType: escrow.projectId
});
```

---

## 🔗 Liens Utiles

- [XRPL Testnet Explorer](https://testnet.xrpl.org)
- [XRPL Testnet Faucet](https://xrpl.org/xrp-testnet-faucet.html)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Guide MongoDB Setup](./MONGODB_SETUP.md)

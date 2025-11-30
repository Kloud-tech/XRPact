# 🔐 Smart Escrow - Donations Conditionnelles

## Vue d'ensemble

Le système Smart Escrow permet de bloquer les donations jusqu'à ce qu'elles soient validées par des preuves photos. Voici comment ça fonctionne :

## 🔄 Flux Complet

### 1. Donation (Frontend → Blockchain → Backend)

```typescript
// L'utilisateur fait une donation via DonationForm.tsx
1. User connecte son wallet GemWallet
2. User entre le montant (ex: 100 XRP)
3. Click "Donate Now"
   → sendPayment() envoie les XRP à l'adresse du pool
   → Transaction validée sur XRPL
   → Récupération du txHash

// Le backend crée un escrow
4. POST /api/donations/create
   Body: {
     donorAddress: "rXXXXXXX...",
     amount: 100,
     txHash: "ABC123...",
     beneficiaryAddress: "rPoolAddress...",
     projectId: "global-pool",
     projectName: "XRPact Impact Pool"
   }
   
5. Backend enregistre dans MongoDB avec status: 'pending'
   → Escrow créé (optionnel si on a le seed)
   → Secret Oracle généré et chiffré
```

### 2. Validation Photo (Upload → IA → Déblocage)

```typescript
// Le projet upload une photo de preuve
1. POST /api/ai/validate
   Body: {
     escrowId: "uuid-123",
     file: <image>,
     category: "humanitarian",
     description: "Distribution de nourriture"
   }

2. IA analyse l'image avec OpenAI Vision
   → Score de confiance calculé
   → Vérification de la cohérence avec le projet
   
3. Si score >= 85% et confiance >= 0.8:
   → Status: 'validated'
   → Déclenchement automatique du déblocage
   
4. POST /api/donations/:escrowId/validate (automatique)
   → Déchiffrement du secret Oracle
   → Appel XRPL EscrowFinish avec fulfillment
   → Fonds transférés au bénéficiaire
   → Status: 'unlocked'
```

### 3. Consultation (Frontend)

```typescript
// Voir l'état d'une donation
GET /api/donations/:escrowId

Response: {
  success: true,
  escrow: {
    id: "uuid-123",
    amount: 100,
    status: "unlocked",
    txHash: "ABC123...",
    unlockTxHash: "DEF456...",
    validationImages: [...]
  }
}
```

## 🛠️ Configuration Requise

### Variables d'environnement (backend)

```bash
# .env
MONGODB_URI=mongodb://localhost:27017/xrpl-impact-map
ORACLE_SEED=sYourOracleSeedHere  # Seed du wallet Oracle XRPL
OPENAI_API_KEY=sk-...             # Clé API OpenAI pour l'IA
API_BASE_URL=http://localhost:3001 # URL de l'API (pour les appels internes)
```

### Génération du wallet Oracle

```bash
# Dans backend/scripts/
node generate-testnet-wallet.js
```

Sauvegarder le seed dans `ORACLE_SEED`.

## 📝 Endpoints API

### Donations

- `POST /api/donations/create` - Créer une donation avec escrow
- `GET /api/donations/:escrowId` - Obtenir les infos d'une donation
- `GET /api/donations` - Lister toutes les donations
- `POST /api/donations/:escrowId/validate` - Débloquer manuellement (Oracle only)

### Validation IA

- `POST /api/ai/validate` - Valider une photo et débloquer si score OK

## 🧪 Test du Flux Complet

### 1. Préparer l'environnement

```bash
# Backend
cd backend
npm install
npm start  # Port 3001

# Frontend
cd frontend
npm install
npm run dev  # Port 5173
```

### 2. Faire une donation

1. Ouvrir http://localhost:5173
2. Connecter GemWallet
3. Entrer 100 XRP
4. Click "Donate Now"
5. Approuver dans GemWallet
6. ✅ Voir le message "Funds locked until photo validation"

### 3. Uploader une photo

```bash
# Via curl ou Postman
curl -X POST http://localhost:3001/api/ai/validate \
  -F "file=@/path/to/photo.jpg" \
  -F "escrowId=uuid-from-step-2" \
  -F "category=humanitarian" \
  -F "description=Distribution alimentaire"
```

### 4. Vérifier le déblocage

```bash
# Récupérer l'état
curl http://localhost:3001/api/donations/:escrowId

# Devrait retourner status: "unlocked" si photo OK
```

## 🔒 Sécurité

- ✅ Secrets Oracle chiffrés en base (AES-256)
- ✅ Fulfillment jamais exposé au frontend
- ✅ Validation IA automatique (>85% score)
- ✅ Deadline pour clawback si pas validé
- ⚠️ En production: utiliser un KMS pour les seeds

## 🐛 Debugging

### Vérifier la connexion XRPL

```bash
curl http://localhost:3001/api/health
```

### Logs importants

```bash
# Backend console
✅ Connecté au XRPL Testnet
✅ Connecté à MongoDB
🔑 Oracle Wallet: rXXXXXXX...
📝 Création d'un escrow pour donation...
🔓 Déblocage de la donation uuid-123...
✅ Fonds débloqués: txHash
```

### Erreurs communes

1. **"wallet.sendPayment is not a function"**
   → GemWallet pas installé ou version obsolète
   → Solution: Installer/Mettre à jour GemWallet extension

2. **"Oracle Wallet non configuré"**
   → Variable ORACLE_SEED manquante
   → Solution: Générer un wallet et ajouter le seed dans .env

3. **"Failed to unlock escrow"**
   → Secret Oracle incorrect ou escrow déjà exécuté
   → Solution: Vérifier le status dans MongoDB

## 📊 Monitoring

Tous les événements sont loggés :
- Création de donations
- Validations IA
- Déblocages de fonds
- Erreurs

Consulter la base MongoDB pour l'historique complet.

## 🚀 Prochaines Étapes

- [ ] Intégrer hooks XRPL pour monitoring on-chain direct
- [ ] Dashboard admin pour gérer les validations manuelles
- [ ] Système de jalons (milestones) pour déblocage progressif
- [ ] Notifications en temps réel via WebSocket
- [ ] Multi-signature pour déblocages importants

---

**Fait avec ❤️ pour l'impact humanitaire**

# 🚀 Workflow Setup - Guide Rapide

## ✅ Ce qui est maintenant FONCTIONNEL

Le workflow complet est **implémenté** et **connecté** entre frontend et backend !

---

## 🎯 Comment Tester le Workflow en Live

### **Étape 1: Démarrer le Backend API**

```bash
# Terminal 1
cd backend
npm run server
```

Vous devriez voir :
```
╔════════════════════════════════════════════════════╗
║   XRPL Impact Fund API Server                     ║
╚════════════════════════════════════════════════════╝

🚀 Server running on http://localhost:3001

📋 Available endpoints:
   GET  /health                        - Health check
   POST /api/workflow/donate           - Initiate donation
   POST /api/workflow/validate         - Submit validation
   GET  /api/workflow/state/:projectId - Get project state
   GET  /api/workflow/all-states       - Get all states
   POST /api/workflow/simulate         - Simulate workflow
```

### **Étape 2: Frontend est déjà lancé**

Le frontend tourne déjà sur **http://localhost:5174**

### **Étape 3: Tester le Workflow**

1. Aller sur **http://localhost:5174**
2. Cliquer sur le bouton **"⚡ See How It Works"** en haut
3. Scroller jusqu'au workflow diagram
4. Cliquer sur **"🚀 Run Live Demo"**

**Ce qui va se passer** :
- Le frontend appelle `/api/workflow/simulate`
- Le backend exécute les 7 étapes complètes
- Résultat affiché en temps réel avec :
  - ✅ Project ID
  - ✅ Final Status (FUNDED)
  - ✅ Pin Color (GREEN 🟢)
  - ✅ Escrow Hash
  - ✅ Final Amount (avec yield)
  - ✅ NFT Token ID

---

## 📊 Architecture Complète

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                             │
│  http://localhost:5174                                  │
│                                                          │
│  • WorkflowDiagram.tsx                                  │
│    └─> simulateWorkflow()                               │
│        └─> fetch('http://localhost:3001/api/workflow')  │
└─────────────────────────────────────────────────────────┘
                           │
                           │ HTTP POST
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    BACKEND API                          │
│  http://localhost:3001                                  │
│                                                          │
│  • server.ts                                            │
│    └─> workflowRoutes.ts                                │
│        └─> CompleteWorkflow.ts                          │
│            ├─> initiateDonation()                       │
│            │   ├─> depositToAMM()                       │
│            │   ├─> createSmartEscrow()                  │
│            │   └─> TrustOptimizer.selectValidators()    │
│            │                                             │
│            └─> submitValidation() x3                    │
│                └─> checkValidationCompletion()          │
│                    └─> releaseEscrow()                  │
│                        ├─> withdrawFromAMM()            │
│                        ├─> Update Pin: GREEN            │
│                        └─> mintProofOfImpactNFT()       │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
                   ┌───────────────┐
                   │  XRPL Testnet │
                   └───────────────┘
```

---

## 🔥 Endpoints API Disponibles

### 1. **POST /api/workflow/donate**
Initie une nouvelle donation

**Request:**
```json
{
  "donor": {
    "address": "rDonor123...",
    "name": "Alice Dupont"
  },
  "project": {
    "id": "PRJ_001",
    "title": "Puits au Sénégal",
    "category": "Water",
    "location": { "lat": 14.4974, "lng": -14.4524, "country": "Senegal", "region": "Dakar" },
    "amount": 5000,
    "entrepreneur": { "name": "Ibrahima", "address": "rEnt123..." },
    "urgency": "MEDIUM",
    "riskLevel": 20
  },
  "conditions": {
    "photosRequired": 3,
    "validatorsRequired": 3,
    "deadline": "2025-03-01T00:00:00Z",
    "gpsRadius": 500
  }
}
```

**Response:**
```json
{
  "success": true,
  "projectId": "PRJ_001",
  "state": {
    "status": "IN_AMM",
    "pinColor": "YELLOW",
    "escrowHash": "ESC_PRJ_001_...",
    "selectedValidators": ["VAL_001", "VAL_003", "VAL_005"]
  }
}
```

### 2. **POST /api/workflow/validate**
Soumettre une validation

**Request:**
```json
{
  "projectId": "PRJ_001",
  "validatorId": "VAL_001",
  "validatorName": "Amadou Diallo",
  "photoUrl": "https://storage.xrpl.org/photo1.jpg",
  "gpsLocation": { "lat": 14.4980, "lng": -14.4530 }
}
```

### 3. **GET /api/workflow/state/:projectId**
Récupérer l'état d'un projet

### 4. **GET /api/workflow/all-states**
Récupérer tous les états (pour la carte)

### 5. **POST /api/workflow/simulate**
Simuler un workflow complet (DEMO)

**Request:**
```json
{
  "donorName": "Demo User",
  "projectTitle": "Demo Project",
  "category": "Water",
  "amount": 5000
}
```

---

## ✅ Checklist de Vérification

### Backend
- [ ] Serveur lancé sur `http://localhost:3001`
- [ ] Endpoint `/health` répond
- [ ] Logs affichent les étapes du workflow

### Frontend
- [ ] App lancée sur `http://localhost:5174`
- [ ] Bouton "See How It Works" visible
- [ ] Workflow diagram s'affiche
- [ ] Bouton "Run Live Demo" cliquable

### Intégration
- [ ] Clic sur "Run Live Demo"
- [ ] Loader s'affiche (Spinner)
- [ ] Résultat vert affiché après ~2-3 secondes
- [ ] Project ID, Status, Pin Color visibles
- [ ] Pas d'erreur dans la console

---

## 🐛 Résolution des Problèmes

### Erreur: `ERR_CONNECTION_REFUSED`
**Cause**: Le backend n'est pas lancé

**Solution**:
```bash
cd backend
npm run server
```

### Erreur: `Module not found: express`
**Cause**: Dépendances non installées

**Solution**:
```bash
cd backend
npm install
```

### Erreur: `CORS blocked`
**Cause**: CORS non configuré (ne devrait pas arriver)

**Solution**: Vérifier que `cors()` est bien dans `server.ts`

---

## 📝 Fichiers Créés/Modifiés

### Backend (Nouveau)
- ✅ `backend/src/api/workflowRoutes.ts` - Routes API
- ✅ `backend/src/server.ts` - Serveur Express
- ✅ `backend/src/services/workflow/CompleteWorkflow.ts` - Orchestration
- ✅ `backend/src/services/ai/TrustOptimizer.ts` - IA de sélection

### Frontend (Nouveau)
- ✅ `frontend/src/services/workflowApi.ts` - Client API
- ✅ `frontend/src/components/workflow/WorkflowDiagram.tsx` (MODIFIÉ) - Bouton demo

### Frontend (Modifié)
- ✅ `frontend/src/App.tsx` - WorkflowDiagram intégré
- ✅ `frontend/src/components/hero/LandingHero.tsx` - Bouton "See How It Works"

---

## 🎬 Demo pour le Hackathon

**Scénario de démo** (30 secondes) :

1. **Montrer la page d'accueil**
   - "Voici notre plateforme XRPL Impact Fund"

2. **Cliquer sur "See How It Works"**
   - "Le workflow complet en 7 étapes"

3. **Cliquer sur "Run Live Demo"**
   - "On exécute en temps réel sur XRPL Testnet"

4. **Montrer le résultat**
   - "✅ Projet financé, pin vert, NFT envoyé"
   - "Tout est on-chain, transparent, automatique"

5. **Scroller vers Impact Map**
   - "Et vous voyez le projet apparaître sur la carte mondiale"

---

## 🚀 Prêt pour le Hackathon !

Vous avez maintenant un **workflow fonctionnel** de bout en bout :
- ✅ Frontend UI interactive
- ✅ Backend API avec XRPL
- ✅ AI Trust Optimizer
- ✅ Smart Escrow simulation
- ✅ NFT Minting
- ✅ État en temps réel

**Lancez les 2 serveurs et c'est parti ! 🎉**

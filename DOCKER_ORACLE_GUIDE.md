# ImpactOracle Micro-service - Docker Compose Quick Start

Démarrer l'ImpactOracle + backend + frontend via Docker Compose :

```bash
# À partir de la racine du projet
docker-compose up -d
```

**Services démarrés :**
- `impact-oracle` sur le port `3300` → `/oracle/verify` endpoint
- `backend` sur le port `3000` → `/api/xrpl/*` routes
- `frontend` sur le port `5173` → dashboard
- `postgres` sur le port `5433` (optionnel)
- `redis` sur le port `6379` (optionnel)

**Logs en temps réel :**
```bash
docker-compose logs -f impact-oracle
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Arrêter les services :**
```bash
docker-compose down
```

**Arrêter et supprimer les volumes :**
```bash
docker-compose down -v
```

## Configuration

Copier le fichier `.env.example` en `.env` et modifier les variables d'environnement si nécessaire :

```bash
cp .env.example .env
# Éditer .env avec vos paramètres
```

**Variables clés :**
- `IMPACT_ORACLE_URL` : URL du micro-service oracle (par défaut `http://localhost:3300/oracle/verify`)
- `PUBLISH_ON_CHAIN` : Publier les hash de validation on-chain (défaut `true`)
- `XRPL_NETWORK` : Réseau XRPL (`mock`, `testnet`, ou `mainnet`)

## Tests d'intégration

### 1. Tester l'oracle
```bash
curl -X POST http://localhost:3300/oracle/verify \
  -H "Content-Type: application/json" \
  -d '{"address":"rExampleNGOAddress123"}'
```

### 2. Valider une ONG (backend)
```bash
curl -X POST http://localhost:3000/api/xrpl/validate-ngo \
  -H "Content-Type: application/json" \
  -d '{"ngoId":"ngo-001"}'
```

### 3. Accéder au dashboard
Ouvrir http://localhost:5173 et aller à la section "Verified NGO Partners"

## Architecture

```
Docker Network: xrpl-network
├── impact-oracle:3300    (Node.js + Express)
│   ├── Verify service (mock/deterministic API checks)
│   └── Health check
├── backend:3000          (Node.js/TypeScript + Express)
│   ├── XRPL routes
│   ├── Oracle integration (calls impact-oracle:3300)
│   ├── On-chain validation (publishes hash to XRPL)
│   └── Donation pool management
├── frontend:5173         (Vite + React)
│   └── NGO validation UI (Validate button)
├── postgres:5433         (Database, optional)
└── redis:6379            (Cache, optional)
```

## Fichiers modifiés

**Micro-service :**
- `backend/services/impact-oracle/Dockerfile` - Docker image
- `backend/services/impact-oracle/index.js` - Ajout endpoint `/health`
- `backend/services/impact-oracle/on-chain-validation.js` - Logique de hash on-chain

**Backend :**
- `backend/src/modules/xrpl/controllers/xrpl.controller.ts` - Intégration oracle + publication on-chain
- `docker-compose.yml` - Service `impact-oracle` ajouté

**Frontend :**
- `frontend/src/components/ngo/NGOList.tsx` - Bouton "Validate" sur chaque ONG

**Configuration :**
- `.env.example` - Nouvelles variables `IMPACT_ORACLE_URL`, `PUBLISH_ON_CHAIN`, `ORACLE_PORT`

## Résumé des fonctionnalités

**A. Dockerisation**
- ✅ Dockerfile pour le micro-service `impact-oracle`
- ✅ Service ajouté à `docker-compose.yml` avec healthcheck
- ✅ Configuration via variables d'environnement

**B. Publication on-chain**
- ✅ Hash SHA256 du résultat de validation
- ✅ Stockage dans le champ `Memo` des transactions XRPL (simulation MOCK)
- ✅ Intégration backend avec appel à `publishValidationOnChain()`
- ✅ Support pour XRPL testnet/mainnet (avec seed wallet)

## Prochaines étapes (optionnel)

- Remplacer les endpoints mock par vraies intégrations API (UNData, OCDE, CharityBase)
- Ajouter authentification JWT au micro-service
- Implémenter stockage off-chain (IPFS/S3) pour l'historique des validations
- Ajouter alertes et notifications via email

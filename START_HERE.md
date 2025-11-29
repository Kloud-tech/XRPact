# 🚀 Démarrage Rapide - XRPL Impact Fund

## ✅ Docker est maintenant configuré!

Vos containers Docker sont actifs :
- ✅ **PostgreSQL** sur port **5433** (au lieu de 5432)
- ✅ **Redis** sur port **6379**

## 🎯 Lancer le projet maintenant

### Étape 1 : Vérifier que Docker tourne

```bash
docker ps
```

Vous devriez voir :
- `xrpl-impact-postgres` (port 5433)
- `xrpl-impact-redis` (port 6379)

### Étape 2 : Installer les dépendances

```bash
# À la racine du projet
npm install

# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
cd ..
```

### Étape 3 : Lancer le projet

```bash
# Option A : Tout lancer en même temps (recommandé)
npm run dev:all
```

**OU**

```bash
# Option B : Lancer séparément

# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend (nouveau terminal)
cd frontend
npm run dev
```

### Étape 4 : Ouvrir l'application

Après 10-20 secondes, ouvrez :

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3000
- **Health Check** : http://localhost:3000/health

---

## 📊 Endpoints API disponibles

L'API fonctionne en **mode MOCK** (pas besoin de base de données pour commencer) :

```bash
# Statistiques du pool
curl http://localhost:3000/api/pool/stats

# Donations récentes
curl http://localhost:3000/api/donations/recent

# Liste des ONG
curl http://localhost:3000/api/ngos

# Leaderboard
curl http://localhost:3000/api/leaderboard
```

---

## 🧪 Tester les composants individuellement

### Smart Contract Demo

```bash
cd backend
npx tsx src/contracts/ImpactFundHook.ts
```

### AI Trading Algorithm

```bash
cd backend/src/services/ai-trading
npx tsx TradingAlgorithm.ts
```

### Impact Oracle

```bash
cd backend/src/services/impact-oracle
npx tsx ImpactOracle.ts
```

### Simulation Complète

```bash
npx tsx scripts/demo-simulation.ts
```

---

## 🔧 Si vous avez des problèmes

### Le frontend ne démarre pas

```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Le backend ne démarre pas

```bash
cd backend
rm -rf node_modules
npm install
npm run dev
```

### Docker n'est pas accessible

1. Vérifiez que Docker Desktop est ouvert
2. Relancez : `docker-compose up -d`

### Port déjà utilisé

Si le port 3000 ou 5173 est déjà utilisé, modifiez :
- **Backend** : Changez `PORT=3000` dans `.env`
- **Frontend** : Changez le port dans `frontend/vite.config.ts`

---

## 📚 Prochaines étapes

1. ✅ Le projet fonctionne en mode MOCK (sans vraie blockchain)
2. 📖 Lisez [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) pour comprendre la structure
3. 🎨 Personnalisez le dashboard dans `frontend/src/components/`
4. 🔗 Intégrez XRPL wallet (voir section ci-dessous)
5. 🎯 Préparez votre démo pour le hackathon

---

## 🔐 Intégration XRPL Wallet (prochaine étape)

Pour connecter un vrai wallet XRPL :

1. **Créer un wallet testnet** :
   - Visitez https://xrpl.org/xrp-testnet-faucet.html
   - Générez une adresse et obtenez du XRP gratuit

2. **Ajouter les credentials** :
   ```bash
   cp .env.example .env
   # Éditez .env avec vos credentials XRPL
   ```

3. **Installer xrpl.js** (déjà fait) :
   ```bash
   npm install xrpl
   ```

4. **Code exemple** pour connecter :
   ```typescript
   import { Client, Wallet } from 'xrpl';

   const client = new Client('wss://s.altnet.rippletest.net:51233');
   await client.connect();

   const wallet = Wallet.fromSeed('sEdXXXXXXXXXXX');
   ```

---

## 📖 Documentation

- **README.md** - Vue d'ensemble complète
- **QUICKSTART.md** - Installation détaillée
- **PROJECT_SUMMARY.md** - Résumé du projet
- **docs/PITCH_DECK.md** - Présentation pour le jury
- **docs/ARCHITECTURE.md** - Architecture technique

---

## 🎉 Vous êtes prêt!

Le projet est maintenant fonctionnel. Vous pouvez :

1. ✅ Voir le dashboard sur http://localhost:5173
2. ✅ Tester l'API sur http://localhost:3000
3. ✅ Modifier les composants React
4. ✅ Tester les smart contracts
5. ✅ Préparer votre démo

**Bon développement pour le hackathon! 🚀**

---

## ❓ Besoin d'aide ?

- Consultez [QUICKSTART.md](QUICKSTART.md)
- Lisez [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
- Vérifiez la documentation XRPL : https://xrpl.org/docs

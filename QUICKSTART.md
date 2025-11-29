# 🚀 Quick Start Guide

Bienvenue dans le projet **XRPL Impact Fund** ! Voici comment démarrer rapidement.

## 📋 Prérequis

- **Node.js** 18+ ([Télécharger](https://nodejs.org/))
- **Git** ([Télécharger](https://git-scm.com/))
- **Docker** (optionnel, pour PostgreSQL/Redis) ([Télécharger](https://www.docker.com/))

## ⚡ Installation rapide (5 minutes)

### 1. Installer les dépendances

```bash
# À la racine du projet
npm install

# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Configuration environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env avec vos valeurs (optionnel pour le hackathon)
# Pour le développement local, les valeurs par défaut fonctionnent
```

### 3. Démarrer la base de données (via Docker)

```bash
# Démarrer PostgreSQL + Redis
docker-compose up -d

# Vérifier que les containers sont actifs
docker ps
```

**Alternative sans Docker**: Installer PostgreSQL et Redis manuellement

### 4. Lancer le projet

```bash
# Option A: Tout lancer en parallèle (recommandé)
npm run dev:all

# Option B: Lancer séparément
# Terminal 1 - Frontend
cd frontend && npm run dev

# Terminal 2 - Backend
cd backend && npm run dev
```

### 5. Ouvrir l'application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 🎯 Structure du projet

```
xrpl-impact-fund/
├── frontend/              # Application React
│   ├── src/
│   │   ├── components/    # Composants UI
│   │   │   ├── DonorDashboard/
│   │   │   └── ImpactNFT/
│   │   ├── App.tsx
│   │   └── index.css
│   └── package.json
│
├── backend/               # API Node.js
│   ├── src/
│   │   ├── contracts/     # Smart contracts XRPL
│   │   ├── services/      # Services métier
│   │   │   ├── ai-trading/
│   │   │   └── impact-oracle/
│   │   └── index.ts
│   └── package.json
│
├── docs/                  # Documentation
│   ├── ARCHITECTURE.md
│   └── PITCH_DECK.md
│
└── README.md
```

## 📚 Documentation clé

- **[README.md](README.md)** - Vue d'ensemble complète
- **[PITCH_DECK.md](docs/PITCH_DECK.md)** - Présentation pour le jury
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Architecture technique détaillée

## 🧪 Tester les composants

### Smart Contract (Backend)

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

## 🎨 Composants principaux

### 1. Dashboard Donateur
- Visualisation du pool
- Statistiques en temps réel
- Flux de donations récentes
- Bouton de donation rapide

### 2. Impact NFT
- NFT évolutif avec visuels dynamiques
- Système de niveaux (Bronze → Diamond)
- Barre de progression XP
- Perks débloqués

### 3. Smart Contract
- Gestion des dépôts
- Distribution des profits
- Système de gouvernance
- Gestion des NFTs

### 4. AI Trading
- Algorithme MA/RSI
- Backtesting
- Gestion des risques
- Performance tracking

### 5. Impact Oracle
- Validation des ONG
- Calcul du score d'impact
- Vérification des certifications
- Détection des red flags

## 🔧 Scripts utiles

```bash
# Développement
npm run dev:frontend      # Lancer le frontend seul
npm run dev:backend       # Lancer le backend seul
npm run dev:all          # Lancer frontend + backend

# Build production
npm run build            # Build frontend + backend

# Tests
npm run test             # Lancer tous les tests

# Linting
npm run lint             # Linter le code
```

## 🐛 Troubleshooting

### Port déjà utilisé

```bash
# Changer le port du frontend dans vite.config.ts
# Changer le port du backend dans .env (PORT=3001)
```

### Erreur de connexion à PostgreSQL

```bash
# Vérifier que Docker est démarré
docker ps

# Relancer les containers
docker-compose down
docker-compose up -d
```

### Erreur de dépendances

```bash
# Nettoyer et réinstaller
rm -rf node_modules frontend/node_modules backend/node_modules
npm install
cd frontend && npm install
cd ../backend && npm install
```

## 🎯 Prochaines étapes

1. **Personnaliser le README** avec les infos de votre équipe
2. **Compléter le PITCH_DECK** avec vos données
3. **Ajouter vos wallets XRPL** dans `.env`
4. **Tester tous les composants** individuellement
5. **Préparer la démo** pour le jury

## 📞 Besoin d'aide ?

- **Documentation XRPL**: https://xrpl.org/docs
- **React**: https://react.dev
- **TailwindCSS**: https://tailwindcss.com/docs

## ✨ Fonctionnalités à implémenter

### Pour le hackathon (prioritaire)

- [ ] Connexion wallet XRPL (xrpl.js)
- [ ] Transaction de donation réelle
- [ ] Affichage dynamique des données
- [ ] Impact Map (Mapbox ou Google Maps)
- [ ] Système de leaderboard
- [ ] Donation Stories avec QR codes

### Post-hackathon

- [ ] Authentification JWT
- [ ] Base de données réelle
- [ ] Tests unitaires
- [ ] Tests E2E
- [ ] CI/CD pipeline
- [ ] Déploiement production

## 🎉 Bon développement !

Vous êtes maintenant prêt à bosser sur le projet XRPL Impact Fund !

**Objectif**: Créer un fonds caritatif transparent, durable et engageant sur XRPL.

**Vision**: Transformer chaque donation en moteur perpétuel de bien.

**Impact**: Financement stable pour les ONG + confiance restaurée + engagement gamifié.

---

**Questions?** Consultez la documentation dans `/docs/`

# Backend XRPL

Backend Node.js/Express pour interagir avec XRPL.

## Installation

```bash
npm install
```

## Packages installés

- **express** - Framework web
- **xrpl** - SDK officiel XRPL
- **cors** - Gestion CORS pour API
- **dotenv** - Variables d'environnement
- **nodemon** - Rechargement automatique (dev)

## Démarrage

```bash
# Mode développement (avec rechargement auto)
npm run dev

# Mode production
npm start
```

Le serveur démarre sur http://localhost:3001

## API Endpoints

### /GET `/api/health`

Vérifier le statut du serveur et la connexion XRPL

### GET `/api/account/:address`

Obtenir les informations d'un compte XRPL

### GET `/api/transactions/:address?limit=10`

Obtenir l'historique des transactions d'un compte

### POST `/api/send`

Envoyer une transaction XRP

```json
{
  "seed": "sXXXXXXXXXXXXXXXX",
  "destination": "rXXXXXXXXXXXXXXXX",
  "amount": "10"
}
```

### POST `/api/wallet/generate`

Générer un nouveau wallet XRPL

## Configuration

Modifiez `.env` pour changer de réseau :

- AlphaNet (défaut)
- Testnet
- Devnet
- Mainnet

## Exemple d'utilisation

```bash
# Vérifier le statut
curl http://localhost:3001/api/health

# Obtenir les infos d'un compte
curl http://localhost:3001/api/account/rYourAddress

# Générer un wallet
curl -X POST http://localhost:3001/api/wallet/generate
```

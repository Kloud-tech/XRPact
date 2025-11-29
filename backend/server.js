const express = require('express');
const cors = require('cors');
const xrpl = require('xrpl');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// XRPL Client
let client;

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xrpl-impact-map';

async function connectMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error);
    console.log('💡 Conseil: Installez MongoDB localement ou utilisez MongoDB Atlas');
    console.log('   Pour MongoDB local: brew install mongodb-community (macOS)');
    console.log('   Pour MongoDB Atlas: https://www.mongodb.com/cloud/atlas');
  }
}

// Initialiser la connexion XRPL
async function initXRPL() {
  try {
    // Testnet par défaut pour les escrows
    client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
    await client.connect();
    console.log('✅ Connecté à XRPL Testnet');
  } catch (error) {
    console.error('❌ Erreur de connexion XRPL:', error);
  }
}

// ============================================================================
// ROUTES EXISTANTES
// ============================================================================

// Health check
app.get('/api/health', async (req, res) => {
  res.json({
    status: 'OK',
    xrpl: client?.isConnected() || false,
    mongodb: mongoose.connection.readyState === 1
  });
});

// Obtenir les infos d'un compte
app.get('/api/account/:address', async (req, res) => {
  try {
    const { address } = req.params;

    if (!client?.isConnected()) {
      return res.status(503).json({ error: 'XRPL client non connecté' });
    }

    const accountInfo = await client.request({
      command: 'account_info',
      account: address,
      ledger_index: 'validated'
    });

    res.json(accountInfo.result);
  } catch (error) {
    res.status(500).json({
      error: 'Erreur lors de la récupération du compte',
      details: error.message
    });
  }
});

// Obtenir l'historique des transactions
app.get('/api/transactions/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    if (!client?.isConnected()) {
      return res.status(503).json({ error: 'XRPL client non connecté' });
    }

    const txHistory = await client.request({
      command: 'account_tx',
      account: address,
      limit: limit
    });

    res.json(txHistory.result);
  } catch (error) {
    res.status(500).json({
      error: 'Erreur lors de la récupération des transactions',
      details: error.message
    });
  }
});

// Envoyer une transaction (exemple)
app.post('/api/send', async (req, res) => {
  try {
    const { seed, destination, amount } = req.body;

    if (!seed || !destination || !amount) {
      return res.status(400).json({
        error: 'Paramètres manquants: seed, destination, amount requis'
      });
    }

    if (!client?.isConnected()) {
      return res.status(503).json({ error: 'XRPL client non connecté' });
    }

    // Créer le wallet depuis le seed
    const wallet = xrpl.Wallet.fromSeed(seed);

    // Préparer la transaction
    const payment = {
      TransactionType: 'Payment',
      Account: wallet.address,
      Destination: destination,
      Amount: xrpl.xrpToDrops(amount)
    };

    // Soumettre la transaction
    const result = await client.submitAndWait(payment, { wallet });

    res.json({
      success: true,
      hash: result.result.hash,
      result: result.result
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erreur lors de l\'envoi de la transaction',
      details: error.message
    });
  }
});

// Générer un nouveau wallet
app.post('/api/wallet/generate', (req, res) => {
  try {
    const wallet = xrpl.Wallet.generate();

    res.json({
      address: wallet.address,
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey,
      seed: wallet.seed,
      warning: '⚠️ Sauvegardez ces informations en lieu sûr!'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erreur lors de la génération du wallet',
      details: error.message
    });
  }
});

// ============================================================================
// NOUVELLES ROUTES ESCROW
// ============================================================================

const escrowRoutes = require('./routes/escrows');
app.use('/api/escrows', escrowRoutes);

// ============================================================================
// DÉMARRAGE DU SERVEUR
// ============================================================================

app.listen(PORT, async () => {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 XRPL Impact Map - Backend API');
  console.log('='.repeat(80));
  console.log(`📡 Serveur démarré sur http://localhost:${PORT}`);
  console.log('');

  // Connexions
  await Promise.all([
    connectMongoDB(),
    initXRPL()
  ]);

  console.log('');
  console.log('📋 Routes disponibles:');
  console.log('   GET  /api/health');
  console.log('   GET  /api/account/:address');
  console.log('   GET  /api/transactions/:address');
  console.log('   POST /api/send');
  console.log('   POST /api/wallet/generate');
  console.log('');
  console.log('   📦 ESCROWS:');
  console.log('   POST /api/escrows              - Créer un escrow');
  console.log('   GET  /api/escrows              - Lister les escrows');
  console.log('   GET  /api/escrows/:id          - Détails d\'un escrow');
  console.log('   POST /api/escrows/:id/validate - Valider avec photos');
  console.log('   POST /api/escrows/:id/unlock   - Débloquer manuellement');
  console.log('   POST /api/escrows/:id/cancel   - Annuler (clawback)');
  console.log('');
  console.log('='.repeat(80) + '\n');
});

// Gérer la fermeture propre
process.on('SIGINT', async () => {
  console.log('\n👋 Fermeture du serveur...');

  if (client?.isConnected()) {
    await client.disconnect();
  }

  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }

  process.exit(0);
});

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

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xrpl-impact-map';
let mongoConnected = false;

async function initMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
    console.log(`   Database: ${mongoose.connection.name}`);
    mongoConnected = true;
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error.message);
    console.log('⚠️  Mode MOCK (sans base de données)');
  }
}

// XRPL Client
let client;

// Initialiser la connexion XRPL
async function initXRPL() {
  try {
    const network = process.env.XRPL_NETWORK || 'wss://alphanet.nerdnest.xyz';
    client = new xrpl.Client(network);
    await client.connect();
    console.log('✅ Connecté à XRPL');
    console.log(`   Network: ${network}`);
  } catch (error) {
    console.error('❌ Erreur de connexion XRPL:', error);
  }
}

// Import des routes
const aiRoutes = require('./routes/ai');

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    xrpl: client?.isConnected() || false,
    mongodb: mongoConnected,
    mode: mongoConnected ? 'mongodb' : 'mock',
    ai: !!process.env.OPENAI_API_KEY
  });
});

// Routes IA
app.use('/api/ai', aiRoutes);

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

// Démarrer le serveur
app.listen(PORT, async () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Serveur backend XRPL + IA démarré`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}`);
  console.log(`💚 Health: http://localhost:${PORT}/api/health`);
  console.log(`🤖 AI Validation: http://localhost:${PORT}/api/ai/validate-image`);
  console.log(`📊 AI Stats: http://localhost:${PORT}/api/ai/stats`);
  console.log(`${'='.repeat(60)}`);
  
  await initMongoDB();
  await initXRPL();
  
  console.log(`${'='.repeat(60)}`);
  console.log(mongoConnected ? '✅ MongoDB: Connecté' : '⚠️  MongoDB: Mode MOCK');
  console.log(client?.isConnected() ? '✅ XRPL: Connecté' : '❌ XRPL: Déconnecté');
  console.log('🤖 IA: Service Python CLIP (démarrez avec: cd IA-Image && python api.py)');
  console.log(`${'='.repeat(60)}\n`);
});

// Gérer la fermeture propre
process.on('SIGINT', async () => {
  console.log('\n👋 Fermeture du serveur...');
  if (client?.isConnected()) {
    await client.disconnect();
  }
  if (mongoConnected) {
    await mongoose.disconnect();
    console.log('✅ MongoDB déconnecté');
  }
  process.exit(0);
});

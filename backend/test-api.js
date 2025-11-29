/**
 * Test de l'API Escrow Management
 * 
 * Ce script teste toutes les routes de l'API escrow
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// Couleurs pour les logs
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAPI() {
    log('\n' + '='.repeat(80), 'cyan');
    log('🧪 TEST DE L\'API ESCROW MANAGEMENT', 'cyan');
    log('='.repeat(80) + '\n', 'cyan');

    try {
        // 1. Health Check
        log('📝 Test 1: Health Check', 'blue');
        const health = await axios.get(`${API_BASE}/health`);
        log(`✅ Status: ${health.data.status}`, 'green');
        log(`   XRPL: ${health.data.xrpl}`, 'green');
        log(`   MongoDB: ${health.data.mongodb}\n`, 'green');

        // 2. Générer un wallet donateur
        log('📝 Test 2: Génération de wallet donateur', 'blue');
        const donorWalletResp = await axios.post(`${API_BASE}/wallet/generate`);
        const donorWallet = donorWalletResp.data;
        log(`✅ Donateur: ${donorWallet.address}`, 'green');
        log(`   Seed: ${donorWallet.seed}\n`, 'green');

        // 3. Générer un wallet bénéficiaire
        log('📝 Test 3: Génération de wallet bénéficiaire', 'blue');
        const beneficiaryWalletResp = await axios.post(`${API_BASE}/wallet/generate`);
        const beneficiaryWallet = beneficiaryWalletResp.data;
        log(`✅ Bénéficiaire: ${beneficiaryWallet.address}\n`, 'green');

        // 4. Financer les wallets (via faucet)
        log('📝 Test 4: Financement des wallets via faucet...', 'blue');
        log('   (Cette étape peut prendre 10-15 secondes)', 'yellow');

        const Client = require('xrpl').Client;
        const client = new Client('wss://s.altnet.rippletest.net:51233');
        await client.connect();

        const donorFunded = await client.fundWallet();
        const beneficiaryFunded = await client.fundWallet();

        log(`✅ Donateur financé: ${donorFunded.wallet.address} (${donorFunded.balance} XRP)`, 'green');
        log(`✅ Bénéficiaire financé: ${beneficiaryFunded.wallet.address} (${beneficiaryFunded.balance} XRP)\n`, 'green');

        await client.disconnect();

        // 5. Créer un escrow via l'API
        log('📝 Test 5: Création d\'un escrow via API', 'blue');
        const escrowData = {
            donorSeed: donorFunded.wallet.seed,
            amount: '15',
            beneficiaryAddress: beneficiaryFunded.wallet.address,
            projectId: 'test-project-001',
            projectName: 'Puits au Sénégal - Test',
            projectDescription: 'Projet de test pour validation API',
            deadlineDays: 7
        };

        log(`   Montant: ${escrowData.amount} XRP`, 'yellow');
        log(`   Projet: ${escrowData.projectName}`, 'yellow');
        log(`   Deadline: ${escrowData.deadlineDays} jours\n`, 'yellow');

        const createResp = await axios.post(`${API_BASE}/escrows`, escrowData);
        const escrow = createResp.data.escrow;

        log(`✅ Escrow créé avec succès!`, 'green');
        log(`   ID: ${escrow.escrowId}`, 'green');
        log(`   TX Hash: ${escrow.txHash}`, 'green');
        log(`   Explorer: ${escrow.explorerUrl}\n`, 'green');

        // 6. Récupérer les détails de l'escrow
        log('📝 Test 6: Récupération des détails de l\'escrow', 'blue');
        const detailsResp = await axios.get(`${API_BASE}/escrows/${escrow.escrowId}`);
        log(`✅ Détails récupérés:`, 'green');
        log(`   Status: ${detailsResp.data.status}`, 'green');
        log(`   Montant: ${detailsResp.data.amountXRP} XRP`, 'green');
        log(`   Projet: ${detailsResp.data.projectName}\n`, 'green');

        // 7. Lister tous les escrows
        log('📝 Test 7: Listage des escrows', 'blue');
        const listResp = await axios.get(`${API_BASE}/escrows`);
        log(`✅ ${listResp.data.total} escrow(s) trouvé(s)\n`, 'green');

        // 8. Soumettre des photos pour validation
        log('📝 Test 8: Soumission de photos pour validation', 'blue');
        const photos = [
            'https://example.com/photo1.jpg',
            'https://example.com/photo2.jpg',
            'https://example.com/photo3.jpg'
        ];

        log(`   Photos: ${photos.length} photos soumises`, 'yellow');
        log(`   Auto-unlock: activé\n`, 'yellow');

        const validationResp = await axios.post(`${API_BASE}/escrows/${escrow.escrowId}/validate`, {
            photos,
            autoUnlock: true
        });

        log(`✅ Validation effectuée:`, 'green');
        log(`   Validé: ${validationResp.data.validated}`, 'green');
        log(`   Débloqué: ${validationResp.data.unlocked}`, 'green');

        if (validationResp.data.unlocked) {
            log(`   TX Unlock: ${validationResp.data.unlockTxHash}`, 'green');
            log(`   🔗 https://testnet.xrpl.org/transactions/${validationResp.data.unlockTxHash}`, 'green');
        }
        log('', 'reset');

        // 9. Vérifier le statut final
        log('📝 Test 9: Vérification du statut final', 'blue');
        const finalResp = await axios.get(`${API_BASE}/escrows/${escrow.escrowId}`);
        log(`✅ Status final: ${finalResp.data.status}`, 'green');
        log(`   Score IA: ${finalResp.data.aiValidationScore}\n`, 'green');

        // Résumé
        log('='.repeat(80), 'cyan');
        log('✅ TOUS LES TESTS RÉUSSIS!', 'green');
        log('='.repeat(80) + '\n', 'cyan');

        log('📋 Résumé:', 'blue');
        log(`   - Escrow ID: ${escrow.escrowId}`, 'yellow');
        log(`   - Montant: 15 XRP`, 'yellow');
        log(`   - Status: ${finalResp.data.status}`, 'yellow');
        log(`   - Donateur: ${donorFunded.wallet.address}`, 'yellow');
        log(`   - Bénéficiaire: ${beneficiaryFunded.wallet.address}`, 'yellow');
        log('', 'reset');

    } catch (error) {
        log('\n❌ ERREUR LORS DU TEST:', 'red');
        if (error.response) {
            log(`   Status: ${error.response.status}`, 'red');
            log(`   Message: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
        } else {
            log(`   ${error.message}`, 'red');
        }
        log('\n💡 Assurez-vous que:', 'yellow');
        log('   1. Le serveur est démarré (npm start)', 'yellow');
        log('   2. MongoDB est en cours d\'exécution', 'yellow');
        log('   3. Le fichier .env est configuré\n', 'yellow');
        process.exit(1);
    }
}

// Exécuter les tests
log('\n🚀 Démarrage des tests API...\n', 'cyan');
testAPI().then(() => {
    log('✅ Tests terminés!\n', 'green');
    process.exit(0);
}).catch(error => {
    log(`❌ Erreur fatale: ${error.message}\n`, 'red');
    process.exit(1);
});

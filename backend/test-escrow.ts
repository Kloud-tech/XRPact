/**
 * Script de test simple pour SmartEscrowService
 * 
 * Ce script va:
 * 1. Générer des wallets Testnet
 * 2. Les financer via le faucet
 * 3. Créer un escrow simple
 * 4. Le débloquer
 */

import SmartEscrowService from './SmartEscrowService';
import { Client, Wallet } from 'xrpl';

const TESTNET_URL = 'wss://s.altnet.rippletest.net:51233';

async function fundWallet(client: Client): Promise<Wallet> {
    console.log('💰 Demande de financement au faucet Testnet...');
    const response = await client.fundWallet();
    console.log(`✅ Wallet financé: ${response.wallet.address}`);
    console.log(`   Balance: ${response.balance} XRP`);
    return response.wallet;
}

async function testSmartEscrow() {
    console.log('\n' + '='.repeat(80));
    console.log('🧪 TEST SMART ESCROW SERVICE');
    console.log('='.repeat(80) + '\n');

    const client = new Client(TESTNET_URL);

    try {
        await client.connect();
        console.log('✅ Connecté au XRPL Testnet\n');

        // 1. Créer et financer les wallets
        console.log('📝 Étape 1: Création des wallets de test\n');

        const donorWallet = await fundWallet(client);
        const beneficiaryWallet = await fundWallet(client);
        const oracleWallet = await fundWallet(client);

        console.log('\n📋 Wallets créés:');
        console.log(`   Donateur: ${donorWallet.address}`);
        console.log(`   Bénéficiaire: ${beneficiaryWallet.address}`);
        console.log(`   Oracle: ${oracleWallet.address}`);

        await client.disconnect();

        // 2. Créer le service
        console.log('\n📝 Étape 2: Création d\'un escrow conditionnel\n');

        const service = new SmartEscrowService(TESTNET_URL);

        // Générer un secret Oracle
        const oracleSecret = service.generateRandomSecret();
        console.log(`🔑 Secret Oracle généré: ${oracleSecret.substring(0, 16)}...\n`);

        // Créer l'escrow
        const escrowInfo = await service.createSmartEscrow({
            donorSeed: donorWallet.seed!,
            amount: '10', // 10 XRP
            beneficiary: beneficiaryWallet.address,
            oracleSecret: oracleSecret,
            deadline: Math.floor(Date.now() / 1000) + 60 * 60, // 1 heure
        });

        console.log('\n✅ Escrow créé avec succès!');
        console.log(`   Owner: ${escrowInfo.owner}`);
        console.log(`   Sequence: ${escrowInfo.sequence}`);
        console.log(`   TX Hash: ${escrowInfo.txHash}`);
        console.log(`   Montant: ${parseInt(escrowInfo.amount) / 1_000_000} XRP`);
        console.log(`   Bénéficiaire: ${escrowInfo.destination}`);
        console.log(`\n   🔗 Explorer: https://testnet.xrpl.org/transactions/${escrowInfo.txHash}`);

        // 3. Attendre un peu (pour que la transaction soit bien confirmée)
        console.log('\n⏳ Attente de 5 secondes...\n');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // 4. Débloquer l'escrow
        console.log('📝 Étape 3: Déblocage de l\'escrow\n');

        const unlockTxHash = await service.fulfillEscrow(
            oracleWallet,
            escrowInfo.owner,
            escrowInfo.sequence,
            oracleSecret
        );

        console.log('\n🎉 SUCCÈS! Escrow débloqué!');
        console.log(`   TX Hash: ${unlockTxHash}`);
        console.log(`   🔗 Explorer: https://testnet.xrpl.org/transactions/${unlockTxHash}`);

        // 5. Vérifier les balances
        console.log('\n📝 Étape 4: Vérification des balances finales\n');

        await client.connect();

        const donorBalance = await client.getXrpBalance(donorWallet.address);
        const beneficiaryBalance = await client.getXrpBalance(beneficiaryWallet.address);

        console.log('💰 Balances finales:');
        console.log(`   Donateur: ${donorBalance} XRP`);
        console.log(`   Bénéficiaire: ${beneficiaryBalance} XRP`);

        await client.disconnect();

        console.log('\n' + '='.repeat(80));
        console.log('✅ TEST RÉUSSI! Toutes les fonctionnalités marchent!');
        console.log('='.repeat(80) + '\n');

    } catch (error) {
        console.error('\n❌ ERREUR:', error);
        if (error instanceof Error) {
            console.error('   Message:', error.message);
            console.error('   Stack:', error.stack);
        }
        await client.disconnect();
        process.exit(1);
    }
}

// Exécuter le test
console.log('🚀 Démarrage du test SmartEscrowService...\n');
testSmartEscrow().then(() => {
    console.log('✅ Test terminé avec succès!');
    process.exit(0);
}).catch(error => {
    console.error('❌ Test échoué:', error);
    process.exit(1);
});

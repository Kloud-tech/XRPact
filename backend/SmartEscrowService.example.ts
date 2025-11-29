/**
 * Exemples d'utilisation du SmartEscrowService
 * 
 * Ce fichier contient des exemples concrets d'utilisation du service
 * pour créer des dons conditionnels sur XRPL.
 * 
 * ⚠️ IMPORTANT: Utilisez des wallets Testnet financés avec le faucet:
 * https://xrpl.org/xrp-testnet-faucet.html
 */

import SmartEscrowService, { Milestone } from './SmartEscrowService';
import { Wallet } from 'xrpl';

// ============================================================================
// CONFIGURATION
// ============================================================================

// Testnet XRPL
const TESTNET_URL = 'wss://s.altnet.rippletest.net:51233';

// Exemples de wallets (À REMPLACER par vos vrais seeds Testnet)
const DONOR_SEED = 'sXXXXXXXXXXXXXXXXXXXXXXXXX'; // Seed du donateur
const ORACLE_SEED = 'sYYYYYYYYYYYYYYYYYYYYYYYYY'; // Seed de l'Oracle (backend IA)
const BENEFICIARY_ADDRESS = 'rZZZZZZZZZZZZZZZZZZZZZZZZZ'; // Adresse de l'ONG

// ============================================================================
// EXEMPLE 1: DON SIMPLE AVEC VALIDATION
// ============================================================================

async function example1_simpleDonation() {
    console.log('\n' + '='.repeat(80));
    console.log('EXEMPLE 1: Don simple avec validation Oracle');
    console.log('='.repeat(80) + '\n');

    const service = new SmartEscrowService(TESTNET_URL);

    try {
        // Étape 1: Le donateur crée un escrow conditionnel
        console.log('📝 Étape 1: Création de l\'escrow par le donateur\n');

        const oracleSecret = service.generateRandomSecret();
        console.log(`🔑 Secret Oracle généré: ${oracleSecret}\n`);

        const escrowInfo = await service.createSmartEscrow({
            donorSeed: DONOR_SEED,
            amount: '50', // 50 XRP
            beneficiary: BENEFICIARY_ADDRESS,
            oracleSecret: oracleSecret,
            deadline: Date.now() / 1000 + 7 * 24 * 60 * 60, // 7 jours
        });

        console.log('\n💾 Informations de l\'escrow (À STOCKER):');
        console.log(JSON.stringify({
            owner: escrowInfo.owner,
            sequence: escrowInfo.sequence,
            txHash: escrowInfo.txHash,
            fulfillment: escrowInfo.fulfillment, // ⚠️ SECRET - À garder côté Oracle
        }, null, 2));

        // Étape 2: Simulation - L'IA valide les preuves terrain
        console.log('\n\n⏳ Simulation: L\'ONG envoie des photos du terrain...');
        console.log('🤖 L\'IA analyse et valide les preuves...');

        // Attendre 3 secondes (simulation)
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log('✅ Validation réussie! L\'Oracle débloque les fonds.\n');

        // Étape 3: L'Oracle débloque les fonds
        console.log('📝 Étape 2: Déblocage des fonds par l\'Oracle\n');

        const oracleWallet = Wallet.fromSeed(ORACLE_SEED);

        const unlockTxHash = await service.fulfillEscrow(
            oracleWallet,
            escrowInfo.owner,
            escrowInfo.sequence,
            oracleSecret
        );

        console.log(`\n🎉 Don de 50 XRP transféré au bénéficiaire!`);
        console.log(`Explorer: https://testnet.xrpl.org/transactions/${unlockTxHash}`);

    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

// ============================================================================
// EXEMPLE 2: DON AVEC JALONS (MILESTONES)
// ============================================================================

async function example2_milestones() {
    console.log('\n' + '='.repeat(80));
    console.log('EXEMPLE 2: Don avec jalons (paiements fractionnés)');
    console.log('='.repeat(80) + '\n');

    const service = new SmartEscrowService(TESTNET_URL);

    try {
        // Configuration: 100 XRP divisés en 3 jalons
        const milestones: Milestone[] = [
            {
                percentage: 30,
                description: 'Démarrage du projet',
                oracleSecret: service.generateRandomSecret(),
                deadline: Date.now() / 1000 + 7 * 24 * 60 * 60, // 7 jours
            },
            {
                percentage: 50,
                description: 'Phase intermédiaire',
                oracleSecret: service.generateRandomSecret(),
                deadline: Date.now() / 1000 + 14 * 24 * 60 * 60, // 14 jours
            },
            {
                percentage: 20,
                description: 'Finalisation',
                oracleSecret: service.generateRandomSecret(),
                deadline: Date.now() / 1000 + 30 * 24 * 60 * 60, // 30 jours
            },
        ];

        console.log('📊 Structure des jalons:');
        milestones.forEach((m, i) => {
            console.log(`   ${i + 1}. ${m.description}: ${m.percentage}%`);
        });

        // Créer tous les escrows de jalons
        const escrows = await service.createMilestoneEscrows(
            {
                donorSeed: DONOR_SEED,
                amount: '100', // 100 XRP total
                beneficiary: BENEFICIARY_ADDRESS,
                oracleSecret: 'not-used', // Les secrets sont dans les milestones
            },
            milestones
        );

        console.log('\n💾 Escrows créés (À STOCKER):');
        escrows.forEach((e, i) => {
            console.log(`\nJalon ${i + 1}:`);
            console.log(`  - Sequence: ${e.sequence}`);
            console.log(`  - Montant: ${parseInt(e.amount) / 1_000_000} XRP`);
            console.log(`  - Secret: ${milestones[i].oracleSecret}`);
        });

        // Exemple: Débloquer le premier jalon
        console.log('\n\n📝 Simulation: Déblocage du jalon 1 après validation\n');

        const oracleWallet = Wallet.fromSeed(ORACLE_SEED);

        const unlockTx = await service.fulfillEscrow(
            oracleWallet,
            escrows[0].owner,
            escrows[0].sequence,
            milestones[0].oracleSecret
        );

        console.log(`\n✅ Jalon 1 débloqué (30 XRP)!`);
        console.log(`Explorer: https://testnet.xrpl.org/transactions/${unlockTx}`);

    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

// ============================================================================
// EXEMPLE 3: CLAWBACK (RÉCUPÉRATION PAR LE DONATEUR)
// ============================================================================

async function example3_clawback() {
    console.log('\n' + '='.repeat(80));
    console.log('EXEMPLE 3: Clawback - Projet non validé');
    console.log('='.repeat(80) + '\n');

    const service = new SmartEscrowService(TESTNET_URL);

    try {
        // Créer un escrow avec une deadline très courte (30 secondes)
        console.log('📝 Création d\'un escrow avec deadline de 30 secondes\n');

        const oracleSecret = service.generateRandomSecret();

        const escrowInfo = await service.createSmartEscrow({
            donorSeed: DONOR_SEED,
            amount: '25',
            beneficiary: BENEFICIARY_ADDRESS,
            oracleSecret: oracleSecret,
            deadline: Date.now() / 1000 + 30, // 30 secondes
        });

        console.log(`✅ Escrow créé (Sequence: ${escrowInfo.sequence})`);
        console.log('⏳ Attente de l\'expiration (30 secondes)...\n');

        // Attendre 35 secondes
        await new Promise(resolve => setTimeout(resolve, 35000));

        // Déclencher le clawback
        console.log('📝 Déclenchement du clawback\n');

        const anyWallet = Wallet.fromSeed(ORACLE_SEED); // N'importe qui peut déclencher

        const clawbackTx = await service.triggerClawback(
            anyWallet,
            escrowInfo.owner,
            escrowInfo.sequence
        );

        console.log(`\n✅ Fonds retournés au donateur!`);
        console.log(`Explorer: https://testnet.xrpl.org/transactions/${clawbackTx}`);

    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

// ============================================================================
// EXEMPLE 4: VÉRIFIER L'ÉTAT D'UN ESCROW
// ============================================================================

async function example4_checkEscrowStatus() {
    console.log('\n' + '='.repeat(80));
    console.log('EXEMPLE 4: Vérification de l\'état d\'un escrow');
    console.log('='.repeat(80) + '\n');

    const service = new SmartEscrowService(TESTNET_URL);

    try {
        // Remplacer par un vrai owner et sequence
        const OWNER = 'rXXXXXXXXXXXXXXXXXXXXXXXXX';
        const SEQUENCE = 12345;

        console.log(`📋 Recherche de l'escrow:`);
        console.log(`   Owner: ${OWNER}`);
        console.log(`   Sequence: ${SEQUENCE}\n`);

        const escrowData = await service.getEscrowInfo(OWNER, SEQUENCE);

        if (escrowData) {
            console.log('✅ Escrow trouvé:');
            console.log(JSON.stringify(escrowData, null, 2));
        } else {
            console.log('❌ Escrow non trouvé (peut-être déjà exécuté ou annulé)');
        }

    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

// ============================================================================
// EXÉCUTION DES EXEMPLES
// ============================================================================

async function main() {
    console.log('\n🚀 XRPL Impact Map - Smart Escrow Service Examples');
    console.log('='.repeat(80));

    // ⚠️ Décommenter l'exemple que vous voulez tester

    // await example1_simpleDonation();
    // await example2_milestones();
    // await example3_clawback();
    // await example4_checkEscrowStatus();

    console.log('\n✅ Tests terminés!\n');
}

// Exécuter si appelé directement
if (require.main === module) {
    main().catch(console.error);
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
    example1_simpleDonation,
    example2_milestones,
    example3_clawback,
    example4_checkEscrowStatus,
};

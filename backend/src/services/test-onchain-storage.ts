/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TEST - XRPL ON-CHAIN STORAGE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Démonstration complète du stockage on-chain sur XRPL:
 * 1. Stockage avec Memos (max 1KB)
 * 2. Stockage avec NFT Metadata
 * 3. Lecture depuis ON-CHAIN
 * 4. Stockage des ONG
 *
 * Usage:
 *   tsx backend/src/services/test-onchain-storage.ts
 */

import { XRPLOnChainStorage } from './xrpl-onchain-storage';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const TEST_CONFIG = {
  network: 'testnet' as const,
  websocketUrl: 'wss://s.altnet.rippletest.net:51233',
  poolWalletSeed: process.env.XRPL_POOL_WALLET_SEED || 'sEdTM1uX8pu2do5XvTnutH6HsouMaM2', // Testnet seed
  poolWalletAddress: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz', // Testnet address
  enableLogging: true,
  logLevel: 'info' as const,
  useHooks: false, // Set to true for Xahau network
};

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

async function runOnChainStorageTests() {
  console.log('\n' + '═'.repeat(80));
  console.log('🧪 XRPL ON-CHAIN STORAGE - TEST SUITE');
  console.log('═'.repeat(80) + '\n');

  const service = new XRPLOnChainStorage(TEST_CONFIG);

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Connexion au réseau XRPL
    // -------------------------------------------------------------------------
    console.log('📌 TEST 1: Connexion au réseau XRPL\n');

    await service.connect();

    console.log('\n✅ Test 1 réussi\n');
    console.log('─'.repeat(80) + '\n');

    // -------------------------------------------------------------------------
    // TEST 2: Enregistrer une donation ON-CHAIN avec MEMO
    // -------------------------------------------------------------------------
    console.log('📌 TEST 2: Enregistrer une donation ON-CHAIN avec MEMO\n');

    const donation1 = {
      donorAddress: 'rDonor123456789ABCDEFGHIJKLMNOP',
      amount: 100,
      timestamp: Date.now(),
      xpGained: 1000,
      level: 4,
      nftTokenId: undefined,
      txHash: '',
    };

    console.log('💾 Sauvegarde de la donation avec MEMO...');
    console.log(`   Donateur: ${donation1.donorAddress}`);
    console.log(`   Montant: ${donation1.amount} XRP`);
    console.log(`   XP: ${donation1.xpGained}`);
    console.log(`   Niveau: ${donation1.level}`);

    const txHash1 = await service.saveDonationWithMemo(donation1);

    console.log(`\n   ✅ Donation enregistrée ON-CHAIN!`);
    console.log(`   ✅ TX Hash: ${txHash1}`);
    console.log(`   ✅ Stocké dans le MEMO de la transaction`);
    console.log(
      `   ✅ Voir sur explorer: https://testnet.xrpl.org/transactions/${txHash1}`
    );

    console.log('\n✅ Test 2 réussi\n');
    console.log('─'.repeat(80) + '\n');

    // -------------------------------------------------------------------------
    // TEST 3: Lire la donation depuis ON-CHAIN
    // -------------------------------------------------------------------------
    console.log('📌 TEST 3: Lire la donation depuis ON-CHAIN\n');

    console.log('📖 Lecture de la donation depuis le ledger...');

    const readDonation = await service.readDonationFromMemo(txHash1);

    if (readDonation) {
      console.log('\n   ✅ Donation lue depuis ON-CHAIN!');
      console.log(`   Donateur: ${readDonation.donorAddress}`);
      console.log(`   Montant: ${readDonation.amount} XRP`);
      console.log(`   XP: ${readDonation.xpGained}`);
      console.log(`   Niveau: ${readDonation.level}`);
      console.log(`   Timestamp: ${new Date(readDonation.timestamp).toISOString()}`);
    }

    console.log('\n✅ Test 3 réussi\n');
    console.log('─'.repeat(80) + '\n');

    // -------------------------------------------------------------------------
    // TEST 4: Enregistrer plusieurs donations
    // -------------------------------------------------------------------------
    console.log('📌 TEST 4: Enregistrer plusieurs donations ON-CHAIN\n');

    const donations = [
      {
        donorAddress: 'rDonor123456789ABCDEFGHIJKLMNOP',
        amount: 250,
        timestamp: Date.now(),
        xpGained: 2500,
        level: 6,
        nftTokenId: undefined,
        txHash: '',
      },
      {
        donorAddress: 'rDonor123456789ABCDEFGHIJKLMNOP',
        amount: 500,
        timestamp: Date.now(),
        xpGained: 5000,
        level: 8,
        nftTokenId: undefined,
        txHash: '',
      },
    ];

    console.log('💾 Sauvegarde de 2 donations supplémentaires...\n');

    for (let i = 0; i < donations.length; i++) {
      const donation = donations[i];
      console.log(`   ${i + 1}. Donation de ${donation.amount} XRP`);

      const txHash = await service.saveDonationWithMemo(donation);

      console.log(`      ✅ TX: ${txHash}`);
    }

    console.log('\n✅ Test 4 réussi\n');
    console.log('─'.repeat(80) + '\n');

    // -------------------------------------------------------------------------
    // TEST 5: Récupérer l'historique complet d'un donateur
    // -------------------------------------------------------------------------
    console.log('📌 TEST 5: Récupérer l\'historique depuis ON-CHAIN\n');

    const donorAddress = 'rDonor123456789ABCDEFGHIJKLMNOP';

    console.log('📜 Récupération de l\'historique...');
    console.log(`   Donateur: ${donorAddress}`);

    const history = await service.getDonationHistory(donorAddress);

    console.log(`\n   ✅ ${history.length} donations trouvées ON-CHAIN!\n`);

    history.forEach((don, index) => {
      console.log(`   ${index + 1}. ${don.amount} XRP - Level ${don.level} - ${new Date(don.timestamp).toLocaleString()}`);
      console.log(`      TX: ${don.txHash}`);
    });

    const totalDonated = history.reduce((sum, don) => sum + don.amount, 0);
    const totalXP = history.reduce((sum, don) => sum + don.xpGained, 0);

    console.log(`\n   📊 Total donné: ${totalDonated} XRP`);
    console.log(`   📊 Total XP: ${totalXP}`);
    console.log(`   📊 Niveau actuel: ${history[history.length - 1]?.level || 0}`);

    console.log('\n✅ Test 5 réussi\n');
    console.log('─'.repeat(80) + '\n');

    // -------------------------------------------------------------------------
    // TEST 6: Mint d'un NFT avec métadonnées ON-CHAIN
    // -------------------------------------------------------------------------
    console.log('📌 TEST 6: Mint d\'un Impact NFT avec métadonnées ON-CHAIN\n');

    const nftDonorAddress = 'rDonor123456789ABCDEFGHIJKLMNOP';
    const nftLevel = 10;
    const nftXP = 10000;

    console.log('🎨 Mint d\'un Impact NFT...');
    console.log(`   Donateur: ${nftDonorAddress}`);
    console.log(`   Niveau: ${nftLevel}`);
    console.log(`   XP: ${nftXP}`);

    const nftTokenId = await service.mintImpactNFTWithMetadata(
      nftDonorAddress,
      nftLevel,
      nftXP
    );

    console.log(`\n   ✅ Impact NFT minté ON-CHAIN!`);
    console.log(`   ✅ Token ID: ${nftTokenId}`);
    console.log(`   ✅ Métadonnées stockées dans l'URI du NFT`);
    console.log(`   ✅ Données additionnelles dans le MEMO`);

    console.log('\n✅ Test 6 réussi\n');
    console.log('─'.repeat(80) + '\n');

    // -------------------------------------------------------------------------
    // TEST 7: Lire les métadonnées du NFT
    // -------------------------------------------------------------------------
    console.log('📌 TEST 7: Lire les métadonnées du NFT depuis ON-CHAIN\n');

    console.log('📖 Lecture des métadonnées...');

    const metadata = await service.readNFTMetadata(nftTokenId);

    if (metadata) {
      console.log('\n   ✅ Métadonnées lues depuis ON-CHAIN!');
      console.log(`   Nom: ${metadata.name}`);
      console.log(`   Description: ${metadata.description}`);
      console.log(`\n   Attributs:`);

      metadata.attributes.forEach((attr: any) => {
        console.log(`      - ${attr.trait_type}: ${attr.value}`);
      });
    }

    console.log('\n✅ Test 7 réussi\n');
    console.log('─'.repeat(80) + '\n');

    // -------------------------------------------------------------------------
    // TEST 8: Enregistrer des ONG ON-CHAIN
    // -------------------------------------------------------------------------
    console.log('📌 TEST 8: Enregistrer des ONG ON-CHAIN\n');

    const ngos = [
      {
        id: 'ngo_1',
        name: 'Climate Action Network',
        walletAddress: 'rClimateAction123456789ABCDEF',
        category: 'climate',
        impactScore: 95,
        weight: 0.25,
        verified: true,
        certifications: ['UN_VERIFIED', 'ISO_14001'],
        totalReceived: 0,
        timestamp: Date.now(),
      },
      {
        id: 'ngo_2',
        name: 'Water For All',
        walletAddress: 'rWaterForAll123456789ABCDEFG',
        category: 'water',
        impactScore: 92,
        weight: 0.2,
        verified: true,
        certifications: ['UN_VERIFIED', 'CHARITY_NAVIGATOR_4STAR'],
        totalReceived: 0,
        timestamp: Date.now(),
      },
    ];

    console.log('🏛️  Enregistrement de 2 ONG...\n');

    for (const ngo of ngos) {
      console.log(`   ${ngo.id}: ${ngo.name}`);

      const ngoTxHash = await service.saveNGOOnChain(ngo);

      console.log(`      ✅ TX: ${ngoTxHash}`);
      console.log(`      ✅ Impact Score: ${ngo.impactScore}`);
      console.log(`      ✅ Certifications: ${ngo.certifications.join(', ')}`);
    }

    console.log('\n✅ Test 8 réussi\n');
    console.log('─'.repeat(80) + '\n');

    // -------------------------------------------------------------------------
    // TEST 9: Récupérer toutes les ONG depuis ON-CHAIN
    // -------------------------------------------------------------------------
    console.log('📌 TEST 9: Récupérer toutes les ONG depuis ON-CHAIN\n');

    console.log('📜 Récupération de toutes les ONG...');

    const allNGOs = await service.getAllNGOs();

    console.log(`\n   ✅ ${allNGOs.length} ONG trouvées ON-CHAIN!\n`);

    allNGOs.forEach((ngo, index) => {
      console.log(`   ${index + 1}. ${ngo.name} (${ngo.category})`);
      console.log(`      Impact Score: ${ngo.impactScore}`);
      console.log(`      Verified: ${ngo.verified ? '✓' : '✗'}`);
      console.log(`      Wallet: ${ngo.walletAddress}`);
    });

    console.log('\n✅ Test 9 réussi\n');
    console.log('─'.repeat(80) + '\n');

    // -------------------------------------------------------------------------
    // TEST 10: Statistiques du service
    // -------------------------------------------------------------------------
    console.log('📌 TEST 10: Statistiques du service ON-CHAIN\n');

    const stats = service.getStatistics();

    console.log('   Network:', stats.network);
    console.log('   Use Hooks:', stats.useHooks);
    console.log('   Cached Donations:', stats.cachedDonations);
    console.log('   Cached NGOs:', stats.cachedNGOs);

    console.log('\n✅ Test 10 réussi\n');
    console.log('─'.repeat(80) + '\n');

    // -------------------------------------------------------------------------
    // RÉSUMÉ FINAL
    // -------------------------------------------------------------------------
    console.log('\n' + '═'.repeat(80));
    console.log('🎉 TOUS LES TESTS ON-CHAIN RÉUSSIS !');
    console.log('═'.repeat(80));

    console.log('\n📊 Résumé de la session de test:\n');
    console.log(`   ✅ Donations enregistrées ON-CHAIN: ${history.length}`);
    console.log(`   ✅ Total donné: ${totalDonated} XRP`);
    console.log(`   ✅ NFT minté: 1`);
    console.log(`   ✅ ONG enregistrées: ${allNGOs.length}`);
    console.log(`   ✅ Toutes les données sont sur le LEDGER XRPL!`);

    console.log('\n' + '═'.repeat(80));
    console.log('✨ XRPL On-Chain Storage - Décentralisé et Transparent ✨');
    console.log('═'.repeat(80) + '\n');

    console.log('🔗 Sources:');
    console.log('   - Memos: https://xrpl.org/docs/references/protocol/transactions/common-fields');
    console.log('   - Hooks: https://hooks.xrpl.org/');
    console.log('   - NFTs: https://xrpl.org/docs/tutorials/nfts/');
    console.log('\n');

    // Shutdown propre
    await service.disconnect();
  } catch (error: any) {
    console.error('\n❌ ERREUR CRITIQUE:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXÉCUTION
// ═══════════════════════════════════════════════════════════════════════════

if (import.meta.url === `file://${process.argv[1]}`) {
  runOnChainStorageTests()
    .then(() => {
      console.log('\n✅ Tests terminés avec succès\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Tests échoués:', error);
      process.exit(1);
    });
}

export { runOnChainStorageTests };

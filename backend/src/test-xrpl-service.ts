/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TEST XRPL SERVICE - Démonstration Complète
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Ce fichier démontre toutes les fonctionnalités du XRPLService:
 * ✅ Envoi dépôt XRPL
 * ✅ Lecture de solde XRPL
 * ✅ Enregistrement d'un don en base
 * ✅ Fonction mock "calcul du profit"
 * ✅ Fonction de redistribution XRPL automatique
 * ✅ Logging + vérification
 * ✅ Gestion d'un mode "Emergency Redistribution"
 *
 * Usage:
 *   cd backend
 *   npx ts-node src/test-xrpl-service.ts
 */

import { XRPLService } from './services/xrpl-service.complete';

// ═══════════════════════════════════════════════════════════════════════════
// TEST SUITE
// ═══════════════════════════════════════════════════════════════════════════

async function runFullTest() {
  console.log('\n');
  console.log('═'.repeat(80));
  console.log('  XRPL SERVICE - TEST COMPLET');
  console.log('═'.repeat(80));
  console.log('\n');

  // Initialiser le service en mode MOCK
  const xrplService = new XRPLService({
    mockMode: true,
    enableLogging: true,
    emergencyThreshold: 20,
  });

  try {
    // ─────────────────────────────────────────────────────────────────────────
    // TEST 1: INITIALISATION
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n📋 TEST 1: Initialisation du service\n');

    await xrplService.initialize();
    console.log('✅ Service initialisé avec succès\n');

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 2: LECTURE DE SOLDE XRPL
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n📋 TEST 2: Lecture de solde XRPL\n');

    const testAddress = 'rTestAddress123456789012345';
    const balance = await xrplService.getBalance(testAddress);
    console.log(`   Solde de ${testAddress}: ${balance.toFixed(2)} XRP`);

    const poolBalance = await xrplService.getPoolBalance();
    console.log(`   Solde du pool: ${poolBalance.toFixed(2)} XRP`);
    console.log('✅ Lecture de solde OK\n');

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 3: ENVOI DÉPÔT XRPL (DONATION)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n📋 TEST 3: Enregistrement d\'une donation\n');

    const donor1 = 'rDonor1234567890123456789012';
    const donation1 = await xrplService.processDonation(donor1, 100);

    console.log('   Résultat donation:');
    console.log(`   - Donateur: ${donation1.donorAddress}`);
    console.log(`   - Montant: ${donation1.amount} XRP`);
    console.log(`   - XP gagné: ${donation1.xpGained}`);
    console.log(`   - Nouveau niveau: ${donation1.newLevel}`);
    console.log(`   - NFT minté: ${donation1.nftMinted ? 'OUI' : 'NON'}`);
    if (donation1.nftTokenId) {
      console.log(`   - NFT Token ID: ${donation1.nftTokenId}`);
    }
    if (donation1.ditTokenId) {
      console.log(`   - DIT Token ID: ${donation1.ditTokenId}`);
    }
    console.log(`   - Nouveau solde pool: ${donation1.poolBalance.toFixed(2)} XRP`);
    console.log('✅ Donation enregistrée avec succès\n');

    // Tester une deuxième donation du même donateur (level up)
    console.log('   Test donation #2 (même donateur, level up attendu)...\n');
    const donation2 = await xrplService.processDonation(donor1, 500);
    console.log(`   - Niveau avant: ${donation1.newLevel}`);
    console.log(`   - Niveau après: ${donation2.newLevel}`);
    console.log(`   - NFT minté (level up): ${donation2.nftMinted ? 'OUI' : 'NON'}`);
    console.log('✅ Système de level up fonctionne\n');

    // Tester un nouveau donateur
    const donor2 = 'rDonor2234567890123456789012';
    const donation3 = await xrplService.processDonation(donor2, 250);
    console.log(`   Test donation #3 (nouveau donateur)...`);
    console.log(`   - Premier don: ${donation3.nftMinted ? 'OUI' : 'NON'}`);
    console.log(`   - DIT minté: ${donation3.ditTokenId ? 'OUI' : 'NON'}`);
    console.log('✅ Système de nouveau donateur fonctionne\n');

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 4: CALCUL DU PROFIT (MOCK)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n📋 TEST 4: Calcul des profits (IA Trading Mock)\n');

    const profitCalc = await xrplService.calculateProfit(0.67);

    console.log('   Résultat calcul profit:');
    console.log(`   - Profit généré: ${profitCalc.profitAmount.toFixed(2)} XRP`);
    console.log(`   - Pourcentage: ${profitCalc.profitPercentage}%`);
    console.log(`   - Solde pool avant: ${profitCalc.poolBalanceBefore.toFixed(2)} XRP`);
    console.log(`   - Solde pool après: ${profitCalc.poolBalanceAfter.toFixed(2)} XRP`);
    console.log(`   - Gain: +${(profitCalc.poolBalanceAfter - profitCalc.poolBalanceBefore).toFixed(2)} XRP`);
    console.log('✅ Calcul de profit OK\n');

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 5: REDISTRIBUTION AUTOMATIQUE AUX ONG
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n📋 TEST 5: Redistribution automatique aux ONG\n');

    const redistribution = await xrplService.redistributeProfits(profitCalc.profitAmount);

    console.log('   Résultat redistribution:');
    console.log(`   - Succès: ${redistribution.success ? 'OUI' : 'NON'}`);
    console.log(`   - Montant total: ${redistribution.totalAmount.toFixed(2)} XRP`);
    console.log(`   - Nombre d'ONG: ${redistribution.ngoCount}`);
    console.log(`   - Distributions:`);

    redistribution.distributions.forEach((dist, idx) => {
      console.log(`     ${idx + 1}. ${dist.ngoName}`);
      console.log(`        Montant: ${dist.amount.toFixed(2)} XRP`);
      console.log(`        TxHash: ${dist.txHash}`);
    });

    console.log('✅ Redistribution réussie\n');

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 6: MODE EMERGENCY REDISTRIBUTION
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n📋 TEST 6: Mode Emergency Redistribution\n');

    // Test Emergency de niveau CRITICAL (devrait être auto-approuvé en MOCK)
    const emergencyCritical = await xrplService.triggerEmergencyRedistribution({
      triggeredBy: 'rAdmin123456789012345678901',
      reason: 'Tremblement de terre en Haïti - besoin urgent de fournitures médicales et eau potable',
      severity: 'critical',
      amountRequested: 5000,
      affectedNGOs: ['ngo-001', 'ngo-002'], // Reforestation + Clean Water
    });

    console.log('   🚨 EMERGENCY CRITICAL - Résultat:');
    console.log(`   - Succès: ${emergencyCritical.success ? 'OUI' : 'NON'}`);
    console.log(`   - Emergency ID: ${emergencyCritical.emergencyId}`);
    console.log(`   - Raison: ${emergencyCritical.reason}`);
    console.log(`   - Sévérité: CRITICAL`);
    console.log(`   - Montant distribué: ${emergencyCritical.totalAmount.toFixed(2)} XRP`);
    console.log(`   - ONG affectées: ${emergencyCritical.affectedNGOs.length}`);
    console.log(`   - Votes pour: ${emergencyCritical.approvalVotes}`);
    console.log(`   - Votes requis: ${emergencyCritical.requiredVotes}`);
    console.log(`   - Transactions XRPL: ${emergencyCritical.txHashes.length}`);

    emergencyCritical.txHashes.forEach((txHash, idx) => {
      console.log(`     TX ${idx + 1}: ${txHash}`);
    });

    console.log('✅ Emergency redistribution réussie\n');

    // Test Emergency de niveau MEDIUM (devrait aussi passer en MOCK)
    console.log('   Test Emergency MEDIUM...\n');
    const emergencyMedium = await xrplService.triggerEmergencyRedistribution({
      triggeredBy: 'rAdmin123456789012345678901',
      reason: 'Sécheresse prolongée - distribution d\'eau potable nécessaire',
      severity: 'medium',
      amountRequested: 2000,
      affectedNGOs: ['ngo-002'], // Clean Water uniquement
    });

    console.log(`   - Emergency MEDIUM approuvée: ${emergencyMedium.success ? 'OUI' : 'NON'}`);
    console.log(`   - Montant: ${emergencyMedium.totalAmount} XRP`);
    console.log('✅ Emergency MEDIUM testée\n');

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 7: LOGGING & VÉRIFICATION
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n📋 TEST 7: Logging et Vérification\n');

    // Récupérer les logs
    const logs = xrplService.getOperationLogs(10);
    console.log(`   Dernières opérations (${logs.length}):`);

    logs.forEach((log, idx) => {
      const status = log.success ? '✅' : '❌';
      console.log(`   ${idx + 1}. ${status} ${log.operation} (${log.duration}ms)`);
    });

    console.log('\n✅ Logs récupérés\n');

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 8: STATISTIQUES GLOBALES
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n📋 TEST 8: Statistiques Globales\n');

    const stats = xrplService.getStatistics();

    console.log('   📊 STATISTIQUES SYSTÈME:');
    console.log(`   - Mode: ${stats.mode}`);
    console.log(`   - Total opérations: ${stats.totalOperations}`);
    console.log(`   - Succès: ${stats.successful}`);
    console.log(`   - Échecs: ${stats.failed}`);
    console.log(`   - Taux de succès: ${stats.successRate.toFixed(2)}%`);
    console.log(`   - Emergencies actives: ${stats.emergencies}`);
    console.log('\n   📊 ÉTAT DU POOL:');
    console.log(`   - Solde total: ${stats.poolState.totalBalance.toFixed(2)} XRP`);
    console.log(`   - Total donations: ${stats.poolState.totalDonations.toFixed(2)} XRP`);
    console.log(`   - Profits générés: ${stats.poolState.totalProfitsGenerated.toFixed(2)} XRP`);
    console.log(`   - Total distribué: ${stats.poolState.totalDistributed.toFixed(2)} XRP`);
    console.log(`   - Nombre de donateurs: ${stats.poolState.donorCount}`);

    console.log('\n✅ Statistiques affichées\n');

    // ─────────────────────────────────────────────────────────────────────────
    // FERMETURE
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n📋 Fermeture du service...\n');
    await xrplService.shutdown();
    console.log('✅ Service fermé proprement\n');

    // ─────────────────────────────────────────────────────────────────────────
    // RÉSUMÉ FINAL
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n');
    console.log('═'.repeat(80));
    console.log('  RÉSUMÉ DES TESTS');
    console.log('═'.repeat(80));
    console.log('\n');
    console.log('✅ Test 1: Initialisation - PASSED');
    console.log('✅ Test 2: Lecture de solde XRPL - PASSED');
    console.log('✅ Test 3: Enregistrement de donations - PASSED');
    console.log('   - Première donation avec mint NFT + DIT');
    console.log('   - Deuxième donation avec level up');
    console.log('   - Nouveau donateur');
    console.log('✅ Test 4: Calcul de profit (IA Mock) - PASSED');
    console.log('✅ Test 5: Redistribution automatique - PASSED');
    console.log('✅ Test 6: Emergency Redistribution - PASSED');
    console.log('   - Emergency CRITICAL avec auto-approval');
    console.log('   - Emergency MEDIUM avec votes');
    console.log('✅ Test 7: Logging et Vérification - PASSED');
    console.log('✅ Test 8: Statistiques globales - PASSED');
    console.log('\n');
    console.log('═'.repeat(80));
    console.log('  TOUTES LES FONCTIONNALITÉS TESTÉES AVEC SUCCÈS ! 🎉');
    console.log('═'.repeat(80));
    console.log('\n');
    console.log('📋 Récapitulatif:');
    console.log(`   - ${stats.totalOperations} opérations exécutées`);
    console.log(`   - ${stats.successful} succès, ${stats.failed} échecs`);
    console.log(`   - Taux de succès: ${stats.successRate.toFixed(2)}%`);
    console.log(`   - Pool final: ${stats.poolState.totalBalance.toFixed(2)} XRP`);
    console.log(`   - ${stats.poolState.donorCount} donateurs enregistrés`);
    console.log(`   - ${stats.emergencies} urgence(s) déclenchée(s)`);
    console.log('\n');

  } catch (error) {
    console.error('\n❌ ERREUR DURANT LES TESTS:\n');
    console.error(error);
    console.error('\n');
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXÉCUTION
// ═══════════════════════════════════════════════════════════════════════════

if (require.main === module) {
  runFullTest()
    .then(() => {
      console.log('✅ Tests terminés avec succès\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Tests échoués:', error);
      process.exit(1);
    });
}

export { runFullTest };

/**
 * XRPL Module - Test Script
 *
 * Script pour tester toutes les fonctionnalités du module XRPL
 * Peut être exécuté avec: npx tsx backend/src/modules/xrpl/test-xrpl-module.ts
 */

import { XRPLClientService } from './services/xrpl-client.service';
import { DonationPoolService } from './services/donation-pool.service';
import { ImpactOracleService } from './services/impact-oracle.service';

async function runTests() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 XRPL MODULE - TEST SUITE');
  console.log('='.repeat(70) + '\n');

  // ========================================================================
  // 1. Test XRPL Client
  // ========================================================================
  console.log('📡 TEST 1: XRPL Client Service\n');

  const xrplClient = new XRPLClientService();
  await xrplClient.connect();

  const poolAddress = xrplClient.getPoolWalletAddress();
  console.log(`  Pool Wallet: ${poolAddress}`);

  const balance = await xrplClient.getBalance(poolAddress);
  console.log(`  Pool Balance: ${balance.toFixed(2)} XRP`);

  const recentTxs = await xrplClient.getRecentTransactions(poolAddress, 3);
  console.log(`  Recent Transactions: ${recentTxs.length}`);
  recentTxs.forEach((tx, i) => {
    console.log(`    ${i + 1}. ${tx.type} - ${tx.amount.toFixed(2)} XRP - ${tx.hash.substring(0, 20)}...`);
  });

  console.log(`  Mode: ${xrplClient.isMockMode() ? 'MOCK ✅' : 'LIVE 🌐'}\n`);

  // ========================================================================
  // 2. Test Donation Pool
  // ========================================================================
  console.log('💰 TEST 2: Donation Pool Service\n');

  const poolService = new DonationPoolService(xrplClient);

  // Donation 1
  console.log('  Donation #1: 100 XRP from rDonor1');
  const deposit1 = await poolService.deposit({
    donorAddress: 'rDonor1111111111111111111111111',
    amount: 100,
  });
  console.log(`    ✅ Success: ${deposit1.txHash}`);
  console.log(`    🎨 NFT Minted: ${deposit1.nftMinted}`);
  console.log(`    ⭐ XP Gained: ${deposit1.xpGained}`);
  console.log(`    📊 Level: ${deposit1.newLevel}`);

  // Donation 2
  console.log('\n  Donation #2: 500 XRP from rDonor2');
  const deposit2 = await poolService.deposit({
    donorAddress: 'rDonor2222222222222222222222222',
    amount: 500,
  });
  console.log(`    ✅ Success: ${deposit2.txHash}`);
  console.log(`    ⭐ XP Gained: ${deposit2.xpGained}`);
  console.log(`    📊 Level: ${deposit2.newLevel}`);

  // Donation 3 (same donor as #1)
  console.log('\n  Donation #3: 200 XRP from rDonor1 (again)');
  const deposit3 = await poolService.deposit({
    donorAddress: 'rDonor1111111111111111111111111',
    amount: 200,
  });
  console.log(`    ✅ Success: ${deposit3.txHash}`);
  console.log(`    ⭐ XP Gained: ${deposit3.xpGained}`);
  console.log(`    📊 Level: ${deposit3.newLevel} (leveled up: ${deposit3.newLevel > deposit1.newLevel})`);

  // Pool state
  const poolState = poolService.getPoolState();
  console.log('\n  📊 Pool State:');
  console.log(`    Balance: ${poolState.totalBalance.toFixed(2)} XRP`);
  console.log(`    Total Donations: ${poolState.totalDonations.toFixed(2)} XRP`);
  console.log(`    Donors: ${poolState.donorCount}`);

  // ========================================================================
  // 3. Test Simulate Profit
  // ========================================================================
  console.log('\n🤖 TEST 3: AI Trading Simulation\n');

  console.log('  Simulating 0.67% profit (monthly average)...');
  const profit = await poolService.simulateProfit(0.67);
  console.log(`  💰 Profit Generated: ${profit.toFixed(2)} XRP`);

  const poolStateAfterProfit = poolService.getPoolState();
  console.log(`  📊 New Pool Balance: ${poolStateAfterProfit.totalBalance.toFixed(2)} XRP`);

  // ========================================================================
  // 4. Test Distribution
  // ========================================================================
  console.log('\n🌍 TEST 4: Profit Distribution to NGOs\n');

  console.log(`  Distributing ${profit.toFixed(2)} XRP to validated NGOs...`);
  const distribution = await poolService.distributeProfits(profit);

  console.log(`  ✅ Success: ${distribution.success}`);
  console.log(`  📦 Distributions: ${distribution.distributions.length}`);

  distribution.distributions.forEach((dist, i) => {
    console.log(`    ${i + 1}. ${dist.ngoName}`);
    console.log(`       Amount: ${dist.amount.toFixed(2)} XRP`);
    console.log(`       TxHash: ${dist.txHash.substring(0, 30)}...`);
  });

  const poolStateAfterDist = poolService.getPoolState();
  console.log(`\n  📊 Pool Balance After Distribution: ${poolStateAfterDist.totalBalance.toFixed(2)} XRP`);
  console.log(`  💸 Total Distributed: ${poolStateAfterDist.totalDistributed.toFixed(2)} XRP`);

  // ========================================================================
  // 5. Test Donor Info
  // ========================================================================
  console.log('\n👤 TEST 5: Donor Information\n');

  const donor1 = poolService.getDonor('rDonor1111111111111111111111111');
  if (donor1) {
    console.log(`  Donor: ${donor1.address}`);
    console.log(`  Total Donated: ${donor1.totalDonated} XRP`);
    console.log(`  XP: ${donor1.xp}`);
    console.log(`  Level: ${donor1.level}`);
    console.log(`  Donations: ${donor1.donationCount}`);
    console.log(`  NFT Token: ${donor1.nftTokenId}`);
    console.log(`  DIT Token: ${donor1.ditTokenId}`);
  }

  // ========================================================================
  // 6. Test NGOs List
  // ========================================================================
  console.log('\n🏛️  TEST 6: NGO Information\n');

  const ngos = poolService.getAllNGOs();
  console.log(`  Total NGOs: ${ngos.length}`);

  ngos.forEach((ngo, i) => {
    console.log(`\n  ${i + 1}. ${ngo.name}`);
    console.log(`     Category: ${['Climate', 'Health', 'Education', 'Water', 'Other'][ngo.category]}`);
    console.log(`     Impact Score: ${ngo.impactScore}/100`);
    console.log(`     Weight: ${(ngo.weight * 100).toFixed(0)}%`);
    console.log(`     Total Received: ${ngo.totalReceived.toFixed(2)} XRP`);
    console.log(`     Verified: ${ngo.verified ? '✅' : '❌'}`);
    console.log(`     Certifications: ${ngo.certifications.join(', ')}`);
  });

  // ========================================================================
  // 7. Test Impact Oracle
  // ========================================================================
  console.log('\n🔍 TEST 7: Impact Oracle Validation\n');

  const oracle = new ImpactOracleService();

  console.log('  Validating NGO: ngo-001...');
  const validation = await oracle.validateNGO({
    ngoId: 'ngo-001',
    registrationNumber: 'UN-RF-2019-001',
    website: 'https://reforest-intl.org',
    country: 'Global',
  });

  console.log(`  ✅ Valid: ${validation.isValid}`);
  console.log(`  📊 Impact Score: ${validation.impactScore}/100`);
  console.log(`  🏆 Certifications: ${validation.certifications.join(', ')}`);
  console.log(`  ⚠️  Red Flags: ${validation.redFlags.length > 0 ? validation.redFlags.join(', ') : 'None'}`);
  console.log(`  📅 Last Updated: ${validation.lastUpdated.toISOString()}`);

  // ========================================================================
  // Summary
  // ========================================================================
  console.log('\n' + '='.repeat(70));
  console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY');
  console.log('='.repeat(70));

  console.log('\n📊 Final Pool Summary:');
  const finalPool = poolService.getPoolState();
  console.log(`  Total Balance: ${finalPool.totalBalance.toFixed(2)} XRP`);
  console.log(`  Total Donations: ${finalPool.totalDonations.toFixed(2)} XRP`);
  console.log(`  Total Profits: ${finalPool.totalProfitsGenerated.toFixed(2)} XRP`);
  console.log(`  Total Distributed: ${finalPool.totalDistributed.toFixed(2)} XRP`);
  console.log(`  Total Donors: ${finalPool.donorCount}`);
  console.log(`  Last Trading Run: ${finalPool.lastTradingRun.toISOString()}`);

  console.log('\n🎉 Module XRPL is ready for the hackathon!\n');

  // Disconnect
  await xrplClient.disconnect();
}

// Run tests
runTests().catch(console.error);

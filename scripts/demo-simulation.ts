/**
 * Demo Simulation Script
 *
 * This script demonstrates all core functionalities:
 * - Donations
 * - AI Trading
 * - Impact Oracle validation
 * - NFT evolution
 * - Profit distribution
 */

import { ImpactFundHook, deployImpactFundHook } from '../backend/src/contracts/ImpactFundHook';
import { TradingAlgorithm, runTradingSimulation } from '../backend/src/services/ai-trading/TradingAlgorithm';
import { ImpactOracle, runImpactOracleDemo } from '../backend/src/services/impact-oracle/ImpactOracle';

async function runFullDemo() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   XRPL Impact Fund - Complete Demo Simulation             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Step 1: Impact Oracle Demo
  console.log('\n📊 STEP 1: Impact Oracle - Validating NGOs');
  console.log('─'.repeat(60));
  await runImpactOracleDemo();

  // Step 2: Smart Contract Demo
  console.log('\n\n🔗 STEP 2: Smart Contract - Simulating Donations');
  console.log('─'.repeat(60));

  // Mock XRPL client
  const mockClient = {} as any;
  const poolWallet = 'rPoolWallet1234567890';

  const hook = await deployImpactFundHook(mockClient, poolWallet);

  // Simulate 3 donations
  console.log('\n[DONATIONS]');
  await hook.onDeposit(1000, 'rDonor1111111111111111111111111');
  await hook.onDeposit(500, 'rDonor2222222222222222222222222');
  await hook.onDeposit(2000, 'rDonor3333333333333333333333333');

  const state = hook.getState();
  console.log(`\n[POOL STATE]`);
  console.log(`  Total Balance: ${state.totalBalance} XRP`);
  console.log(`  Total Donations: ${state.totalDonations} XRP`);
  console.log(`  Total Donors: ${state.donors.size}`);

  // Step 3: AI Trading Demo
  console.log('\n\n🤖 STEP 3: AI Trading Algorithm - Generating Profits');
  console.log('─'.repeat(60));
  const performance = await runTradingSimulation();

  // Simulate profit distribution
  console.log('\n\n💰 STEP 4: Profit Distribution to NGOs');
  console.log('─'.repeat(60));
  const profit = performance.roi;
  console.log(`[PROFIT] Generated: ${profit.toFixed(2)} XRP`);

  await hook.onProfitGenerated(profit);

  // Step 5: Governance Demo
  console.log('\n\n🗳️  STEP 5: Governance - Donor Voting');
  console.log('─'.repeat(60));
  await hook.onGovernanceVote('rDonor1111111111111111111111111', 'ngo-001');
  await hook.onGovernanceVote('rDonor3333333333333333333333333', 'ngo-002');

  // Final Summary
  console.log('\n\n✅ DEMO COMPLETE - Summary');
  console.log('═'.repeat(60));
  const finalState = hook.getState();
  console.log(`Pool Balance:        ${finalState.totalBalance.toFixed(2)} XRP`);
  console.log(`Total Donated:       ${finalState.totalDonations.toFixed(2)} XRP`);
  console.log(`Total Distributed:   ${finalState.totalDistributed.toFixed(2)} XRP`);
  console.log(`Total Donors:        ${finalState.donors.size}`);
  console.log(`Registered NGOs:     ${finalState.ngos.size}`);
  console.log(`Trading ROI:         ${performance.roi.toFixed(2)} XRP (${(performance.roi / 10000 * 100).toFixed(2)}%)`);
  console.log(`Win Rate:            ${(performance.profitableTrades / performance.totalTrades * 100).toFixed(2)}%`);

  console.log('\n🎉 All systems operational! Ready for hackathon demo.\n');
}

// Run demo if executed directly
if (require.main === module) {
  runFullDemo().catch(console.error);
}

export { runFullDemo };

/**
 * Initialize Testnet Data
 *
 * This script creates real on-chain transactions for:
 * - Donations to the pool
 * - Project escrows
 * - Distributions to NGOs
 *
 * All transactions will be visible on: https://testnet.xrpl.org/
 *
 * Run with: node scripts/init-testnet-data.js
 */

import { Client, Wallet, xrpToDrops } from 'xrpl';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../.env');
dotenv.config({ path: envPath, override: true });

const POOL_SEED = process.env.XRPL_POOL_WALLET_SEED;
const POOL_ADDRESS = process.env.XRPL_POOL_WALLET_ADDRESS;

if (!POOL_SEED || !POOL_ADDRESS) {
  console.error('❌ Error: XRPL wallet credentials not found in .env file');
  console.error('   Please ensure XRPL_POOL_WALLET_SEED and XRPL_POOL_WALLET_ADDRESS are set');
  process.exit(1);
}

async function initializeTestnetData() {
  console.log('\n🚀 Initializing Testnet Data for Dashboard\n');
  console.log('═'.repeat(70));

  // Connect to testnet
  console.log('🔌 Connecting to XRPL Testnet...');
  const client = new Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();
  console.log('✅ Connected to testnet\n');

  const poolWallet = Wallet.fromSeed(POOL_SEED);
  console.log(`📊 Pool Wallet: ${poolWallet.address}`);

  // Check initial balance
  const accountInfo = await client.request({
    command: 'account_info',
    account: poolWallet.address,
    ledger_index: 'validated'
  });
  const initialBalance = Number(accountInfo.result.account_data.Balance) / 1000000;
  console.log(`💰 Initial Balance: ${initialBalance.toFixed(2)} XRP\n`);

  console.log('═'.repeat(70));
  console.log('📝 Creating Test Donations (5 donations)\n');

  // Create 5 test donor wallets and send donations
  const donors = [];
  const donationAmounts = [1, 1, 1, 1, 1]; // XRP amounts (small amounts for testing)

  for (let i = 0; i < 5; i++) {
    try {
      console.log(`\n[${i + 1}/5] Creating donor wallet...`);

      // Fund a new test wallet
      const { wallet: donorWallet } = await client.fundWallet();
      donors.push({
        address: donorWallet.address,
        seed: donorWallet.seed,
        amount: donationAmounts[i]
      });

      console.log(`  ✅ Donor created: ${donorWallet.address}`);
      console.log(`  💸 Sending ${donationAmounts[i]} XRP donation...`);

      // Send donation to pool
      const payment = {
        TransactionType: 'Payment',
        Account: donorWallet.address,
        Destination: poolWallet.address,
        Amount: xrpToDrops(donationAmounts[i]),
        Memos: [
          {
            Memo: {
              MemoData: Buffer.from(`Donation ${i + 1} - Test Data`, 'utf8').toString('hex'),
            },
          },
        ],
      };

      const result = await client.submitAndWait(payment, { wallet: donorWallet });

      if (result.result.meta.TransactionResult === 'tesSUCCESS') {
        console.log(`  ✅ Donation successful!`);
        console.log(`  🔗 TX Hash: ${result.result.hash}`);
        console.log(`  🌐 Explorer: https://testnet.xrpl.org/transactions/${result.result.hash}`);
      }

      // Small delay between transactions
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`  ❌ Error creating donor ${i + 1}:`, error.message);
    }
  }

  console.log('\n═'.repeat(70));
  console.log('🔒 Creating Project Escrows (3 escrows)\n');

  // Create 3 test project escrows
  const projects = [
    { name: 'Clean Water Well - Senegal', amount: 1, days: 30 },
    { name: 'Solar Panels - India', amount: 1, days: 45 },
    { name: 'School Construction - Kenya', amount: 1, days: 60 }
  ];

  const escrows = [];

  for (let i = 0; i < projects.length; i++) {
    try {
      console.log(`\n[${i + 1}/3] Creating escrow for: ${projects[i].name}`);

      // Create beneficiary wallet
      const { wallet: beneficiaryWallet } = await client.fundWallet();

      const finishAfter = Math.floor(Date.now() / 1000) + (projects[i].days * 24 * 60 * 60) - 946684800; // Ripple epoch

      const escrowCreate = {
        TransactionType: 'EscrowCreate',
        Account: poolWallet.address,
        Destination: beneficiaryWallet.address,
        Amount: xrpToDrops(projects[i].amount),
        FinishAfter: finishAfter,
        Memos: [
          {
            Memo: {
              MemoData: Buffer.from(projects[i].name, 'utf8').toString('hex'),
            },
          },
        ],
      };

      const result = await client.submitAndWait(escrowCreate, { wallet: poolWallet });

      if (result.result.meta.TransactionResult === 'tesSUCCESS') {
        escrows.push({
          project: projects[i].name,
          amount: projects[i].amount,
          beneficiary: beneficiaryWallet.address,
          txHash: result.result.hash,
          sequence: result.result.Sequence
        });

        console.log(`  ✅ Escrow created!`);
        console.log(`  💰 Amount: ${projects[i].amount} XRP`);
        console.log(`  📅 Duration: ${projects[i].days} days`);
        console.log(`  👤 Beneficiary: ${beneficiaryWallet.address}`);
        console.log(`  🔗 TX Hash: ${result.result.hash}`);
        console.log(`  🌐 Explorer: https://testnet.xrpl.org/transactions/${result.result.hash}`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`  ❌ Error creating escrow ${i + 1}:`, error.message);
    }
  }

  // Check final balance
  const finalAccountInfo = await client.request({
    command: 'account_info',
    account: poolWallet.address,
    ledger_index: 'validated'
  });
  const finalBalance = Number(finalAccountInfo.result.account_data.Balance) / 1000000;

  console.log('\n═'.repeat(70));
  console.log('📊 SUMMARY\n');
  console.log(`Initial Balance:  ${initialBalance.toFixed(2)} XRP`);
  console.log(`Final Balance:    ${finalBalance.toFixed(2)} XRP`);
  console.log(`Net Change:       ${(finalBalance - initialBalance).toFixed(2)} XRP`);
  console.log(`\nDonations Created: ${donors.length}`);
  console.log(`Escrows Created:   ${escrows.length}`);

  console.log('\n📋 DONOR ADDRESSES (for testing):');
  donors.forEach((donor, i) => {
    console.log(`  ${i + 1}. ${donor.address} (${donor.amount} XRP donated)`);
  });

  console.log('\n🔒 ESCROW DETAILS:');
  escrows.forEach((escrow, i) => {
    console.log(`  ${i + 1}. ${escrow.project}`);
    console.log(`     Amount: ${escrow.amount} XRP | Beneficiary: ${escrow.beneficiary}`);
    console.log(`     Explorer: https://testnet.xrpl.org/transactions/${escrow.txHash}`);
  });

  console.log('\n═'.repeat(70));
  console.log('✅ Testnet data initialization complete!');
  console.log('\n🌐 View all transactions at:');
  console.log(`   https://testnet.xrpl.org/accounts/${poolWallet.address}\n`);

  await client.disconnect();
}

// Run the script
initializeTestnetData().catch(console.error);

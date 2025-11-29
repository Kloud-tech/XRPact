/**
 * Generate XRPL Testnet Wallet
 *
 * This script generates a new testnet wallet and funds it using the testnet faucet.
 * Run with: npx ts-node scripts/generate-testnet-wallet.ts
 */

import { Client, Wallet } from 'xrpl';

async function generateTestnetWallet() {
  console.log('🔌 Connecting to XRPL Testnet...');

  const client = new Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();

  console.log('✅ Connected to testnet\n');

  console.log('💰 Funding new wallet from testnet faucet...');
  const { wallet, balance } = await client.fundWallet();

  console.log('\n🎉 Testnet Wallet Generated Successfully!\n');
  console.log('═'.repeat(60));
  console.log('📋 WALLET CREDENTIALS (Add to backend/.env)');
  console.log('═'.repeat(60));
  console.log(`Address: ${wallet.address}`);
  console.log(`Seed:    ${wallet.seed}`);
  console.log(`Balance: ${balance} XRP`);
  console.log('═'.repeat(60));

  console.log('\n📝 Add these lines to backend/.env:');
  console.log('─'.repeat(60));
  console.log(`XRPL_POOL_WALLET_ADDRESS=${wallet.address}`);
  console.log(`XRPL_POOL_WALLET_SEED=${wallet.seed}`);
  console.log('─'.repeat(60));

  console.log('\n⚠️  SECURITY WARNING:');
  console.log('   - This is a TESTNET wallet only');
  console.log('   - Never use testnet seeds on mainnet');
  console.log('   - Never commit the .env file to version control');

  await client.disconnect();
  console.log('\n✅ Disconnected from testnet');
}

generateTestnetWallet().catch(console.error);

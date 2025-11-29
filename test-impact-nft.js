#!/usr/bin/env node

/**
 * Impact NFT Testing Script
 * Tests all Impact NFT endpoints
 */

const baseURL = 'http://localhost:3000/api/xrpl';

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const log = {
  title: (msg) => console.log(`\n${colors.cyan}═══ ${msg} ═══${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
};

async function testImpactNFT() {
  log.title('IMPACT NFT API TESTS');

  // Test 1: Mint Impact NFT
  log.title('Test 1: Mint Impact NFT');
  try {
    const mintRes = await fetch(`${baseURL}/impact-nft/mint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        poolAddress: 'rXRPLImpactPool',
        redistributionAmount: 250,
        projectIds: ['ong-climate', 'ong-water', 'ong-education'],
        redistributionCount: 3,
      }),
    });

    const mintData = await mintRes.json();

    if (mintData.success) {
      log.success(`Impact NFT minted: ${mintData.nftTokenId}`);
      log.info(`Tier: ${mintData.metadata.tier}`);
      log.info(`Impact Score: ${mintData.metadata.impactScore}/100`);
      log.info(`Total Redistributed: ${mintData.metadata.totalRedistributed} XRP`);
      log.info(`ASCII Art:\n${mintData.metadata.asciiArt}`);

      // Test 2: Read Impact NFT
      log.title('Test 2: Read Impact NFT');
      const readRes = await fetch(`${baseURL}/impact-nft/${mintData.nftTokenId}`);
      const readData = await readRes.json();

      if (readData.success) {
        log.success(`Impact NFT retrieved: ${readData.metadata.nftTokenId}`);
      } else {
        log.error(`Failed to read: ${readData.error}`);
      }

      // Test 3: Update Impact NFT
      log.title('Test 3: Update Impact NFT');
      const updateRes = await fetch(
        `${baseURL}/impact-nft/${mintData.nftTokenId}/update`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            redistributionAmount: 300,
            projectIds: ['ong-climate', 'ong-water', 'ong-education', 'ong-health'],
            redistributionCount: 4,
          }),
        }
      );

      const updateData = await updateRes.json();

      if (updateData.success) {
        log.success(`Impact NFT updated`);
        log.info(`New Tier: ${updateData.metadata.tier}`);
        log.info(`New Impact Score: ${updateData.metadata.impactScore}/100`);
        log.info(`New Total: ${updateData.metadata.totalRedistributed} XRP`);
      } else {
        log.error(`Failed to update: ${updateData.error}`);
      }
    } else {
      log.error(`Mint failed: ${mintData.error}`);
    }

    // Test 4: List All Impact NFTs
    log.title('Test 4: List All Impact NFTs');
    const listRes = await fetch(`${baseURL}/impact-nft/list/all`);
    const listData = await listRes.json();

    if (listData.success) {
      log.success(`Found ${listData.total} Impact NFT(s)`);
      listData.nfts.forEach((nft, idx) => {
        log.info(
          `${idx + 1}. ${nft.tier.toUpperCase()} - Score: ${nft.impactScore} - ${nft.totalRedistributed} XRP`
        );
      });
    } else {
      log.error(`Failed to list: ${listData.error}`);
    }

    log.title('ALL TESTS COMPLETED ✅');
  } catch (error) {
    log.error(`Test failed: ${error.message}`);
  }
}

testImpactNFT();

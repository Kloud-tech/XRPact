import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from root .env file
// This file should be imported FIRST before any other modules
// override: true forces .env file values to override system environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../../.env');

console.log('[Config] Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('[Config] Error loading .env file:', result.error);
} else {
  console.log('[Config] Successfully loaded .env file');
}

// Debug: Log environment variables
console.log('[Config] XRPL_NETWORK:', process.env.XRPL_NETWORK);
console.log('[Config] XRPL_WEBSOCKET_URL:', process.env.XRPL_WEBSOCKET_URL);
console.log('[Config] Has wallet credentials:', !!process.env.XRPL_POOL_WALLET_SEED);

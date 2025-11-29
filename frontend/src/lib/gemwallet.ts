/**
 * GemWallet Integration
 *
 * Provides utilities for connecting to GemWallet and interacting with XRPL
 */

import { isInstalled, getAddress, sendPayment as gemSendPayment } from '@gemwallet/api';

/**
 * Check if GemWallet is installed
 */
export const isGemWalletInstalled = (): boolean => {
  try {
    // Try the official SDK first
    const sdkInstalled = isInstalled();

    // Fallback: check window object directly
    const directCheck = typeof window !== 'undefined' && !!(window as any).gemwallet;

    const result = sdkInstalled || directCheck;
    console.log('[GemWallet] Installation check:', { sdkInstalled, directCheck, result });
    return result;
  } catch (error) {
    console.error('[GemWallet] Detection error:', error);
    // Final fallback
    return typeof window !== 'undefined' && !!(window as any).gemwallet;
  }
};

/**
 * Connect to GemWallet and get user address
 */
export const connectGemWallet = async (): Promise<string> => {
  if (!isGemWalletInstalled()) {
    throw new Error('GemWallet is not installed. Please install the GemWallet extension.');
  }

  try {
    const response = await getAddress();

    if (!response?.result?.address) {
      throw new Error('Failed to get wallet address');
    }

    return response.result.address;
  } catch (error: any) {
    console.error('[GemWallet] Connection failed:', error);
    throw new Error(error.message || 'Failed to connect to GemWallet');
  }
};

/**
 * Send payment via GemWallet
 */
export const sendPayment = async (
  destination: string,
  amount: string
): Promise<string> => {
  if (!isGemWalletInstalled()) {
    throw new Error('GemWallet is not installed');
  }

  try {
    const response = await gemSendPayment({
      amount,
      destination,
    });

    if (!response?.result?.hash) {
      throw new Error('Payment failed - no transaction hash received');
    }

    return response.result.hash;
  } catch (error: any) {
    console.error('[GemWallet] Payment failed:', error);
    throw new Error(error.message || 'Payment failed');
  }
};

/**
 * Disconnect from GemWallet
 */
export const disconnectGemWallet = (): void => {
  // GemWallet doesn't have a disconnect method, but we can clear local state
  console.log('[GemWallet] Disconnected');
};

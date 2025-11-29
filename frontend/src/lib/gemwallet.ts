/**
 * GemWallet Integration
 *
 * Provides utilities for connecting to GemWallet and interacting with XRPL
 */

export interface GemWalletResponse {
  result: {
    address: string;
    publicKey?: string;
  };
}

export interface PaymentRequest {
  amount: string;
  destination: string;
}

export interface PaymentResponse {
  result: {
    hash: string;
  };
}

/**
 * Check if GemWallet is installed
 */
export const isGemWalletInstalled = (): boolean => {
  return typeof window !== 'undefined' && 'gemWallet' in window;
};

/**
 * Connect to GemWallet and get user address
 */
export const connectGemWallet = async (): Promise<string> => {
  if (!isGemWalletInstalled()) {
    throw new Error('GemWallet is not installed. Please install the GemWallet extension.');
  }

  try {
    const wallet = (window as any).gemWallet;
    const response: GemWalletResponse = await wallet.getAddress();

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
    const wallet = (window as any).gemWallet;
    const payment: PaymentRequest = {
      amount,
      destination,
    };

    const response: PaymentResponse = await wallet.sendPayment(payment);

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
 * Get public key from GemWallet
 */
export const getPublicKey = async (): Promise<string> => {
  if (!isGemWalletInstalled()) {
    throw new Error('GemWallet is not installed');
  }

  try {
    const wallet = (window as any).gemWallet;
    const response: GemWalletResponse = await wallet.getAddress();

    if (!response?.result?.publicKey) {
      throw new Error('Failed to get public key');
    }

    return response.result.publicKey;
  } catch (error: any) {
    console.error('[GemWallet] Get public key failed:', error);
    throw new Error(error.message || 'Failed to get public key');
  }
};

/**
 * Disconnect from GemWallet
 */
export const disconnectGemWallet = (): void => {
  // GemWallet doesn't have a disconnect method, but we can clear local state
  console.log('[GemWallet] Disconnected');
};

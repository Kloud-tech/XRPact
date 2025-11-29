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
  if (typeof window === 'undefined') return false;

  // Check for GemWallet in various locations
  return 'gemWallet' in window ||
         ('xrpToolkit' in window && !!(window as any).xrpToolkit?.gemWallet) ||
         !!(window as any).GemWallet;
};

/**
 * Get GemWallet instance
 */
const getGemWallet = () => {
  if ((window as any).gemWallet) {
    return (window as any).gemWallet;
  }
  if ((window as any).GemWallet) {
    return (window as any).GemWallet;
  }
  if ((window as any).xrpToolkit?.gemWallet) {
    return (window as any).xrpToolkit.gemWallet;
  }
  throw new Error('GemWallet not found. Please make sure the extension is installed and enabled.');
};

/**
 * Connect to GemWallet and get user address
 */
export const connectGemWallet = async (): Promise<string> => {
  if (!isGemWalletInstalled()) {
    throw new Error('GemWallet is not installed. Please install the GemWallet extension from https://gemwallet.app/');
  }

  try {
    const wallet = getGemWallet();
    console.log('[GemWallet] Wallet instance found:', !!wallet);

    // Try the newer API first (v3+)
    if (wallet.requestAddress) {
      console.log('[GemWallet] Using requestAddress API');
      const response = await wallet.requestAddress();
      console.log('[GemWallet] Response:', response);

      if (response?.address) {
        return response.address;
      }
    }

    // Fall back to older API (v2)
    console.log('[GemWallet] Using getAddress API');
    const response: GemWalletResponse = await wallet.getAddress();
    console.log('[GemWallet] Response:', response);

    if (response?.result?.address) {
      return response.result.address;
    }

    // Last resort - try direct address property
    if (response && typeof response === 'object' && 'address' in response) {
      return (response as any).address;
    }

    throw new Error('Failed to get wallet address from response');
  } catch (error: any) {
    console.error('[GemWallet] Connection failed:', error);

    // Provide more helpful error messages
    if (error.message?.includes('denied') || error.message?.includes('reject')) {
      throw new Error('Connection rejected by user');
    }

    throw new Error(error.message || 'Failed to connect to GemWallet. Please try again.');
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
    const wallet = getGemWallet();
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
    const wallet = getGemWallet();
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

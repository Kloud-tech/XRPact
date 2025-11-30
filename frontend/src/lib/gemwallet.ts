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
  const hasGemWallet = 'gemWallet' in window;
  const hasXRPToolkit = 'xrpToolkit' in window && !!(window as any).xrpToolkit?.gemWallet;
  const hasGemWalletCapital = !!(window as any).GemWallet;
  const hasIsGemWalletInstalled = typeof (window as any).isGemWalletInstalled === 'function' && (window as any).isGemWalletInstalled();

  const installed = hasGemWallet || hasXRPToolkit || hasGemWalletCapital || hasIsGemWalletInstalled;

  if (installed) {
    console.log('[GemWallet] Detection:', {
      gemWallet: hasGemWallet,
      xrpToolkit: hasXRPToolkit,
      GemWallet: hasGemWalletCapital,
      isGemWalletInstalled: hasIsGemWalletInstalled
    });
  }

  return installed;
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
    throw new Error('GemWallet is not installed. Please install it from https://gemwallet.app/');
  }

  try {
    const wallet = getGemWallet();
    
    const payment: PaymentRequest = {
      amount,
      destination,
    };

    console.log('[GemWallet] Sending payment:', payment);
    console.log('[GemWallet] Available methods:', {
      signPayment: typeof wallet.signPayment,
      submitPayment: typeof wallet.submitPayment,
      sendPayment: typeof wallet.sendPayment,
    });
    
    // Try submitPayment first (most recent API - v3.5+)
    if (typeof wallet.submitPayment === 'function') {
      console.log('[GemWallet] Using submitPayment API (v3.5+)');
      const response = await wallet.submitPayment({
        transaction: {
          TransactionType: 'Payment',
          Destination: destination,
          Amount: amount,
        }
      });
      console.log('[GemWallet] Payment response:', response);
      
      if (response?.result?.hash) {
        return response.result.hash;
      }
      if (response?.hash) {
        return response.hash;
      }
    }
    
    // Try signPayment (v3+)
    if (typeof wallet.signPayment === 'function') {
      console.log('[GemWallet] Using signPayment API (v3+)');
      const response = await wallet.signPayment(payment);
      console.log('[GemWallet] Payment response:', response);
      
      if (response?.result?.hash) {
        return response.result.hash;
      }
      if (response?.hash) {
        return response.hash;
      }
    }
    
    // Fall back to older API (sendPayment - v2)
    if (typeof wallet.sendPayment === 'function') {
      console.log('[GemWallet] Using sendPayment API (v2)');
      const response: PaymentResponse = await wallet.sendPayment(payment);
      console.log('[GemWallet] Payment response:', response);

      if (response?.result?.hash) {
        return response.result.hash;
      }
      
      if (response && typeof response === 'object' && 'hash' in response) {
        return (response as any).hash;
      }
    }

    throw new Error('GemWallet payment method not available. Please update your GemWallet extension to the latest version from https://gemwallet.app/');
  } catch (error: any) {
    console.error('[GemWallet] Payment failed:', error);
    
    // Provide helpful error messages
    if (error.message?.includes('denied') || error.message?.includes('reject') || error.message?.includes('cancel')) {
      throw new Error('Payment cancelled by user');
    }
    
    if (error.message?.includes('insufficient')) {
      throw new Error('Insufficient XRP balance');
    }
    
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

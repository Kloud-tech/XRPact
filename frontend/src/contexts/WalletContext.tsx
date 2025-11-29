/**
 * Wallet Context
 *
 * Manages wallet connection state and provides wallet utilities throughout the app
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { connectGemWallet, disconnectGemWallet, isGemWalletInstalled } from '../lib/gemwallet';

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isInstalled: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Check if GemWallet is installed
  useEffect(() => {
    setIsInstalled(isGemWalletInstalled());
  }, []);

  // Load saved address from localStorage
  useEffect(() => {
    const savedAddress = localStorage.getItem('gemwallet_address');
    if (savedAddress) {
      setAddress(savedAddress);
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const walletAddress = await connectGemWallet();
      setAddress(walletAddress);
      localStorage.setItem('gemwallet_address', walletAddress);
      console.log('[WalletContext] Connected:', walletAddress);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to connect wallet';
      setError(errorMessage);
      console.error('[WalletContext] Connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    localStorage.removeItem('gemwallet_address');
    disconnectGemWallet();
    console.log('[WalletContext] Disconnected');
  }, []);

  const value: WalletContextType = {
    address,
    isConnected: !!address,
    isConnecting,
    error,
    connect,
    disconnect,
    isInstalled,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

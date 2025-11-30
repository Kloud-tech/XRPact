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
  // xrpl-connect support
  walletManager: any | null;
  setWalletManager: (manager: any) => void;
  accountInfo: any | null;
  setAccountInfo: (info: any) => void;
  events: Array<{ timestamp: string; name: string; data: any }>;
  addEvent: (name: string, data: any) => void;
  clearEvents: () => void;
  statusMessage: { message: string; type: string } | null;
  showStatus: (message: string, type: string) => void;
  setIsConnecting: (connecting: boolean) => void;
  setIsConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
  updateConnectionState: (connected: boolean, address?: string | null, info?: any | null) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // xrpl-connect states
  const [walletManager, setWalletManagerState] = useState<any | null>(null);
  const [accountInfo, setAccountInfo] = useState<any | null>(null);
  const [events, setEvents] = useState<Array<{ timestamp: string; name: string; data: any }>>([]);
  const [statusMessage, setStatusMessage] = useState<{ message: string; type: string } | null>(null);

  // Check if GemWallet or xrpl-connect web component is installed with retry mechanism
  useEffect(() => {
    const checkWallet = () => {
      const gemWalletInstalled = isGemWalletInstalled();
      const xrplConnectInstalled = typeof window !== 'undefined' &&
        (customElements.get('xrpl-wallet-connector') !== undefined ||
          (window as any).xrplConnect !== undefined);
      const installed = gemWalletInstalled || xrplConnectInstalled;
      setIsInstalled(installed);

      if (gemWalletInstalled) {
        console.log('[WalletContext] GemWallet detected');
      }
      if (xrplConnectInstalled) {
        console.log('[WalletContext] xrpl-connect web component detected');
      }

      return installed;
    };

    // Check immediately
    if (checkWallet()) {
      return;
    }

    // Retry every 500ms for up to 5 seconds
    let attempts = 0;
    const maxAttempts = 10;
    const interval = setInterval(() => {
      attempts++;
      if (checkWallet() || attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 500);

    // Listen for GemWallet installation event
    const handleWalletReady = () => {
      console.log('[WalletContext] GemWallet ready event detected');
      setIsInstalled(true);
      clearInterval(interval);
    };

    window.addEventListener('gemWalletReady', handleWalletReady);

    return () => {
      clearInterval(interval);
      window.removeEventListener('gemWalletReady', handleWalletReady);
    };
  }, []);

  // Load saved address from localStorage
  useEffect(() => {
    const savedAddress = localStorage.getItem('xrpl_wallet_address') || localStorage.getItem('gemwallet_address');
    const savedAccountInfo = localStorage.getItem('xrpl_account_info');

    if (savedAddress) {
      setAddress(savedAddress);
      console.log('[WalletContext] Restored saved address:', savedAddress);
    }

    if (savedAccountInfo) {
      try {
        setAccountInfo(JSON.parse(savedAccountInfo));
      } catch (e) {
        console.error('[WalletContext] Failed to parse saved account info:', e);
      }
    }
  }, []);

  const setWalletManager = useCallback((manager: any) => {
    setWalletManagerState(manager);
    console.log('[WalletContext] Wallet manager set:', !!manager);
  }, []);

  const addEvent = useCallback((name: string, data: any) => {
    const timestamp = new Date().toLocaleTimeString();
    setEvents((prev) => [{ timestamp, name, data }, ...prev]);
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  const showStatus = useCallback((message: string, type: string) => {
    setStatusMessage({ message, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 5000);
  }, []);

  const updateConnectionState = useCallback((connected: boolean, newAddress: string | null = null, info: any | null = null) => {
    setAddress(newAddress);

    if (connected && newAddress) {
      localStorage.setItem('xrpl_wallet_address', newAddress);
      if (info) {
        localStorage.setItem('xrpl_account_info', JSON.stringify(info));
        setAccountInfo(info);
      }
    } else {
      localStorage.removeItem('xrpl_wallet_address');
      localStorage.removeItem('xrpl_account_info');
      setAccountInfo(null);
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const walletAddress = await connectGemWallet();
      setAddress(walletAddress);
      localStorage.setItem('xrpl_wallet_address', walletAddress);
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
    setAccountInfo(null);
    setWalletManagerState(null);
    localStorage.removeItem('xrpl_wallet_address');
    localStorage.removeItem('gemwallet_address');
    localStorage.removeItem('xrpl_account_info');
    disconnectGemWallet();
    console.log('[WalletContext] Disconnected');
  }, []);

  // setIsConnected is a no-op since isConnected is computed from address
  // Use updateConnectionState instead
  const setIsConnectedCallback = useCallback((connected: boolean) => {
    console.log('[WalletContext] setIsConnected called (no-op), use updateConnectionState instead');
  }, []);

  const value: WalletContextType = {
    address,
    isConnected: !!address,
    isConnecting,
    error,
    connect,
    disconnect,
    isInstalled,
    walletManager,
    setWalletManager,
    accountInfo,
    setAccountInfo,
    events,
    addEvent,
    clearEvents,
    statusMessage,
    showStatus,
    setIsConnecting,
    setIsConnected: setIsConnectedCallback,
    setError,
    updateConnectionState,
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

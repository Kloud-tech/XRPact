"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

const WalletContext = createContext(undefined);

export function WalletProvider({ children }) {
  const [walletManager, setWalletManagerState] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [accountInfo, setAccountInfo] = useState(null);
  const [events, setEvents] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState(null);

  // Check if xrpl-connect web component is available with retry mechanism
  useEffect(() => {
    const checkWebComponentAvailable = () => {
      const isAvailable = typeof window !== 'undefined' &&
        (customElements.get('xrpl-wallet-connector') !== undefined ||
          window.xrplConnect !== undefined);
      setIsInstalled(isAvailable);
      return isAvailable;
    };

    // Check immediately
    if (checkWebComponentAvailable()) {
      console.log('[WalletProvider] xrpl-connect web component detected');
      return;
    }

    // Retry every 500ms for up to 5 seconds
    let attempts = 0;
    const maxAttempts = 10;
    const interval = setInterval(() => {
      attempts++;
      if (checkWebComponentAvailable() || attempts >= maxAttempts) {
        clearInterval(interval);
        if (!checkWebComponentAvailable()) {
          console.warn('[WalletProvider] xrpl-connect web component not detected after retries');
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Load saved address from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedAddress = localStorage.getItem('xrpl_wallet_address');
    const savedAccountInfo = localStorage.getItem('xrpl_account_info');

    if (savedAddress) {
      setConnectedAddress(savedAddress);
      setIsConnected(true);
      console.log('[WalletProvider] Restored saved address:', savedAddress);
    }

    if (savedAccountInfo) {
      try {
        setAccountInfo(JSON.parse(savedAccountInfo));
      } catch (e) {
        console.error('[WalletProvider] Failed to parse saved account info:', e);
      }
    }
  }, []);

  const setWalletManager = useCallback((manager) => {
    setWalletManagerState(manager);
    console.log('[WalletProvider] Wallet manager set:', !!manager);
  }, []);

  const updateConnectionState = useCallback((connected, address = null, info = null) => {
    setIsConnected(connected);
    setConnectedAddress(address);

    if (connected && address) {
      localStorage.setItem('xrpl_wallet_address', address);
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

  const disconnect = useCallback(() => {
    updateConnectionState(false, null, null);
    setWalletManagerState(null);
    setError(null);
    addEvent('Disconnected', { timestamp: new Date().toISOString() });
    showStatus('Wallet disconnected', 'info');
    console.log('[WalletProvider] Disconnected');
  }, []);

  const addEvent = useCallback((name, data) => {
    const timestamp = new Date().toLocaleTimeString();
    setEvents((prev) => [{ timestamp, name, data }, ...prev]);
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  const showStatus = useCallback((message, type) => {
    setStatusMessage({ message, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 5000);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        walletManager,
        isConnected,
        isConnecting,
        accountInfo,
        events,
        statusMessage,
        error,
        isInstalled,
        connectedAddress,
        setWalletManager,
        setIsConnected,
        setIsConnecting,
        setAccountInfo,
        setError,
        addEvent,
        clearEvents,
        showStatus,
        updateConnectionState,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}

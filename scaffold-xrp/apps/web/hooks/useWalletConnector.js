"use client";

import { useEffect, useRef } from "react";
import { useWallet } from "../components/providers/WalletProvider";

export function useWalletConnector(walletManager) {
  const walletConnectorRef = useRef(null);
  const {
    addEvent,
    showStatus,
    setIsConnecting,
    setError,
    updateConnectionState,
    isInstalled
  } = useWallet();

  useEffect(() => {
    if (!walletConnectorRef.current || !walletManager) return;

    const setupConnector = async () => {
      try {
        // Wait for custom element to be defined and upgraded
        await customElements.whenDefined("xrpl-wallet-connector");

        // Small delay to ensure the element is fully initialized
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (
          walletConnectorRef.current &&
          typeof walletConnectorRef.current.setWalletManager === "function"
        ) {
          walletConnectorRef.current.setWalletManager(walletManager);
          console.log('[useWalletConnector] Wallet manager attached to web component');

          // Listen to connector events
          const handleConnecting = (e) => {
            console.log('[useWalletConnector] Connecting to:', e.detail.walletId);
            setIsConnecting(true);
            setError(null);
            showStatus(`Connecting to ${e.detail.walletId}...`, "info");
            addEvent('Connecting', { walletId: e.detail.walletId });
          };

          const handleConnected = (e) => {
            console.log('[useWalletConnector] Connected:', e.detail);
            setIsConnecting(false);

            const address = e.detail?.address || e.detail?.account;
            const accountData = {
              address,
              network: e.detail?.network,
              walletId: e.detail?.walletId,
              timestamp: new Date().toISOString(),
            };

            updateConnectionState(true, address, accountData);
            showStatus("Connected successfully!", "success");
            addEvent("Connected via Web Component", e.detail);
          };

          const handleDisconnected = (e) => {
            console.log('[useWalletConnector] Disconnected:', e.detail);
            setIsConnecting(false);
            updateConnectionState(false, null, null);
            showStatus("Wallet disconnected", "info");
            addEvent("Disconnected", e.detail);
          };

          const handleError = (e) => {
            console.error('[useWalletConnector] Error:', e.detail);
            setIsConnecting(false);

            const errorMessage = e.detail?.error?.message ||
              e.detail?.message ||
              'Connection failed';

            setError(errorMessage);
            showStatus(`Connection failed: ${errorMessage}`, "error");
            addEvent("Connection Error", e.detail);
          };

          const handleNetworkChange = (e) => {
            console.log('[useWalletConnector] Network changed:', e.detail);
            addEvent("Network Changed", e.detail);
            showStatus(`Network changed to ${e.detail.network}`, "info");
          };

          const handleAccountChange = (e) => {
            console.log('[useWalletConnector] Account changed:', e.detail);
            const newAddress = e.detail?.address || e.detail?.account;

            if (newAddress) {
              updateConnectionState(true, newAddress, {
                address: newAddress,
                timestamp: new Date().toISOString(),
              });
              addEvent("Account Changed", e.detail);
              showStatus(`Switched to account ${newAddress.slice(0, 8)}...`, "info");
            }
          };

          // Add all event listeners
          walletConnectorRef.current.addEventListener("connecting", handleConnecting);
          walletConnectorRef.current.addEventListener("connected", handleConnected);
          walletConnectorRef.current.addEventListener("disconnected", handleDisconnected);
          walletConnectorRef.current.addEventListener("error", handleError);
          walletConnectorRef.current.addEventListener("network-changed", handleNetworkChange);
          walletConnectorRef.current.addEventListener("account-changed", handleAccountChange);

          return () => {
            if (walletConnectorRef.current) {
              walletConnectorRef.current.removeEventListener("connecting", handleConnecting);
              walletConnectorRef.current.removeEventListener("connected", handleConnected);
              walletConnectorRef.current.removeEventListener("disconnected", handleDisconnected);
              walletConnectorRef.current.removeEventListener("error", handleError);
              walletConnectorRef.current.removeEventListener("network-changed", handleNetworkChange);
              walletConnectorRef.current.removeEventListener("account-changed", handleAccountChange);
            }
          };
        }
      } catch (error) {
        console.error('[useWalletConnector] Setup failed:', error);
        setError(error.message);
        showStatus(`Failed to initialize wallet connector: ${error.message}`, "error");
      }
    };

    setupConnector();
  }, [walletManager, addEvent, showStatus, setIsConnecting, setError, updateConnectionState]);

  // Log installation status
  useEffect(() => {
    console.log('[useWalletConnector] Web component installed:', isInstalled);
  }, [isInstalled]);

  return walletConnectorRef;
}

/**
 * Wallet Connector Hook
 * 
 * Manages the xrpl-wallet-connector web component and its events
 */

import { useEffect, useRef } from 'react';
import { useWallet } from '../contexts/WalletContext';

export const useWalletConnector = (walletManager: any) => {
    const walletConnectorRef = useRef<any>(null);
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
                await customElements.whenDefined('xrpl-wallet-connector');

                // Small delay to ensure the element is fully initialized
                await new Promise((resolve) => setTimeout(resolve, 100));

                if (
                    walletConnectorRef.current &&
                    typeof walletConnectorRef.current.setWalletManager === 'function'
                ) {
                    walletConnectorRef.current.setWalletManager(walletManager);
                    console.log('[useWalletConnector] Wallet manager attached to web component');

                    // Listen to connector events
                    const handleConnecting = (e: any) => {
                        console.log('[useWalletConnector] Connecting to:', e.detail.walletId);
                        setIsConnecting(true);
                        setError(null);
                        showStatus(`Connexion à ${e.detail.walletId}...`, 'info');
                        addEvent('Connecting', { walletId: e.detail.walletId });
                    };

                    const handleConnected = (e: any) => {
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
                        showStatus('Connecté avec succès!', 'success');
                        addEvent('Connected via Web Component', e.detail);
                    };

                    const handleDisconnected = (e: any) => {
                        console.log('[useWalletConnector] Disconnected:', e.detail);
                        setIsConnecting(false);
                        updateConnectionState(false, null, null);
                        showStatus('Wallet déconnecté', 'info');
                        addEvent('Disconnected', e.detail);
                    };

                    const handleError = (e: any) => {
                        console.error('[useWalletConnector] Error:', e.detail);
                        setIsConnecting(false);

                        const errorMessage = e.detail?.error?.message ||
                            e.detail?.message ||
                            'Échec de connexion';

                        setError(errorMessage);
                        showStatus(`Erreur: ${errorMessage}`, 'error');
                        addEvent('Connection Error', e.detail);
                    };

                    const handleNetworkChange = (e: any) => {
                        console.log('[useWalletConnector] Network changed:', e.detail);
                        addEvent('Network Changed', e.detail);
                        showStatus(`Réseau changé: ${e.detail.network}`, 'info');
                    };

                    const handleAccountChange = (e: any) => {
                        console.log('[useWalletConnector] Account changed:', e.detail);
                        const newAddress = e.detail?.address || e.detail?.account;

                        if (newAddress) {
                            updateConnectionState(true, newAddress, {
                                address: newAddress,
                                timestamp: new Date().toISOString(),
                            });
                            addEvent('Account Changed', e.detail);
                            showStatus(`Compte changé: ${newAddress.slice(0, 8)}...`, 'info');
                        }
                    };

                    // Add all event listeners
                    walletConnectorRef.current.addEventListener('connecting', handleConnecting);
                    walletConnectorRef.current.addEventListener('connected', handleConnected);
                    walletConnectorRef.current.addEventListener('disconnected', handleDisconnected);
                    walletConnectorRef.current.addEventListener('error', handleError);
                    walletConnectorRef.current.addEventListener('network-changed', handleNetworkChange);
                    walletConnectorRef.current.addEventListener('account-changed', handleAccountChange);

                    return () => {
                        if (walletConnectorRef.current) {
                            walletConnectorRef.current.removeEventListener('connecting', handleConnecting);
                            walletConnectorRef.current.removeEventListener('connected', handleConnected);
                            walletConnectorRef.current.removeEventListener('disconnected', handleDisconnected);
                            walletConnectorRef.current.removeEventListener('error', handleError);
                            walletConnectorRef.current.removeEventListener('network-changed', handleNetworkChange);
                            walletConnectorRef.current.removeEventListener('account-changed', handleAccountChange);
                        }
                    };
                }
            } catch (error: any) {
                console.error('[useWalletConnector] Setup failed:', error);
                setError(error.message);
                showStatus(`Erreur d'initialisation: ${error.message}`, 'error');
            }
        };

        setupConnector();
    }, [walletManager, addEvent, showStatus, setIsConnecting, setError, updateConnectionState]);

    // Log installation status
    useEffect(() => {
        console.log('[useWalletConnector] Web component installed:', isInstalled);
    }, [isInstalled]);

    return walletConnectorRef;
};

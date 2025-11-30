/**
 * Wallet Manager Hook
 * 
 * Manages the XRPL wallet manager instance for xrpl-connect
 */

import { useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

export const useWalletManager = () => {
    const { setWalletManager, setIsConnected, addEvent, showStatus, updateConnectionState } = useWallet();

    useEffect(() => {
        const initWalletManager = async () => {
            try {
                console.log('[useWalletManager] Starting initialization...');

                // Wait a bit for the window to be fully ready
                await new Promise(resolve => setTimeout(resolve, 100));

                // Dynamically import xrpl-connect and adapters
                const {
                    WalletManager,
                    GemWalletAdapter,
                    CrossmarkAdapter,
                    XamanAdapter,
                } = await import('xrpl-connect');

                console.log('[useWalletManager] xrpl-connect modules loaded');

                // Create adapters for available wallets
                const adapters = [];

                // Add browser extension wallets (no config needed)
                try {
                    adapters.push(new GemWalletAdapter());
                    console.log('[useWalletManager] ✅ GemWallet adapter created');
                } catch (e) {
                    console.warn('[useWalletManager] ⚠️  GemWallet adapter failed:', e);
                }

                try {
                    adapters.push(new CrossmarkAdapter());
                    console.log('[useWalletManager] ✅ Crossmark adapter created');
                } catch (e) {
                    console.warn('[useWalletManager] ⚠️  Crossmark adapter failed:', e);
                }

                // Xaman requires API key, add without it for now (might need QR code)
                try {
                    adapters.push(new XamanAdapter());
                    console.log('[useWalletManager] ✅ Xaman adapter created');
                } catch (e) {
                    console.warn('[useWalletManager] ⚠️  Xaman adapter failed:', e);
                }

                // Create wallet manager with adapters
                const manager = new WalletManager({
                    adapters,
                    network: 'mainnet',
                    autoConnect: true,
                    logger: { level: 'info' },
                });

                console.log('[useWalletManager] ✅ WalletManager instance created:', manager);

                // Set the manager in context
                setWalletManager(manager);
                console.log('[useWalletManager] ✅ Wallet manager set in context');

                // Event listeners
                manager.on('connect', (account: any) => {
                    console.log('[useWalletManager] 🟢 Wallet connected:', account);
                    addEvent('Connected', account);

                    // Update connection state
                    const connected = manager.connected ?? false;
                    setIsConnected(connected);

                    if (connected && manager.account && manager.wallet) {
                        const accountData = {
                            address: manager.account.address,
                            network: manager.account.network,
                            walletId: manager.wallet.name,
                            timestamp: new Date().toISOString(),
                        };
                        updateConnectionState(true, manager.account.address, accountData);
                        showStatus('Connecté avec succès!', 'success');
                    }
                });

                manager.on('disconnect', () => {
                    console.log('[useWalletManager] 🔴 Wallet disconnected');
                    addEvent('Disconnected', null);
                    updateConnectionState(false, null, null);
                    setIsConnected(false);
                    showStatus('Wallet déconnecté', 'info');
                });

                manager.on('error', (error: any) => {
                    console.error('[useWalletManager] ❌ Wallet error:', error);
                    addEvent('Error', error);
                    showStatus(error.message || 'Erreur de connexion', 'error');
                });

                // Check initial connection status
                if (!manager.connected) {
                    showStatus('Connectez votre wallet pour commencer', 'info');
                } else {
                    showStatus('Wallet reconnecté depuis la session précédente', 'success');
                    // Update state for already connected wallet
                    if (manager.account) {
                        updateConnectionState(true, manager.account.address, {
                            address: manager.account.address,
                            network: manager.account.network,
                            walletId: manager.wallet?.name,
                            timestamp: new Date().toISOString(),
                        });
                    }
                }

                console.log('[useWalletManager] ✅ Initialization complete');

            } catch (error) {
                console.error('[useWalletManager] ❌ Failed to initialize:', error);
                showStatus('Erreur d\'initialisation du wallet', 'error');
            }
        };

        initWalletManager();
    }, [setWalletManager, setIsConnected, addEvent, showStatus, updateConnectionState]);
};

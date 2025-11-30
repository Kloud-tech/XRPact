/**
 * Wallet Connector Component
 *
 * Web component wrapper for xrpl-wallet-connector
 */

import { useState, useEffect } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { useWalletConnector } from '../../hooks/useWalletConnector';

const THEMES = {
    dark: {
        '--xc-background-color': '#1a202c',
        '--xc-background-secondary': '#2d3748',
        '--xc-background-tertiary': '#4a5568',
        '--xc-text-color': '#F5F4E7',
        '--xc-text-muted-color': 'rgba(245, 244, 231, 0.6)',
        '--xc-primary-color': '#3b99fc',
    },
    light: {
        '--xc-background-color': '#ffffff',
        '--xc-background-secondary': '#f5f5f5',
        '--xc-background-tertiary': '#eeeeee',
        '--xc-text-color': '#111111',
        '--xc-text-muted-color': 'rgba(17, 17, 17, 0.6)',
        '--xc-primary-color': '#2563eb',
    },
    green: {
        '--xc-background-color': '#0f2e1e',
        '--xc-background-secondary': '#1a4731',
        '--xc-background-tertiary': '#25603f',
        '--xc-text-color': '#e8f5e9',
        '--xc-text-muted-color': 'rgba(232, 245, 233, 0.6)',
        '--xc-primary-color': '#4caf50',
    },
};

export const WalletConnector = () => {
    const { walletManager } = useWallet();
    const walletConnectorRef = useWalletConnector(walletManager);
    const [currentTheme] = useState<keyof typeof THEMES>('green');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);

        // Register the web component
        const registerWebComponent = async () => {
            try {
                const { WalletConnectorElement } = await import('xrpl-connect');

                // Define the custom element if not already defined
                if (!customElements.get('xrpl-wallet-connector')) {
                    customElements.define('xrpl-wallet-connector', WalletConnectorElement);
                    console.log('[WalletConnector] Web component registered');
                }
            } catch (error) {
                console.error('[WalletConnector] Failed to register:', error);
            }
        };

        registerWebComponent();
    }, []);

    if (!isClient) {
        return null;
    }

    return (
        <xrpl-wallet-connector
            ref={walletConnectorRef}
            id="wallet-connector"
            style={{
                ...THEMES[currentTheme],
                '--xc-font-family': 'inherit',
                '--xc-border-radius': '12px',
                '--xc-modal-box-shadow': '0 10px 40px rgba(0, 0, 0, 0.3)',
            }}
            primary-wallet="xaman"
        />
    );
};

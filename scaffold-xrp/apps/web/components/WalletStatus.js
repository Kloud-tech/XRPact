"use client";

import { useWallet } from "./providers/WalletProvider";

export function WalletStatus() {
    const {
        isConnected,
        isConnecting,
        connectedAddress,
        accountInfo,
        error,
        isInstalled,
        disconnect
    } = useWallet();

    const truncateAddress = (addr) => {
        if (!addr) return '';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    // Show installation warning if web component not available
    if (!isInstalled) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-50 text-orange-700 text-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Wallet component loading...</span>
            </div>
        );
    }

    // Show connecting state
    if (isConnecting) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="font-medium">Connecting...</span>
            </div>
        );
    }

    // Show connected state with disconnect button
    if (isConnected && connectedAddress) {
        return (
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="font-mono text-sm text-emerald-900 font-medium">
                        {truncateAddress(connectedAddress)}
                    </span>
                    {accountInfo?.walletId && (
                        <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
                            {accountInfo.walletId}
                        </span>
                    )}
                </div>
                <button
                    onClick={disconnect}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"
                    title="Disconnect wallet"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="flex flex-col gap-1 max-w-xs">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{error}</span>
                </div>
            </div>
        );
    }

    // Not connected - web component will show connection button
    return null;
}

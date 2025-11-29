/**
 * Wallet Button Component
 *
 * Displays wallet connection button with status
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, LogOut, AlertCircle } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';

export const WalletButton: React.FC = () => {
  const { address, isConnected, isConnecting, error, connect, disconnect, isInstalled } = useWallet();

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isInstalled) {
    return (
      <motion.a
        href="https://gemwallet.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold shadow-lg hover:shadow-xl transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AlertCircle className="w-5 h-5" />
        Install GemWallet
      </motion.a>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <motion.div
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
          <span className="font-mono">{truncateAddress(address)}</span>
        </motion.div>
        <motion.button
          onClick={disconnect}
          className="p-3 rounded-2xl bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Disconnect"
        >
          <LogOut className="w-5 h-5" />
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <motion.button
        onClick={connect}
        disabled={isConnecting}
        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-lime-400 to-emerald-500 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={!isConnecting ? { scale: 1.05 } : {}}
        whileTap={!isConnecting ? { scale: 0.95 } : {}}
      >
        <Wallet className="w-5 h-5" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </motion.button>
      {error && (
        <motion.p
          className="text-red-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

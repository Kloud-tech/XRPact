/**
 * Enhanced Live Transaction Flow
 *
 * Features:
 * - Purple-to-pink gradient background
 * - Glassmorphism design
 * - Animated transaction rows
 * - Live stats
 * - Background orbs
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, TrendingUp, Coins, Activity, Loader } from 'lucide-react';
import { useTransactions, Transaction } from '../../hooks/useTransactions';
import { usePoolData } from '../../hooks/usePoolData';

export const EnhancedTransactionFlow: React.FC = () => {
  const { transactions, loading, error } = useTransactions(5);
  const { poolData } = usePoolData();

  const stats = {
    donationsToday: poolData?.totalDonations || 0,
    distributedToday: poolData?.totalDistributed || 0,
    inProgress: Math.min(transactions.length, 5),
  };


  const getTypeColor = (type: Transaction['type']) => {
    switch (type) {
      case 'donation':
        return 'from-green-400 to-emerald-500';
      case 'distribution':
        return 'from-blue-400 to-cyan-500';
      case 'yield':
        return 'from-yellow-400 to-orange-500';
    }
  };

  const getTypeLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'donation':
        return '💚 Donation';
      case 'distribution':
        return '💙 Distribution';
      case 'yield':
        return '✨ Yield';
    }
  };

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-red-400 p-8 shadow-2xl overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-yellow-300/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-300/10 rounded-full blur-3xl"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center gap-3 mb-6">
            <Loader className="w-6 h-6 text-white animate-spin" />
            <span className="text-white font-bold">Loading transactions...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center gap-3 mb-6 bg-red-500/20 backdrop-blur-md border border-red-400/30 rounded-2xl p-4">
            <span className="text-white">⚠️ {error}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Coins className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white">Live XRPL Flow</h2>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white font-semibold text-sm">{stats.inProgress} active now</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
            <p className="text-white/80 text-sm mb-1">Donations Today</p>
            <p className="text-white text-2xl font-bold">{stats.donationsToday.toLocaleString()} XRP</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
            <p className="text-white/80 text-sm mb-1">Distributed Today</p>
            <p className="text-white text-2xl font-bold">{stats.distributedToday.toLocaleString()} XRP</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
            <p className="text-white/80 text-sm mb-1">In Progress</p>
            <p className="text-white text-2xl font-bold flex items-center gap-2">
              {stats.inProgress}
              <Activity className="w-5 h-5 animate-pulse" />
            </p>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          {transactions.length === 0 && !loading && (
            <div className="text-center py-8 text-white/60">
              No transactions yet. Waiting for XRPL activity...
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {transactions.map((tx, index) => (
              <motion.div
                key={tx.id || `tx-${index}-${tx.timestamp}`}
                initial={{ opacity: 0, x: -50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 hover:bg-white/15 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* From */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-xs mb-1">From</p>
                    <p className="text-white font-mono text-sm truncate">{tx.from}</p>
                  </div>

                  {/* Arrow */}
                  <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-6 h-6 text-white/70 flex-shrink-0" />
                  </motion.div>

                  {/* To */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-xs mb-1">To</p>
                    <p className="text-white font-mono text-sm truncate">{tx.to}</p>
                  </div>

                  {/* Amount Badge */}
                  <div className={`flex-shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r ${getTypeColor(tx.type)} shadow-lg`}>
                    <p className="text-white font-bold text-lg whitespace-nowrap">
                      +{tx.amount} XRP
                    </p>
                    <p className="text-white/80 text-xs">{getTypeLabel(tx.type)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex items-center justify-center gap-2 text-white/70 text-sm"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Real-time XRPL ledger updates</span>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedTransactionFlow;

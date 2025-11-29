/**
 * Live Transaction Flow Animation
 *
 * Beautiful real-time visualization of XRPL transactions
 * Shows donations flowing from donors → pool → NGOs
 * Web3-style with smooth animations and glassmorphism
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Users, Heart, Coins } from 'lucide-react';

interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  type: 'donation' | 'distribution';
  timestamp: number;
}

export const LiveTransactionFlow: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    donationsToday: 47,
    distributedToday: 12,
    activeNow: 3,
  });

  // Simulate real-time transactions
  useEffect(() => {
    const generateTransaction = (): Transaction => {
      const type = Math.random() > 0.6 ? 'donation' : 'distribution';
      const amount = type === 'donation'
        ? Math.floor(Math.random() * 900) + 100
        : Math.floor(Math.random() * 400) + 50;

      return {
        id: `tx-${Date.now()}-${Math.random()}`,
        from: type === 'donation' ? `rDon${Math.random().toString(36).slice(2, 6)}` : 'Pool',
        to: type === 'donation' ? 'Pool' : `NGO-${Math.floor(Math.random() * 5) + 1}`,
        amount,
        type,
        timestamp: Date.now(),
      };
    };

    const interval = setInterval(() => {
      const newTx = generateTransaction();
      setTransactions((prev) => [newTx, ...prev.slice(0, 4)]);

      setStats((prev) => ({
        ...prev,
        donationsToday: newTx.type === 'donation' ? prev.donationsToday + 1 : prev.donationsToday,
        distributedToday: newTx.type === 'distribution' ? prev.distributedToday + 1 : prev.distributedToday,
        activeNow: Math.floor(Math.random() * 5) + 2,
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden">
      {/* Animated background orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-300/20 rounded-full blur-3xl"
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Coins className="w-8 h-8" />
              </motion.div>
              Live XRPL Flow
            </h2>
            <p className="text-blue-100">Watch impact happen in real-time</p>
          </div>

          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full border border-white/30">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 bg-green-400 rounded-full"
            />
            <span className="text-sm font-medium">{stats.activeNow} active now</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatBox
            icon={<Users className="w-5 h-5" />}
            label="Donations Today"
            value={stats.donationsToday}
            color="from-blue-400 to-cyan-400"
          />
          <StatBox
            icon={<Heart className="w-5 h-5" />}
            label="Distributed Today"
            value={stats.distributedToday}
            color="from-pink-400 to-rose-400"
          />
          <StatBox
            icon={<Coins className="w-5 h-5" />}
            label="In Progress"
            value={transactions.length}
            color="from-purple-400 to-indigo-400"
          />
        </div>

        {/* Transaction Flow Visualization */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {transactions.map((tx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -50, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.8 }}
                transition={{ duration: 0.5 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20"
              >
                <div className="flex items-center justify-between">
                  {/* From */}
                  <div className="flex-1">
                    <p className="text-xs text-blue-200 mb-1">From</p>
                    <p className="font-mono text-sm font-medium">{tx.from}</p>
                  </div>

                  {/* Arrow with animation */}
                  <div className="mx-4">
                    <motion.div
                      animate={{ x: [0, 10, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight
                        className={`w-6 h-6 ${
                          tx.type === 'donation' ? 'text-green-400' : 'text-yellow-400'
                        }`}
                      />
                    </motion.div>
                  </div>

                  {/* To */}
                  <div className="flex-1">
                    <p className="text-xs text-blue-200 mb-1">To</p>
                    <p className="font-mono text-sm font-medium">{tx.to}</p>
                  </div>

                  {/* Amount */}
                  <div className="ml-4 text-right">
                    <div
                      className={`px-4 py-2 rounded-xl ${
                        tx.type === 'donation'
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                          : 'bg-gradient-to-r from-yellow-400 to-orange-500'
                      }`}
                    >
                      <p className="text-lg font-bold">+{tx.amount} XRP</p>
                      <p className="text-xs opacity-90">
                        {tx.type === 'donation' ? '💰 Donated' : '❤️ Distributed'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty state */}
          {transactions.length === 0 && (
            <div className="text-center py-8 text-blue-100">
              <p>Waiting for transactions...</p>
            </div>
          )}
        </div>

        {/* Footer message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-center text-blue-100 text-sm"
        >
          <p>
            ✨ Every transaction is recorded on the XRPL blockchain •{' '}
            <span className="font-bold">100% transparent</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

// Stat Box Component
interface StatBoxProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

const StatBox: React.FC<StatBoxProps> = ({ icon, label, value, color }) => {
  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
      <div className={`inline-flex p-2 rounded-lg bg-gradient-to-r ${color} mb-2`}>
        {icon}
      </div>
      <p className="text-xs text-blue-200 mb-1">{label}</p>
      <motion.p
        key={value}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        className="text-2xl font-bold"
      >
        {value}
      </motion.p>
    </div>
  );
};

/**
 * Green Pool Balance - Eco-themed live donation pool stats
 *
 * Features:
 * - Real-time pool balance
 * - Animated counters
 * - Green gradient theme
 * - Auto-refresh
 * - Gamified stats display
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Activity, RefreshCw, Sparkles } from 'lucide-react';
import { useStore } from '../../store';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  gradient: string;
  index: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subValue, gradient, index }) => {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-3xl p-6 border-2 border-emerald-500/30 bg-gradient-to-br ${gradient} backdrop-blur-xl shadow-2xl`}
      whileHover={{ y: -8, scale: 1.05 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <motion.div
            className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm shadow-lg"
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            {icon}
          </motion.div>
          <div className="text-right">
            <div className="text-sm text-emerald-100 font-bold">{label}</div>
          </div>
        </div>

        <motion.div
          className="text-4xl font-bold text-white mb-1 drop-shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: index * 0.1 + 0.2 }}
        >
          {value}
        </motion.div>

        {subValue && (
          <div className="text-sm text-emerald-200 font-medium">
            {subValue}
          </div>
        )}
      </div>

      {/* Glow Effect */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          boxShadow: '0 0 40px rgba(132, 204, 22, 0.3)',
        }}
        animate={{
          boxShadow: [
            '0 0 40px rgba(132, 204, 22, 0.3)',
            '0 0 60px rgba(132, 204, 22, 0.5)',
            '0 0 40px rgba(132, 204, 22, 0.3)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  );
};

export const GreenPoolBalance: React.FC = () => {
  const { pool, isLoading, fetchPool } = useStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchPool();

    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchPool();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchPool]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchPool();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  if (isLoading && !pool) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="w-16 h-16 border-4 border-lime-400 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  const totalBalance = pool?.totalBalance || 0;
  const totalDonations = pool?.totalDonations || 0;
  const donorCount = pool?.donorCount || 0;
  const totalDistributed = pool?.totalDistributed || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="p-3 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 shadow-lg"
            >
              <Activity className="h-8 w-8 text-white" />
            </motion.div>
            <h2 className="text-4xl font-bold text-white drop-shadow-lg">
              💰 Live Pool Statistics
            </h2>
          </div>
          <p className="text-emerald-200 text-lg">
            Real-time donation pool performance on XRP Ledger
          </p>
        </motion.div>

        <motion.button
          onClick={handleManualRefresh}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-lime-400 to-emerald-500 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-lime-400/30 transition-all border-2 border-lime-400/30"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<DollarSign className="w-8 h-8 text-white" />}
          label="Pool Balance"
          value={`${totalBalance.toLocaleString()} XRP`}
          subValue="Current pool value"
          gradient="from-cyan-600/80 to-blue-700/80"
          index={0}
        />

        <StatCard
          icon={<TrendingUp className="w-8 h-8 text-white" />}
          label="Total Donations"
          value={`${totalDonations.toLocaleString()} XRP`}
          subValue="All-time contributions"
          gradient="from-lime-600/80 to-emerald-700/80"
          index={1}
        />

        <StatCard
          icon={<Users className="w-8 h-8 text-white" />}
          label="Total Donors"
          value={donorCount.toLocaleString()}
          subValue="Unique contributors"
          gradient="from-purple-600/80 to-pink-700/80"
          index={2}
        />

        <StatCard
          icon={<Activity className="w-8 h-8 text-white" />}
          label="Distributed to NGOs"
          value={`${totalDistributed.toLocaleString()} XRP`}
          subValue="Impact delivered"
          gradient="from-orange-600/80 to-red-700/80"
          index={3}
        />
      </div>

      {/* Pool Health Indicator */}
      <motion.div
        className="bg-gradient-to-br from-emerald-800/80 to-teal-900/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-emerald-500/30 shadow-2xl relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {/* Background Sparkles */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              <Sparkles className="w-4 h-4 text-lime-400" />
            </motion.div>
          ))}
        </div>

        <div className="flex items-start gap-6 relative z-10">
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
            animate={{
              boxShadow: [
                '0 0 20px rgba(132, 204, 22, 0.5)',
                '0 0 40px rgba(132, 204, 22, 0.8)',
                '0 0 20px rgba(132, 204, 22, 0.5)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Activity className="w-8 h-8 text-white" />
          </motion.div>

          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              Pool Health: Excellent
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✨
              </motion.span>
            </h3>
            <p className="text-emerald-200 mb-4 text-lg">
              The donation pool is actively generating profits through AI-managed trading.
              {totalDistributed > 0 && ` Already distributed ${totalDistributed.toLocaleString()} XRP to verified NGOs.`}
            </p>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-emerald-200 font-medium">
                <span>Distributed vs Total</span>
                <span className="text-lime-400 font-bold">
                  {((totalDistributed / totalDonations) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-green-950/80 rounded-full h-4 overflow-hidden border-2 border-emerald-500/30">
                <motion.div
                  className="h-full bg-gradient-to-r from-lime-400 via-emerald-500 to-cyan-500 relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${(totalDistributed / totalDonations) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                >
                  {/* Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Last Update */}
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center justify-center gap-2 text-emerald-200">
          <motion.div
            className="w-2.5 h-2.5 bg-lime-400 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-sm font-medium">Auto-updating every 5 seconds</span>
        </div>
      </motion.div>
    </div>
  );
};

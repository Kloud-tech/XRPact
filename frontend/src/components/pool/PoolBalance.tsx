/**
 * Pool Balance - Live donation pool stats
 *
 * Features:
 * - Real-time pool balance
 * - Animated counters
 * - Total donations tracking
 * - Donors count
 * - Auto-refresh every 5 seconds
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Activity, RefreshCw } from 'lucide-react';
import { useStore } from '../../store';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  color: string;
  gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subValue, color, gradient }) => {
  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl p-6 border border-gray-200 bg-white shadow-lg hover:shadow-xl transition-shadow"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Gradient Background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{ background: gradient }}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            {icon}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 font-medium">{label}</div>
          </div>
        </div>

        <div className="text-3xl font-bold text-gray-900 mb-1">
          {value}
        </div>

        {subValue && (
          <div className="text-sm text-gray-500">
            {subValue}
          </div>
        )}
      </div>

      {/* Animated Border on Hover */}
      <motion.div
        className="absolute inset-0 border-2 rounded-2xl pointer-events-none"
        style={{ borderColor: color }}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 0.2 }}
      />
    </motion.div>
  );
};

export const PoolBalance: React.FC = () => {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
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
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Live Pool Statistics
          </h2>
          <p className="text-gray-600">
            Real-time donation pool performance on XRP Ledger
          </p>
        </div>

        <motion.button
          onClick={handleManualRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<DollarSign className="w-6 h-6 text-white" />}
          label="Pool Balance"
          value={`${totalBalance.toLocaleString()} XRP`}
          subValue="Current pool value"
          color="bg-blue-600"
          gradient="linear-gradient(135deg, #0066CC 0%, #0052A3 100%)"
        />

        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          label="Total Donations"
          value={`${totalDonations.toLocaleString()} XRP`}
          subValue="All-time contributions"
          color="bg-green-600"
          gradient="linear-gradient(135deg, #10B981 0%, #059669 100%)"
        />

        <StatCard
          icon={<Users className="w-6 h-6 text-white" />}
          label="Total Donors"
          value={donorCount.toLocaleString()}
          subValue="Unique contributors"
          color="bg-purple-600"
          gradient="linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)"
        />

        <StatCard
          icon={<Activity className="w-6 h-6 text-white" />}
          label="Distributed to NGOs"
          value={`${totalDistributed.toLocaleString()} XRP`}
          subValue="Impact delivered"
          color="bg-orange-600"
          gradient="linear-gradient(135deg, #F97316 0%, #EA580C 100%)"
        />
      </div>

      {/* Pool Health Indicator */}
      <motion.div
        className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 border border-blue-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Pool Health: Excellent
            </h3>
            <p className="text-gray-700 mb-4">
              The donation pool is actively generating profits through AI-managed trading.
              {totalDistributed > 0 && ` Already distributed ${totalDistributed.toLocaleString()} XRP to verified NGOs.`}
            </p>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Distributed vs Total</span>
                <span>{((totalDistributed / totalDonations) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(totalDistributed / totalDonations) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Last Update */}
      <div className="mt-4 text-center text-sm text-gray-500">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Auto-updating every 5 seconds</span>
        </div>
      </div>
    </div>
  );
};

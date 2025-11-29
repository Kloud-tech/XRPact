/**
 * Landing Hero - Main hero section
 *
 * Features:
 * - Animated gradient background
 * - Live pool stats
 * - Call-to-action buttons
 * - Floating particles effect
 * - Perfect for hackathon demo opening
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Leaf, Sparkles } from 'lucide-react';
import { useStore } from '../../store';

export const LandingHero: React.FC = () => {
  const { pool, fetchPool, setShowDonationModal, climateMode } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchPool();
  }, [fetchPool]);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-green-600">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              x: [null, Math.random() * window.innerWidth],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          {/* Logo/Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full text-white mb-8"
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">XRPL Hackathon 2025</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6"
          >
            XRPL Impact Fund
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl sm:text-2xl text-blue-100 mb-4"
          >
            The Transparent Regenerative Donation Engine
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-blue-50 max-w-2xl mx-auto mb-12"
          >
            Turn your donation into a <span className="font-bold text-green-300">perpetual engine for good</span>.
            AI-managed funds generate profits, automatically distributed to verified NGOs on the XRP Ledger.
          </motion.p>

          {/* Live Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12"
          >
            {/* Pool Balance */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-6 h-6 text-green-300" />
                <span className="text-blue-100 text-sm font-medium">Pool Balance</span>
              </div>
              <div className="text-4xl font-bold text-white">
                {pool?.totalBalance.toLocaleString() || '0'} <span className="text-2xl">XRP</span>
              </div>
            </div>

            {/* Total Donors */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-6 h-6 text-blue-300" />
                <span className="text-blue-100 text-sm font-medium">Total Donors</span>
              </div>
              <div className="text-4xl font-bold text-white">
                {pool?.donorCount.toLocaleString() || '0'}
              </div>
            </div>

            {/* CO2 Offset */}
            {climateMode && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Leaf className="w-6 h-6 text-green-400" />
                  <span className="text-blue-100 text-sm font-medium">CO₂ Offset</span>
                </div>
                <div className="text-4xl font-bold text-white">
                  {pool?.co2Offset?.toLocaleString() || '0'} <span className="text-2xl">tons</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => setShowDonationModal(true)}
              className="group relative px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-lg shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10">Start Donating</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity" />
            </button>

            <button
              onClick={() => document.getElementById('impact-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 rounded-full font-bold text-lg hover:bg-white/20 transition-all duration-300"
            >
              See Impact
            </button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-8 text-blue-100"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm">100% Transparent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm">XRPL Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm">AI Optimized</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm">Climate Positive</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-white rounded-full"
          />
        </div>
      </motion.div>
    </div>
  );
};

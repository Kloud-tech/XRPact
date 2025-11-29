/**
 * Enhanced Hero Section - Modern Charity Dashboard
 *
 * Features:
 * - Gradient background with floating particles
 * - Glassmorphism stat cards
 * - Animated elements
 * - CTA buttons with gradients
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Heart, Sparkles, ArrowRight } from 'lucide-react';
import { WalletButton } from '../wallet/WalletButton';
import { usePoolData } from '../../hooks/usePoolData';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
  gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, trend, gradient }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative group"
    >
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-3xl opacity-75 group-hover:opacity-100 blur transition duration-300`}></div>
      <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <div className="text-white">
              {icon}
            </div>
          </div>
          {trend && (
            <div className="px-3 py-1 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-400/30">
              <span className="text-green-300 text-sm font-semibold">{trend}</span>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-white/70 text-sm font-medium">{label}</p>
          <p className="text-white text-3xl font-bold">{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

const FloatingParticle: React.FC<{ delay: number; size: string; color: string }> = ({ delay, size, color }) => {
  return (
    <motion.div
      className={`absolute rounded-full ${size} ${color} opacity-20 blur-xl`}
      animate={{
        y: [-20, -60, -20],
        x: [-10, 10, -10],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

export const EnhancedHero: React.FC = () => {
  const { poolData } = usePoolData();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Gradient Background - More Green! */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600">
        <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-lime-400/10 via-transparent to-emerald-500/20"></div>
      </div>

      {/* Floating Particles - Green Theme */}
      <FloatingParticle delay={0} size="w-64 h-64" color="bg-lime-400" />
      <FloatingParticle delay={1} size="w-96 h-96" color="bg-emerald-400" />
      <FloatingParticle delay={2} size="w-80 h-80" color="bg-teal-300" />
      <FloatingParticle delay={1.5} size="w-72 h-72" color="bg-green-300" />
      <FloatingParticle delay={0.5} size="w-56 h-56" color="bg-cyan-400" />

      {/* Additional decorative orbs - Green glow */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-lime-400/30 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-40 right-20 w-56 h-56 bg-emerald-400/40 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-teal-300/30 rounded-full blur-2xl animate-float"></div>
      <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-green-400/25 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 left-1/3 w-36 h-36 bg-cyan-400/30 rounded-full blur-2xl animate-float"></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        {/* Wallet Button - Top Right */}
        <div className="absolute top-8 right-8">
          <WalletButton />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-lime-400/20 backdrop-blur-md border-2 border-lime-300/40 mb-6 shadow-glow-cyan"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-lime-200 drop-shadow-lg" />
            </motion.div>
            <span className="text-white font-bold drop-shadow-md">Powered by XRPL</span>
          </motion.div>

          <motion.h1
            className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl"
            animate={{
              textShadow: [
                "0 0 20px rgba(132, 204, 22, 0.5)",
                "0 0 40px rgba(132, 204, 22, 0.8)",
                "0 0 20px rgba(132, 204, 22, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🌍 XRPL Impact Fund
          </motion.h1>

          <p className="text-2xl md:text-3xl text-white font-medium mb-8 max-w-3xl mx-auto drop-shadow-lg">
            Turn your donation into a <span className="text-lime-200 font-black animate-pulse">perpetual engine</span> for good 🌱
          </p>

          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-12">
            Your contribution generates sustainable yield through XRPL AMM.
            100% of profits fund verified humanitarian projects with on-chain transparency.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.a
              href="#impact-dashboard-section"
              whileHover={{ scale: 1.1, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(132, 204, 22, 0.5)",
                  "0 0 40px rgba(132, 204, 22, 0.8)",
                  "0 0 20px rgba(132, 204, 22, 0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="group px-10 py-5 rounded-2xl bg-gradient-to-r from-lime-400 via-green-500 to-emerald-600 text-white font-black text-xl shadow-2xl flex items-center gap-3 border-2 border-lime-300"
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🚀
              </motion.span>
              Start Your Impact
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ArrowRight className="w-6 h-6" />
              </motion.div>
            </motion.a>

            <motion.a
              href="#world-map-section"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-5 rounded-2xl bg-emerald-600/30 backdrop-blur-xl border-2 border-emerald-300/50 text-white font-bold text-lg hover:bg-emerald-500/40 transition-all duration-300 shadow-lg"
            >
              🌍 Explore Projects
            </motion.a>

            <motion.a
              href="/impact-map"
              whileHover={{ scale: 1.05, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
              className="group px-8 py-5 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-600 text-white font-bold text-lg shadow-xl hover:shadow-glow-cyan transition-all duration-300 flex items-center gap-2 border-2 border-cyan-300"
            >
              🗺️ Impact Map
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </motion.a>
          </div>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Pool Balance"
            value={`${(poolData?.totalBalance || 0).toLocaleString()} XRP`}
            trend={poolData?.totalProfitsGenerated ? `+${poolData.totalProfitsGenerated.toFixed(1)} profit` : undefined}
            gradient="from-cyan-400 to-blue-500"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Total Donors"
            value={(poolData?.donorCount || 0).toString()}
            trend={poolData?.donorCount ? `${poolData.donorCount} active` : undefined}
            gradient="from-purple-400 to-pink-500"
          />
          <StatCard
            icon={<Heart className="w-6 h-6" />}
            label="Total Donated"
            value={`${(poolData?.totalDonations || 0).toLocaleString()} XRP`}
            gradient="from-pink-400 to-red-500"
          />
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 flex flex-wrap justify-center items-center gap-8 text-white/70 text-sm"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>100% On-Chain Transparency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Real-time Validation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Audited Smart Contracts</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom Wave Decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
            fillOpacity="0.1"
          />
        </svg>
      </div>
    </div>
  );
};

export default EnhancedHero;

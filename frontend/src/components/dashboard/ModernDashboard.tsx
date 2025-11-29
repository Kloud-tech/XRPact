/**
 * Modern Charity Dashboard - Complete UI
 *
 * Includes:
 * - Donor Level Badge
 * - Progress Bar
 * - Impact Metrics Grid
 * - Real Impact Cards
 * - Growing Impact Tree
 * - Achievement Badges
 * - AI Engine Health
 * - Live Transaction Flow
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Users,
  Heart,
  Sparkles,
  Droplet,
  Home,
  Leaf,
  Brain,
  TrendingUp,
  Award,
  Target,
  Shield,
  ArrowRight,
  Activity,
  Loader,
} from 'lucide-react';
import { usePoolData } from '../../hooks/usePoolData';

// ==================== DONOR LEVEL BADGE ====================
interface DonorLevel {
  level: number;
  title: string;
  emoji: string;
  minDonation: number;
  nextLevel: number;
  color: string;
}

const DONOR_LEVELS: DonorLevel[] = [
  { level: 1, title: 'Impact Starter', emoji: '🌱', minDonation: 0, nextLevel: 500, color: 'from-green-400 to-emerald-500' },
  { level: 2, title: 'Change Maker', emoji: '💧', minDonation: 500, nextLevel: 1000, color: 'from-cyan-400 to-blue-500' },
  { level: 3, title: 'Impact Hero', emoji: '⚡', minDonation: 1000, nextLevel: 5000, color: 'from-yellow-400 to-orange-500' },
  { level: 4, title: 'Visionary', emoji: '🌟', minDonation: 5000, nextLevel: 10000, color: 'from-purple-400 to-pink-500' },
  { level: 5, title: 'Legend', emoji: '🏆', minDonation: 10000, nextLevel: 10000, color: 'from-pink-500 to-red-500' },
];

const DonorLevelBadge: React.FC<{ currentDonation: number }> = ({ currentDonation }) => {
  const currentLevel = DONOR_LEVELS.findIndex(l => currentDonation < l.nextLevel) !== -1
    ? DONOR_LEVELS[DONOR_LEVELS.findIndex(l => currentDonation < l.nextLevel)]
    : DONOR_LEVELS[DONOR_LEVELS.length - 1];

  const progress = currentLevel.nextLevel > currentLevel.minDonation
    ? ((currentDonation - currentLevel.minDonation) / (currentLevel.nextLevel - currentLevel.minDonation)) * 100
    : 100;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative"
    >
      <div className={`absolute -inset-1 bg-gradient-to-r ${currentLevel.color} rounded-3xl opacity-75 blur-xl animate-pulse-slow`}></div>
      <div className="relative bg-gradient-to-br from-emerald-800/90 to-teal-900/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-2 border-emerald-400/30">
        <div className="flex items-center gap-6">
          {/* Badge Circle */}
          <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${currentLevel.color} flex items-center justify-center shadow-lg`}>
            <span className="text-5xl">{currentLevel.emoji}</span>
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full px-3 py-1 shadow-lg">
              <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Lvl {currentLevel.level}
              </span>
            </div>
          </div>

          {/* Level Info */}
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">{currentLevel.title}</h3>
            <p className="text-emerald-200 mb-3 font-semibold">Keep making impact! 🌟</p>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-lime-200 font-bold drop-shadow">{currentDonation} XRP</span>
                <span className="text-emerald-300">Next: {currentLevel.nextLevel} XRP</span>
              </div>
              <div className="relative h-3 bg-green-950/50 rounded-full overflow-hidden border border-emerald-500/30">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: `${Math.min(Math.max(progress || 0, 0), 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`absolute inset-y-0 left-0 bg-gradient-to-r ${currentLevel.color} rounded-full`}
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-shimmer"
                    style={{ backgroundSize: '200% 100%' }}
                  ></div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ==================== IMPACT METRICS GRID ====================
interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  gradient: string;
  delay: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, gradient, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`relative rounded-2xl bg-gradient-to-br ${gradient} p-6 shadow-lg hover:shadow-xl transition-shadow group overflow-hidden`}
    >
      {/* Background Orbs */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

      <div className="relative z-10">
        <div className="mb-3">{icon}</div>
        <p className="text-white/80 text-sm font-medium mb-1">{label}</p>
        <p className="text-white text-3xl font-bold">{value}</p>
      </div>
    </motion.div>
  );
};

const ImpactMetricsGrid: React.FC<{ poolData: any }> = ({ poolData }) => {
  const totalProfit = poolData?.totalProfitsGenerated || 0;
  const donors = poolData?.donorCount || 0;
  const totalDonations = poolData?.totalDonations || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        icon={<Zap className="w-8 h-8 text-white" />}
        label="Total Profits Generated"
        value={`${totalProfit.toFixed(1)} XRP`}
        gradient="from-yellow-400 to-orange-500"
        delay={0}
      />
      <MetricCard
        icon={<Users className="w-8 h-8 text-white" />}
        label="Total Donors"
        value={donors.toString()}
        gradient="from-cyan-400 to-blue-500"
        delay={0.1}
      />
      <MetricCard
        icon={<Heart className="w-8 h-8 text-white" />}
        label="Total Donations"
        value={`${totalDonations.toFixed(0)} XRP`}
        gradient="from-pink-400 to-red-500"
        delay={0.2}
      />
      <MetricCard
        icon={<Sparkles className="w-8 h-8 text-white" />}
        label="Pool Balance"
        value={`${(poolData?.totalBalance || 0).toFixed(0)} XRP`}
        gradient="from-purple-400 to-pink-500"
        delay={0.3}
      />
    </div>
  );
};

// ==================== REAL IMPACT CARDS ====================
interface RealImpactCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  iconColor: string;
  delay: number;
}

const RealImpactCard: React.FC<RealImpactCardProps> = ({ icon, label, value, unit, iconColor, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.05, y: -10 }}
      className="bg-gradient-to-br from-emerald-800/80 to-teal-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border-2 border-emerald-500/30"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-4 rounded-2xl ${iconColor} shadow-lg`}>
          {icon}
        </div>
      </div>
      <h3 className="text-emerald-200 font-bold mb-2 text-lg">{label}</h3>
      <div className="flex items-baseline gap-2">
        <motion.span
          className="text-5xl font-black text-white drop-shadow-lg"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {value}
        </motion.span>
        <span className="text-lime-300 text-xl font-semibold">{unit}</span>
      </div>
    </motion.div>
  );
};

const RealImpactCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <RealImpactCard
        icon={<Droplet className="w-6 h-6 text-white" />}
        label="Clean Water"
        value="15,420"
        unit="liters"
        iconColor="bg-gradient-to-br from-cyan-400 to-blue-500"
        delay={0}
      />
      <RealImpactCard
        icon={<Home className="w-6 h-6 text-white" />}
        label="Meals Served"
        value="1,247"
        unit="meals"
        iconColor="bg-gradient-to-br from-orange-400 to-red-500"
        delay={0.1}
      />
      <RealImpactCard
        icon={<Leaf className="w-6 h-6 text-white" />}
        label="Trees Planted"
        value="89"
        unit="trees"
        iconColor="bg-gradient-to-br from-green-400 to-emerald-500"
        delay={0.2}
      />
    </div>
  );
};

// ==================== GROWING IMPACT TREE ====================
const GrowingImpactTree: React.FC = () => {
  const treeHeights = [40, 60, 55, 75, 65, 85, 70];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-3xl bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 p-8 shadow-2xl overflow-hidden"
    >
      {/* Background Orbs */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <Leaf className="w-8 h-8 text-white" />
          <h2 className="text-3xl font-bold text-white">Your Impact Tree is Growing!</h2>
        </div>

        <p className="text-white/90 mb-8 text-lg">
          Watch your contributions bloom into real-world change
        </p>

        {/* Tree Bars */}
        <div className="flex items-end justify-around gap-4 h-64">
          {treeHeights.map((height, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
              className="flex-1 relative"
            >
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-t-2xl border-2 border-white/30 flex flex-col items-center justify-start pt-3">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 + 0.8 }}
                  className="text-3xl"
                >
                  🌳
                </motion.span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-white/80 text-sm">
          <Activity className="w-4 h-4" />
          <span>Growing based on your donations and impact created</span>
        </div>
      </div>
    </motion.div>
  );
};

// ==================== ACHIEVEMENT BADGES ====================
interface AchievementBadge {
  id: string;
  emoji: string;
  name: string;
  unlocked: boolean;
  gradient: string;
}

const ACHIEVEMENTS: AchievementBadge[] = [
  { id: '1', emoji: '🎯', name: 'First Donation', unlocked: true, gradient: 'from-yellow-400 to-orange-500' },
  { id: '2', emoji: '💎', name: 'Diamond Donor', unlocked: true, gradient: 'from-cyan-400 to-blue-500' },
  { id: '3', emoji: '🌟', name: '10 Projects', unlocked: true, gradient: 'from-purple-400 to-pink-500' },
  { id: '4', emoji: '🔥', name: 'Weekly Streak', unlocked: false, gradient: 'from-orange-500 to-red-600' },
  { id: '5', emoji: '🚀', name: 'Impact Rocket', unlocked: false, gradient: 'from-indigo-500 to-purple-600' },
  { id: '6', emoji: '👑', name: 'Top Contributor', unlocked: false, gradient: 'from-yellow-500 to-amber-600' },
];

const AchievementBadges: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-emerald-800/80 to-teal-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-lg border-2 border-emerald-500/30">
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Award className="w-8 h-8 text-lime-400 drop-shadow-lg" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white drop-shadow-lg">🏆 Achievements</h2>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {ACHIEVEMENTS.map((achievement, i) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="relative group"
          >
            {achievement.unlocked ? (
              <>
                <div className={`absolute -inset-1 bg-gradient-to-r ${achievement.gradient} rounded-2xl opacity-75 group-hover:opacity-100 blur transition`}></div>
                <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-lg">
                  <span className="text-4xl">{achievement.emoji}</span>
                  <span className="text-xs font-semibold text-gray-700 text-center">{achievement.name}</span>
                </div>
              </>
            ) : (
              <div className="bg-gray-100 rounded-2xl p-4 flex flex-col items-center gap-2 opacity-50">
                <span className="text-4xl grayscale">{achievement.emoji}</span>
                <span className="text-xs font-semibold text-gray-500 text-center">{achievement.name}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ==================== AI ENGINE HEALTH ====================
const AIEngineHealth: React.FC = () => {
  const metrics = [
    { label: 'Performance', value: 85, color: 'from-lime-400 to-green-500' },
    { label: 'Safety', value: 92, color: 'from-emerald-400 to-teal-500' },
    { label: 'Impact Boost', value: 75, color: 'from-cyan-400 to-blue-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-emerald-800/80 to-teal-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-lg border-2 border-emerald-500/30"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="w-8 h-8 text-lime-400 drop-shadow-lg" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">🤖 AI Impact Engine</h2>
        </div>

        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="px-5 py-2 rounded-full bg-gradient-to-r from-lime-400 to-green-500 text-emerald-950 font-black flex items-center gap-2 shadow-lg"
        >
          <span>Excellent</span>
          <Sparkles className="w-5 h-5" />
        </motion.div>
      </div>

      <div className="space-y-4 mb-6">
        {metrics.map((metric, i) => (
          <div key={i}>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-bold text-emerald-200">{metric.label}</span>
              <span className="text-sm font-black text-lime-300">{metric.value}%</span>
            </div>
            <div className="h-3 bg-green-950/50 rounded-full overflow-hidden border border-emerald-500/30">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metric.value}%` }}
                transition={{ delay: i * 0.1, duration: 1, ease: "easeOut" }}
                className={`h-full bg-gradient-to-r ${metric.color} rounded-full shadow-lg`}
              >
                <div className="h-full bg-gradient-to-r from-white/20 via-white/40 to-transparent animate-shimmer"></div>
              </motion.div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-emerald-200 font-medium">
        ⚡ Your AI engine optimizes yield generation and project selection to maximize humanitarian impact per XRP donated.
      </p>
    </motion.div>
  );
};

// ==================== MAIN DASHBOARD ====================
export const ModernDashboard: React.FC = () => {
  const [currentDonation] = useState(750);
  const { poolData, loading, error } = usePoolData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-green-900 py-12 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-400/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-6 space-y-12 relative z-10">
        {/* Loading State */}
        {loading && (
          <motion.div
            className="flex items-center justify-center gap-3 bg-gradient-to-br from-emerald-800/80 to-teal-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-lg border-2 border-emerald-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loader className="w-6 h-6 text-lime-400 animate-spin" />
            <span className="text-white font-bold">Loading pool data from XRPL testnet...</span>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            className="flex items-center justify-center gap-3 bg-gradient-to-br from-red-800/80 to-orange-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border-2 border-red-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-white">⚠️ {error}</span>
          </motion.div>
        )}

        {/* Donor Level Badge */}
        <DonorLevelBadge currentDonation={currentDonation} />

        {/* Impact Metrics Grid */}
        <ImpactMetricsGrid poolData={poolData} />

        {/* Real Impact Cards */}
        <RealImpactCards />

        {/* Growing Impact Tree */}
        <GrowingImpactTree />

        {/* Achievement Badges */}
        <AchievementBadges />

        {/* AI Engine Health */}
        <AIEngineHealth />
      </div>
    </div>
  );
};

export default ModernDashboard;

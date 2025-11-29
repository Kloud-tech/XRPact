/**
 * Human Impact Dashboard - Gamified & Humanized
 *
 * Transform technical AI metrics into emotional, human-centered impact
 * Features:
 * - Gamified progress visualization
 * - Donor badges & levels
 * - Real-time impact animations
 * - Web3-style glassmorphism UI
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Droplet,
  Users,
  TrendingUp,
  Zap,
  Award,
  Sparkles,
  Leaf,
  Home
} from 'lucide-react';
import { HumanizedAIMetrics } from '../analytics/HumanizedAIMetrics';
import { LiveTransactionFlow } from '../animations/LiveTransactionFlow';

interface ImpactMetrics {
  // Human-centered metrics (not technical)
  todayImpactBoost: number; // % increase
  donorsThisWeek: number;
  familiesHelped: number;
  charityGeneratedToday: number; // XRPL generated
  waterLitersProvided: number;
  mealsProvided: number;
  treesPlanted: number;
}

interface DonorLevel {
  level: number;
  title: string;
  minDonation: number;
  badge: string;
  color: string;
}

const DONOR_LEVELS: DonorLevel[] = [
  { level: 1, title: "Impact Starter", minDonation: 100, badge: "🌱", color: "from-green-400 to-emerald-500" },
  { level: 2, title: "Change Maker", minDonation: 500, badge: "💧", color: "from-blue-400 to-cyan-500" },
  { level: 3, title: "Hero of Hope", minDonation: 1000, badge: "⭐", color: "from-yellow-400 to-orange-500" },
  { level: 4, title: "Guardian Angel", minDonation: 5000, badge: "👼", color: "from-purple-400 to-pink-500" },
  { level: 5, title: "Legend", minDonation: 10000, badge: "🏆", color: "from-amber-400 to-red-500" },
];

export const HumanImpactDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<ImpactMetrics>({
    todayImpactBoost: 12.4,
    donorsThisWeek: 142,
    familiesHelped: 218,
    charityGeneratedToday: 32.4,
    waterLitersProvided: 15420,
    mealsProvided: 1247,
    treesPlanted: 89,
  });

  const [userDonation] = useState(750); // Example user donation
  const currentLevel = DONOR_LEVELS.find(l => userDonation >= l.minDonation) || DONOR_LEVELS[0];
  const nextLevel = DONOR_LEVELS[currentLevel.level] || currentLevel;
  const progressToNext = Math.min(100, (userDonation / nextLevel.minDonation) * 100);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        charityGeneratedToday: prev.charityGeneratedToday + (Math.random() * 0.5),
        familiesHelped: prev.familiesHelped + (Math.random() > 0.95 ? 1 : 0),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header with Donor Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Your Impact Today
              </h1>
              <p className="text-gray-600 text-lg">Making the world better, one donation at a time</p>
            </div>

            {/* Donor Level Badge */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`bg-gradient-to-r ${currentLevel.color} p-6 rounded-2xl shadow-2xl backdrop-blur-xl border-2 border-white/50`}
            >
              <div className="text-center text-white">
                <div className="text-5xl mb-2">{currentLevel.badge}</div>
                <div className="font-bold text-lg">{currentLevel.title}</div>
                <div className="text-sm opacity-90">Level {currentLevel.level}</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Progress to Next Level */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-purple-200"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">
              Progress to {nextLevel.title}
            </span>
            <span className="text-sm font-bold text-purple-600">
              {userDonation} / {nextLevel.minDonation} XRP
            </span>
          </div>
          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressToNext}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full bg-gradient-to-r ${nextLevel.color} rounded-full`}
            />
            <motion.div
              animate={{ x: [0, 100, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-transparent via-white/50 to-transparent"
            />
          </div>
        </motion.div>

        {/* Main Impact Metrics - Humanized */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          {/* Today's Impact Boost */}
          <ImpactCard
            icon={<Zap className="w-8 h-8" />}
            label="Today's Impact Boost"
            value={`+${metrics.todayImpactBoost.toFixed(1)}%`}
            gradient="from-yellow-400 via-orange-400 to-red-400"
            animate
          />

          {/* Donors This Week */}
          <ImpactCard
            icon={<Users className="w-8 h-8" />}
            label="Donors Contributed"
            value={metrics.donorsThisWeek.toString()}
            subtitle="this week"
            gradient="from-blue-400 via-cyan-400 to-teal-400"
          />

          {/* Families Helped */}
          <ImpactCard
            icon={<Heart className="w-8 h-8" />}
            label="Families Helped"
            value={metrics.familiesHelped.toString()}
            gradient="from-pink-400 via-rose-400 to-purple-400"
            pulse
          />

          {/* AI Generated for Charity */}
          <ImpactCard
            icon={<Sparkles className="w-8 h-8" />}
            label="AI Generated Today"
            value={`${metrics.charityGeneratedToday.toFixed(1)} XRP`}
            subtitle="for charity"
            gradient="from-purple-400 via-violet-400 to-indigo-400"
            animate
          />
        </div>

        {/* Real Impact Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Water Provided */}
          <RealImpactCard
            icon={<Droplet className="w-12 h-12" />}
            title="Clean Water Provided"
            value={metrics.waterLitersProvided.toLocaleString()}
            unit="liters"
            color="blue"
            description="Enough for 500 families this month"
          />

          {/* Meals Provided */}
          <RealImpactCard
            icon={<Home className="w-12 h-12" />}
            title="Meals Served"
            value={metrics.mealsProvided.toLocaleString()}
            unit="meals"
            color="orange"
            description="Feeding communities every day"
          />

          {/* Trees Planted */}
          <RealImpactCard
            icon={<Leaf className="w-12 h-12" />}
            title="Trees Planted"
            value={metrics.treesPlanted.toString()}
            unit="trees"
            color="green"
            description="Fighting climate change together"
          />
        </div>

        {/* Growing Impact Tree Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />

          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
              <Leaf className="w-10 h-10" />
              Your Impact Tree is Growing!
            </h2>
            <p className="text-lg mb-6 text-green-50">
              As profits increase, your impact tree grows bigger. Watch your positive impact expand in real-time.
            </p>

            {/* Animated Tree Growth Visualization */}
            <div className="flex items-end justify-center gap-2 h-32">
              {[40, 60, 80, 100, 85, 95, 110].map((height, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="w-12 bg-white/30 backdrop-blur rounded-t-full relative"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-2xl"
                  >
                    🌳
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Achievements / Badges Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-purple-200"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-500" />
            Your Achievement Badges
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { badge: "🎯", name: "First Donation", unlocked: true },
              { badge: "💎", name: "Diamond Donor", unlocked: true },
              { badge: "🌟", name: "Weekly Hero", unlocked: true },
              { badge: "🔥", name: "Hot Streak", unlocked: false },
              { badge: "🚀", name: "Moon Mission", unlocked: false },
              { badge: "👑", name: "Ultimate Legend", unlocked: false },
            ].map((achievement, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.1 }}
                className={`p-4 rounded-xl text-center ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-yellow-200 to-orange-200 border-2 border-yellow-400'
                    : 'bg-gray-200 opacity-50'
                }`}
              >
                <div className="text-4xl mb-2">{achievement.badge}</div>
                <div className="text-xs font-medium text-gray-700">{achievement.name}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI Engine Metrics - Humanized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <HumanizedAIMetrics />
        </motion.div>

        {/* Live Transaction Flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <LiveTransactionFlow />
        </motion.div>

      </div>
    </div>
  );
};

// Impact Card Component with animations
interface ImpactCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  gradient: string;
  animate?: boolean;
  pulse?: boolean;
}

const ImpactCard: React.FC<ImpactCardProps> = ({
  icon,
  label,
  value,
  subtitle,
  gradient,
  animate,
  pulse
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`bg-gradient-to-br ${gradient} p-6 rounded-2xl shadow-xl text-white relative overflow-hidden`}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

      <div className="relative z-10">
        <motion.div
          animate={pulse ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className="mb-3"
        >
          {icon}
        </motion.div>
        <p className="text-sm font-medium opacity-90 mb-1">{label}</p>
        <motion.p
          className="text-3xl font-bold"
          animate={animate ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {value}
        </motion.p>
        {subtitle && <p className="text-xs opacity-75 mt-1">{subtitle}</p>}
      </div>

      {/* Animated background effect */}
      {animate && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -right-8 -top-8 w-32 h-32 bg-white/20 rounded-full blur-2xl"
        />
      )}
    </motion.div>
  );
};

// Real Impact Card
interface RealImpactCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  unit: string;
  color: 'blue' | 'orange' | 'green';
  description: string;
}

const RealImpactCard: React.FC<RealImpactCardProps> = ({
  icon,
  title,
  value,
  unit,
  color,
  description
}) => {
  const colorMap = {
    blue: {
      bg: 'from-blue-500 to-cyan-500',
      icon: 'text-blue-600',
      badge: 'bg-blue-100'
    },
    orange: {
      bg: 'from-orange-500 to-yellow-500',
      icon: 'text-orange-600',
      badge: 'bg-orange-100'
    },
    green: {
      bg: 'from-green-500 to-emerald-500',
      icon: 'text-green-600',
      badge: 'bg-green-100'
    }
  };

  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200 relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.bg} opacity-10 rounded-full -mr-16 -mt-16`} />

      <div className="relative z-10">
        <div className={`inline-flex p-3 rounded-xl ${colors.badge} mb-4`}>
          <div className={colors.icon}>
            {icon}
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-bold text-gray-900">{value}</span>
          <span className="text-lg text-gray-600">{unit}</span>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
};

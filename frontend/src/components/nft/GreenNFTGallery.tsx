/**
 * Green NFT Gallery - Eco-themed evolving NFT display
 *
 * Features:
 * - Green gradient theme
 * - Animated tier progression
 * - Gamified level system
 * - XP progress tracking
 * - 3D-style effects
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, TrendingUp, Star, Award, Sparkles } from 'lucide-react';
import { useStore } from '../../store';

const NFT_TIERS = [
  {
    name: 'Bronze',
    level: 1,
    minXP: 0,
    maxXP: 999,
    icon: '🥉',
    color: '#CD7F32',
    gradient: 'from-yellow-700 via-yellow-600 to-yellow-500',
    glowColor: 'yellow-600',
    description: 'Every journey starts somewhere',
  },
  {
    name: 'Silver',
    level: 4,
    minXP: 1000,
    maxXP: 4999,
    icon: '🥈',
    color: '#C0C0C0',
    gradient: 'from-gray-400 via-gray-300 to-gray-200',
    glowColor: 'gray-400',
    description: 'Making a difference',
  },
  {
    name: 'Gold',
    level: 8,
    minXP: 5000,
    maxXP: 9999,
    icon: '🥇',
    color: '#FFD700',
    gradient: 'from-yellow-500 via-yellow-400 to-yellow-300',
    glowColor: 'yellow-400',
    description: 'Champion of change',
  },
  {
    name: 'Platinum',
    level: 11,
    minXP: 10000,
    maxXP: 24999,
    icon: '💎',
    color: '#E5E4E2',
    gradient: 'from-purple-300 via-blue-200 to-purple-200',
    glowColor: 'purple-300',
    description: 'Elite impact maker',
  },
  {
    name: 'Diamond',
    level: 16,
    minXP: 25000,
    maxXP: Infinity,
    icon: '✨',
    color: '#B9F2FF',
    gradient: 'from-cyan-300 via-blue-300 to-purple-300',
    glowColor: 'cyan-300',
    description: 'Legendary philanthropist',
  },
];

const getCurrentTier = (xp: number) => {
  for (let i = NFT_TIERS.length - 1; i >= 0; i--) {
    if (xp >= NFT_TIERS[i].minXP) {
      return NFT_TIERS[i];
    }
  }
  return NFT_TIERS[0];
};

const getNextTier = (xp: number) => {
  const currentIndex = NFT_TIERS.findIndex(tier => xp >= tier.minXP && xp <= tier.maxXP);
  return currentIndex < NFT_TIERS.length - 1 ? NFT_TIERS[currentIndex + 1] : null;
};

export const GreenNFTGallery: React.FC = () => {
  const { donor } = useStore();

  const xp = donor?.xp || 0;
  const level = donor?.level || 1;
  const currentTier = getCurrentTier(xp);
  const nextTier = getNextTier(xp);

  const progressToNext = nextTier
    ? ((xp - currentTier.minXP) / (nextTier.minXP - currentTier.minXP)) * 100
    : 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-lime-400/20 to-emerald-500/20 backdrop-blur-xl px-6 py-3 rounded-full mb-4 border-2 border-lime-400/30"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-6 h-6 text-lime-400" />
          </motion.div>
          <span className="text-lime-200 font-bold text-lg">Your Impact NFT</span>
        </motion.div>

        <motion.h2
          className="text-5xl font-bold text-white mb-4 drop-shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🎨 NFT Evolution Gallery
        </motion.h2>
        <p className="text-xl text-emerald-200 max-w-2xl mx-auto">
          Your donations create a living NFT that evolves with every contribution.
          Track your journey from Bronze to Diamond.
        </p>
      </div>

      {/* Current NFT Showcase */}
      <motion.div
        className="max-w-2xl mx-auto mb-16"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          {/* NFT Card */}
          <div
            className={`relative bg-gradient-to-br ${currentTier.gradient} rounded-3xl p-1.5 shadow-2xl`}
          >
            <div className="bg-gradient-to-br from-emerald-900 to-green-950 rounded-3xl p-10 relative overflow-hidden">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
                  backgroundSize: '30px 30px',
                }} />
              </div>

              {/* Card Content */}
              <div className="text-center relative z-10">
                {/* Level Badge */}
                <motion.div
                  className="inline-flex items-center gap-2 bg-lime-400/20 backdrop-blur-sm px-5 py-2.5 rounded-full mb-6 border-2 border-lime-400/40"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Award className="w-6 h-6 text-lime-400" />
                  <span className="text-white font-bold text-lg">Level {level}</span>
                </motion.div>

                {/* NFT Icon */}
                <motion.div
                  className="text-9xl mb-6 filter drop-shadow-2xl"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {currentTier.icon}
                </motion.div>

                {/* Tier Name */}
                <motion.h3
                  className="text-5xl font-bold text-white mb-3 drop-shadow-lg"
                  animate={{
                    textShadow: [
                      "0 0 20px rgba(132, 204, 22, 0.5)",
                      "0 0 40px rgba(132, 204, 22, 0.8)",
                      "0 0 20px rgba(132, 204, 22, 0.5)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {currentTier.name} Tier
                </motion.h3>

                <p className="text-lg text-emerald-200 mb-8 font-medium">
                  {currentTier.description}
                </p>

                {/* XP Display */}
                <div className="flex items-center justify-center gap-3 mb-8">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="w-8 h-8 text-yellow-400" />
                  </motion.div>
                  <span className="text-4xl font-bold text-white drop-shadow-lg">
                    {xp.toLocaleString()} XP
                  </span>
                </div>

                {/* Progress to Next Tier */}
                {nextTier && (
                  <div className="bg-emerald-800/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-emerald-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-emerald-200 font-medium">
                        Progress to {nextTier.name}
                      </span>
                      <span className="text-sm font-bold text-lime-400">
                        {Math.floor(progressToNext)}%
                      </span>
                    </div>

                    <div className="w-full bg-green-950/80 rounded-full h-4 overflow-hidden mb-3 border border-emerald-500/30">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${nextTier.gradient} shadow-lg`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressToNext}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>

                    <div className="text-sm text-emerald-300 font-medium">
                      {(nextTier.minXP - xp).toLocaleString()} XP until {nextTier.icon} {nextTier.name}
                    </div>
                  </div>
                )}

                {/* NFT ID */}
                {donor?.nftTokenId && (
                  <div className="mt-6 text-xs text-emerald-400 font-mono bg-green-950/50 rounded-lg p-3 border border-emerald-500/30">
                    NFT ID: {donor.nftTokenId.substring(0, 20)}...
                  </div>
                )}
              </div>

              {/* Animated Glow */}
              <motion.div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  boxShadow: `0 0 60px ${currentTier.color}66`,
                }}
                animate={{
                  boxShadow: [
                    `0 0 60px ${currentTier.color}66`,
                    `0 0 80px ${currentTier.color}99`,
                    `0 0 60px ${currentTier.color}66`,
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </div>

          {/* Floating Stats */}
          <motion.div
            className="absolute -right-4 top-1/4 bg-gradient-to-br from-emerald-800/90 to-teal-900/90 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border-2 border-emerald-500/30"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <div className="text-center">
              <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{donor?.donationCount || 0}</div>
              <div className="text-xs text-emerald-200 font-medium">Donations</div>
            </div>
          </motion.div>

          <motion.div
            className="absolute -left-4 top-2/3 bg-gradient-to-br from-emerald-800/90 to-teal-900/90 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border-2 border-emerald-500/30"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.1, rotate: -5 }}
          >
            <div className="text-center">
              <TrendingUp className="w-10 h-10 text-lime-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">
                {(donor?.totalDonated || 0).toLocaleString()}
              </div>
              <div className="text-xs text-emerald-200 font-medium">XRP Donated</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* All Tiers Timeline */}
      <div className="mb-12">
        <h3 className="text-3xl font-bold text-white mb-8 text-center drop-shadow-lg">
          Evolution Timeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {NFT_TIERS.map((tier, index) => {
            const isUnlocked = xp >= tier.minXP;
            const isCurrent = tier.name === currentTier.name;

            return (
              <motion.div
                key={tier.name}
                className={`
                  relative rounded-3xl p-6 border-2 transition-all
                  ${isCurrent
                    ? `bg-gradient-to-br ${tier.gradient} border-transparent shadow-2xl`
                    : isUnlocked
                    ? 'bg-gradient-to-br from-emerald-800/80 to-teal-900/80 backdrop-blur-xl border-emerald-500/30'
                    : 'bg-gradient-to-br from-green-950/50 to-emerald-950/50 border-emerald-500/20 opacity-50'
                  }
                `}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: isUnlocked ? 1.05 : 1, y: isUnlocked ? -5 : 0 }}
              >
                {/* Current Badge */}
                {isCurrent && (
                  <motion.div
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="bg-gradient-to-r from-lime-400 to-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                      CURRENT
                    </div>
                  </motion.div>
                )}

                <div className="text-center">
                  <div className={`text-6xl mb-3 ${!isUnlocked && 'grayscale'}`}>
                    {tier.icon}
                  </div>

                  <h4 className={`text-lg font-bold mb-1 ${isCurrent ? 'text-white' : isUnlocked ? 'text-white' : 'text-emerald-400'}`}>
                    {tier.name}
                  </h4>

                  <div className={`text-xs mb-3 ${isCurrent ? 'text-white/80' : isUnlocked ? 'text-emerald-200' : 'text-emerald-400'}`}>
                    Level {tier.level}+
                  </div>

                  <div className={`text-sm font-bold ${isCurrent ? 'text-white' : isUnlocked ? 'text-lime-200' : 'text-emerald-400'}`}>
                    {tier.minXP === 0 ? '0' : tier.minXP.toLocaleString()}+ XP
                  </div>

                  {isUnlocked && !isCurrent && (
                    <div className="mt-3 text-lime-400 flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-xs font-bold">UNLOCKED</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* How It Works */}
      <motion.div
        className="bg-gradient-to-br from-emerald-800/80 to-teal-900/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-emerald-500/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-3xl font-bold text-white mb-6 text-center flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 text-lime-400" />
          How NFT Evolution Works
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <motion.div
              className="w-20 h-20 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              whileHover={{ scale: 1.1, rotate: 10 }}
            >
              <Zap className="w-10 h-10 text-white" />
            </motion.div>
            <h4 className="font-bold text-white mb-2 text-lg">Earn XP</h4>
            <p className="text-sm text-emerald-200">
              Every 1 XRP donated = 10 XP. Make regular contributions to grow faster.
            </p>
          </div>

          <div className="text-center">
            <motion.div
              className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              whileHover={{ scale: 1.1, rotate: -10 }}
            >
              <TrendingUp className="w-10 h-10 text-white" />
            </motion.div>
            <h4 className="font-bold text-white mb-2 text-lg">Level Up</h4>
            <p className="text-sm text-emerald-200">
              Your level automatically increases with XP. Level formula: √(XP/100) + 1
            </p>
          </div>

          <div className="text-center">
            <motion.div
              className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              whileHover={{ scale: 1.1, rotate: 10 }}
            >
              <Award className="w-10 h-10 text-white" />
            </motion.div>
            <h4 className="font-bold text-white mb-2 text-lg">Evolve NFT</h4>
            <p className="text-sm text-emerald-200">
              Your NFT automatically evolves to higher tiers as you reach XP milestones.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

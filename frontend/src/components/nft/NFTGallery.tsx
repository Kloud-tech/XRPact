/**
 * NFT Impact Gallery - Display evolving NFTs
 *
 * Features:
 * - Visual NFT cards with tier evolution
 * - XP progress tracking
 * - Level badges
 * - 3D-style animations
 * - Next tier preview
 */

import React, { useEffect } from 'react';
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

export const NFTGallery: React.FC = () => {
  const { donor, fetchDonor } = useStore();

  useEffect(() => {
    // Fetch donor data - in real app, this would use actual wallet address
    if (!donor) {
      fetchDonor('rDonor123'); // Mock address
    }
  }, [donor, fetchDonor]);

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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full mb-4"
        >
          <Sparkles className="w-5 h-5 text-purple-600" />
          <span className="text-purple-700 font-semibold">Your Impact NFT</span>
        </motion.div>

        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          NFT Evolution Gallery
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
            className={`relative bg-gradient-to-br ${currentTier.gradient} rounded-3xl p-1 shadow-2xl`}
          >
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8">
              {/* Card Content */}
              <div className="text-center">
                {/* Level Badge */}
                <motion.div
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Award className="w-5 h-5 text-white" />
                  <span className="text-white font-bold">Level {level}</span>
                </motion.div>

                {/* NFT Icon */}
                <motion.div
                  className="text-9xl mb-6"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {currentTier.icon}
                </motion.div>

                {/* Tier Name */}
                <h3 className="text-4xl font-bold text-white mb-2">
                  {currentTier.name} Tier
                </h3>

                <p className="text-lg text-gray-300 mb-6">
                  {currentTier.description}
                </p>

                {/* XP Display */}
                <div className="flex items-center justify-center gap-2 mb-8">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  <span className="text-3xl font-bold text-white">
                    {xp.toLocaleString()} XP
                  </span>
                </div>

                {/* Progress to Next Tier */}
                {nextTier && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-300">
                        Progress to {nextTier.name}
                      </span>
                      <span className="text-sm font-bold text-white">
                        {Math.floor(progressToNext)}%
                      </span>
                    </div>

                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden mb-3">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${nextTier.gradient}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressToNext}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>

                    <div className="text-sm text-gray-300">
                      {(nextTier.minXP - xp).toLocaleString()} XP until {nextTier.icon} {nextTier.name}
                    </div>
                  </div>
                )}

                {/* NFT ID */}
                {donor?.nftTokenId && (
                  <div className="mt-6 text-xs text-gray-400 font-mono">
                    NFT ID: {donor.nftTokenId.substring(0, 20)}...
                  </div>
                )}
              </div>

              {/* Animated Glow */}
              <motion.div
                className="absolute inset-0 rounded-3xl"
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
            className="absolute -right-4 top-1/4 bg-white rounded-2xl p-4 shadow-xl border border-gray-200"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{donor?.donationCount || 0}</div>
              <div className="text-xs text-gray-600">Donations</div>
            </div>
          </motion.div>

          <motion.div
            className="absolute -left-4 top-2/3 bg-white rounded-2xl p-4 shadow-xl border border-gray-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {(donor?.totalDonated || 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">XRP Donated</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* All Tiers Timeline */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
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
                  relative rounded-2xl p-6 border-2 transition-all
                  ${isCurrent
                    ? `bg-gradient-to-br ${tier.gradient} border-transparent`
                    : isUnlocked
                    ? 'bg-white border-gray-300'
                    : 'bg-gray-100 border-gray-200 opacity-50'
                  }
                `}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: isUnlocked ? 1.05 : 1 }}
              >
                {/* Current Badge */}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      CURRENT
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <div className={`text-5xl mb-3 ${!isUnlocked && 'grayscale'}`}>
                    {tier.icon}
                  </div>

                  <h4 className={`text-lg font-bold mb-1 ${isCurrent ? 'text-white' : 'text-gray-900'}`}>
                    {tier.name}
                  </h4>

                  <div className={`text-xs mb-3 ${isCurrent ? 'text-white/80' : 'text-gray-600'}`}>
                    Level {tier.level}+
                  </div>

                  <div className={`text-sm font-bold ${isCurrent ? 'text-white' : 'text-gray-700'}`}>
                    {tier.minXP === 0 ? '0' : tier.minXP.toLocaleString()}+ XP
                  </div>

                  {isUnlocked && !isCurrent && (
                    <div className="mt-3 text-green-600 flex items-center justify-center gap-1">
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
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          How NFT Evolution Works
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Earn XP</h4>
            <p className="text-sm text-gray-600">
              Every 1 XRP donated = 10 XP. Make regular contributions to grow faster.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Level Up</h4>
            <p className="text-sm text-gray-600">
              Your level automatically increases with XP. Level formula: √(XP/100) + 1
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Evolve NFT</h4>
            <p className="text-sm text-gray-600">
              Your NFT automatically evolves to higher tiers as you reach XP milestones.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

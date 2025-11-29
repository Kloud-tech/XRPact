/**
 * Impact Hero - Showcase the impact and NFT evolution
 *
 * Features:
 * - NFT Evolution showcase with animated tiers
 * - Real-time impact metrics
 * - Climate mode visualization
 * - Particle effects
 * - Perfect for impact-focused demo section
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, TrendingUp, Globe, Award, Zap, Heart } from 'lucide-react';
import { useStore } from '../../store';

const NFT_TIERS = [
  { name: 'Bronze', color: '#CD7F32', minXP: 0, icon: '🥉' },
  { name: 'Silver', color: '#C0C0C0', minXP: 1000, icon: '🥈' },
  { name: 'Gold', color: '#FFD700', minXP: 5000, icon: '🥇' },
  { name: 'Platinum', color: '#E5E4E2', minXP: 10000, icon: '💎' },
  { name: 'Diamond', color: '#B9F2FF', minXP: 25000, icon: '✨' },
];

export const ImpactHero: React.FC = () => {
  const { pool, donor, climateMode, fetchPool, fetchDonor } = useStore();
  const [activeTier, setActiveTier] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchPool();
  }, [fetchPool]);

  // Animate through NFT tiers
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTier((prev) => (prev + 1) % NFT_TIERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const currentTier = NFT_TIERS[activeTier];
  const totalImpact = pool?.totalDistributed || 0;
  const co2Offset = pool?.co2Offset || 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-green-600 via-blue-700 to-purple-700">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }} />
      </div>

      {/* Floating Impact Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0,
            }}
            animate={{
              y: [null, -100],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'easeInOut',
            }}
          >
            {i % 3 === 0 ? '🌱' : i % 3 === 1 ? '💚' : '✨'}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - NFT Evolution */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm mb-6"
            >
              <Award className="w-4 h-4" />
              <span>Impact NFT Evolution</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
            >
              Your Impact
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-blue-300">
                Evolves Forever
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-blue-100 mb-8 max-w-xl"
            >
              Every donation earns you XP and evolves your unique Impact NFT through 5 legendary tiers.
              Watch your contribution grow into a perpetual engine for global change.
            </motion.p>

            {/* NFT Tiers Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8"
            >
              {NFT_TIERS.map((tier, index) => (
                <motion.div
                  key={tier.name}
                  className={`
                    px-4 py-2 rounded-full border-2 transition-all duration-300 cursor-pointer
                    ${activeTier === index
                      ? 'bg-white/20 border-white scale-110'
                      : 'bg-white/5 border-white/30 hover:bg-white/10'
                    }
                  `}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setActiveTier(index)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{tier.icon}</span>
                    <span className="text-white font-medium text-sm">{tier.name}</span>
                    <span className="text-xs text-blue-200">{tier.minXP} XP</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Impact Stats Mini Cards */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-300" />
                  <span className="text-xs text-blue-100">Total Impact</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {totalImpact.toLocaleString()} XRP
                </div>
              </div>

              {climateMode && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Leaf className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-blue-100">CO₂ Offset</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {co2Offset.toLocaleString()}t
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Side - Animated NFT Display */}
          <div className="flex items-center justify-center">
            <motion.div
              className="relative w-80 h-80"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, type: 'spring' }}
            >
              {/* NFT Card Container */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTier}
                  className="absolute inset-0 rounded-3xl p-1"
                  style={{
                    background: `linear-gradient(135deg, ${currentTier.color}, ${currentTier.color}88)`,
                  }}
                  initial={{ rotateY: -90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: 90, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                      }} />
                    </div>

                    {/* NFT Content */}
                    <div className="relative z-10 text-center">
                      <motion.div
                        className="text-8xl mb-4"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {currentTier.icon}
                      </motion.div>

                      <h3 className="text-3xl font-bold text-white mb-2">
                        {currentTier.name} Tier
                      </h3>

                      <div className="text-sm text-gray-300 mb-4">
                        Impact NFT Evolution
                      </div>

                      <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                        <Zap className="w-4 h-4" style={{ color: currentTier.color }} />
                        <span className="text-white font-medium">
                          {currentTier.minXP.toLocaleString()} XP Required
                        </span>
                      </div>
                    </div>

                    {/* Animated Border Glow */}
                    <motion.div
                      className="absolute inset-0 rounded-3xl"
                      style={{
                        boxShadow: `0 0 40px ${currentTier.color}66`,
                      }}
                      animate={{
                        boxShadow: [
                          `0 0 40px ${currentTier.color}66`,
                          `0 0 60px ${currentTier.color}99`,
                          `0 0 40px ${currentTier.color}66`,
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Floating Icons Around NFT */}
              {[Globe, Heart, Leaf, Award].map((Icon, i) => (
                <motion.div
                  key={i}
                  className="absolute w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20"
                  style={{
                    top: `${50 + 45 * Math.sin((i * Math.PI) / 2)}%`,
                    left: `${50 + 45 * Math.cos((i * Math.PI) / 2)}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 text-green-300 font-semibold mb-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Live on XRP Ledger</span>
          </div>

          <div className="text-white/80 text-sm max-w-2xl mx-auto">
            Every donation is permanently recorded on the blockchain. Your Impact NFT evolves automatically
            as your contribution grows, creating a transparent legacy of global good.
          </div>
        </motion.div>
      </div>
    </div>
  );
};

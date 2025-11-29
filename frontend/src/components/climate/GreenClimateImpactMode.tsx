/**
 * Green Climate Impact Mode - Ultra eco-themed climate tracking
 *
 * Features:
 * - Climate mode toggle
 * - CO2 offset tracking
 * - Tree planting equivalent
 * - Visual impact metrics
 * - Animated eco elements
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, TreePine, Wind, Droplet, Sun, Globe2, Sparkles } from 'lucide-react';
import { useStore } from '../../store';

export const GreenClimateImpactMode: React.FC = () => {
  const { climateMode, setClimateMode, pool } = useStore();

  const co2Offset = pool?.co2Offset || 0;
  const treesEquivalent = Math.floor(co2Offset / 0.02); // 1 tree = ~20kg CO2/year
  const carsOffRoad = Math.floor(co2Offset / 4.6); // Average car = 4.6 tons CO2/year
  const homesPowered = Math.floor(co2Offset / 7.5); // Average home = 7.5 tons CO2/year

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Toggle Section */}
      <motion.div
        className="bg-gradient-to-br from-emerald-800/80 to-teal-900/80 backdrop-blur-xl rounded-3xl p-8 mb-12 border-2 border-emerald-500/30 shadow-2xl relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 360],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              <Leaf className="w-6 h-6 text-lime-400" />
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Leaf className="w-10 h-10 text-lime-400" />
              </motion.div>
              <h2 className="text-4xl font-bold text-white drop-shadow-lg">
                🌱 Climate Impact Mode
              </h2>
            </div>
            <p className="text-emerald-200 max-w-2xl text-lg">
              Enable Climate Impact Mode to track and visualize the environmental impact of your donations.
              See real-time CO₂ offset metrics and forest restoration equivalents.
            </p>
          </div>

          {/* Toggle Switch */}
          <motion.button
            onClick={() => setClimateMode(!climateMode)}
            className={`
              relative w-24 h-12 rounded-full transition-colors duration-300 border-2
              ${climateMode ? 'bg-gradient-to-r from-lime-400 to-emerald-500 border-lime-400' : 'bg-green-950/50 border-emerald-500/30'}
            `}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              className="absolute top-1 left-1 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center"
              animate={{
                x: climateMode ? 48 : 0,
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {climateMode ? (
                <Leaf className="w-6 h-6 text-lime-500" />
              ) : (
                <Wind className="w-6 h-6 text-emerald-600" />
              )}
            </motion.div>
          </motion.button>
        </div>
      </motion.div>

      {/* Climate Metrics - Only show when enabled */}
      <AnimatePresence>
        {climateMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Main CO2 Display */}
            <motion.div
              className="bg-gradient-to-br from-lime-600 via-emerald-700 to-teal-800 rounded-3xl p-12 mb-8 text-white relative overflow-hidden shadow-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                  backgroundSize: '30px 30px',
                }} />
              </div>

              {/* Floating Eco Emojis */}
              {['🌿', '🍃', '🌱', '💚', '✨', '🌍', '🌳'].map((emoji, i) => (
                <motion.div
                  key={i}
                  className="absolute text-5xl pointer-events-none"
                  initial={{
                    x: Math.random() * 100 + '%',
                    y: Math.random() * 100 + '%',
                    opacity: 0.3,
                  }}
                  animate={{
                    y: [null, '-30%'],
                    rotate: [0, 360],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 10 + Math.random() * 5,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: i * 0.5,
                  }}
                >
                  {emoji}
                </motion.div>
              ))}

              <div className="relative z-10 text-center">
                <motion.div
                  className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6 border-2 border-white/30"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-6 h-6" />
                  <span className="font-bold text-lg">Total Climate Impact</span>
                </motion.div>

                <motion.div
                  className="text-9xl font-bold mb-4 drop-shadow-2xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                >
                  {co2Offset.toLocaleString()}
                </motion.div>

                <div className="text-4xl font-semibold mb-2 drop-shadow-lg">
                  Tons of CO₂ Offset
                </div>

                <div className="text-xl text-lime-100">
                  Equivalent environmental impact of your contributions
                </div>
              </div>
            </motion.div>

            {/* Impact Equivalents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                className="bg-gradient-to-br from-emerald-800/80 to-teal-900/80 backdrop-blur-xl rounded-3xl p-6 border-2 border-lime-400/40 hover:shadow-2xl hover:shadow-lime-400/20 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -8, scale: 1.05 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <TreePine className="w-10 h-10 text-white" />
                  </motion.div>
                  <div>
                    <div className="text-sm text-emerald-200 font-medium">Trees Planted Equivalent</div>
                    <motion.div
                      className="text-4xl font-bold text-white"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {treesEquivalent.toLocaleString()}
                    </motion.div>
                  </div>
                </div>
                <p className="text-sm text-emerald-200">
                  Your impact equals planting this many trees and nurturing them for 10 years. 🌳
                </p>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-cyan-800/80 to-blue-900/80 backdrop-blur-xl rounded-3xl p-6 border-2 border-cyan-400/40 hover:shadow-2xl hover:shadow-cyan-400/20 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -8, scale: 1.05 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg"
                    whileHover={{ rotate: -360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Wind className="w-10 h-10 text-white" />
                  </motion.div>
                  <div>
                    <div className="text-sm text-cyan-200 font-medium">Cars Off Road</div>
                    <motion.div
                      className="text-4xl font-bold text-white"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {carsOffRoad.toLocaleString()}
                    </motion.div>
                  </div>
                </div>
                <p className="text-sm text-cyan-200">
                  Equivalent to removing this many cars from the road for an entire year. 🚗
                </p>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-purple-800/80 to-pink-900/80 backdrop-blur-xl rounded-3xl p-6 border-2 border-purple-400/40 hover:shadow-2xl hover:shadow-purple-400/20 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ y: -8, scale: 1.05 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Sun className="w-10 h-10 text-white" />
                  </motion.div>
                  <div>
                    <div className="text-sm text-purple-200 font-medium">Homes Powered</div>
                    <motion.div
                      className="text-4xl font-bold text-white"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {homesPowered.toLocaleString()}
                    </motion.div>
                  </div>
                </div>
                <p className="text-sm text-purple-200">
                  Clean energy equivalent to powering this many homes for one year. ⚡
                </p>
              </motion.div>
            </div>

            {/* How It Works */}
            <motion.div
              className="bg-gradient-to-br from-emerald-800/80 to-teal-900/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-emerald-500/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Globe2 className="w-10 h-10 text-lime-400" />
                </motion.div>
                <h3 className="text-3xl font-bold text-white drop-shadow-lg">
                  How Climate Impact Works
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <motion.div
                    className="w-14 h-14 bg-lime-400/20 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 border-lime-400/40"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <span className="text-3xl font-bold text-lime-400">1</span>
                  </motion.div>
                  <div>
                    <h4 className="font-bold text-white mb-2 text-lg">NGO Selection</h4>
                    <p className="text-sm text-emerald-200">
                      Profits are preferentially distributed to climate-focused NGOs when Climate Mode is enabled.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <motion.div
                    className="w-14 h-14 bg-cyan-400/20 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 border-cyan-400/40"
                    whileHover={{ scale: 1.1, rotate: -10 }}
                  >
                    <span className="text-3xl font-bold text-cyan-400">2</span>
                  </motion.div>
                  <div>
                    <h4 className="font-bold text-white mb-2 text-lg">Impact Tracking</h4>
                    <p className="text-sm text-emerald-200">
                      NGOs report verified CO₂ offset data through the Impact Oracle system using standardized metrics.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <motion.div
                    className="w-14 h-14 bg-purple-400/20 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 border-purple-400/40"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <span className="text-3xl font-bold text-purple-400">3</span>
                  </motion.div>
                  <div>
                    <h4 className="font-bold text-white mb-2 text-lg">Real-Time Updates</h4>
                    <p className="text-sm text-emerald-200">
                      Your climate impact dashboard updates automatically as NGOs execute projects and report results.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <motion.div
                    className="w-14 h-14 bg-orange-400/20 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 border-orange-400/40"
                    whileHover={{ scale: 1.1, rotate: -10 }}
                  >
                    <span className="text-3xl font-bold text-orange-400">4</span>
                  </motion.div>
                  <div>
                    <h4 className="font-bold text-white mb-2 text-lg">Transparent Proof</h4>
                    <p className="text-sm text-emerald-200">
                      All impact metrics are verified on-chain and can be independently audited through XRPL transactions.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disabled State Message */}
      {!climateMode && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Wind className="w-20 h-20 text-emerald-500/50 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Climate Impact Mode Disabled
          </h3>
          <p className="text-emerald-200 max-w-md mx-auto text-lg">
            Enable Climate Impact Mode above to track your environmental impact and
            prioritize climate-focused NGOs in profit distribution.
          </p>
        </motion.div>
      )}
    </div>
  );
};

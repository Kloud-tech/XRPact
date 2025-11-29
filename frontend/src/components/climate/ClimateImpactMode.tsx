/**
 * Climate Impact Mode - Toggle and visualize climate impact
 *
 * Features:
 * - Climate mode toggle
 * - CO2 offset tracking
 * - Tree planting equivalent
 * - Visual impact metrics
 * - Educational info
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, TreePine, Wind, Droplet, Sun, Globe2 } from 'lucide-react';
import { useStore } from '../../store';

export const ClimateImpactMode: React.FC = () => {
  const { climateMode, setClimateMode, pool } = useStore();

  const co2Offset = pool?.co2Offset || 0;
  const treesEquivalent = Math.floor(co2Offset / 0.02); // 1 tree = ~20kg CO2/year
  const carsOffRoad = Math.floor(co2Offset / 4.6); // Average car = 4.6 tons CO2/year
  const homesPowered = Math.floor(co2Offset / 7.5); // Average home = 7.5 tons CO2/year

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Toggle Section */}
      <motion.div
        className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 mb-12 border-2 border-green-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Leaf className="w-8 h-8 text-green-600" />
              <h2 className="text-3xl font-bold text-gray-900">
                Climate Impact Mode
              </h2>
            </div>
            <p className="text-gray-600 max-w-2xl">
              Enable Climate Impact Mode to track and visualize the environmental impact of your donations.
              See real-time CO₂ offset metrics and forest restoration equivalents.
            </p>
          </div>

          {/* Toggle Switch */}
          <motion.button
            onClick={() => setClimateMode(!climateMode)}
            className={`
              relative w-20 h-10 rounded-full transition-colors duration-300
              ${climateMode ? 'bg-green-600' : 'bg-gray-300'}
            `}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute top-1 left-1 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center"
              animate={{
                x: climateMode ? 40 : 0,
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {climateMode ? (
                <Leaf className="w-5 h-5 text-green-600" />
              ) : (
                <Wind className="w-5 h-5 text-gray-400" />
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
              className="bg-gradient-to-br from-green-600 via-green-700 to-blue-700 rounded-3xl p-12 mb-8 text-white relative overflow-hidden"
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

              {/* Floating Leaves */}
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-4xl"
                  initial={{
                    x: Math.random() * 100 + '%',
                    y: Math.random() * 100 + '%',
                    opacity: 0.3,
                  }}
                  animate={{
                    y: [null, '-20%'],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: Math.random() * 10 + 10,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  🌿
                </motion.div>
              ))}

              <div className="relative z-10 text-center">
                <motion.div
                  className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Leaf className="w-5 h-5" />
                  <span className="font-semibold">Total Climate Impact</span>
                </motion.div>

                <motion.div
                  className="text-8xl font-bold mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                >
                  {co2Offset.toLocaleString()}
                </motion.div>

                <div className="text-3xl font-semibold mb-2">
                  Tons of CO₂ Offset
                </div>

                <div className="text-lg text-green-100">
                  Equivalent environmental impact of your contributions
                </div>
              </div>
            </motion.div>

            {/* Impact Equivalents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                className="bg-white rounded-2xl p-6 border-2 border-green-200 hover:shadow-xl transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                    <TreePine className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Trees Planted Equivalent</div>
                    <div className="text-3xl font-bold text-gray-900">
                      {treesEquivalent.toLocaleString()}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Your impact equals planting this many trees and nurturing them for 10 years.
                </p>
              </motion.div>

              <motion.div
                className="bg-white rounded-2xl p-6 border-2 border-blue-200 hover:shadow-xl transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Wind className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Cars Off Road</div>
                    <div className="text-3xl font-bold text-gray-900">
                      {carsOffRoad.toLocaleString()}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Equivalent to removing this many cars from the road for an entire year.
                </p>
              </motion.div>

              <motion.div
                className="bg-white rounded-2xl p-6 border-2 border-purple-200 hover:shadow-xl transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                    <Sun className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Homes Powered</div>
                    <div className="text-3xl font-bold text-gray-900">
                      {homesPowered.toLocaleString()}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Clean energy equivalent to powering this many homes for one year.
                </p>
              </motion.div>
            </div>

            {/* How It Works */}
            <motion.div
              className="bg-white rounded-2xl p-8 border-2 border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Globe2 className="w-8 h-8 text-green-600" />
                <h3 className="text-2xl font-bold text-gray-900">
                  How Climate Impact Works
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-green-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">NGO Selection</h4>
                    <p className="text-sm text-gray-600">
                      Profits are preferentially distributed to climate-focused NGOs when Climate Mode is enabled.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Impact Tracking</h4>
                    <p className="text-sm text-gray-600">
                      NGOs report verified CO₂ offset data through the Impact Oracle system using standardized metrics.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-purple-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Real-Time Updates</h4>
                    <p className="text-sm text-gray-600">
                      Your climate impact dashboard updates automatically as NGOs execute projects and report results.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-orange-600">4</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Transparent Proof</h4>
                    <p className="text-sm text-gray-600">
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
          <Wind className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Climate Impact Mode Disabled
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Enable Climate Impact Mode above to track your environmental impact and
            prioritize climate-focused NGOs in profit distribution.
          </p>
        </motion.div>
      )}
    </div>
  );
};

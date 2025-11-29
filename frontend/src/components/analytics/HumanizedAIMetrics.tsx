/**
 * Humanized AI Metrics Component
 *
 * Transforms complex AI/RL metrics into simple, emotional, visual indicators
 * Instead of: "Sharpe Ratio: 1.42, Volatility: 0.23"
 * Show: "AI Engine Health: Excellent ✨" with visual indicators
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Shield, Zap, Activity } from 'lucide-react';

interface AIMetrics {
  // Backend sends complex metrics
  sharpeRatio?: number;
  volatility?: number;
  winRate?: number;
  totalReturns?: number;
}

interface HumanMetrics {
  // What we show to users
  engineHealth: 'Excellent' | 'Good' | 'Moderate';
  performanceLevel: number; // 0-100
  safetyScore: number; // 0-100
  impactMultiplier: number; // e.g., 2.4x
}

export const HumanizedAIMetrics: React.FC = () => {
  const [aiMetrics] = useState<AIMetrics>({
    sharpeRatio: 1.42,
    volatility: 0.23,
    winRate: 0.68,
    totalReturns: 0.124,
  });

  const [humanMetrics, setHumanMetrics] = useState<HumanMetrics>({
    engineHealth: 'Excellent',
    performanceLevel: 85,
    safetyScore: 92,
    impactMultiplier: 2.4,
  });

  // Transform complex AI metrics into human-friendly ones
  useEffect(() => {
    const sharpe = aiMetrics.sharpeRatio || 0;
    const vol = aiMetrics.volatility || 0;
    const winRate = aiMetrics.winRate || 0;

    // Health based on Sharpe Ratio
    const health = sharpe > 1.2 ? 'Excellent' : sharpe > 0.8 ? 'Good' : 'Moderate';

    // Performance level based on win rate (0-100 scale)
    const performance = Math.min(100, Math.round(winRate * 100));

    // Safety score inversely proportional to volatility
    const safety = Math.min(100, Math.round((1 - vol) * 100));

    // Impact multiplier based on total returns
    const multiplier = 1 + (aiMetrics.totalReturns || 0) * 10;

    setHumanMetrics({
      engineHealth: health,
      performanceLevel: performance,
      safetyScore: safety,
      impactMultiplier: Math.round(multiplier * 10) / 10,
    });
  }, [aiMetrics]);

  const healthColor = {
    Excellent: 'from-green-400 to-emerald-500',
    Good: 'from-blue-400 to-cyan-500',
    Moderate: 'from-yellow-400 to-orange-500',
  };

  const healthEmoji = {
    Excellent: '✨',
    Good: '💫',
    Moderate: '⚡',
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-purple-200">
      {/* Title */}
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Brain className="w-8 h-8 text-purple-600" />
        </motion.div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          AI Impact Engine
        </h2>
      </div>

      <p className="text-gray-600 mb-8">
        Our AI continuously optimizes your donation to maximize real-world impact
      </p>

      {/* Main Health Indicator */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`bg-gradient-to-br ${healthColor[humanMetrics.engineHealth]} p-6 rounded-2xl text-white mb-6 relative overflow-hidden`}
      >
        <motion.div
          animate={{ x: [-100, 500] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-90 mb-1">Engine Status</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{humanMetrics.engineHealth}</span>
              <span className="text-3xl">{healthEmoji[humanMetrics.engineHealth]}</span>
            </div>
          </div>
          <Activity className="w-12 h-12 opacity-50" />
        </div>
      </motion.div>

      {/* Simple Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Performance Level */}
        <SimpleMetric
          icon={<TrendingUp className="w-6 h-6" />}
          label="Performance"
          value={humanMetrics.performanceLevel}
          max={100}
          unit="%"
          color="blue"
        />

        {/* Safety Score */}
        <SimpleMetric
          icon={<Shield className="w-6 h-6" />}
          label="Safety"
          value={humanMetrics.safetyScore}
          max={100}
          unit="%"
          color="green"
        />

        {/* Impact Multiplier */}
        <SimpleMetric
          icon={<Zap className="w-6 h-6" />}
          label="Impact Boost"
          value={humanMetrics.impactMultiplier}
          max={5}
          unit="x"
          color="purple"
          showAsMultiplier
        />
      </div>

      {/* Simple Explanation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200"
      >
        <p className="text-sm text-gray-700 text-center">
          💡 The AI is working! Your donation is generating{' '}
          <span className="font-bold text-purple-600">
            {humanMetrics.impactMultiplier}x more impact
          </span>{' '}
          than a traditional one-time donation.
        </p>
      </motion.div>
    </div>
  );
};

// Simple Metric Component
interface SimpleMetricProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  max: number;
  unit: string;
  color: 'blue' | 'green' | 'purple';
  showAsMultiplier?: boolean;
}

const SimpleMetric: React.FC<SimpleMetricProps> = ({
  icon,
  label,
  value,
  max,
  unit,
  color,
  showAsMultiplier,
}) => {
  const percentage = Math.min(100, (value / max) * 100);

  const colorMap = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      bar: 'bg-gradient-to-r from-blue-400 to-cyan-400',
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      bar: 'bg-gradient-to-r from-green-400 to-emerald-400',
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      bar: 'bg-gradient-to-r from-purple-400 to-pink-400',
    },
  };

  const colors = colorMap[color];

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className={`inline-flex p-2 rounded-lg ${colors.bg} mb-3`}>
        <div className={colors.text}>{icon}</div>
      </div>

      <p className="text-xs text-gray-600 mb-1">{label}</p>

      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-bold text-gray-900">
          {showAsMultiplier ? value.toFixed(1) : Math.round(value)}
        </span>
        <span className="text-sm text-gray-600">{unit}</span>
      </div>

      {/* Simple progress bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full ${colors.bar}`}
        />
      </div>
    </div>
  );
};

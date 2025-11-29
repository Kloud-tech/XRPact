import React from 'react';
import { motion } from 'framer-motion';

interface ImpactNFTProps {
  level: number;
  xp: number;
  totalDonated: number;
  donationCount: number;
}

export const ImpactNFT: React.FC<ImpactNFTProps> = ({
  level,
  xp,
  totalDonated,
  donationCount,
}) => {
  const attributes = calculateNFTAttributes(level, xp);

  return (
    <div className="relative">
      {/* NFT Card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-2xl max-w-sm">
        {/* Visual Representation */}
        <div className="relative mb-6">
          <motion.div
            className="relative mx-auto"
            style={{ width: 200, height: 200 }}
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Aura Effect */}
            {attributes.aura !== 'none' && (
              <motion.div
                className="absolute inset-0 rounded-full blur-xl opacity-50"
                style={{ backgroundColor: attributes.glowColor }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}

            {/* Main Shape */}
            <svg
              viewBox="0 0 200 200"
              className="relative z-10"
              style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))' }}
            >
              {renderShape(attributes.shape, attributes.color)}
            </svg>
          </motion.div>

          {/* Level Badge */}
          <div className="absolute top-0 right-0 bg-yellow-500 text-white font-bold px-4 py-2 rounded-full shadow-lg">
            LVL {level}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3 text-white">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Tier</span>
            <span className="font-semibold text-lg capitalize">
              {attributes.tierName}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total XP</span>
            <span className="font-semibold">{xp.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total Donated</span>
            <span className="font-semibold">{totalDonated.toLocaleString()} XRP</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">Donations</span>
            <span className="font-semibold">{donationCount}</span>
          </div>

          {/* XP Progress Bar */}
          <div className="pt-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Next Level</span>
              <span className="text-gray-300">
                {xp % 1000} / 1000 XP
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                initial={{ width: 0 }}
                animate={{ width: `${(xp % 1000) / 10}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Perks */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h3 className="text-white font-semibold mb-3">Unlocked Perks</h3>
          <div className="space-y-2">
            {attributes.perks.map((perk, idx) => (
              <div key={idx} className="flex items-center text-sm text-gray-300">
                <span className="text-green-400 mr-2">✓</span>
                {perk}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share Button */}
      <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition">
        Share My Impact
      </button>
    </div>
  );
};

interface NFTAttributes {
  color: string;
  glowColor: string;
  shape: 'circle' | 'pentagon' | 'hexagon' | 'star';
  aura: 'none' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  tierName: string;
  perks: string[];
}

function calculateNFTAttributes(level: number, xp: number): NFTAttributes {
  let color = '#CD7F32'; // Bronze
  let glowColor = '#CD7F32';
  let shape: NFTAttributes['shape'] = 'circle';
  let aura: NFTAttributes['aura'] = 'none';
  let tierName = 'Bronze';
  let perks: string[] = ['Dashboard access'];

  if (level >= 10) {
    color = '#B9F2FF'; // Diamond
    glowColor = '#00D4FF';
    shape = 'star';
    aura = 'legendary';
    tierName = 'Diamond';
    perks = [
      'Full governance rights',
      'Exclusive events',
      'Custom NFT metadata',
      'Priority support',
      'Impact multiplier x3',
    ];
  } else if (level >= 8) {
    color = '#E5E4E2'; // Platinum
    glowColor = '#C0C0C0';
    shape = 'hexagon';
    aura = 'epic';
    tierName = 'Platinum';
    perks = [
      'Governance voting',
      'VIP dashboard',
      'Impact multiplier x2.5',
      'Monthly reports',
    ];
  } else if (level >= 6) {
    color = '#FFD700'; // Gold
    glowColor = '#FFA500';
    shape = 'hexagon';
    aura = 'rare';
    tierName = 'Gold';
    perks = [
      'Governance voting',
      'Advanced analytics',
      'Impact multiplier x2',
    ];
  } else if (level >= 4) {
    color = '#C0C0C0'; // Silver
    glowColor = '#A8A8A8';
    shape = 'pentagon';
    aura = 'uncommon';
    tierName = 'Silver';
    perks = ['Basic voting', 'Impact tracking', 'Impact multiplier x1.5'];
  } else if (level >= 2) {
    color = '#CD7F32'; // Bronze
    glowColor = '#8B4513';
    shape = 'pentagon';
    aura = 'uncommon';
    tierName = 'Bronze';
    perks = ['Impact tracking', 'Leaderboard access'];
  }

  return { color, glowColor, shape, aura, tierName, perks };
}

function renderShape(
  shape: NFTAttributes['shape'],
  color: string
): React.ReactNode {
  switch (shape) {
    case 'circle':
      return (
        <circle
          cx="100"
          cy="100"
          r="80"
          fill={color}
          stroke="white"
          strokeWidth="3"
        />
      );

    case 'pentagon':
      return (
        <polygon
          points="100,20 180,80 150,160 50,160 20,80"
          fill={color}
          stroke="white"
          strokeWidth="3"
        />
      );

    case 'hexagon':
      return (
        <polygon
          points="100,20 170,60 170,140 100,180 30,140 30,60"
          fill={color}
          stroke="white"
          strokeWidth="3"
        />
      );

    case 'star':
      return (
        <polygon
          points="100,10 120,70 180,70 130,110 150,170 100,130 50,170 70,110 20,70 80,70"
          fill={color}
          stroke="white"
          strokeWidth="3"
        />
      );

    default:
      return null;
  }
}

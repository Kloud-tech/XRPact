/**
 * Green NGO List - Eco-themed NGO display with impact scores
 *
 * Features:
 * - Green gradient backgrounds
 * - Animated cards
 * - Category filtering
 * - Real-time updates
 * - Distribution weight display
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Leaf,
  Heart,
  GraduationCap,
  Droplet,
  Globe,
  CheckCircle,
  TrendingUp,
  Award,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../../store';

const CATEGORY_ICONS = {
  climate: Leaf,
  health: Heart,
  education: GraduationCap,
  water: Droplet,
  other: Globe,
};

const CATEGORY_COLORS = {
  climate: 'bg-lime-400/20 text-lime-200 border-lime-400/30',
  health: 'bg-rose-400/20 text-rose-200 border-rose-400/30',
  education: 'bg-cyan-400/20 text-cyan-200 border-cyan-400/30',
  water: 'bg-blue-400/20 text-blue-200 border-blue-400/30',
  other: 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30',
};

interface NGOCardProps {
  ngo: any;
  index: number;
}

const NGOCard: React.FC<NGOCardProps> = ({ ngo, index }) => {
  const Icon = CATEGORY_ICONS[ngo.category as keyof typeof CATEGORY_ICONS] || Globe;
  const categoryColor = CATEGORY_COLORS[ngo.category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.other;
  const { fetchNgos } = useStore();
  const [validating, setValidating] = React.useState(false);

  // Score color based on impact score
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-lime-200 bg-lime-400/20 border-lime-400/40';
    if (score >= 75) return 'text-cyan-200 bg-cyan-400/20 border-cyan-400/40';
    if (score >= 60) return 'text-yellow-200 bg-yellow-400/20 border-yellow-400/40';
    return 'text-rose-200 bg-rose-400/20 border-rose-400/40';
  };

  const scoreColor = getScoreColor(ngo.impactScore);

  return (
    <motion.div
      className="bg-gradient-to-br from-emerald-800/80 to-teal-900/80 backdrop-blur-xl rounded-3xl border-2 border-emerald-500/30 p-6 hover:shadow-2xl hover:shadow-lime-400/20 transition-all"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          {/* Icon */}
          <motion.div
            className="w-14 h-14 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Icon className="w-7 h-7 text-white" />
          </motion.div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-white">{ngo.name}</h3>
              {ngo.verified && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <CheckCircle className="w-6 h-6 text-lime-400" />
                </motion.div>
              )}
            </div>

            {/* Category Badge */}
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border-2 text-xs font-bold ${categoryColor}`}>
              <Icon className="w-3 h-3" />
              <span className="capitalize">{ngo.category}</span>
            </div>
          </div>
        </div>

        {/* Impact Score Badge */}
        <motion.div
          className={`flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 ${scoreColor} shadow-lg`}
          whileHover={{ scale: 1.1 }}
        >
          <div className="text-3xl font-bold">{ngo.impactScore}</div>
          <div className="text-xs font-medium">Score</div>
        </motion.div>
      </div>

      {/* Description */}
      {ngo.description && (
        <p className="text-sm text-emerald-200 mb-4 line-clamp-2">
          {ngo.description}
        </p>
      )}

      {/* Certifications */}
      {ngo.certifications && ngo.certifications.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-lime-400" />
            <span className="text-xs font-medium text-emerald-200">Certifications</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {ngo.certifications.map((cert: string, i: number) => (
              <span
                key={i}
                className="px-2 py-1 bg-cyan-400/20 text-cyan-200 text-xs rounded-full border border-cyan-400/30 font-medium"
              >
                {cert}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-500/30">
        {/* Distribution Weight */}
        <div>
          <div className="text-xs text-emerald-300 mb-1 font-medium">Distribution Weight</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-green-950/50 rounded-full h-2.5 overflow-hidden border border-emerald-500/30">
              <motion.div
                className="h-full bg-gradient-to-r from-lime-400 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${ngo.weight * 100}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>
            <span className="text-sm font-bold text-white">
              {(ngo.weight * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Total Received */}
        <div>
          <div className="text-xs text-emerald-300 mb-1 font-medium">Total Received</div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-lime-400" />
            <span className="text-sm font-bold text-white">
              {ngo.totalReceived.toLocaleString()} XRP
            </span>
          </div>
        </div>
      </div>

      {/* Actions: Validate */}
      <div className="flex items-center gap-2 mt-4">
        <motion.button
          onClick={async () => {
            try {
              setValidating(true);
              console.log(`[NGOList] Validating NGO: ${ngo.id}`);

              const response = await fetch(`http://localhost:3000/api/xrpl/validate-ngo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ngoId: ngo.id }),
              });

              if (!response.ok) {
                console.error(`[NGOList] Validation failed: ${response.status} ${response.statusText}`);
                alert(`Validation failed: ${response.statusText}`);
                return;
              }

              const data = await response.json();
              console.log(`[NGOList] Validation result:`, data);

              if (data.success) {
                alert(`✅ NGO "${ngo.name}" validated!\nScore: ${data.validation.impactScore}/100`);
                // Refresh the NGO list
                await new Promise(resolve => setTimeout(resolve, 500));
                await fetchNgos();
              } else {
                alert(`❌ Validation failed: ${data.error}`);
              }
            } catch (err: any) {
              console.error('[NGOList] Validation error:', err);
              alert(`Error: ${err.message || 'Unknown error'}`);
            } finally {
              setValidating(false);
            }
          }}
          className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
            ngo.verified
              ? 'bg-lime-400/20 text-lime-200 border-lime-400/30 cursor-default'
              : 'bg-cyan-400/20 text-cyan-200 border-cyan-400/30 hover:bg-cyan-400/30'
          }`}
          disabled={validating || ngo.verified}
          whileHover={!ngo.verified ? { scale: 1.05 } : {}}
          whileTap={!ngo.verified ? { scale: 0.95 } : {}}
          title={ngo.verified ? 'Already validated' : 'Click to validate this NGO'}
        >
          {validating ? '⏳ Validating...' : ngo.verified ? '✓ Validated' : '🔍 Validate'}
        </motion.button>

        {/* Website Link */}
        {ngo.website && (
          <motion.a
            href={ngo.website}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl text-sm font-bold bg-emerald-500/20 text-emerald-200 border-2 border-emerald-400/30 hover:bg-emerald-500/30 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Globe className="w-4 h-4" />
          </motion.a>
        )}
      </div>
    </motion.div>
  );
};

export const GreenNGOList: React.FC = () => {
  const { ngos, fetchNgos, isLoading } = useStore();
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchNgos();
  }, [fetchNgos]);

  const categories = ['all', 'climate', 'health', 'education', 'water', 'other'];

  const filteredNGOs = filter === 'all'
    ? ngos
    : ngos.filter(ngo => ngo.category === filter);

  const verifiedCount = ngos.filter(ngo => ngo.verified).length;
  const totalImpact = ngos.reduce((sum, ngo) => sum + ngo.totalReceived, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="p-3 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 shadow-lg"
          >
            <Leaf className="h-8 w-8 text-white" />
          </motion.div>
          <h2 className="text-4xl font-bold text-white drop-shadow-lg">
            🌍 Verified NGO Partners
          </h2>
        </motion.div>
        <p className="text-emerald-200 text-lg">
          Transparent, verified organizations making real impact worldwide
        </p>
      </div>

      {/* Stats Bar */}
      <motion.div
        className="bg-gradient-to-br from-emerald-800/80 to-teal-900/80 backdrop-blur-xl rounded-3xl p-6 mb-8 border-2 border-emerald-500/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-14 h-14 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: 10 }}
            >
              <CheckCircle className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <div className="text-3xl font-bold text-white">{verifiedCount}</div>
              <div className="text-sm text-emerald-200">Verified NGOs</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <motion.div
              className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: -10 }}
            >
              <TrendingUp className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <div className="text-3xl font-bold text-white">
                {totalImpact.toLocaleString()} XRP
              </div>
              <div className="text-sm text-emerald-200">Total Impact Delivered</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <motion.div
              className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: 10 }}
            >
              <Award className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <div className="text-3xl font-bold text-white">
                {(ngos.reduce((sum, ngo) => sum + ngo.impactScore, 0) / ngos.length).toFixed(0)}
              </div>
              <div className="text-sm text-emerald-200">Avg Impact Score</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((category) => {
          const Icon = category === 'all' ? Globe : CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
          const isActive = filter === category;

          return (
            <motion.button
              key={category}
              onClick={() => setFilter(category)}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 font-bold transition-all
                ${isActive
                  ? 'bg-gradient-to-r from-lime-400 to-emerald-500 text-white border-lime-400 shadow-lg shadow-lime-400/30'
                  : 'bg-emerald-800/50 text-emerald-200 border-emerald-500/30 hover:border-lime-400/50'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span className="capitalize">{category}</span>
              <span className={`
                px-2 py-0.5 rounded-full text-xs font-bold
                ${isActive ? 'bg-white/30' : 'bg-emerald-700/50'}
              `}>
                {category === 'all' ? ngos.length : ngos.filter(n => n.category === category).length}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* NGO Cards Grid */}
      {isLoading && ngos.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <motion.div
            className="w-16 h-16 border-4 border-lime-400 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNGOs.map((ngo, index) => (
            <NGOCard key={ngo.id} ngo={ngo} index={index} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredNGOs.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Globe className="w-16 h-16 text-emerald-500/50 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No NGOs found</h3>
          <p className="text-emerald-200">Try selecting a different category filter.</p>
        </motion.div>
      )}
    </div>
  );
};

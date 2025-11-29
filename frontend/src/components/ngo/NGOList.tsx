/**
 * NGO List - Display NGOs with Impact Oracle scores
 *
 * Features:
 * - List of verified NGOs
 * - Impact Oracle scores visualization
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
  climate: 'bg-green-100 text-green-700 border-green-300',
  health: 'bg-red-100 text-red-700 border-red-300',
  education: 'bg-blue-100 text-blue-700 border-blue-300',
  water: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  other: 'bg-gray-100 text-gray-700 border-gray-300',
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
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const scoreColor = getScoreColor(ngo.impactScore);

  return (
    <motion.div
      className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          {/* Icon */}
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-white" />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900">{ngo.name}</h3>
              {ngo.verified && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>

            {/* Category Badge */}
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-medium ${categoryColor}`}>
              <Icon className="w-3 h-3" />
              <span className="capitalize">{ngo.category}</span>
            </div>
          </div>
        </div>

        {/* Impact Score Badge */}
        <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-xl border-2 ${scoreColor}`}>
          <div className="text-2xl font-bold">{ngo.impactScore}</div>
          <div className="text-xs font-medium">Score</div>
        </div>
      </div>

      {/* Actions: Validate */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={async () => {
            try {
              setValidating(true);
              console.log(`[NGOList] Validating NGO: ${ngo.id}`);
              
              const response = await fetch(`/api/xrpl/validate-ngo`, {
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
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
            ngo.verified 
              ? 'bg-green-50 text-green-700 border-green-200 cursor-default' 
              : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
          }`}
          disabled={validating || ngo.verified}
          title={ngo.verified ? 'Already validated' : 'Click to validate this NGO'}
        >
          {validating ? '⏳ Validating...' : ngo.verified ? '✓ Validated' : '🔍 Validate'}
        </button>
      </div>

      {/* Description */}
      {ngo.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {ngo.description}
        </p>
      )}

      {/* Certifications */}
      {ngo.certifications && ngo.certifications.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">Certifications</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {ngo.certifications.map((cert: string, i: number) => (
              <span
                key={i}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200"
              >
                {cert}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        {/* Distribution Weight */}
        <div>
          <div className="text-xs text-gray-500 mb-1">Distribution Weight</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                initial={{ width: 0 }}
                animate={{ width: `${ngo.weight * 100}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>
            <span className="text-sm font-bold text-gray-900">
              {(ngo.weight * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Total Received */}
        <div>
          <div className="text-xs text-gray-500 mb-1">Total Received</div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-bold text-gray-900">
              {ngo.totalReceived.toLocaleString()} XRP
            </span>
          </div>
        </div>
      </div>

      {/* Website Link */}
      {ngo.website && (
        <a
          href={ngo.website}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <Globe className="w-4 h-4" />
          <span>Visit website</span>
        </a>
      )}
    </motion.div>
  );
};

export const NGOList: React.FC = () => {
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Verified NGO Partners
        </h2>
        <p className="text-gray-600">
          Transparent, verified organizations making real impact worldwide
        </p>
      </div>

      {/* Stats Bar */}
      <motion.div
        className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 mb-8 border border-blue-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{verifiedCount}</div>
              <div className="text-sm text-gray-600">Verified NGOs</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {totalImpact.toLocaleString()} XRP
              </div>
              <div className="text-sm text-gray-600">Total Impact Delivered</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {(ngos.reduce((sum, ngo) => sum + ngo.impactScore, 0) / ngos.length).toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Avg Impact Score</div>
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
                flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-medium transition-all
                ${isActive
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span className="capitalize">{category}</span>
              <span className={`
                px-2 py-0.5 rounded-full text-xs
                ${isActive ? 'bg-white/20' : 'bg-gray-100'}
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
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
        <div className="text-center py-12">
          <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No NGOs found</h3>
          <p className="text-gray-600">Try selecting a different category filter.</p>
        </div>
      )}
    </div>
  );
};

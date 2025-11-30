/**
 * Impact NFT Display Component
 *
 * Displays evolving Impact NFTs generated after redistribution
 * Features:
 * - Tier progression visualization
 * - Impact score with progress bar
 * - ASCII art rendering
 * - Project support tracking
 * - Export functionality
 */

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Award,
  Download,
  AlertCircle,
  Zap,
  RefreshCw,
} from 'lucide-react';

interface ImpactNFTMetadata {
  nftTokenId?: string;
  poolAddress: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  impactScore: number;
  totalRedistributed: number;
  projectsSupported: string[];
  redistributionCount: number;
  asciiArt: string;
  mintedAt: string;
  lastUpdated: string;
}

interface ImpactNFTDisplayProps {
  nftTokenId?: string;
  autoRefresh?: boolean;
}

const tierColors = {
  bronze: {
    bg: 'from-orange-100 to-amber-100',
    border: 'border-orange-300',
    text: 'text-orange-700',
    badge: '🥉',
  },
  silver: {
    bg: 'from-slate-100 to-gray-100',
    border: 'border-slate-300',
    text: 'text-slate-700',
    badge: '🥈',
  },
  gold: {
    bg: 'from-yellow-100 to-amber-100',
    border: 'border-yellow-300',
    text: 'text-yellow-700',
    badge: '🥇',
  },
  platinum: {
    bg: 'from-purple-100 to-blue-100',
    border: 'border-purple-300',
    text: 'text-purple-700',
    badge: '👑',
  },
};

export const ImpactNFTDisplay: React.FC<ImpactNFTDisplayProps> = ({
  nftTokenId,
  autoRefresh = false,
}) => {
  const [nftData, setNftData] = useState<ImpactNFTMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allNFTs, setAllNFTs] = useState<ImpactNFTMetadata[]>([]);

  // Fetch single NFT if tokenId provided
  useEffect(() => {
    if (!nftTokenId) return;

    const fetchNFT = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:3001/api/xrpl/impact-nft/${nftTokenId}`);
        const data = await res.json();

        if (data.success) {
          setNftData(data.metadata);
          setError(null);
        } else {
          setError(data.error || 'Failed to load Impact NFT');
        }
      } catch (err: any) {
        setError(err.message || 'Error fetching NFT');
      } finally {
        setLoading(false);
      }
    };

    fetchNFT();

    // Auto-refresh if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchNFT, 5000);
      return () => clearInterval(interval);
    }
  }, [nftTokenId, autoRefresh]);

  // Fetch all NFTs
  const fetchAllNFTs = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/xrpl/impact-nft/list/all');
      const data = await res.json();

      if (data.success) {
        setAllNFTs(data.nfts || []);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching NFTs');
    } finally {
      setLoading(false);
    }
  };

  // Export NFT as JSON
  const handleExport = async () => {
    if (!nftData?.nftTokenId) return;

    try {
      const res = await fetch(
        `http://localhost:3001/api/xrpl/impact-nft/${nftData.nftTokenId}/export`
      );

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `impact-nft-${nftData.nftTokenId}.json`;
        a.click();
      }
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  // Main render logic - shows list view or detail view
  if (!nftTokenId) {
    // Gallery/List view mode
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Impact NFTs</h2>
          <p className="text-gray-600 mb-6">
            Evolving tokens minted after redistribution, showing impact and tier progression
          </p>
        </div>

        {/* Content Area */}
        {allNFTs.length === 0 ? (
          // Empty State
          <div className="text-center">
            <button
              onClick={fetchAllNFTs}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition font-medium disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              {loading ? 'Loading...' : 'View All Impact NFTs'}
            </button>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {!error && !loading && (
              <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <p className="text-blue-700 text-sm">
                  No Impact NFTs yet. They will be automatically created after the first redistribution cycle.
                </p>
              </div>
            )}
          </div>
        ) : (
          // NFTs Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allNFTs.map((nft, idx) => (
              <NFTCard key={idx} nft={nft} onExport={() => setNftData(nft)} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (loading && !nftData) {
    return (
      <div className="flex items-center justify-center h-48 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!nftData) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg flex items-gap-2">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <p className="text-red-700">{error || 'Impact NFT not found'}</p>
      </div>
    );
  }

  const colors = tierColors[nftData.tier];
  const tierEmoji = colors.badge;

  return (
    <div className={`bg-gradient-to-br ${colors.bg} rounded-xl p-8 border-2 ${colors.border}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{tierEmoji}</span>
            <div>
              <h3 className="text-2xl font-bold capitalize">
                {nftData.tier} Impact NFT
              </h3>
              <p className="text-sm text-gray-600">
                Generated on {new Date(nftData.mintedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        {nftTokenId && (
          <button
            onClick={handleExport}
            className="p-2 hover:bg-white/30 rounded-lg transition"
            title="Download NFT data"
          >
            <Download className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ASCII Art */}
      <pre className="bg-white/40 rounded-lg p-4 text-xs font-mono overflow-x-auto mb-6">
        {nftData.asciiArt}
      </pre>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Impact Score */}
        <div className="bg-white/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Impact Score</span>
          </div>
          <div className="text-2xl font-bold">{nftData.impactScore}</div>
          <div className="w-full bg-white/30 rounded-full h-2 mt-2">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
              style={{ width: `${nftData.impactScore}%` }}
            />
          </div>
        </div>

        {/* Total Redistributed */}
        <div className="bg-white/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-medium">Total Redistributed</span>
          </div>
          <div className="text-2xl font-bold">{nftData.totalRedistributed}</div>
          <div className="text-xs text-gray-600">XRP</div>
        </div>

        {/* Projects Supported */}
        <div className="bg-white/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4" />
            <span className="text-xs font-medium">Projects Supported</span>
          </div>
          <div className="text-2xl font-bold">{nftData.projectsSupported.length}</div>
          <div className="text-xs text-gray-600">Organizations</div>
        </div>

        {/* Redistribution Count */}
        <div className="bg-white/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="w-4 h-4" />
            <span className="text-xs font-medium">Redistributions</span>
          </div>
          <div className="text-2xl font-bold">{nftData.redistributionCount}</div>
          <div className="text-xs text-gray-600">Cycles</div>
        </div>
      </div>

      {/* Projects List */}
      {nftData.projectsSupported.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-3">🌍 Supported Projects</h4>
          <div className="flex flex-wrap gap-2">
            {nftData.projectsSupported.map((project, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-white/50 rounded-full text-sm font-medium"
              >
                {project}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Token ID */}
      <div className="bg-white/30 rounded-lg p-3 text-sm font-mono break-all">
        <p className="text-xs opacity-75 mb-1">Token ID:</p>
        <p>{nftData.nftTokenId}</p>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-white/30 text-xs opacity-75">
        <p>Non-transferable • On-chain immutable • Generated automatically on redistribution</p>
      </div>
    </div>
  );
};

/**
 * Individual NFT Card Component
 */
interface NFTCardProps {
  nft: ImpactNFTMetadata;
  onExport: () => void;
}

const NFTCard: React.FC<NFTCardProps> = ({ nft, onExport }) => {
  const colors = tierColors[nft.tier];

  return (
    <div
      className={`bg-gradient-to-br ${colors.bg} rounded-lg p-6 border-2 ${colors.border} cursor-pointer hover:shadow-lg transition`}
      onClick={onExport}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{colors.badge}</span>
        <span className="text-xs font-semibold bg-white/50 px-2 py-1 rounded capitalize">
          {nft.tier}
        </span>
      </div>

      <h3 className="font-bold mb-3 capitalize">{nft.tier} Impact NFT</h3>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="opacity-75">Impact Score</span>
          <span className="font-bold">{nft.impactScore}/100</span>
        </div>
        <div className="w-full bg-white/30 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
            style={{ width: `${nft.impactScore}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div>
          <p className="opacity-75">Redistributed</p>
          <p className="font-bold">{nft.totalRedistributed} XRP</p>
        </div>
        <div>
          <p className="opacity-75">Projects</p>
          <p className="font-bold">{nft.projectsSupported.length}</p>
        </div>
      </div>

      <p className="text-xs opacity-75">
        Generated {new Date(nft.mintedAt).toLocaleDateString()}
      </p>
    </div>
  );
};

export default ImpactNFTDisplay;

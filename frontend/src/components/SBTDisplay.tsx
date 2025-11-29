/**
 * SBT (Soulbound Token) Dashboard Component
 *
 * Displays donor's SBT, governance voting power, and impact metrics
 * Non-transferable NFT showing donation impact
 */

import React, { useEffect, useState } from 'react';
import { Award, Shield, TrendingUp, Vote, Download, AlertCircle } from 'lucide-react';

interface SBTMetadata {
  donorAddress: string;
  totalDonated: number;
  redistributionsCount: number;
  ngosSupported: string[];
  governanceVotesCount: number;
  mintedAt: string;
  level: number;
}

interface SBTDisplayProps {
  donorAddress?: string;
  nftTokenId?: string;
}

export const SBTDisplay: React.FC<SBTDisplayProps> = ({ donorAddress, nftTokenId }) => {
  const [sbtData, setSBTData] = useState<{ nftTokenId: string; metadata: SBTMetadata } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [mockDonorAddress] = useState<string>(
    'rN7n7otQDd6FczFgLdkqfHRSEeGe3N5Ewk'
  );

  // Fetch SBT if tokenId provided
  useEffect(() => {
    if (!nftTokenId) return;

    const fetchSBT = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:3000/api/xrpl/sbt/${nftTokenId}`);
        const data = await res.json();

        if (data.success) {
          setSBTData({
            nftTokenId,
            metadata: data.metadata,
          });
          setError(null);
        } else {
          setError(data.error || 'Failed to load SBT');
        }
      } catch (err: any) {
        setError(err.message || 'Error fetching SBT');
      } finally {
        setLoading(false);
      }
    };

    fetchSBT();
  }, [nftTokenId]);

  // Mint SBT for current donor
  const handleMintSBT = async () => {
    const addr = donorAddress || mockDonorAddress;
    if (!addr) {
      setError('No donor address available');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('[SBTDisplay] Minting SBT for:', addr);
      
      const res = await fetch(`http://localhost:3000/api/xrpl/sbt/mint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorAddress: addr,
          totalDonated: 1000,
          level: 1,
        }),
      });

      const data = await res.json();
      console.log('[SBTDisplay] Mint response:', data);

      if (data.success) {
        setSBTData({
          nftTokenId: data.nftTokenId,
          metadata: data.metadata,
        });
        alert(`✅ SBT minted!\nToken ID: ${data.nftTokenId}`);
      } else {
        setError(data.error || 'Mint failed');
        alert(`❌ Error: ${data.error}`);
      }
    } catch (err: any) {
      const message = err.message || 'Mint failed';
      setError(message);
      console.error('[SBTDisplay] Mint error:', err);
      alert(`❌ Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  // Record governance vote
  const handleVote = async () => {
    if (!sbtData?.nftTokenId) return;

    try {
      setVoting(true);
      const res = await fetch(
        `http://localhost:3000/api/xrpl/sbt/${sbtData.nftTokenId}/vote`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const data = await res.json();

      if (data.success) {
        setSBTData({
          ...sbtData,
          metadata: data.metadata,
        });
        alert(`✅ Vote recorded!\nTotal governance votes: ${data.metadata.governanceVotesCount}`);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message || 'Vote failed');
    } finally {
      setVoting(false);
    }
  };

  // Export SBT as JSON
  const handleExport = async () => {
    if (!sbtData?.nftTokenId) return;

    try {
      const res = await fetch(
        `http://localhost:3000/api/xrpl/sbt/${sbtData.nftTokenId}/export`
      );

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sbt-${sbtData.nftTokenId}.json`;
        a.click();
      }
    } catch (err: any) {
      setError(err.message || 'Export failed');
    }
  };

  if (!sbtData && !donorAddress && !mockDonorAddress) {
    return null;
  }

  if (loading && !sbtData) {
    return (
      <div className="flex items-center justify-center h-48 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!sbtData) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200">
        <div className="flex items-start gap-4">
          <Shield className="w-8 h-8 text-purple-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Soulbound Token (SBT)</h3>
            <p className="text-sm text-gray-600 mb-4">
              Your non-transferable impact NFT that grows with your donations and governance participation.
            </p>
            <button
              onClick={handleMintSBT}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
            >
              {loading ? 'Minting...' : 'Mint Your SBT'}
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-4 flex items-gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
    );
  }

  const m = sbtData.metadata;
  const votingPower = Math.floor((m.governanceVotesCount + 1) * 1.5);

  return (
    <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl p-6 text-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-6 h-6" />
            <h3 className="text-2xl font-bold">Your Impact NFT</h3>
          </div>
          <p className="text-purple-100 text-sm">
            Soulbound Token • Non-transferable • On-Chain
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">Lv {m.level}</div>
          <div className="text-purple-100 text-xs">Donor Level</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total Donated */}
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium text-purple-100">Total Donated</span>
          </div>
          <div className="text-2xl font-bold">{m.totalDonated.toLocaleString()}</div>
          <div className="text-xs text-purple-100">XRP</div>
        </div>

        {/* Redistributions */}
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4" />
            <span className="text-xs font-medium text-purple-100">Redistributions</span>
          </div>
          <div className="text-2xl font-bold">{m.redistributionsCount}</div>
          <div className="text-xs text-purple-100">Profit cycles</div>
        </div>

        {/* NGOs Supported */}
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-medium text-purple-100">NGOs Supported</span>
          </div>
          <div className="text-2xl font-bold">{m.ngosSupported.length}</div>
          <div className="text-xs text-purple-100">Organizations</div>
        </div>

        {/* Governance Votes */}
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Vote className="w-4 h-4" />
            <span className="text-xs font-medium text-purple-100">Votes</span>
          </div>
          <div className="text-2xl font-bold">{m.governanceVotesCount}</div>
          <div className="text-xs text-purple-100">Cast</div>
        </div>
      </div>

      {/* Governance Power */}
      <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium">Governance Voting Power</span>
          <span className="text-2xl font-bold">{votingPower}</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className="bg-white h-2 rounded-full transition-all"
            style={{ width: `${Math.min((votingPower / 100) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-purple-100 mt-2">
          Based on donations and votes cast
        </p>
      </div>

      {/* Token ID */}
      <div className="bg-white/10 backdrop-blur rounded-lg p-3 mb-6">
        <p className="text-xs text-purple-100 mb-1">NFT Token ID</p>
        <p className="text-xs font-mono break-all text-white">
          {sbtData.nftTokenId}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleVote}
          disabled={voting}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition font-medium disabled:opacity-50"
        >
          <Vote className="w-4 h-4" />
          {voting ? 'Voting...' : 'Cast Vote'}
        </button>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition font-medium"
          title="Download SBT data as JSON"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="mt-4 flex items-gap-2 p-3 bg-red-400/20 border border-red-300/50 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-200 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-100">{error}</p>
        </div>
      )}

      {/* Metadata */}
      <div className="mt-4 pt-4 border-t border-white/20 text-xs text-purple-100">
        <p>Minted: {new Date(m.mintedAt).toLocaleDateString()}</p>
        <p>Non-transferable • Immutable on XRPL</p>
      </div>
    </div>
  );
};

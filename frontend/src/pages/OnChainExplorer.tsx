/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ON-CHAIN EXPLORER PAGE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Page dédiée pour explorer toutes les données stockées on-chain sur XRPL.
 *
 * Sections:
 * 1. Donations récentes (avec TX hash et lien explorateur)
 * 2. ONG vérifiées on-chain
 * 3. Redistributions
 * 4. Emergency events
 * 5. Search by TX hash
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  ExternalLink,
  Shield,
  TrendingUp,
  AlertTriangle,
  Database,
  Eye,
  Copy,
  Check,
} from 'lucide-react';
import OnChainVerification, { OnChainBadge } from '../components/OnChainVerification';

interface OnChainDonation {
  txHash: string;
  donorAddress: string;
  amount: number;
  timestamp: number;
  xpGained: number;
  level: number;
  verified: boolean;
}

interface OnChainNGO {
  id: string;
  name: string;
  walletAddress: string;
  txHash: string;
  impactScore: number;
  verified: boolean;
  timestamp: number;
}

export const OnChainExplorer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'donations' | 'ngos' | 'search'>('donations');
  const [searchHash, setSearchHash] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Mock data - En production, fetch depuis l'API qui lit le ledger XRPL
  const [donations, setDonations] = useState<OnChainDonation[]>([
    {
      txHash: 'ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567BCD890',
      donorAddress: 'rDonor123456789ABCDEFGHIJKLMNOP',
      amount: 100,
      timestamp: Date.now() - 3600000,
      xpGained: 1000,
      level: 4,
      verified: true,
    },
    {
      txHash: 'DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567BCD890EFG123',
      donorAddress: 'rDonor987654321ZYXWVUTSRQPONMLK',
      amount: 250,
      timestamp: Date.now() - 7200000,
      xpGained: 2500,
      level: 6,
      verified: true,
    },
    {
      txHash: 'GHI789JKL012MNO345PQR678STU901VWX234YZA567BCD890EFG123HIJ456',
      donorAddress: 'rWhale123456789ABCDEFGHIJKLMNOP',
      amount: 500,
      timestamp: Date.now() - 10800000,
      xpGained: 5000,
      level: 8,
      verified: true,
    },
  ]);

  const [ngos, setNgos] = useState<OnChainNGO[]>([
    {
      id: 'ngo_1',
      name: 'Climate Action Network',
      walletAddress: 'rClimateAction123456789ABCDEF',
      txHash: 'NGO1ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234',
      impactScore: 95,
      verified: true,
      timestamp: Date.now() - 86400000,
    },
    {
      id: 'ngo_2',
      name: 'Water For All',
      walletAddress: 'rWaterForAll123456789ABCDEFG',
      txHash: 'NGO2DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA',
      impactScore: 92,
      verified: true,
      timestamp: Date.now() - 86400000,
    },
  ]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleSearch = () => {
    // En production, fetch depuis l'API qui lit le ledger XRPL
    const found = donations.find(d => d.txHash === searchHash);
    setSearchResult(found || null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Database className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    On-Chain Explorer
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">
                    All data verified and stored on the XRPL Ledger
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-green-100 px-4 py-2 rounded-lg">
                <p className="text-xs text-green-700 font-medium">Network</p>
                <p className="text-sm font-bold text-green-900">XRPL Testnet</p>
              </div>
              <a
                href="https://testnet.xrpl.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open XRPL Explorer
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 font-medium mb-1">Total Donations On-Chain</p>
              <p className="text-2xl font-bold text-blue-900">{donations.length}</p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <p className="text-xs text-green-700 font-medium mb-1">Verified NGOs</p>
              <p className="text-2xl font-bold text-green-900">{ngos.length}</p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-700 font-medium mb-1">Total Volume</p>
              <p className="text-2xl font-bold text-purple-900">
                {donations.reduce((sum, d) => sum + d.amount, 0)} XRP
              </p>
            </div>
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-700 font-medium mb-1">Verification Rate</p>
              <p className="text-2xl font-bold text-amber-900">100%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 inline-flex gap-1">
          <button
            onClick={() => setActiveTab('donations')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'donations'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            💰 Donations
          </button>
          <button
            onClick={() => setActiveTab('ngos')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'ngos'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🏛️ NGOs
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'search'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🔍 Search TX
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Donations Tab */}
        {activeTab === 'donations' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Recent Donations (On-Chain)
            </h2>

            {donations.map((donation, index) => (
              <div
                key={donation.txHash}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">💰</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {donation.amount} XRP
                        </h3>
                        <p className="text-sm text-gray-600">
                          Level {donation.level} • {donation.xpGained} XP gained
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Donor Address:</p>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                            {donation.donorAddress.slice(0, 12)}...{donation.donorAddress.slice(-8)}
                          </code>
                          <button
                            onClick={() => copyToClipboard(donation.donorAddress)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {copiedHash === donation.donorAddress ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Timestamp:</p>
                        <p className="text-sm text-gray-700">
                          {new Date(donation.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <OnChainBadge txHash={donation.txHash} network="testnet" />
                </div>

                <OnChainVerification
                  txHash={donation.txHash}
                  network="testnet"
                  timestamp={donation.timestamp}
                  data={{
                    type: 'donation',
                    donor: donation.donorAddress,
                    amount: donation.amount,
                    xpGained: donation.xpGained,
                    level: donation.level,
                    timestamp: donation.timestamp,
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* NGOs Tab */}
        {activeTab === 'ngos' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Verified NGOs (On-Chain)
            </h2>

            {ngos.map((ngo) => (
              <div
                key={ngo.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">🏛️</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{ngo.name}</h3>
                        <p className="text-sm text-gray-600">
                          Impact Score: {ngo.impactScore}/100
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Wallet Address:</p>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                            {ngo.walletAddress.slice(0, 12)}...{ngo.walletAddress.slice(-8)}
                          </code>
                          <button
                            onClick={() => copyToClipboard(ngo.walletAddress)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {copiedHash === ngo.walletAddress ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Verified Since:</p>
                        <p className="text-sm text-gray-700">
                          {new Date(ngo.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <OnChainBadge txHash={ngo.txHash} network="testnet" />
                </div>

                <OnChainVerification
                  txHash={ngo.txHash}
                  network="testnet"
                  timestamp={ngo.timestamp}
                  data={{
                    type: 'ngo',
                    id: ngo.id,
                    name: ngo.name,
                    walletAddress: ngo.walletAddress,
                    impactScore: ngo.impactScore,
                    verified: ngo.verified,
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Search Transaction by Hash
            </h2>

            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={searchHash}
                onChange={(e) => setSearchHash(e.target.value)}
                placeholder="Enter XRPL transaction hash..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>

            {searchResult && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Transaction Found!</h3>
                <OnChainVerification
                  txHash={searchResult.txHash}
                  network="testnet"
                  timestamp={searchResult.timestamp}
                  data={{
                    type: 'donation',
                    donor: searchResult.donorAddress,
                    amount: searchResult.amount,
                    xpGained: searchResult.xpGained,
                    level: searchResult.level,
                  }}
                  showDetails={true}
                />
              </div>
            )}

            {searchHash && !searchResult && (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No transaction found with this hash</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OnChainExplorer;

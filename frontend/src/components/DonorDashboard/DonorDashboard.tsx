import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, Globe, Droplet, Wifi, WifiOff } from 'lucide-react';
import { useWebSocket } from '@/shared/hooks/useWebSocket';
import type { PoolUpdate, DonationEvent } from '@/shared/hooks/useWebSocket';

interface DashboardStats {
  poolBalance: number;
  totalDonors: number;
  totalDistributed: number;
  co2Offset: number;
}

interface RecentDonation {
  address: string;
  amount: number;
  time: string;
  tier?: string;
  level?: number;
}

export const DonorDashboard: React.FC = () => {
  const { socket, connected, subscribeToPool, subscribeToDonations } = useWebSocket();

  const [stats, setStats] = useState<DashboardStats>({
    poolBalance: 125000,
    totalDonors: 342,
    totalDistributed: 45000,
    co2Offset: 12500,
  });

  const [recentDonations, setRecentDonations] = useState<RecentDonation[]>([
    { address: 'rDon...x7k9', amount: 500, time: '2 min ago' },
    { address: 'rDon...m3n2', amount: 1000, time: '15 min ago' },
    { address: 'rDon...p8q1', amount: 250, time: '1 hour ago' },
  ]);

  // Subscribe to WebSocket updates when connected
  useEffect(() => {
    if (connected) {
      subscribeToPool();
      subscribeToDonations();
    }
  }, [connected, subscribeToPool, subscribeToDonations]);

  // Listen for pool updates
  useEffect(() => {
    if (!socket) return;

    const handlePoolUpdate = (update: PoolUpdate) => {
      console.log('[Dashboard] Pool updated:', update);
      setStats((prev) => ({
        ...prev,
        poolBalance: update.totalBalance,
        totalDonors: update.donorCount,
      }));
    };

    socket.on('pool:updated', handlePoolUpdate);

    return () => {
      socket.off('pool:updated', handlePoolUpdate);
    };
  }, [socket]);

  // Listen for new donations
  useEffect(() => {
    if (!socket) return;

    const handleNewDonation = (donation: DonationEvent) => {
      console.log('[Dashboard] New donation:', donation);

      const shortAddress = `${donation.donorAddress.slice(0, 4)}...${donation.donorAddress.slice(-4)}`;
      const newDonation: RecentDonation = {
        address: shortAddress,
        amount: donation.amount,
        time: 'Just now',
        tier: donation.tier,
        level: donation.level,
      };

      setRecentDonations((prev) => [newDonation, ...prev.slice(0, 9)]);
    };

    socket.on('donation:new', handleNewDonation);

    return () => {
      socket.off('donation:new', handleNewDonation);
    };
  }, [socket]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                XRPL Impact Fund
              </h1>
              <p className="text-gray-600">
                Transparent Regenerative Donation Engine
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow">
              {connected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-400">Offline</span>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Pool Balance"
            value={`${stats.poolBalance.toLocaleString()} XRP`}
            color="blue"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Total Donors"
            value={stats.totalDonors.toString()}
            color="green"
          />
          <StatCard
            icon={<Globe className="w-6 h-6" />}
            label="Distributed to NGOs"
            value={`${stats.totalDistributed.toLocaleString()} XRP`}
            color="purple"
          />
          <StatCard
            icon={<Droplet className="w-6 h-6" />}
            label="CO₂ Offset (tons)"
            value={stats.co2Offset.toLocaleString()}
            color="teal"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Donations */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Recent Donations</h2>
            <div className="space-y-3">
              {recentDonations.map((donation, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm text-gray-600">
                        {donation.address}
                      </p>
                      {donation.tier && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          {donation.tier}
                        </span>
                      )}
                      {donation.level && (
                        <span className="text-xs text-gray-500">
                          Lvl {donation.level}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{donation.time}</p>
                  </div>
                  <span className="font-semibold text-green-600">
                    +{donation.amount} XRP
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Donate */}
          <div className="bg-gradient-to-br from-blue-500 to-green-500 rounded-xl shadow-lg p-6 text-white">
            <h2 className="text-2xl font-semibold mb-4">Quick Donate</h2>
            <p className="mb-6 text-blue-50">
              Your donation becomes a perpetual engine for good
            </p>
            <div className="space-y-3">
              {[100, 500, 1000].map((amount) => (
                <button
                  key={amount}
                  className="w-full bg-white text-blue-600 font-semibold py-3 rounded-lg hover:bg-blue-50 transition"
                >
                  Donate {amount} XRP
                </button>
              ))}
              <button className="w-full bg-white/20 backdrop-blur text-white font-semibold py-3 rounded-lg hover:bg-white/30 transition border-2 border-white/50">
                Custom Amount
              </button>
            </div>
          </div>
        </div>

        {/* Impact Visualization Placeholder */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Impact Map</h2>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">Interactive impact map will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'purple' | 'teal';
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    teal: 'bg-teal-100 text-teal-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-3`}>
        {icon}
      </div>
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

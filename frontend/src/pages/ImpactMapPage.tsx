/**
 * Impact Map Page - Main page for the XRPL Impact Map
 *
 * The "Google Maps of Humanitarian Aid"
 */

import React, { useState, useMemo } from 'react';
import { RealWorldMap, Project } from '../components/map/RealWorldMap';
import { useProjects } from '../hooks/useProjects';

export const ImpactMapPage: React.FC = () => {
  const { projects, loading, error, countries } = useProjects();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [amountRange, setAmountRange] = useState<[number, number]>([0, 50000]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    // Could open a modal with more details
  };

  // Filter projects based on selected filters
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (selectedStatus !== 'All' && p.status !== selectedStatus) return false;
      if (selectedCountry !== 'All' && p.location.country !== selectedCountry) return false;
      if (p.amount < amountRange[0] || p.amount > amountRange[1]) return false;
      return true;
    });
  }, [projects, selectedCategory, selectedStatus, selectedCountry, amountRange]);

  const filters = {
    category: selectedCategory,
    status: selectedStatus,
    minAmount: amountRange[0],
    maxAmount: amountRange[1]
  };

  // Calculate stats from real filtered projects
  const stats = {
    totalProjects: filteredProjects.length,
    totalDeployed: filteredProjects.reduce((sum, p) => sum + p.amount, 0),
    completed: filteredProjects.filter(p => p.status === 'FUNDED').length,
    inProgress: filteredProjects.filter(p => p.status === 'IN_PROGRESS').length,
    alerts: filteredProjects.filter(p => p.status === 'ALERT').length
  };

  // Calculate additional stats
  const uniqueCountries = new Set(projects.map(p => p.location.country)).size;
  const uniqueValidators = new Set(
    projects.flatMap(p => p.validationProofs?.map(v => v.validatorName) || [])
  ).size;
  const successRate = projects.length > 0
    ? Math.round((projects.filter(p => p.status === 'FUNDED').length / projects.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🌍 XRPL Impact Map
              </h1>
              <p className="text-gray-600 mt-1">
                The Google Maps of Humanitarian Aid - Real-time transparency on XRPL
              </p>
            </div>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
              Fund a Project
            </button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalProjects}</div>
              <div className="text-xs text-gray-600">Active Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.totalDeployed.toLocaleString()} XRP
              </div>
              <div className="text-xs text-gray-600">Total Deployed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-xs text-gray-600">✅ Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
              <div className="text-xs text-gray-600">⏳ In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.alerts}</div>
              <div className="text-xs text-gray-600">⚠️ Alerts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Filters Sidebar */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-3">Filters</h3>
              </div>

              {/* Country Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option>All</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option>All</option>
                  <option>Water</option>
                  <option>Education</option>
                  <option>Health</option>
                  <option>Climate</option>
                  <option>Infrastructure</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option>All</option>
                  <option>FUNDED</option>
                  <option>IN_PROGRESS</option>
                  <option>PENDING</option>
                  <option>ALERT</option>
                </select>
              </div>

              {/* Amount Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Range (XRP)
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="1000"
                    value={amountRange[1]}
                    onChange={(e) => setAmountRange([0, parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>0 XRP</span>
                    <span>{amountRange[1].toLocaleString()} XRP</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-sm mb-3">Quick Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Countries:</span>
                    <span className="font-bold">{loading ? '...' : uniqueCountries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Validators:</span>
                    <span className="font-bold">{loading ? '...' : uniqueValidators}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Success Rate:</span>
                    <span className="font-bold text-green-600">{loading ? '...' : `${successRate}%`}</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-sm mb-3">Recent Activity</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-gray-600">
                      Senegal well validated by 3 oracles
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600">⏳</span>
                    <span className="text-gray-600">
                      India school received 2/5 photos
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-600">⚠️</span>
                    <span className="text-gray-600">
                      Kenya clinic deadline passed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map - REAL Google Maps-like Interactive Map */}
          <div className="col-span-9">
            {loading ? (
              <div className="bg-white rounded-lg shadow p-8 flex items-center justify-center" style={{ height: '700px' }}>
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading projects...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow p-8 flex items-center justify-center" style={{ height: '700px' }}>
                <div className="text-center">
                  <p className="text-red-600 mb-2">Failed to load projects</p>
                  <p className="text-sm text-gray-600">{error}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '700px' }}>
                <RealWorldMap
                  projects={filteredProjects}
                  onProjectClick={handleProjectClick}
                  filters={filters}
                />
              </div>
            )}

            {/* How it works */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="font-bold text-lg mb-4">How It Works</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-4xl mb-2">1️⃣</div>
                  <div className="font-semibold mb-1">Fund Pool</div>
                  <div className="text-xs text-gray-600">
                    Donations generate perpetual yield via XRPL AMM
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">2️⃣</div>
                  <div className="font-semibold mb-1">Smart Escrow</div>
                  <div className="text-xs text-gray-600">
                    Profits locked until validation conditions met
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">3️⃣</div>
                  <div className="font-semibold mb-1">Local Validation</div>
                  <div className="text-xs text-gray-600">
                    XRPL Commons ambassadors verify on ground
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">4️⃣</div>
                  <div className="font-semibold mb-1">NFT Proof</div>
                  <div className="text-xs text-gray-600">
                    Receive geographic NFT as permanent proof
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactMapPage;

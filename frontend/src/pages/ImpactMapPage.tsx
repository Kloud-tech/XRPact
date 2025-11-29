/**
 * Impact Map Page - Main page for the XRPL Impact Map
 *
 * The "Google Maps of Humanitarian Aid"
 */

import React, { useState } from 'react';
import { SimpleImpactMap, Project } from '../components/map/SimpleImpactMap';

// Mock data - in production, fetch from API
const MOCK_PROJECTS: Project[] = [
  {
    id: 'PRJ_001',
    title: 'Puits au Sénégal',
    category: 'Water',
    location: {
      lat: 14.4974,
      lng: -14.4524,
      country: 'Senegal',
      region: 'Dakar'
    },
    amount: 5000,
    status: 'FUNDED',
    conditions: {
      photosRequired: 3,
      photosReceived: 3,
      validatorsRequired: 3,
      validatorsApproved: 3,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    validationProofs: [
      { validatorName: 'Amadou Diallo', photoUrl: '/assets/photo1.jpg', reputation: 98 },
      { validatorName: 'Fatou Sow', photoUrl: '/assets/photo2.jpg', reputation: 95 },
      { validatorName: 'Moussa Kane', photoUrl: '/assets/photo3.jpg', reputation: 97 }
    ],
    escrowHash: '0xABC123DEF456789'
  },
  {
    id: 'PRJ_002',
    title: 'École en Inde',
    category: 'Education',
    location: {
      lat: 12.9716,
      lng: 77.5946,
      country: 'India',
      region: 'Bangalore'
    },
    amount: 8000,
    status: 'IN_PROGRESS',
    conditions: {
      photosRequired: 5,
      photosReceived: 2,
      validatorsRequired: 3,
      validatorsApproved: 1,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
    },
    validationProofs: [
      { validatorName: 'Raj Kumar', photoUrl: '/assets/india-school.jpg', reputation: 92 }
    ],
    daysRemaining: 45,
    escrowHash: '0xDEF456GHI789012'
  },
  {
    id: 'PRJ_003',
    title: 'Clinique au Kenya',
    category: 'Health',
    location: {
      lat: -1.2921,
      lng: 36.8219,
      country: 'Kenya',
      region: 'Nairobi'
    },
    amount: 12000,
    status: 'ALERT',
    conditions: {
      photosRequired: 4,
      photosReceived: 1,
      validatorsRequired: 3,
      validatorsApproved: 0,
      deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    daysOverdue: 5,
    escrowHash: '0xGHI789JKL012345'
  },
  {
    id: 'PRJ_004',
    title: 'Reforestation au Brésil',
    category: 'Climate',
    location: {
      lat: -3.4653,
      lng: -62.2159,
      country: 'Brazil',
      region: 'Amazonas'
    },
    amount: 15000,
    status: 'IN_PROGRESS',
    conditions: {
      photosRequired: 10,
      photosReceived: 6,
      validatorsRequired: 5,
      validatorsApproved: 3,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    },
    daysRemaining: 60,
    validationProofs: [
      { validatorName: 'Carlos Silva', photoUrl: '/assets/brazil1.jpg', reputation: 91 },
      { validatorName: 'Ana Costa', photoUrl: '/assets/brazil2.jpg', reputation: 87 },
      { validatorName: 'Pedro Santos', photoUrl: '/assets/brazil3.jpg', reputation: 89 }
    ]
  },
  {
    id: 'PRJ_005',
    title: 'Solar Panels Vietnam',
    category: 'Infrastructure',
    location: {
      lat: 21.0285,
      lng: 105.8542,
      country: 'Vietnam',
      region: 'Hanoi'
    },
    amount: 10000,
    status: 'PENDING',
    conditions: {
      photosRequired: 4,
      photosReceived: 0,
      validatorsRequired: 3,
      validatorsApproved: 0,
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    },
    daysRemaining: 90
  }
];

export const ImpactMapPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [amountRange, setAmountRange] = useState<[number, number]>([0, 50000]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    // Could open a modal with more details
  };

  const filters = {
    category: selectedCategory,
    status: selectedStatus,
    minAmount: amountRange[0],
    maxAmount: amountRange[1]
  };

  const stats = {
    totalProjects: MOCK_PROJECTS.length,
    totalDeployed: MOCK_PROJECTS.reduce((sum, p) => sum + p.amount, 0),
    completed: MOCK_PROJECTS.filter(p => p.status === 'FUNDED').length,
    inProgress: MOCK_PROJECTS.filter(p => p.status === 'IN_PROGRESS').length,
    alerts: MOCK_PROJECTS.filter(p => p.status === 'ALERT').length
  };

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

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    <span className="font-bold">15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Validators:</span>
                    <span className="font-bold">47</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Success Rate:</span>
                    <span className="font-bold text-green-600">94%</span>
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

          {/* Map */}
          <div className="col-span-9">
            <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '700px' }}>
              <SimpleImpactMap
                projects={MOCK_PROJECTS}
                onProjectClick={handleProjectClick}
                filters={filters}
              />
            </div>

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

/**
 * Green Impact Map Page - Eco-themed XRPL Impact Map
 *
 * The "Google Maps of Humanitarian Aid" with beautiful green design
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RealWorldMap, Project } from '../components/map/RealWorldMap';
import { fetchProjects } from '../services/api';
import {
  MapPin,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  Filter,
  Sparkles,
  Globe,
  Users,
  Award,
  Leaf,
  Heart,
  GraduationCap,
  Droplet,
} from 'lucide-react';

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
  },
  // Multiple projects in Senegal (same location - will cluster)
  {
    id: 'PRJ_006',
    title: 'École à Dakar',
    category: 'Education',
    location: {
      lat: 14.6937,
      lng: -17.4441,
      country: 'Senegal',
      region: 'Dakar'
    },
    amount: 7500,
    status: 'IN_PROGRESS',
    conditions: {
      photosRequired: 4,
      photosReceived: 2,
      validatorsRequired: 3,
      validatorsApproved: 1,
      deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000)
    },
    daysRemaining: 50
  },
  {
    id: 'PRJ_007',
    title: 'Clinique Dakar Sud',
    category: 'Health',
    location: {
      lat: 14.7167,
      lng: -17.4677,
      country: 'Senegal',
      region: 'Dakar'
    },
    amount: 9000,
    status: 'FUNDED',
    conditions: {
      photosRequired: 3,
      photosReceived: 3,
      validatorsRequired: 3,
      validatorsApproved: 3,
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
    },
    validationProofs: [
      { validatorName: 'Awa Diop', photoUrl: '/assets/clinic1.jpg', reputation: 96 },
      { validatorName: 'Mamadou Fall', photoUrl: '/assets/clinic2.jpg', reputation: 94 },
      { validatorName: 'Aissatou Ba', photoUrl: '/assets/clinic3.jpg', reputation: 93 }
    ]
  },
  // Multiple projects in India (close locations - will cluster)
  {
    id: 'PRJ_008',
    title: 'Puits rural Karnataka',
    category: 'Water',
    location: {
      lat: 12.9141,
      lng: 77.5837,
      country: 'India',
      region: 'Bangalore'
    },
    amount: 4500,
    status: 'IN_PROGRESS',
    conditions: {
      photosRequired: 3,
      photosReceived: 1,
      validatorsRequired: 3,
      validatorsApproved: 0,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    },
    daysRemaining: 60
  },
  {
    id: 'PRJ_009',
    title: 'Panneaux solaires Bangalore',
    category: 'Infrastructure',
    location: {
      lat: 13.0097,
      lng: 77.6241,
      country: 'India',
      region: 'Bangalore'
    },
    amount: 11000,
    status: 'PENDING',
    conditions: {
      photosRequired: 5,
      photosReceived: 0,
      validatorsRequired: 3,
      validatorsApproved: 0,
      deadline: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000)
    },
    daysRemaining: 100
  },
  // Projects in Kenya (clustering test)
  {
    id: 'PRJ_010',
    title: 'Jardin communautaire Nairobi',
    category: 'Climate',
    location: {
      lat: -1.2864,
      lng: 36.8172,
      country: 'Kenya',
      region: 'Nairobi'
    },
    amount: 3500,
    status: 'FUNDED',
    conditions: {
      photosRequired: 4,
      photosReceived: 4,
      validatorsRequired: 3,
      validatorsApproved: 3,
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    },
    validationProofs: [
      { validatorName: 'Jane Wanjiku', photoUrl: '/assets/garden1.jpg', reputation: 99 },
      { validatorName: 'John Kamau', photoUrl: '/assets/garden2.jpg', reputation: 97 },
      { validatorName: 'Mary Achieng', photoUrl: '/assets/garden3.jpg', reputation: 95 }
    ]
  },
  // Projects in Brazil (Amazon region)
  {
    id: 'PRJ_011',
    title: 'Protection faune Amazonie',
    category: 'Climate',
    location: {
      lat: -3.4168,
      lng: -62.1762,
      country: 'Brazil',
      region: 'Amazonas'
    },
    amount: 13500,
    status: 'IN_PROGRESS',
    conditions: {
      photosRequired: 8,
      photosReceived: 4,
      validatorsRequired: 5,
      validatorsApproved: 2,
      deadline: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000)
    },
    daysRemaining: 75,
    validationProofs: [
      { validatorName: 'Maria Silva', photoUrl: '/assets/wildlife1.jpg', reputation: 88 },
      { validatorName: 'José Santos', photoUrl: '/assets/wildlife2.jpg', reputation: 90 }
    ]
  },
  {
    id: 'PRJ_012',
    title: 'Réserve naturelle Pará',
    category: 'Climate',
    location: {
      lat: -1.4558,
      lng: -48.4902,
      country: 'Brazil',
      region: 'Pará'
    },
    amount: 18000,
    status: 'PENDING',
    conditions: {
      photosRequired: 6,
      photosReceived: 0,
      validatorsRequired: 4,
      validatorsApproved: 0,
      deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000)
    },
    daysRemaining: 120
  }
];

export const GreenImpactMapPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [amountRange, setAmountRange] = useState<[number, number]>([0, 50000]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects from API on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const data = await fetchProjects();
        setProjects(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load projects:', err);
        setError('Failed to load projects. Using fallback data.');
        // Fallback to mock data if API fails
        setProjects(MOCK_PROJECTS);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  const filters = {
    category: selectedCategory,
    status: selectedStatus,
    minAmount: amountRange[0],
    maxAmount: amountRange[1]
  };

  const stats = {
    totalProjects: projects.length,
    totalDeployed: projects.reduce((sum, p) => sum + p.amount, 0),
    completed: projects.filter(p => p.status === 'FUNDED').length,
    inProgress: projects.filter(p => p.status === 'IN_PROGRESS').length,
    alerts: projects.filter(p => p.status === 'ALERT').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse-slow"></div>

      {/* Loading & Error States */}
      {loading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <motion.div
            className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              className="w-8 h-8 border-4 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span className="font-bold">Loading projects from XRPL testnet...</span>
          </motion.div>
        </div>
      )}

      {error && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-50">
          <motion.div
            className="bg-yellow-500 text-white px-6 py-3 rounded-xl shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ⚠️ {error}
          </motion.div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-br from-emerald-800/80 to-teal-900/80 backdrop-blur-xl shadow-2xl border-b-2 border-emerald-500/30 relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="p-3 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 shadow-lg"
                >
                  <MapPin className="h-8 w-8 text-white" />
                </motion.div>
                <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                  🌍 XRPL Impact Map
                </h1>
              </div>
              <p className="text-emerald-200 text-lg ml-14">
                The Google Maps of Humanitarian Aid - Real-time transparency on XRPL
              </p>
            </motion.div>
            <motion.button
              className="bg-gradient-to-r from-lime-400 to-emerald-500 text-white px-8 py-3.5 rounded-2xl font-bold hover:shadow-lg hover:shadow-lime-400/30 transition-all border-2 border-lime-400/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Fund a Project
            </motion.button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-gradient-to-br from-emerald-800/60 to-teal-900/60 backdrop-blur-xl border-b-2 border-emerald-500/30 relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-5 gap-4">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-3xl font-bold text-cyan-400">{stats.totalProjects}</div>
              <div className="text-xs text-emerald-200 font-medium">Active Projects</div>
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-3xl font-bold text-lime-400">
                {stats.totalDeployed.toLocaleString()} XRP
              </div>
              <div className="text-xs text-emerald-200 font-medium">Total Deployed</div>
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-3xl font-bold text-lime-400">{stats.completed}</div>
              <div className="text-xs text-emerald-200 font-medium">✅ Completed</div>
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-3xl font-bold text-yellow-400">{stats.inProgress}</div>
              <div className="text-xs text-emerald-200 font-medium">⏳ In Progress</div>
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-3xl font-bold text-rose-400">{stats.alerts}</div>
              <div className="text-xs text-emerald-200 font-medium">⚠️ Alerts</div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 relative z-10">
        <div className="grid grid-cols-12 gap-6">
          {/* Filters Sidebar */}
          <div className="col-span-3">
            <motion.div
              className="bg-gradient-to-br from-emerald-800/80 to-teal-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 space-y-6 border-2 border-emerald-500/30"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2">
                <Filter className="w-6 h-6 text-lime-400" />
                <h3 className="font-bold text-xl text-white">Filters</h3>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-bold text-emerald-200 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 bg-green-950/50 border-2 border-emerald-500/30 rounded-xl text-white focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all"
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
                <label className="block text-sm font-bold text-emerald-200 mb-2">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-3 bg-green-950/50 border-2 border-emerald-500/30 rounded-xl text-white focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all"
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
                <label className="block text-sm font-bold text-emerald-200 mb-2">
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
                    className="w-full accent-lime-400"
                  />
                  <div className="flex justify-between text-xs text-emerald-200 font-medium">
                    <span>0 XRP</span>
                    <span className="text-lime-400 font-bold">{amountRange[1].toLocaleString()} XRP</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="border-t-2 border-emerald-500/30 pt-4">
                <h4 className="font-bold text-sm mb-3 text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-lime-400" />
                  Quick Stats
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-emerald-200">Countries:</span>
                    <span className="font-bold text-lime-400">15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-200">Validators:</span>
                    <span className="font-bold text-lime-400">47</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-200">Success Rate:</span>
                    <span className="font-bold text-lime-400">94%</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="border-t-2 border-emerald-500/30 pt-4">
                <h4 className="font-bold text-sm mb-3 text-white">Recent Activity</h4>
                <div className="space-y-3 text-xs">
                  <motion.div
                    className="flex items-start gap-2 bg-lime-400/10 rounded-lg p-2 border border-lime-400/30"
                    whileHover={{ scale: 1.02, x: 5 }}
                  >
                    <CheckCircle className="w-4 h-4 text-lime-400 flex-shrink-0 mt-0.5" />
                    <span className="text-emerald-200">
                      Senegal well validated by 3 oracles
                    </span>
                  </motion.div>
                  <motion.div
                    className="flex items-start gap-2 bg-yellow-400/10 rounded-lg p-2 border border-yellow-400/30"
                    whileHover={{ scale: 1.02, x: 5 }}
                  >
                    <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span className="text-emerald-200">
                      India school received 2/5 photos
                    </span>
                  </motion.div>
                  <motion.div
                    className="flex items-start gap-2 bg-rose-400/10 rounded-lg p-2 border border-rose-400/30"
                    whileHover={{ scale: 1.02, x: 5 }}
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    <span className="text-emerald-200">
                      Kenya clinic deadline passed
                    </span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Map */}
          <div className="col-span-9">
            <motion.div
              className="bg-gradient-to-br from-emerald-800/80 to-teal-900/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border-2 border-emerald-500/30"
              style={{ height: '700px' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <RealWorldMap
                projects={projects}
                onProjectClick={handleProjectClick}
                filters={filters}
              />
            </motion.div>

            {/* How it works */}
            <motion.div
              className="bg-gradient-to-br from-emerald-800/80 to-teal-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mt-6 border-2 border-emerald-500/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Globe className="w-8 h-8 text-lime-400" />
                </motion.div>
                <h3 className="font-bold text-2xl text-white">How It Works</h3>
              </div>
              <div className="grid grid-cols-4 gap-6">
                <motion.div
                  className="text-center"
                  whileHover={{ y: -5, scale: 1.05 }}
                >
                  <motion.div
                    className="text-6xl mb-3"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                  >
                    1️⃣
                  </motion.div>
                  <div className="font-bold mb-2 text-white text-lg">Fund Pool</div>
                  <div className="text-sm text-emerald-200">
                    Donations generate perpetual yield via XRPL AMM
                  </div>
                </motion.div>
                <motion.div
                  className="text-center"
                  whileHover={{ y: -5, scale: 1.05 }}
                >
                  <motion.div
                    className="text-6xl mb-3"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  >
                    2️⃣
                  </motion.div>
                  <div className="font-bold mb-2 text-white text-lg">Smart Escrow</div>
                  <div className="text-sm text-emerald-200">
                    Profits locked until validation conditions met
                  </div>
                </motion.div>
                <motion.div
                  className="text-center"
                  whileHover={{ y: -5, scale: 1.05 }}
                >
                  <motion.div
                    className="text-6xl mb-3"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  >
                    3️⃣
                  </motion.div>
                  <div className="font-bold mb-2 text-white text-lg">Local Validation</div>
                  <div className="text-sm text-emerald-200">
                    XRPL Commons ambassadors verify on ground
                  </div>
                </motion.div>
                <motion.div
                  className="text-center"
                  whileHover={{ y: -5, scale: 1.05 }}
                >
                  <motion.div
                    className="text-6xl mb-3"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                  >
                    4️⃣
                  </motion.div>
                  <div className="font-bold mb-2 text-white text-lg">NFT Proof</div>
                  <div className="text-sm text-emerald-200">
                    Receive geographic NFT as permanent proof
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreenImpactMapPage;

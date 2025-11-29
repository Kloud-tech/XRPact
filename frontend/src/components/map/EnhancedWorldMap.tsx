/**
 * Enhanced World Map - Beautiful Real World Map
 *
 * Features:
 * - Real interactive world map using Leaflet
 * - Animated pins with pulsing effects
 * - Beautiful tile layers (multiple styles)
 * - Glassmorphism UI overlays
 * - Real-time project visualization
 * - Smooth animations and transitions
 */

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Globe,
  Users,
  TrendingUp,
  Heart,
  MapPin,
  Layers,
  Droplet,
  Leaf,
  GraduationCap,
  Building
} from 'lucide-react';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Project {
  id: string;
  title: string;
  category: 'Water' | 'Education' | 'Health' | 'Climate' | 'Infrastructure';
  location: {
    lat: number;
    lng: number;
    country: string;
    region: string;
  };
  amount: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'FUNDED' | 'ALERT';
  donors: number;
  familiesHelped: number;
  description: string;
}

type MapStyle = 'default' | 'satellite' | 'terrain' | 'dark';

export const EnhancedWorldMap: React.FC = () => {
  const [mapStyle, setMapStyle] = useState<MapStyle>('default');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);

  // Sample project data with real world coordinates
  const projects: Project[] = [
    {
      id: '1',
      title: 'Clean Water Initiative',
      category: 'Water',
      location: { lat: -1.286389, lng: 36.817223, country: 'Kenya', region: 'Nairobi' },
      amount: 15420,
      status: 'FUNDED',
      donors: 342,
      familiesHelped: 500,
      description: 'Building water wells in rural communities'
    },
    {
      id: '2',
      title: 'School Reconstruction',
      category: 'Education',
      location: { lat: 14.0583, lng: 108.2772, country: 'Vietnam', region: 'Central Highlands' },
      amount: 12800,
      status: 'IN_PROGRESS',
      donors: 298,
      familiesHelped: 750,
      description: 'Rebuilding schools damaged by floods'
    },
    {
      id: '3',
      title: 'Amazon Reforestation',
      category: 'Climate',
      location: { lat: -3.4653, lng: -62.2159, country: 'Brazil', region: 'Amazonas' },
      amount: 10500,
      status: 'FUNDED',
      donors: 210,
      familiesHelped: 300,
      description: 'Planting native trees in deforested areas'
    },
    {
      id: '4',
      title: 'Rural Healthcare Center',
      category: 'Health',
      location: { lat: 27.7172, lng: 85.3240, country: 'Nepal', region: 'Kathmandu Valley' },
      amount: 11200,
      status: 'FUNDED',
      donors: 267,
      familiesHelped: 1200,
      description: 'Medical services for remote villages'
    },
    {
      id: '5',
      title: 'Refugee Education Program',
      category: 'Education',
      location: { lat: 33.8886, lng: 35.4955, country: 'Lebanon', region: 'Beirut' },
      amount: 8900,
      status: 'IN_PROGRESS',
      donors: 184,
      familiesHelped: 450,
      description: 'Educational support for refugee children'
    },
    {
      id: '6',
      title: 'Community Infrastructure',
      category: 'Infrastructure',
      location: { lat: 50.4501, lng: 30.5234, country: 'Ukraine', region: 'Kyiv' },
      amount: 7650,
      status: 'PENDING',
      donors: 156,
      familiesHelped: 600,
      description: 'Rebuilding community centers'
    },
    {
      id: '7',
      title: 'Water Purification System',
      category: 'Water',
      location: { lat: 28.6139, lng: 77.2090, country: 'India', region: 'New Delhi' },
      amount: 9300,
      status: 'FUNDED',
      donors: 221,
      familiesHelped: 800,
      description: 'Clean drinking water for slum communities'
    },
    {
      id: '8',
      title: 'Coastal Protection',
      category: 'Climate',
      location: { lat: 14.5995, lng: 120.9842, country: 'Philippines', region: 'Manila' },
      amount: 13200,
      status: 'IN_PROGRESS',
      donors: 305,
      familiesHelped: 950,
      description: 'Mangrove restoration for coastal protection'
    },
  ];

  const getTileLayerUrl = (style: MapStyle): string => {
    switch (style) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'terrain':
        return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      case 'dark':
        return 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  const getTileLayerAttribution = (style: MapStyle): string => {
    switch (style) {
      case 'satellite':
        return 'Tiles &copy; Esri';
      case 'terrain':
        return 'Map data: &copy; OpenStreetMap, SRTM | Map style: &copy; OpenTopoMap';
      case 'dark':
        return '&copy; Stadia Maps, &copy; OpenMapTiles &copy; OpenStreetMap';
      default:
        return '&copy; OpenStreetMap contributors';
    }
  };

  // Create custom marker icons
  const createCustomIcon = (project: Project) => {
    const statusColors = {
      FUNDED: '#10b981',
      IN_PROGRESS: '#f59e0b',
      PENDING: '#3b82f6',
      ALERT: '#ef4444',
    };

    const categoryIcons = {
      Water: '💧',
      Education: '📚',
      Health: '❤️',
      Climate: '🌱',
      Infrastructure: '🏗️',
    };

    const color = statusColors[project.status];
    const icon = categoryIcons[project.category];

    return L.divIcon({
      className: 'custom-marker-enhanced',
      html: `
        <div class="relative">
          <div class="absolute inset-0 rounded-full animate-ping" style="
            background-color: ${color};
            opacity: 0.4;
          "></div>
          <div style="
            background: linear-gradient(135deg, ${color}ee, ${color}aa);
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: 4px solid white;
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            position: relative;
            z-index: 10;
            transition: all 0.3s ease;
          " class="marker-icon">
            ${icon}
          </div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
      popupAnchor: [0, -24]
    });
  };

  const stats = {
    totalProjects: projects.length,
    totalDonations: projects.reduce((sum, p) => sum + p.amount, 0),
    totalDonors: projects.reduce((sum, p) => sum + p.donors, 0),
    familiesHelped: projects.reduce((sum, p) => sum + p.familiesHelped, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Globe className="w-10 h-10" />
              <h2 className="text-4xl font-bold">Global Impact Map</h2>
            </div>
            {/* Map Style Selector */}
            <div className="flex gap-2">
              {(['default', 'satellite', 'terrain', 'dark'] as MapStyle[]).map((style) => (
                <button
                  key={style}
                  onClick={() => setMapStyle(style)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    mapStyle === style
                      ? 'bg-white text-purple-600'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <p className="text-blue-100 text-lg">
            Real-time visualization of donations creating impact across the world
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          icon={<MapPin className="w-6 h-6" />}
          label="Active Projects"
          value={stats.totalProjects.toString()}
          color="from-blue-400 to-cyan-400"
        />
        <StatsCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Total Deployed"
          value={`${stats.totalDonations.toLocaleString()} XRP`}
          color="from-purple-400 to-pink-400"
        />
        <StatsCard
          icon={<Users className="w-6 h-6" />}
          label="Total Donors"
          value={stats.totalDonors.toLocaleString()}
          color="from-green-400 to-emerald-400"
        />
        <StatsCard
          icon={<Heart className="w-6 h-6" />}
          label="Families Helped"
          value={stats.familiesHelped.toLocaleString()}
          color="from-orange-400 to-red-400"
        />
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden relative" style={{ height: '600px' }}>
        <MapContainer
          center={[20, 0]}
          zoom={2}
          className="w-full h-full"
          scrollWheelZoom={true}
          zoomControl={false}
        >
          <TileLayer
            attribution={getTileLayerAttribution(mapStyle)}
            url={getTileLayerUrl(mapStyle)}
          />

          {/* Project Markers */}
          {projects.map((project) => (
            <React.Fragment key={project.id}>
              <Marker
                position={[project.location.lat, project.location.lng]}
                icon={createCustomIcon(project)}
                eventHandlers={{
                  click: () => setSelectedProject(project),
                }}
              >
                <Popup className="custom-popup">
                  <ProjectPopup project={project} />
                </Popup>
              </Marker>

              {/* Heatmap circles for funded projects */}
              {showHeatmap && project.status === 'FUNDED' && (
                <Circle
                  center={[project.location.lat, project.location.lng]}
                  radius={project.amount * 50}
                  pathOptions={{
                    fillColor: '#10b981',
                    fillOpacity: 0.1,
                    color: '#10b981',
                    weight: 1,
                    opacity: 0.3,
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </MapContainer>

        {/* Floating Legend */}
        <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-xl p-6 rounded-2xl shadow-2xl z-[1000] border border-purple-200">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600" />
            Project Status
          </h3>
          <div className="space-y-3 text-sm">
            <LegendItem color="bg-green-500" label="Funded & Completed" icon="✅" />
            <LegendItem color="bg-yellow-500" label="In Progress" icon="⏳" />
            <LegendItem color="bg-blue-500" label="Pending Validation" icon="📋" />
            <LegendItem color="bg-red-500" label="Alert / Issue" icon="⚠️" />
          </div>

          {/* Toggle Heatmap */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`mt-4 w-full px-4 py-2 rounded-lg font-medium transition-all ${
              showHeatmap
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {showHeatmap ? '🔥 Heatmap On' : 'Heatmap Off'}
          </button>
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {projects.slice(0, 4).map((project) => (
          <ProjectCard key={project.id} project={project} onClick={() => setSelectedProject(project)} />
        ))}
      </div>

      {/* Selected Project Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-6"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Stats Card Component
const StatsCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({
  icon,
  label,
  value,
  color,
}) => (
  <motion.div
    whileHover={{ scale: 1.05, y: -5 }}
    className={`bg-gradient-to-br ${color} p-6 rounded-2xl shadow-xl text-white`}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="p-2 bg-white/20 rounded-lg backdrop-blur">{icon}</div>
    </div>
    <p className="text-sm font-medium opacity-90 mb-1">{label}</p>
    <p className="text-3xl font-bold">{value}</p>
  </motion.div>
);

// Legend Item
const LegendItem: React.FC<{ color: string; label: string; icon: string }> = ({ color, label, icon }) => (
  <div className="flex items-center gap-3">
    <div className={`w-5 h-5 rounded-full ${color} border-2 border-white shadow`} />
    <span className="text-gray-700 flex-1">{label}</span>
    <span>{icon}</span>
  </div>
);

// Project Card Component
const ProjectCard: React.FC<{ project: Project; onClick: () => void }> = ({ project, onClick }) => {
  const categoryIcons = {
    Water: <Droplet className="w-5 h-5" />,
    Education: <GraduationCap className="w-5 h-5" />,
    Health: <Heart className="w-5 h-5" />,
    Climate: <Leaf className="w-5 h-5" />,
    Infrastructure: <Building className="w-5 h-5" />,
  };

  const statusColors = {
    FUNDED: 'bg-green-100 text-green-700',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
    PENDING: 'bg-blue-100 text-blue-700',
    ALERT: 'bg-red-100 text-red-700',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      onClick={onClick}
      className="bg-white rounded-xl p-5 shadow-lg cursor-pointer border border-gray-200 hover:border-purple-300 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
          {categoryIcons[project.category]}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[project.status]}`}>
          {project.status}
        </span>
      </div>
      <h4 className="font-bold text-gray-900 mb-2">{project.title}</h4>
      <p className="text-sm text-gray-600 mb-3">{project.location.country}</p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">{project.donors} donors</span>
        <span className="font-bold text-purple-600">{project.amount.toLocaleString()} XRP</span>
      </div>
    </motion.div>
  );
};

// Project Popup (for map markers)
const ProjectPopup: React.FC<{ project: Project }> = ({ project }) => (
  <div className="min-w-[250px]">
    <h3 className="font-bold text-lg mb-2">{project.title}</h3>
    <div className="space-y-2 text-sm">
      <p className="text-gray-600">{project.location.region}, {project.location.country}</p>
      <p className="font-bold text-purple-600">{project.amount.toLocaleString()} XRP</p>
      <p className="text-gray-700">{project.description}</p>
      <div className="flex items-center justify-between pt-2 border-t">
        <span className="text-gray-600">{project.donors} donors</span>
        <span className="text-green-600 font-semibold">{project.familiesHelped} families helped</span>
      </div>
    </div>
  </div>
);

// Project Detail Modal
const ProjectDetailModal: React.FC<{ project: Project; onClose: () => void }> = ({ project, onClose }) => {
  const categoryIcons = {
    Water: <Droplet className="w-8 h-8" />,
    Education: <GraduationCap className="w-8 h-8" />,
    Health: <Heart className="w-8 h-8" />,
    Climate: <Leaf className="w-8 h-8" />,
    Infrastructure: <Building className="w-8 h-8" />,
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-purple-100 rounded-2xl text-purple-600">
            {categoryIcons[project.category]}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{project.title}</h2>
            <p className="text-gray-600">{project.location.region}, {project.location.country}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
        >
          ×
        </button>
      </div>

      <p className="text-gray-700 mb-6">{project.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-purple-50 rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-1">Total Funding</p>
          <p className="text-2xl font-bold text-purple-600">{project.amount.toLocaleString()} XRP</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-1">Families Helped</p>
          <p className="text-2xl font-bold text-green-600">{project.familiesHelped}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-1">Total Donors</p>
          <p className="text-2xl font-bold text-blue-600">{project.donors}</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-1">Status</p>
          <p className="text-2xl font-bold text-orange-600">{project.status}</p>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all"
      >
        Close
      </button>
    </div>
  );
};

export default EnhancedWorldMap;

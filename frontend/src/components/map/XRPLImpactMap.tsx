/**
 * XRPL Impact Map - Interactive World Map
 *
 * Shows all funded projects as colored pins:
 * - Yellow: Pending validation
 * - Green: Successfully funded
 * - Red: Alert/Failed
 */

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface Project {
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
  status: 'PENDING' | 'IN_PROGRESS' | 'FUNDED' | 'ALERT' | 'CANCELLED';
  conditions: {
    photosRequired: number;
    photosReceived: number;
    validatorsRequired: number;
    validatorsApproved: number;
    deadline: Date;
  };
  validationProofs?: Array<{
    validatorName: string;
    photoUrl: string;
    reputation: number;
  }>;
  daysRemaining?: number;
  daysOverdue?: number;
  escrowHash?: string;
}

interface XRPLImpactMapProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
  filters?: {
    category?: string;
    status?: string;
    minAmount?: number;
    maxAmount?: number;
  };
}

export const XRPLImpactMap: React.FC<XRPLImpactMapProps> = ({
  projects,
  onProjectClick,
  filters
}) => {
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Apply filters
  useEffect(() => {
    let filtered = [...projects];

    if (filters?.category && filters.category !== 'All') {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    if (filters?.status && filters.status !== 'All') {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    if (filters?.minAmount !== undefined) {
      filtered = filtered.filter(p => p.amount >= filters.minAmount!);
    }

    if (filters?.maxAmount !== undefined) {
      filtered = filtered.filter(p => p.amount <= filters.maxAmount!);
    }

    setFilteredProjects(filtered);
  }, [projects, filters]);

  // Get pin color based on status
  const getPinColor = (status: Project['status']): string => {
    switch (status) {
      case 'FUNDED':
        return '#10b981'; // Green
      case 'ALERT':
      case 'CANCELLED':
        return '#ef4444'; // Red
      case 'PENDING':
      case 'IN_PROGRESS':
      default:
        return '#eab308'; // Yellow
    }
  };

  // Create custom marker icon
  const createCustomIcon = (project: Project) => {
    const color = getPinColor(project.status);
    const categoryIcon = getCategoryIcon(project.category);

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            transform: rotate(45deg);
            font-size: 20px;
          ">${categoryIcon}</span>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });
  };

  // Get emoji icon for category
  const getCategoryIcon = (category: Project['category']): string => {
    switch (category) {
      case 'Water':
        return '💧';
      case 'Education':
        return '📚';
      case 'Health':
        return '❤️';
      case 'Climate':
        return '🌱';
      case 'Infrastructure':
        return '🏗️';
      default:
        return '📍';
    }
  };

  // Handle project click
  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    if (onProjectClick) {
      onProjectClick(project);
    }
  };

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        className="w-full h-full rounded-lg shadow-xl"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {filteredProjects.map((project) => (
          <Marker
            key={project.id}
            position={[project.location.lat, project.location.lng]}
            icon={createCustomIcon(project)}
            eventHandlers={{
              click: () => handleProjectClick(project)
            }}
          >
            <Popup className="custom-popup">
              <ProjectPopup project={project} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-6 right-6 bg-white p-4 rounded-lg shadow-lg z-[1000]">
        <h3 className="font-bold text-sm mb-2">Project Status</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-400 border-2 border-white"></div>
            <span>Pending Validation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
            <span>Funded & Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div>
            <span>Alert / Failed</span>
          </div>
        </div>
      </div>

      {/* Stats overlay */}
      <div className="absolute top-6 left-6 bg-white/95 backdrop-blur p-4 rounded-lg shadow-lg z-[1000] min-w-[200px]">
        <h3 className="font-bold text-lg mb-3">Live Stats</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Active Projects:</span>
            <span className="font-bold">{filteredProjects.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Deployed:</span>
            <span className="font-bold">
              {filteredProjects.reduce((sum, p) => sum + p.amount, 0).toLocaleString()} XRP
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Success Rate:</span>
            <span className="font-bold text-green-600">
              {Math.round((filteredProjects.filter(p => p.status === 'FUNDED').length / filteredProjects.length) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Project Popup Component
const ProjectPopup: React.FC<{ project: Project }> = ({ project }) => {
  const getStatusBadge = () => {
    const badges = {
      FUNDED: 'bg-green-100 text-green-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      PENDING: 'bg-blue-100 text-blue-800',
      ALERT: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return badges[project.status];
  };

  return (
    <div className="min-w-[300px]">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-lg pr-2">{project.title}</h3>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge()}`}>
          {project.status}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getCategoryIcon(project.category)}</span>
          <span className="text-gray-600">{project.category}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-600">📍</span>
          <span>{project.location.region}, {project.location.country}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-600">💰</span>
          <span className="font-bold">{project.amount.toLocaleString()} XRP</span>
        </div>

        <div className="border-t pt-2 mt-2">
          <div className="text-xs text-gray-600 mb-1">Validation Progress:</div>
          <div className="flex items-center gap-2 text-xs">
            <span>📸 Photos: {project.conditions.photosReceived}/{project.conditions.photosRequired}</span>
          </div>
          <div className="flex items-center gap-2 text-xs mt-1">
            <span>✅ Validators: {project.conditions.validatorsApproved}/{project.conditions.validatorsRequired}</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${(project.conditions.validatorsApproved / project.conditions.validatorsRequired) * 100}%`
              }}
            />
          </div>
        </div>

        {project.daysRemaining !== undefined && project.daysRemaining > 0 && (
          <div className="text-xs text-gray-600">
            ⏱️ {project.daysRemaining} days remaining
          </div>
        )}

        {project.daysOverdue !== undefined && project.daysOverdue > 0 && (
          <div className="text-xs text-red-600 font-bold">
            ⚠️ {project.daysOverdue} days overdue
          </div>
        )}

        {project.validationProofs && project.validationProofs.length > 0 && (
          <div className="border-t pt-2 mt-2">
            <div className="text-xs text-gray-600 mb-1">Validators:</div>
            {project.validationProofs.map((proof, idx) => (
              <div key={idx} className="text-xs flex items-center gap-1">
                ✅ {proof.validatorName} (Rep: {proof.reputation})
              </div>
            ))}
          </div>
        )}

        {project.escrowHash && (
          <a
            href={`https://testnet.xrpl.org/transactions/${project.escrowHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs text-blue-600 hover:underline mt-2"
          >
            🔗 View on XRPL Explorer →
          </a>
        )}
      </div>
    </div>
  );
};

// Helper to get category icon
function getCategoryIcon(category: Project['category']): string {
  switch (category) {
    case 'Water':
      return '💧';
    case 'Education':
      return '📚';
    case 'Health':
      return '❤️';
    case 'Climate':
      return '🌱';
    case 'Infrastructure':
      return '🏗️';
    default:
      return '📍';
  }
}

export default XRPLImpactMap;

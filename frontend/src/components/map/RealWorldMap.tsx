/**
 * Real World Map - Google Maps Style with Leaflet
 *
 * WORKING version without React Context bugs
 */

import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
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

interface RealWorldMapProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
  filters?: {
    category?: string;
    status?: string;
    minAmount?: number;
    maxAmount?: number;
  };
}

export const RealWorldMap: React.FC<RealWorldMapProps> = ({ projects, onProjectClick, filters }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);

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

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map
    const map = L.map(mapContainerRef.current).setView([20, 0], 2);
    mapRef.current = map;

    // Add tile layer (OpenStreetMap - like Google Maps)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    filteredProjects.forEach(project => {
      const marker = createMarker(project);
      marker.addTo(mapRef.current!);
      markersRef.current.push(marker);
    });
  }, [filteredProjects]);

  const createMarker = (project: Project): L.Marker => {
    const icon = createCustomIcon(project);
    const marker = L.marker([project.location.lat, project.location.lng], { icon });

    // Create popup content
    const popupContent = createPopupContent(project);
    marker.bindPopup(popupContent, {
      maxWidth: 350,
      className: 'custom-leaflet-popup'
    });

    marker.on('click', () => {
      if (onProjectClick) {
        onProjectClick(project);
      }
    });

    return marker;
  };

  const createCustomIcon = (project: Project): L.DivIcon => {
    const statusColors = {
      FUNDED: '#10b981',
      IN_PROGRESS: '#f59e0b',
      PENDING: '#3b82f6',
      ALERT: '#ef4444',
      CANCELLED: '#6b7280',
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
      className: 'custom-div-icon',
      html: `
        <div style="position: relative;">
          <div style="
            position: absolute;
            top: -20px;
            left: -20px;
            width: 40px;
            height: 40px;
            background: ${color};
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            animation: ${project.status === 'IN_PROGRESS' || project.status === 'ALERT' ? 'pulse 2s infinite' : 'none'};
          ">
            ${icon}
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  const createPopupContent = (project: Project): string => {
    const statusBadges = {
      FUNDED: 'background: #10b981; color: white',
      IN_PROGRESS: 'background: #f59e0b; color: white',
      PENDING: 'background: #3b82f6; color: white',
      ALERT: 'background: #ef4444; color: white',
      CANCELLED: 'background: #6b7280; color: white',
    };

    const categoryIcons = {
      Water: '💧',
      Education: '📚',
      Health: '❤️',
      Climate: '🌱',
      Infrastructure: '🏗️',
    };

    const progress = (project.conditions.validatorsApproved / project.conditions.validatorsRequired) * 100;

    return `
      <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 280px;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
          <h3 style="font-size: 16px; font-weight: bold; margin: 0; padding-right: 8px;">${project.title}</h3>
          <span style="
            ${statusBadges[project.status]};
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            white-space: nowrap;
          ">${project.status}</span>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 20px;">${categoryIcons[project.category]}</span>
          <span style="color: #6b7280; font-size: 14px;">${project.category}</span>
        </div>

        <div style="color: #374151; font-size: 14px; margin-bottom: 6px;">
          📍 ${project.location.region}, ${project.location.country}
        </div>

        <div style="color: #374151; font-size: 14px; margin-bottom: 12px;">
          💰 <strong>${project.amount.toLocaleString()} XRP</strong>
        </div>

        <div style="border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 8px;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 6px;">Validation Progress:</div>
          <div style="font-size: 12px; color: #374151; margin-bottom: 4px;">
            📸 Photos: ${project.conditions.photosReceived}/${project.conditions.photosRequired}
          </div>
          <div style="font-size: 12px; color: #374151; margin-bottom: 6px;">
            ✅ Validators: ${project.conditions.validatorsApproved}/${project.conditions.validatorsRequired}
          </div>
          <div style="background: #e5e7eb; border-radius: 999px; height: 6px; overflow: hidden;">
            <div style="background: #3b82f6; height: 100%; width: ${progress}%; transition: width 0.3s;"></div>
          </div>
        </div>

        ${project.daysRemaining ? `
          <div style="font-size: 12px; color: #6b7280; margin-top: 8px;">
            ⏱️ ${project.daysRemaining} days remaining
          </div>
        ` : ''}

        ${project.daysOverdue ? `
          <div style="font-size: 12px; color: #ef4444; font-weight: bold; margin-top: 8px;">
            ⚠️ ${project.daysOverdue} days overdue
          </div>
        ` : ''}

        ${project.escrowHash ? `
          <a href="https://testnet.xrpl.org/transactions/${project.escrowHash}"
             target="_blank"
             style="display: block; font-size: 12px; color: #3b82f6; margin-top: 8px; text-decoration: none;">
            🔗 View on XRPL Explorer →
          </a>
        ` : ''}
      </div>
    `;
  };

  const stats = {
    totalProjects: filteredProjects.length,
    totalDeployed: filteredProjects.reduce((sum, p) => sum + p.amount, 0),
    successRate: filteredProjects.length > 0
      ? Math.round((filteredProjects.filter(p => p.status === 'FUNDED').length / filteredProjects.length) * 100)
      : 0,
  };

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full rounded-lg shadow-xl" />

      {/* Legend */}
      <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur p-4 rounded-xl shadow-2xl z-[1000] border border-gray-200">
        <h3 className="font-bold text-sm mb-3">Project Status</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-white shadow"></div>
            <span>Pending Validation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow"></div>
            <span>Funded & Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow"></div>
            <span>Alert / Failed</span>
          </div>
        </div>
      </div>

      {/* Stats overlay */}
      <div className="absolute top-6 left-6 bg-white/95 backdrop-blur p-4 rounded-xl shadow-2xl z-[1000] border border-gray-200 min-w-[220px]">
        <h3 className="font-bold text-lg mb-3 text-gray-900">Live Stats</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Active Projects:</span>
            <span className="font-bold text-gray-900">{stats.totalProjects}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Deployed:</span>
            <span className="font-bold text-gray-900">
              {stats.totalDeployed.toLocaleString()} XRP
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Success Rate:</span>
            <span className="font-bold text-green-600">{stats.successRate}%</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        .custom-div-icon {
          background: transparent;
          border: none;
        }
        .custom-leaflet-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 4px;
        }
        .custom-leaflet-popup .leaflet-popup-content {
          margin: 12px 16px;
        }
      `}</style>
    </div>
  );
};

export default RealWorldMap;

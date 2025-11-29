/**
 * Real World Map - Google Maps Style with Leaflet
 *
 * WORKING version without React Context bugs
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

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
  const markerClusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
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
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([20, 0], 2);
    mapRef.current = map;

    // Add beautiful green-themed tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    // Initialize marker cluster group with custom styling
    const markerClusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      removeOutsideVisibleBounds: true,
      iconCreateFunction: function(cluster) {
        const childCount = cluster.getChildCount();
        let c = ' marker-cluster-';
        if (childCount < 10) {
          c += 'small';
        } else if (childCount < 100) {
          c += 'medium';
        } else {
          c += 'large';
        }

        return new L.DivIcon({
          html: `
            <div style="
              width: 50px;
              height: 50px;
              background: linear-gradient(135deg, #10b981, #059669);
              border-radius: 50%;
              border: 4px solid #ecfdf5;
              box-shadow: 0 8px 16px rgba(16, 185, 129, 0.4), 0 0 0 4px rgba(16, 185, 129, 0.1);
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              color: white;
              font-size: 16px;
              animation: cluster-pulse 2s infinite;
            ">
              ${childCount}
            </div>
          `,
          className: 'custom-cluster-icon',
          iconSize: new L.Point(50, 50)
        });
      }
    });

    markerClusterGroupRef.current = markerClusterGroup;
    map.addLayer(markerClusterGroup);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!mapRef.current || !markerClusterGroupRef.current) return;

    // Clear existing markers from cluster group
    markerClusterGroupRef.current.clearLayers();
    markersRef.current = [];

    // Add new markers to cluster group
    filteredProjects.forEach(project => {
      const marker = createMarker(project);
      markerClusterGroupRef.current!.addLayer(marker);
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
      FUNDED: { main: '#10b981', light: '#d1fae5', glow: 'rgba(16, 185, 129, 0.6)' },
      IN_PROGRESS: { main: '#f59e0b', light: '#fef3c7', glow: 'rgba(245, 158, 11, 0.6)' },
      PENDING: { main: '#84cc16', light: '#ecfccb', glow: 'rgba(132, 204, 22, 0.6)' },
      ALERT: { main: '#ef4444', light: '#fee2e2', glow: 'rgba(239, 68, 68, 0.6)' },
      CANCELLED: { main: '#6b7280', light: '#f3f4f6', glow: 'rgba(107, 114, 128, 0.6)' },
    };

    const categoryIcons = {
      Water: '💧',
      Education: '📚',
      Health: '❤️',
      Climate: '🌱',
      Infrastructure: '🏗️',
    };

    const colors = statusColors[project.status];
    const icon = categoryIcons[project.category];
    const isPulsing = project.status === 'IN_PROGRESS' || project.status === 'ALERT';

    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="position: relative; width: 60px; height: 80px;">
          <!-- Pin shadow -->
          <div style="
            position: absolute;
            bottom: 2px;
            left: 50%;
            transform: translateX(-50%);
            width: 20px;
            height: 8px;
            background: radial-gradient(ellipse, rgba(0,0,0,0.3), transparent);
            border-radius: 50%;
          "></div>

          <!-- Pin body -->
          <div style="
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 44px;
            height: 44px;
            background: linear-gradient(135deg, ${colors.main}, ${colors.main}dd);
            border-radius: 50% 50% 50% 0;
            transform: translateX(-50%) rotate(-45deg);
            border: 4px solid white;
            box-shadow:
              0 4px 12px ${colors.glow},
              0 2px 6px rgba(0,0,0,0.2),
              inset 0 -2px 4px rgba(0,0,0,0.1);
            ${isPulsing ? 'animation: pin-pulse 1.5s infinite;' : ''}
          ">
            <!-- Pin icon -->
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(45deg);
              font-size: 22px;
              filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
            ">
              ${icon}
            </div>
          </div>

          <!-- Glow effect -->
          <div style="
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 60px;
            background: radial-gradient(circle, ${colors.glow}, transparent 70%);
            border-radius: 50%;
            ${isPulsing ? 'animation: glow-pulse 1.5s infinite;' : 'opacity: 0.4;'}
            pointer-events: none;
          "></div>
        </div>
      `,
      iconSize: [60, 80],
      iconAnchor: [30, 76],
      popupAnchor: [0, -76],
    });
  };

  const createPopupContent = (project: Project): string => {
    const statusBadges = {
      FUNDED: 'background: linear-gradient(135deg, #10b981, #059669); color: white; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);',
      IN_PROGRESS: 'background: linear-gradient(135deg, #f59e0b, #d97706); color: white; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);',
      PENDING: 'background: linear-gradient(135deg, #84cc16, #65a30d); color: white; box-shadow: 0 2px 8px rgba(132, 204, 22, 0.4);',
      ALERT: 'background: linear-gradient(135deg, #ef4444, #dc2626); color: white; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);',
      CANCELLED: 'background: linear-gradient(135deg, #6b7280, #4b5563); color: white; box-shadow: 0 2px 8px rgba(107, 114, 128, 0.4);',
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
      <div style="
        font-family: system-ui, -apple-system, sans-serif;
        min-width: 320px;
        background: linear-gradient(to bottom, #ffffff, #f0fdf4);
      ">
        <div style="
          background: linear-gradient(135deg, #10b981, #059669);
          padding: 16px;
          margin: -12px -16px 16px -16px;
          border-radius: 12px 12px 0 0;
        ">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
            <h3 style="font-size: 18px; font-weight: bold; margin: 0; padding-right: 8px; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
              ${project.title}
            </h3>
            <span style="
              ${statusBadges[project.status]}
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 700;
              white-space: nowrap;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            ">${project.status.replace('_', ' ')}</span>
          </div>
          <div style="color: #d1fae5; font-size: 13px; display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 24px;">${categoryIcons[project.category]}</span>
            <span>${project.category}</span>
          </div>
        </div>

        <div style="padding: 0 4px;">
          <div style="
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
            padding: 12px;
            background: linear-gradient(135deg, #ecfdf5, #d1fae5);
            border-radius: 12px;
            border: 2px solid #6ee7b7;
          ">
            <div style="font-size: 32px;">💰</div>
            <div>
              <div style="font-size: 24px; font-weight: bold; color: #059669;">
                ${project.amount.toLocaleString()} XRP
              </div>
              <div style="font-size: 12px; color: #047857;">
                📍 ${project.location.region}, ${project.location.country}
              </div>
            </div>
          </div>

          <div style="
            background: white;
            border: 2px solid #d1fae5;
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 12px;
          ">
            <div style="font-size: 13px; color: #047857; font-weight: 600; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 16px;">🎯</span>
              Validation Progress
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <div style="text-align: center; flex: 1;">
                <div style="font-size: 24px; font-weight: bold; color: #10b981;">
                  ${project.conditions.photosReceived}/${project.conditions.photosRequired}
                </div>
                <div style="font-size: 11px; color: #6b7280;">📸 Photos</div>
              </div>
              <div style="text-align: center; flex: 1; border-left: 2px solid #d1fae5; border-right: 2px solid #d1fae5;">
                <div style="font-size: 24px; font-weight: bold; color: #10b981;">
                  ${project.conditions.validatorsApproved}/${project.conditions.validatorsRequired}
                </div>
                <div style="font-size: 11px; color: #6b7280;">✅ Validators</div>
              </div>
              <div style="text-align: center; flex: 1;">
                <div style="font-size: 24px; font-weight: bold; color: #10b981;">
                  ${Math.round(progress)}%
                </div>
                <div style="font-size: 11px; color: #6b7280;">🎉 Complete</div>
              </div>
            </div>
            <div style="background: #d1fae5; border-radius: 999px; height: 8px; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">
              <div style="
                background: linear-gradient(90deg, #10b981, #059669);
                height: 100%;
                width: ${progress}%;
                transition: width 0.5s ease;
                box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
              "></div>
            </div>
          </div>

          ${project.daysRemaining ? `
            <div style="
              font-size: 12px;
              color: #047857;
              background: linear-gradient(135deg, #ecfdf5, #d1fae5);
              padding: 8px 12px;
              border-radius: 8px;
              margin-bottom: 8px;
              display: flex;
              align-items: center;
              gap: 6px;
            ">
              <span style="font-size: 16px;">⏱️</span>
              <strong>${project.daysRemaining} days remaining</strong>
            </div>
          ` : ''}

          ${project.daysOverdue ? `
            <div style="
              font-size: 12px;
              color: #dc2626;
              background: linear-gradient(135deg, #fee2e2, #fecaca);
              padding: 8px 12px;
              border-radius: 8px;
              margin-bottom: 8px;
              font-weight: bold;
              display: flex;
              align-items: center;
              gap: 6px;
              border: 2px solid #fca5a5;
            ">
              <span style="font-size: 16px;">⚠️</span>
              ${project.daysOverdue} days overdue
            </div>
          ` : ''}

          ${project.escrowHash ? `
            <a href="https://testnet.xrpl.org/transactions/${project.escrowHash}"
               target="_blank"
               style="
                 display: flex;
                 align-items: center;
                 justify-content: center;
                 gap: 6px;
                 font-size: 13px;
                 color: white;
                 background: linear-gradient(135deg, #10b981, #059669);
                 padding: 10px 16px;
                 border-radius: 8px;
                 text-decoration: none;
                 font-weight: 600;
                 box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
                 transition: transform 0.2s;
               "
               onmouseover="this.style.transform='translateY(-2px)'"
               onmouseout="this.style.transform='translateY(0)'">
              🔗 View on XRPL Explorer →
            </a>
          ` : ''}
        </div>
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
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-6 right-6 bg-gradient-to-br from-emerald-50/95 to-teal-50/95 backdrop-blur-xl p-5 rounded-2xl shadow-2xl z-[1000] border-2 border-emerald-200"
      >
        <h3 className="font-bold text-sm mb-4 text-emerald-800 flex items-center gap-2">
          <span className="text-lg">🎯</span>
          Project Status
        </h3>
        <div className="space-y-3 text-xs">
          <motion.div
            className="flex items-center gap-2 p-2 rounded-lg bg-lime-50 border border-lime-200"
            whileHover={{ x: 4, scale: 1.02 }}
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-lime-400 to-lime-600 border-2 border-white shadow-lg"></div>
            <span className="text-emerald-900 font-medium">Pending Validation</span>
          </motion.div>
          <motion.div
            className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200"
            whileHover={{ x: 4, scale: 1.02 }}
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-white shadow-lg"></div>
            <span className="text-emerald-900 font-medium">Funded & Completed</span>
          </motion.div>
          <motion.div
            className="flex items-center gap-2 p-2 rounded-lg bg-yellow-50 border border-yellow-200"
            whileHover={{ x: 4, scale: 1.02 }}
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-white shadow-lg"></div>
            <span className="text-emerald-900 font-medium">In Progress</span>
          </motion.div>
          <motion.div
            className="flex items-center gap-2 p-2 rounded-lg bg-rose-50 border border-rose-200"
            whileHover={{ x: 4, scale: 1.02 }}
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 border-2 border-white shadow-lg"></div>
            <span className="text-emerald-900 font-medium">Alert / Failed</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats overlay */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-6 left-6 bg-gradient-to-br from-emerald-600/95 to-teal-600/95 backdrop-blur-xl p-5 rounded-2xl shadow-2xl z-[1000] border-2 border-emerald-400 min-w-[240px]"
      >
        <h3 className="font-bold text-lg mb-4 text-white flex items-center gap-2">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="text-2xl"
          >
            📊
          </motion.span>
          Live Stats
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center p-2 rounded-lg bg-white/10 backdrop-blur">
            <span className="text-emerald-100 font-medium">Active Projects:</span>
            <motion.span
              className="font-bold text-lime-300 text-lg"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {stats.totalProjects}
            </motion.span>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg bg-white/10 backdrop-blur">
            <span className="text-emerald-100 font-medium">Total Deployed:</span>
            <motion.span
              className="font-bold text-lime-300 text-lg"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            >
              {stats.totalDeployed.toLocaleString()} XRP
            </motion.span>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg bg-white/10 backdrop-blur">
            <span className="text-emerald-100 font-medium">Success Rate:</span>
            <motion.span
              className="font-bold text-lime-300 text-lg"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
            >
              {stats.successRate}%
            </motion.span>
          </div>
        </div>
      </motion.div>

      <style>{`
        /* Pin animations */
        @keyframes pin-pulse {
          0%, 100% {
            transform: translateX(-50%) rotate(-45deg) scale(1);
            box-shadow:
              0 4px 12px rgba(16, 185, 129, 0.6),
              0 2px 6px rgba(0,0,0,0.2),
              inset 0 -2px 4px rgba(0,0,0,0.1);
          }
          50% {
            transform: translateX(-50%) rotate(-45deg) scale(1.1);
            box-shadow:
              0 6px 20px rgba(16, 185, 129, 0.8),
              0 3px 10px rgba(0,0,0,0.3),
              inset 0 -2px 4px rgba(0,0,0,0.1);
          }
        }

        @keyframes glow-pulse {
          0%, 100% {
            opacity: 0.5;
            transform: translateX(-50%) scale(1);
          }
          50% {
            opacity: 0.8;
            transform: translateX(-50%) scale(1.2);
          }
        }

        @keyframes cluster-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 8px 16px rgba(16, 185, 129, 0.4), 0 0 0 4px rgba(16, 185, 129, 0.1);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 12px 24px rgba(16, 185, 129, 0.6), 0 0 0 6px rgba(16, 185, 129, 0.2);
          }
        }

        /* Custom marker styles */
        .custom-div-icon {
          background: transparent;
          border: none;
        }

        /* Popup styles */
        .custom-leaflet-popup .leaflet-popup-content-wrapper {
          border-radius: 16px;
          padding: 0;
          background: linear-gradient(to bottom, #ffffff, #f0fdf4);
          box-shadow: 0 20px 50px rgba(16, 185, 129, 0.3), 0 10px 20px rgba(0, 0, 0, 0.15);
          border: 3px solid #10b981;
          overflow: hidden;
        }

        .custom-leaflet-popup .leaflet-popup-content {
          margin: 0;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .custom-leaflet-popup .leaflet-popup-tip {
          background: #10b981;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
        }

        /* Cluster icon styles */
        .custom-cluster-icon {
          background: transparent;
          border: none;
        }

        .marker-cluster {
          background-clip: padding-box;
          border-radius: 50%;
        }

        .marker-cluster div {
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }

        /* Map container enhancements */
        .leaflet-container {
          font-family: system-ui, -apple-system, sans-serif;
          background: linear-gradient(to bottom, #f0fdfa, #ccfbf1);
        }

        /* Zoom controls styling */
        .leaflet-control-zoom a {
          background: linear-gradient(135deg, #10b981, #059669) !important;
          color: white !important;
          border: 2px solid #ecfdf5 !important;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          transition: all 0.2s ease;
        }

        .leaflet-control-zoom a:hover {
          background: linear-gradient(135deg, #059669, #047857) !important;
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.5);
        }

        /* Attribution styling */
        .leaflet-control-attribution {
          background: rgba(255, 255, 255, 0.8) !important;
          backdrop-filter: blur(10px);
          border-radius: 8px !important;
          border: 1px solid rgba(16, 185, 129, 0.2) !important;
          padding: 4px 8px !important;
          font-size: 11px !important;
        }
      `}</style>
    </div>
  );
};

export default RealWorldMap;

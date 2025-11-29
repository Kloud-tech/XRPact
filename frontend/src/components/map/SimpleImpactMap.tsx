/**
 * Simple Impact Map - No External Dependencies
 *
 * Shows all funded projects with colored pins and interactive popups
 * Color coding:
 * - Yellow: Pending/In Progress validation
 * - Green: Successfully funded
 * - Red: Alert/Failed
 */

import React, { useState, useEffect } from 'react';
import { MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';

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

interface SimpleImpactMapProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
  filters?: {
    category?: string;
    status?: string;
    minAmount?: number;
    maxAmount?: number;
  };
}

export const SimpleImpactMap: React.FC<SimpleImpactMapProps> = ({
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
        return 'bg-green-500 border-green-600';
      case 'ALERT':
      case 'CANCELLED':
        return 'bg-red-500 border-red-600';
      case 'PENDING':
      case 'IN_PROGRESS':
      default:
        return 'bg-yellow-400 border-yellow-500';
    }
  };

  // Get status icon
  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'FUNDED':
        return <CheckCircle className="w-4 h-4" />;
      case 'ALERT':
      case 'CANCELLED':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
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

  // Convert lat/lng to pixel position (simplified projection)
  const projectToPosition = (lat: number, lng: number) => {
    // Simple mercator-like projection
    // World dimensions: 1200px wide, 600px tall
    const x = ((lng + 180) / 360) * 1200;
    const y = ((90 - lat) / 180) * 600;
    return { x, y };
  };

  return (
    <div className="w-full h-full relative bg-gradient-to-b from-blue-100 to-blue-50 rounded-lg shadow-xl overflow-hidden">
      {/* World Map Background (SVG) */}
      <div className="absolute inset-0 opacity-20">
        <svg viewBox="0 0 1200 600" className="w-full h-full">
          {/* Simple continent shapes */}
          <path d="M 200,150 L 350,120 L 450,180 L 380,280 L 250,250 Z" fill="#34d399" />
          <path d="M 500,200 L 700,180 L 800,280 L 650,350 L 520,300 Z" fill="#34d399" />
          <path d="M 200,350 L 280,320 L 350,400 L 250,450 Z" fill="#34d399" />
          <path d="M 850,200 L 1000,180 L 1050,280 L 900,300 Z" fill="#34d399" />
          <path d="M 100,400 L 250,380 L 300,480 L 150,500 Z" fill="#34d399" />
        </svg>
      </div>

      {/* Project Pins */}
      <div className="absolute inset-0">
        {filteredProjects.map((project) => {
          const pos = projectToPosition(project.location.lat, project.location.lng);
          return (
            <div
              key={project.id}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-full transition-transform hover:scale-110"
              style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
              onClick={() => handleProjectClick(project)}
            >
              {/* Pin */}
              <div className={`w-10 h-10 rounded-full border-3 shadow-lg flex items-center justify-center text-white font-bold ${getPinColor(project.status)}`}>
                <span className="text-xl">{getCategoryIcon(project.category)}</span>
              </div>
              {/* Pulse animation for active projects */}
              {(project.status === 'IN_PROGRESS' || project.status === 'ALERT') && (
                <div className={`absolute inset-0 rounded-full animate-ping ${getPinColor(project.status)} opacity-75`}></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur p-4 rounded-lg shadow-lg z-10">
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
      <div className="absolute top-6 left-6 bg-white/95 backdrop-blur p-4 rounded-lg shadow-lg z-10 min-w-[200px]">
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
              {filteredProjects.length > 0
                ? Math.round((filteredProjects.filter(p => p.status === 'FUNDED').length / filteredProjects.length) * 100)
                : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Selected Project Popup */}
      {selectedProject && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedProject(null)}>
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <ProjectPopup project={selectedProject} onClose={() => setSelectedProject(null)} />
          </div>
        </div>
      )}
    </div>
  );
};

// Project Popup Component
const ProjectPopup: React.FC<{ project: Project; onClose: () => void }> = ({ project, onClose }) => {
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

  return (
    <div className="min-w-[300px]">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-xl pr-2">{project.title}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
        >
          ×
        </button>
      </div>

      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${getStatusBadge()}`}>
        {project.status}
      </span>

      <div className="space-y-3 text-sm">
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
          <span className="font-bold text-lg">{project.amount.toLocaleString()} XRP</span>
        </div>

        <div className="border-t pt-3 mt-3">
          <div className="text-xs text-gray-600 mb-2 font-semibold">Validation Progress:</div>
          <div className="flex items-center gap-2 text-xs mb-1">
            <span>📸 Photos: {project.conditions.photosReceived}/{project.conditions.photosRequired}</span>
          </div>
          <div className="flex items-center gap-2 text-xs mb-2">
            <span>✅ Validators: {project.conditions.validatorsApproved}/{project.conditions.validatorsRequired}</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all"
              style={{
                width: `${(project.conditions.validatorsApproved / project.conditions.validatorsRequired) * 100}%`
              }}
            />
          </div>
        </div>

        {project.daysRemaining !== undefined && project.daysRemaining > 0 && (
          <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
            ⏱️ {project.daysRemaining} days remaining
          </div>
        )}

        {project.daysOverdue !== undefined && project.daysOverdue > 0 && (
          <div className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded">
            ⚠️ {project.daysOverdue} days overdue
          </div>
        )}

        {project.validationProofs && project.validationProofs.length > 0 && (
          <div className="border-t pt-3 mt-3">
            <div className="text-xs text-gray-600 mb-2 font-semibold">Validators:</div>
            {project.validationProofs.map((proof, idx) => (
              <div key={idx} className="text-xs flex items-center gap-1 mb-1">
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
            className="block text-xs text-blue-600 hover:underline mt-3 font-medium"
          >
            🔗 View on XRPL Explorer →
          </a>
        )}
      </div>
    </div>
  );
};

export default SimpleImpactMap;

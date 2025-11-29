/**
 * World Map Component
 *
 * Displays global distribution of donations and impact across regions
 * Shows heatmap-style visualization of donor locations and NGO project sites
 */

import React, { useEffect, useState } from 'react';
import { Globe, Users, Heart, TrendingUp } from 'lucide-react';

interface DonationRegion {
  region: string;
  country: string;
  donations: number;
  donors: number;
  impact: string;
  projects: number;
  color: string;
  intensity: number; // 0-100 scale
}

export const WorldMap: React.FC = () => {
  const [regions, setRegions] = useState<DonationRegion[]>([]);
  const [totalDonations, setTotalDonations] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState<DonationRegion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegionData();
  }, []);

  const fetchRegionData = async () => {
    try {
      setLoading(true);
      // Mock data - represents global distribution
      const mockRegions: DonationRegion[] = [
        {
          region: 'Africa',
          country: 'Multiple Countries',
          donations: 15420,
          donors: 342,
          impact: 'Water wells, schools, healthcare',
          projects: 12,
          color: '#ef4444',
          intensity: 85,
        },
        {
          region: 'Southeast Asia',
          country: 'Philippines, Vietnam, Thailand',
          donations: 12800,
          donors: 298,
          impact: 'Reforestation, education programs',
          projects: 9,
          color: '#f97316',
          intensity: 72,
        },
        {
          region: 'South America',
          country: 'Brazil, Peru, Colombia',
          donations: 10500,
          donors: 210,
          impact: 'Amazon protection, community centers',
          projects: 8,
          color: '#eab308',
          intensity: 58,
        },
        {
          region: 'South Asia',
          country: 'India, Bangladesh, Nepal',
          donations: 11200,
          donors: 267,
          impact: 'Rural development, women empowerment',
          projects: 7,
          color: '#ec4899',
          intensity: 62,
        },
        {
          region: 'Middle East',
          country: 'Lebanon, Yemen, Jordan',
          donations: 8900,
          donors: 184,
          impact: 'Refugee support, education',
          projects: 5,
          color: '#a855f7',
          intensity: 49,
        },
        {
          region: 'Eastern Europe',
          country: 'Ukraine, Moldova, Romania',
          donations: 7650,
          donors: 156,
          impact: 'Post-conflict reconstruction',
          projects: 4,
          color: '#3b82f6',
          intensity: 42,
        },
      ];

      setRegions(mockRegions);
      setTotalDonations(mockRegions.reduce((sum, r) => sum + r.donations, 0));
      setLoading(false);
    } catch (error) {
      console.error('[WorldMap] Error fetching data:', error);
      setLoading(false);
    }
  };

  const getIntensityLevel = (intensity: number) => {
    if (intensity >= 75) return 'Critical';
    if (intensity >= 50) return 'High';
    if (intensity >= 25) return 'Medium';
    return 'Low';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Globe className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading world map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-md p-6 text-white">
        <div className="flex items-center mb-4">
          <Globe className="w-8 h-8 mr-3" />
          <h2 className="text-2xl font-bold">Global Impact Distribution</h2>
        </div>
        <p className="text-blue-100">
          Real-time map of donations and their impact across continents
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Donations</p>
              <p className="text-2xl font-bold text-gray-900">${(totalDonations / 1000).toFixed(1)}K</p>
            </div>
            <Heart className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Donors</p>
              <p className="text-2xl font-bold text-gray-900">{regions.reduce((sum, r) => sum + r.donors, 0)}</p>
            </div>
            <Users className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Regions</p>
              <p className="text-2xl font-bold text-gray-900">{regions.length}</p>
            </div>
            <Globe className="w-8 h-8 text-orange-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{regions.reduce((sum, r) => sum + r.projects, 0)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Interactive Regions */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Regional Breakdown</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {regions.map((region, index) => (
            <div
              key={index}
              onClick={() => setSelectedRegion(region)}
              className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">{region.region}</h4>
                  <p className="text-sm text-gray-600">{region.country}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">${region.donations}</p>
                    <p className="text-xs text-gray-500">{region.donors} donors</p>
                  </div>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: region.color }}
                  >
                    {region.intensity}%
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">
                    Impact Intensity: {getIntensityLevel(region.intensity)}
                  </span>
                  <span className="text-xs font-medium text-gray-500">{region.projects} projects</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${region.intensity}%`,
                      backgroundColor: region.color,
                    }}
                  />
                </div>
              </div>

              {/* Impact Description */}
              <p className="text-sm text-gray-600 italic">{region.impact}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Region Details */}
      {selectedRegion && (
        <div
          className="bg-gradient-to-r rounded-lg shadow-md p-6 text-white"
          style={{
            backgroundImage: `linear-gradient(135deg, ${selectedRegion.color}dd, ${selectedRegion.color}aa)`,
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold">{selectedRegion.region} - Detailed View</h3>
              <p className="text-white text-opacity-90">{selectedRegion.country}</p>
            </div>
            <button
              onClick={() => setSelectedRegion(null)}
              className="text-white text-opacity-70 hover:text-opacity-100 text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-20 rounded p-4">
              <p className="text-white text-opacity-80 text-sm mb-1">Total Donations</p>
              <p className="text-3xl font-bold">${selectedRegion.donations.toLocaleString()}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded p-4">
              <p className="text-white text-opacity-80 text-sm mb-1">Active Donors</p>
              <p className="text-3xl font-bold">{selectedRegion.donors}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded p-4">
              <p className="text-white text-opacity-80 text-sm mb-1">Projects Running</p>
              <p className="text-3xl font-bold">{selectedRegion.projects}</p>
            </div>
          </div>

          <div className="mt-4 bg-white bg-opacity-20 rounded p-4">
            <p className="text-white text-opacity-90">{selectedRegion.impact}</p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg shadow-md p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Impact Intensity Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-500 rounded" />
            <span className="text-sm text-gray-700">Critical (75-100%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-orange-500 rounded" />
            <span className="text-sm text-gray-700">High (50-74%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-yellow-500 rounded" />
            <span className="text-sm text-gray-700">Medium (25-49%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded" />
            <span className="text-sm text-gray-700">Low (0-24%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;

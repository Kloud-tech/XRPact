/**
 * Redistribution Timeline Component
 *
 * Animated timeline showing the history of profit distributions and their impact
 * Real-time updates as new redistributions occur
 */

import React, { useEffect, useState } from 'react';
import { Activity, TrendingUp, Award, Zap } from 'lucide-react';

interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: 'distribution' | 'milestone' | 'project' | 'achievement';
  title: string;
  description: string;
  amount?: number;
  impact: string;
  ngoName?: string;
  icon: React.ReactNode;
  color: string;
}

export const RedistributionTimeline: React.FC = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'distribution' | 'milestone' | 'achievement'>('all');

  useEffect(() => {
    fetchTimelineEvents();
    // Refresh every 30 seconds
    const interval = setInterval(fetchTimelineEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTimelineEvents = async () => {
    try {
      setLoading(true);
      // Mock timeline data
      const mockEvents: TimelineEvent[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          type: 'distribution',
          title: 'Large Distribution Round',
          description: 'Distributed 5,000 XRP to 8 verified NGOs',
          amount: 5000,
          impact: 'Benefited over 10,000 people',
          ngoName: 'Various Partners',
          icon: <TrendingUp className="w-5 h-5" />,
          color: 'green',
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          type: 'achievement',
          title: 'Platinum Tier Reached',
          description: 'First donor achieved Platinum NFT tier',
          impact: '1000+ XRP in total redistributions',
          icon: <Award className="w-5 h-5" />,
          color: 'purple',
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          type: 'milestone',
          title: 'Pool Growth Milestone',
          description: 'Donation pool reached 50,000 XRP',
          amount: 50000,
          impact: 'Record-breaking contribution',
          icon: <Zap className="w-5 h-5" />,
          color: 'yellow',
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
          type: 'distribution',
          title: 'Morning Distribution',
          description: 'Distributed 3,200 XRP to climate projects',
          amount: 3200,
          impact: 'Supported 5 environmental initiatives',
          ngoName: 'Climate Action Network',
          icon: <TrendingUp className="w-5 h-5" />,
          color: 'green',
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          type: 'project',
          title: 'New Project Added',
          description: 'Amazon Reforestation Initiative launched',
          impact: 'Target: 100,000 trees planted',
          ngoName: 'Green Earth Foundation',
          icon: <Activity className="w-5 h-5" />,
          color: 'blue',
        },
        {
          id: '6',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
          type: 'achievement',
          title: 'Gold Tier Milestone',
          description: '500 donors reached Gold NFT status',
          impact: 'Strong community engagement',
          icon: <Award className="w-5 h-5" />,
          color: 'orange',
        },
      ];

      setEvents(mockEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
      setLoading(false);
    } catch (error) {
      console.error('[RedistributionTimeline] Error fetching events:', error);
      setLoading(false);
    }
  };

  const filteredEvents = filter === 'all' ? events : events.filter((e) => e.type === filter);

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; border: string; text: string }> = {
      green: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-600' },
      purple: { bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-600' },
      yellow: { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-600' },
      blue: { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-600' },
      orange: { bg: 'bg-orange-100', border: 'border-orange-500', text: 'text-orange-600' },
      red: { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-600' },
    };
    return colorMap[color] || colorMap.blue;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      distribution: '💰 Distribution',
      milestone: '🎯 Milestone',
      project: '🌱 Project',
      achievement: '🏆 Achievement',
    };
    return labels[type] || type;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      return date.toLocaleDateString();
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'just now';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-md p-6 text-white">
        <div className="flex items-center mb-4">
          <Activity className="w-8 h-8 mr-3" />
          <h2 className="text-2xl font-bold">Distribution Timeline</h2>
        </div>
        <p className="text-purple-100">
          Real-time history of profit distributions and impact milestones
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white rounded-lg shadow-md p-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Events
        </button>
        <button
          onClick={() => setFilter('distribution')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'distribution'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Distributions
        </button>
        <button
          onClick={() => setFilter('milestone')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'milestone'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Milestones
        </button>
        <button
          onClick={() => setFilter('achievement')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'achievement'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Achievements
        </button>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">
            {filter === 'all' ? 'Recent Events' : `${getTypeLabel(filter)}`}
          </h3>
        </div>

        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 opacity-30" />

          {/* Events */}
          <div className="space-y-0">
            {filteredEvents.map((event) => {
              const colors = getColorClasses(event.color);
              return (
                <div
                  key={event.id}
                  className={`p-6 border-l-4 relative group hover:bg-gray-50 transition-colors ${colors.border}`}
                >
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-[18px] top-8 w-8 h-8 rounded-full border-4 border-white shadow-md flex items-center justify-center ${colors.bg}`}
                  >
                    <div className={`text-sm ${colors.text}`}>{event.icon}</div>
                  </div>

                  {/* Event Content */}
                  <div className="ml-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{event.title}</h4>
                        <p className={`text-sm font-medium ${colors.text}`}>
                          {getTypeLabel(event.type)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 font-medium">{formatTime(event.timestamp)}</p>
                        {event.amount && (
                          <p className="text-xl font-bold text-gray-900">{event.amount.toLocaleString()} XRP</p>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 mb-3">{event.description}</p>

                    {/* Impact & NGO */}
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600">Impact:</span>
                        <span className="text-sm text-gray-700">{event.impact}</span>
                      </div>
                      {event.ngoName && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-600">Partner:</span>
                          <span className="text-sm font-semibold text-gray-900">{event.ngoName}</span>
                        </div>
                      )}
                    </div>

                    {/* Badge */}
                    <div className="mt-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${
                          event.color === 'green'
                            ? 'bg-green-500'
                            : event.color === 'purple'
                              ? 'bg-purple-500'
                              : event.color === 'yellow'
                                ? 'bg-yellow-500'
                                : event.color === 'blue'
                                  ? 'bg-blue-500'
                                  : event.color === 'orange'
                                    ? 'bg-orange-500'
                                    : 'bg-gray-500'
                        }`}
                      >
                        {getTypeLabel(event.type)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredEvents.length === 0 && (
            <div className="p-8 text-center">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No {filter !== 'all' ? filter : ''} events found</p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm mb-1">Total Distributions (All Time)</p>
          <p className="text-3xl font-bold text-gray-900">
            {events
              .filter((e) => e.type === 'distribution')
              .reduce((sum, e) => sum + (e.amount || 0), 0)
              .toLocaleString()}{' '}
            XRP
          </p>
          <p className="text-gray-600 text-xs mt-2">
            {events.filter((e) => e.type === 'distribution').length} distributions
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm mb-1">Major Milestones</p>
          <p className="text-3xl font-bold text-gray-900">
            {events.filter((e) => e.type === 'milestone').length}
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Records broken in this season
          </p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <p className="text-gray-600 text-sm mb-1">Community Achievements</p>
          <p className="text-3xl font-bold text-gray-900">
            {events.filter((e) => e.type === 'achievement').length}
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Donor tier upgrades
          </p>
        </div>
      </div>

      {/* Auto-Refresh Indicator */}
      <div className="text-center text-xs text-gray-500 py-2">
        <Activity className="w-3 h-3 inline-block mr-1 animate-pulse" />
        Auto-refreshes every 30 seconds
      </div>
    </div>
  );
};

export default RedistributionTimeline;

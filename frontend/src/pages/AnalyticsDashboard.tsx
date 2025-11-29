/**
 * Analytics Dashboard Page
 *
 * Professional analytics dashboard with Highcharts
 * Shows AMM performance, escrow status, and fund distribution
 */

import React from 'react';
import { AMMPerformanceChart } from '../components/analytics/AMMPerformanceChart';
import { EscrowStatusChart } from '../components/analytics/EscrowStatusChart';
import { ImpactFlowChart } from '../components/analytics/ImpactFlowChart';

export const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            📊 Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time performance metrics and impact visualization
          </p>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">105,234 XRP</div>
              <div className="text-xs text-gray-600">Total Pool Balance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">47</div>
              <div className="text-xs text-gray-600">Active Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">9.8%</div>
              <div className="text-xs text-gray-600">Current APY</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">94%</div>
              <div className="text-xs text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AMM Performance */}
          <div className="lg:col-span-2">
            <AMMPerformanceChart />
          </div>

          {/* Escrow Status */}
          <div>
            <EscrowStatusChart />
          </div>

          {/* Impact Flow */}
          <div>
            <ImpactFlowChart />
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Validators */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              👥 Top Validators
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Amadou Diallo</div>
                  <div className="text-sm text-gray-600">Senegal</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">98</div>
                  <div className="text-xs text-gray-600">Reputation</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Raj Kumar</div>
                  <div className="text-sm text-gray-600">India</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">94</div>
                  <div className="text-xs text-gray-600">Reputation</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Fatou Sow</div>
                  <div className="text-sm text-gray-600">Senegal</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">95</div>
                  <div className="text-xs text-gray-600">Reputation</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              🔔 Recent Activity
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-green-600">✅</span>
                <div>
                  <div>Senegal well funded</div>
                  <div className="text-gray-600 text-xs">2 hours ago</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600">📸</span>
                <div>
                  <div>India school: 3/5 photos received</div>
                  <div className="text-gray-600 text-xs">5 hours ago</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-600">⏳</span>
                <div>
                  <div>Brazil reforestation: 10 days left</div>
                  <div className="text-gray-600 text-xs">1 day ago</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              📈 Monthly Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Fees Collected</span>
                <span className="font-bold">834 XRP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Projects Funded</span>
                <span className="font-bold">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">New Validators</span>
                <span className="font-bold">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Validation Time</span>
                <span className="font-bold">18h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

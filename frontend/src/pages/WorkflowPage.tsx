/**
 * Workflow Page - Complete flow visualization
 *
 * Shows the entire donor-to-impact journey
 */

import React from 'react';
import { WorkflowDiagram } from '../components/workflow/WorkflowDiagram';
import { useNavigate } from 'react-router-dom';
import { Home, Map, BarChart3 } from 'lucide-react';

export const WorkflowPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ⚡ Complete Workflow
              </h1>
              <p className="text-gray-600 mt-1">
                How your donation creates verified impact on XRPL
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                <Home className="w-5 h-5" />
                Home
              </button>
              <button
                onClick={() => navigate('/impact-map')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Map className="w-5 h-5" />
                Impact Map
              </button>
              <button
                onClick={() => navigate('/analytics')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <BarChart3 className="w-5 h-5" />
                Analytics
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-xl p-8 text-white mb-8">
          <h2 className="text-4xl font-bold mb-4">
            The Future of Transparent Philanthropy
          </h2>
          <p className="text-xl text-blue-100 mb-6">
            Every step tracked, every decision automated, every impact proven.
          </p>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/20 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">7</div>
              <div className="text-sm">Steps</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">2</div>
              <div className="text-sm">Outcomes</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm">On-chain</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">0</div>
              <div className="text-sm">Middlemen</div>
            </div>
          </div>
        </div>

        {/* Workflow Diagram */}
        <WorkflowDiagram />

        {/* Technical Details */}
        <div className="mt-8 grid grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              🔬 Technologies Used
            </h3>
            <div className="space-y-3">
              <div>
                <div className="font-semibold text-gray-900">XLS-100 Conditional Escrow</div>
                <div className="text-sm text-gray-600">Smart contracts with multi-condition release</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">XRPL AMM (Automated Market Maker)</div>
                <div className="text-sm text-gray-600">Passive yield generation from liquidity pools</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">XLS-20 NFTs</div>
                <div className="text-sm text-gray-600">Geographic proof of impact with metadata</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">XLS-39 Clawback</div>
                <div className="text-sm text-gray-600">Automatic fund recovery on failure</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">AI Trust Optimizer</div>
                <div className="text-sm text-gray-600">RL-based validator selection (mock)</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              🎯 Key Advantages
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="text-green-600 mr-2">✅</span>
                <div>
                  <div className="font-semibold text-gray-900">Perpetual Funding</div>
                  <div className="text-sm text-gray-600">AMM yield creates infinite runway</div>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 mr-2">✅</span>
                <div>
                  <div className="font-semibold text-gray-900">Zero Fraud Risk</div>
                  <div className="text-sm text-gray-600">Multi-signature + GPS verification</div>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 mr-2">✅</span>
                <div>
                  <div className="font-semibold text-gray-900">Total Transparency</div>
                  <div className="text-sm text-gray-600">Every transaction visible on-chain</div>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 mr-2">✅</span>
                <div>
                  <div className="font-semibold text-gray-900">Local Empowerment</div>
                  <div className="text-sm text-gray-600">Validators earn income from verification</div>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 mr-2">✅</span>
                <div>
                  <div className="font-semibold text-gray-900">Instant Settlement</div>
                  <div className="text-sm text-gray-600">3-5 second XRPL finality</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-xl p-8 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">
            Ready to create verified impact?
          </h3>
          <p className="text-xl text-green-100 mb-6">
            Join the revolution of transparent, efficient, and perpetual philanthropy.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/impact-map')}
              className="px-8 py-4 bg-white text-green-600 rounded-lg font-bold text-lg hover:bg-green-50 transition"
            >
              Fund a Project
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="px-8 py-4 bg-green-600 text-white border-2 border-white rounded-lg font-bold text-lg hover:bg-green-700 transition"
            >
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowPage;

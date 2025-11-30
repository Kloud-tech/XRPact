/**
 * Main App Component - XRPL Impact Map
 * Google Maps de l'Humanitaire
 */

import React from 'react';
import { WorldMap } from './components/impact-map/WorldMap';
import { EmergencyAlert } from './features/emergency/components';
import KYCVerification from './components/KYCVerification';
import XamanWalletConnect from './components/XamanWalletConnect';
import OnChainExplorer from './pages/OnChainExplorer';
import { DonationForm } from './components/forms/DonationForm';
import { ProjectForm } from './components/forms/ProjectForm';
import { WorkflowDiagram } from './components/workflow/WorkflowDiagram';
import { GreenQRCodeDemo } from './components/qr/GreenQRCodeDemo';
import { GreenNGOList } from './components/ngo/GreenNGOList';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Global Emergency Alerts */}
      <EmergencyAlert />

      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">
              🌍 XRPL Impact Map
            </h1>
            <div className="text-sm text-slate-300">
              Le Google Maps de l'Humanitaire
            </div>
          </div>
        </div>
      </header>

      {/* Main World Map */}
      <section id="impact-map-section" className="relative min-h-screen">
        <WorldMap />
      </section>

      {/* Complete Workflow Section */}
      <section id="workflow-section" className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <WorkflowDiagram />
        </div>
      </section>

      {/* Donation and Project Forms Section */}
      <section id="forms-section" className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DonationForm />
            <ProjectForm />
          </div>
        </div>
      </section>

      {/* NGO Directory Section */}
      <section id="ngo-section" className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 py-12">
        <GreenNGOList />
      </section>

      {/* KYC Section */}
      <section id="kyc-section" className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <KYCVerification />
        </div>
      </section>

      {/* Xaman Wallet Section */}
      <section id="xaman-section" className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <XamanWalletConnect />
        </div>
      </section>

      {/* QR Code Generator Section */}
      <section id="qr-section" className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
        <GreenQRCodeDemo />
      </section>

      {/* On-Chain Explorer Section */}
      <section id="onchain-section" className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 py-12">
        <OnChainExplorer />
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About */}
            <div>
              <h3 className="text-lg font-bold mb-4">🌍 XRPL Impact Map</h3>
              <p className="text-gray-400 text-sm">
                Le Google Maps de l'Humanitaire - Transparent, regenerative donations on the XRP Ledger.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-bold mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#impact-map-section" className="hover:text-white transition-colors">Impact Map</a></li>
                <li><a href="#workflow-section" className="hover:text-white transition-colors">Workflow</a></li>
                <li><a href="#forms-section" className="hover:text-white transition-colors">Donate/Project</a></li>
                <li><a href="#ngo-section" className="hover:text-white transition-colors">NGO Partners</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="https://xrpl.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">XRPL Documentation</a></li>
                <li><a href="https://xrpl-hooks.readme.io" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">XRPL Hooks</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-gray-400">
            <p>© 2025 XRPL Impact Map - Built for XRPL Hackathon "Crypto for Good"</p>
            <p className="mt-2">
              Powered by <span className="text-blue-400">XRP Ledger</span> •
              Secured by <span className="text-green-400">Smart Contracts</span> •
              Optimized by <span className="text-purple-400">AI</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;


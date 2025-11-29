/**
 * Main App Component
 *
 * Routes and combines all dashboard components for the XRPL Impact Fund
 */

import React from 'react';
import { EnhancedHero } from './components/hero/EnhancedHero';
import { ModernDashboard } from './components/dashboard/ModernDashboard';
import { EnhancedTransactionFlow } from './components/animations/EnhancedTransactionFlow';
import { PandaMascot } from './components/animations/PandaMascot';
import { FloatingLeaves } from './components/animations/FloatingLeaves';
import { ImpactHero } from './components/hero/ImpactHero';
import { WorkflowDiagram } from './components/workflow/WorkflowDiagram';
import { GreenPoolBalance } from './components/pool/GreenPoolBalance';
import { GreenNGOList } from './components/ngo/GreenNGOList';
import { GreenNFTGallery } from './components/nft/GreenNFTGallery';
import { GreenGovernanceVoting } from './components/governance/GreenGovernanceVoting';
import { GreenClimateImpactMode } from './components/climate/GreenClimateImpactMode';
import { EmergencyAlert } from './features/emergency/components';
import { GreenQRCodeDemo } from './components/qr/GreenQRCodeDemo';
import { SBTDisplay } from './components/SBTDisplay';
import { ImpactNFTDisplay } from './components/ImpactNFTDisplay';
import { DemoFlow } from './components/DemoFlow';
import { WorldMap } from './components/impact-map/WorldMap';
import { RedistributionTimeline } from './components/dashboard/RedistributionTimeline';
import KYCVerification from './components/KYCVerification';
import XamanWalletConnect from './components/XamanWalletConnect';
import OnChainExplorer from './pages/OnChainExplorer';
import { DonationForm } from './components/forms/DonationForm';
import { ProjectForm } from './components/forms/ProjectForm';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950">
      {/* Floating Leaves Background Animation */}
      <FloatingLeaves />

      {/* Panda Mascot - Follows scroll */}
      <PandaMascot />

      {/* Global Emergency Alerts */}
      <EmergencyAlert />

      {/* Enhanced Hero Section - Modern Web3 Charity Design */}
      <EnhancedHero />

      {/* Modern Dashboard - Complete UI with all components */}
      <section id="impact-dashboard-section">
        <ModernDashboard />
      </section>

      {/* Enhanced Transaction Flow */}
      <section className="bg-gradient-to-br from-teal-900 via-emerald-800 to-green-900 py-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <EnhancedTransactionFlow />
        </div>
      </section>

      {/* Impact Hero Section */}
      <ImpactHero />

      {/* Complete Workflow Section */}
      <section id="workflow-section" className="bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <WorkflowDiagram />
        </div>
      </section>

      {/* Pool Statistics Section */}
      <section id="pool-section" className="bg-gradient-to-br from-teal-950 via-emerald-900 to-green-950 py-12">
        <GreenPoolBalance />
      </section>

      {/* Donation and Project Forms Section */}
      <section id="forms-section" className="bg-gradient-to-br from-emerald-900 via-teal-800 to-green-900 py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DonationForm />
            <ProjectForm />
          </div>
        </div>
      </section>

      {/* World Map Section */}
      <section id="world-map-section" className="bg-gradient-to-br from-green-900 via-teal-800 to-emerald-900 py-12 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <WorldMap />
        </div>
      </section>

      {/* Redistribution Timeline Section */}
      <section id="timeline-section" className="bg-gradient-to-br from-emerald-950 via-teal-900 to-green-900 py-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lime-400/5 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <RedistributionTimeline />
        </div>
      </section>

      {/* KYC Section */}
      <section id="kyc-section" className="bg-gradient-to-br from-teal-900 via-green-800 to-emerald-900 py-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <KYCVerification />
        </div>
      </section>

      {/* Xaman Multisig Section */}
      <section id="xaman-section" className="bg-gradient-to-br from-green-950 via-emerald-900 to-teal-950 py-12 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <XamanWalletConnect />
        </div>
      </section>

      {/* SBT (Soulbound Token) Section */}
      <section id="sbt-section" className="bg-gradient-to-br from-emerald-900 via-teal-800 to-green-900 py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl font-bold text-white mb-8 drop-shadow-lg">🎨 Your Impact NFT</h2>
          <SBTDisplay />
        </div>
      </section>

      {/* Demo Flow Section */}
      <section id="demo-section" className="bg-gradient-to-br from-teal-950 via-green-900 to-emerald-950 py-12">
        <DemoFlow />
      </section>

      {/* NGO Directory Section */}
      <section id="ngo-section" className="bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 py-12">
        <GreenNGOList />
      </section>

      {/* NFT Gallery Section */}
      <section id="nft-section" className="bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950 py-12">
        <GreenNFTGallery />
      </section>

      {/* Impact NFT Section */}
      <section id="impact-nft-section" className="bg-gradient-to-br from-teal-900 via-green-800 to-emerald-900 py-12 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="relative z-10">
          <ImpactNFTDisplay autoRefresh={false} />
        </div>
      </section>

      {/* Governance Section */}
      <section id="governance-section" className="bg-gradient-to-br from-green-950 via-emerald-900 to-teal-950 py-12">
        <GreenGovernanceVoting />
      </section>

      {/* Climate Impact Section */}
      <section id="impact-section" className="bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 py-12">
        <GreenClimateImpactMode />
      </section>

      {/* QR Code Generator Section */}
      <section id="qr-section" className="bg-gradient-to-br from-teal-950 via-green-900 to-emerald-950 py-12">
        <GreenQRCodeDemo />
      </section>

      {/* On-Chain Explorer Section */}
      <section id="onchain-section" className="bg-gradient-to-br from-green-900 via-teal-800 to-emerald-900 py-12">
        <OnChainExplorer />
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-emerald-950 via-green-950 to-teal-950 text-white py-12 border-t-2 border-emerald-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <h3 className="text-lg font-bold mb-4">XRPL Impact Fund</h3>
              <p className="text-gray-400 text-sm">
                Transparent, regenerative donations on the XRP Ledger.
                Turn your contribution into a perpetual engine for good.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#workflow-section" className="hover:text-white transition-colors">
                    Complete Workflow
                  </a>
                </li>
                <li>
                  <a href="#pool-section" className="hover:text-white transition-colors">
                    Pool Statistics
                  </a>
                </li>
                <li>
                  <a href="#world-map-section" className="hover:text-white transition-colors">
                    Global Impact Map
                  </a>
                </li>
                <li>
                  <a href="#timeline-section" className="hover:text-white transition-colors">
                    Distribution Timeline
                  </a>
                </li>
                <li>
                  <a href="#kyc-section" className="hover:text-white transition-colors">
                    KYC Verification
                  </a>
                </li>
                <li>
                  <a href="#ngo-section" className="hover:text-white transition-colors">
                    NGO Partners
                  </a>
                </li>
                <li>
                  <a href="#nft-section" className="hover:text-white transition-colors">
                    NFT Gallery
                  </a>
                </li>
                <li>
                  <a href="#governance-section" className="hover:text-white transition-colors">
                    Governance
                  </a>
                </li>
                <li>
                  <a href="#qr-section" className="hover:text-white transition-colors">
                    QR Code Generator
                  </a>
                </li>
                <li>
                  <a href="#onchain-section" className="hover:text-white transition-colors">
                    On-Chain Explorer
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="https://xrpl.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    XRPL Documentation
                  </a>
                </li>
                <li>
                  <a href="https://xrpl-hooks.readme.io" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    XRPL Hooks
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Whitepaper
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API Documentation
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>GitHub</li>
                <li>Discord</li>
                <li>Twitter</li>
                <li>Email</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>
              © 2025 XRPL Impact Fund. Built for XRPL Hackathon "Crypto for Good"
            </p>
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

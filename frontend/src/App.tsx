/**
 * Main App Component
 *
 * Routes and combines all dashboard components for the XRPL Impact Fund
 */

import React from 'react';
import { LandingHero } from './components/hero/LandingHero';
import { ImpactHero } from './components/hero/ImpactHero';
import { PoolBalance } from './components/pool/PoolBalance';
import { NGOList } from './components/ngo/NGOList';
import { NFTGallery } from './components/nft/NFTGallery';
import { GovernanceVoting } from './components/governance/GovernanceVoting';
import { ClimateImpactMode } from './components/climate/ClimateImpactMode';
import { EmergencyAlert } from './features/emergency/components';
import { QRCodeDemo } from './components/qr/QRCodeDemo';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global Emergency Alerts */}
      <EmergencyAlert />

      {/* Landing Hero Section */}
      <LandingHero />

      {/* Impact Hero Section */}
      <ImpactHero />

      {/* Pool Statistics Section */}
      <section id="pool-section" className="bg-white">
        <PoolBalance />
      </section>

      {/* NGO Directory Section */}
      <section id="ngo-section" className="bg-gray-50">
        <NGOList />
      </section>

      {/* NFT Gallery Section */}
      <section id="nft-section" className="bg-white">
        <NFTGallery />
      </section>

      {/* Governance Section */}
      <section id="governance-section" className="bg-gray-50">
        <GovernanceVoting />
      </section>

      {/* Climate Impact Section */}
      <section id="impact-section" className="bg-white">
        <ClimateImpactMode />
      </section>

      {/* QR Code Generator Section */}
      <section id="qr-section" className="bg-gray-50">
        <QRCodeDemo />
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
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
                  <a href="#pool-section" className="hover:text-white transition-colors">
                    Pool Statistics
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

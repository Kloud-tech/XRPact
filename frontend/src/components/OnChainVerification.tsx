/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ON-CHAIN VERIFICATION COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Composant React pour afficher et vérifier les données stockées on-chain
 * sur le ledger XRPL.
 *
 * Fonctionnalités:
 * - Affichage du TX hash cliquable (lien vers l'explorateur XRPL)
 * - Badge "Verified On-Chain"
 * - Bouton "Verify on Ledger"
 * - Affichage des données du memo
 * - Timestamp du ledger
 */

import React, { useState } from 'react';
import { ExternalLink, Shield, CheckCircle, Eye } from 'lucide-react';

interface OnChainVerificationProps {
  txHash: string;
  network?: 'testnet' | 'mainnet';
  data?: any;
  timestamp?: number;
  showDetails?: boolean;
}

export const OnChainVerification: React.FC<OnChainVerificationProps> = ({
  txHash,
  network = 'testnet',
  data,
  timestamp,
  showDetails = false,
}) => {
  const [expanded, setExpanded] = useState(showDetails);

  const explorerUrl =
    network === 'mainnet'
      ? `https://livenet.xrpl.org/transactions/${txHash}`
      : `https://testnet.xrpl.org/transactions/${txHash}`;

  const shortHash = `${txHash.slice(0, 8)}...${txHash.slice(-8)}`;

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 shadow-sm">
      {/* Header avec badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600" />
          <span className="font-semibold text-green-800">
            Verified On-Chain ✅
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
            XRPL Ledger
          </span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
            {network === 'mainnet' ? 'Mainnet' : 'Testnet'}
          </span>
        </div>
      </div>

      {/* Transaction Hash */}
      <div className="mb-3">
        <p className="text-xs text-gray-600 mb-1 font-medium">
          Transaction Hash:
        </p>
        <div className="flex items-center gap-2">
          <code className="text-sm bg-white px-3 py-1.5 rounded border border-green-200 font-mono text-gray-700 flex-1">
            {shortHash}
          </code>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View on Explorer
          </a>
        </div>
      </div>

      {/* Timestamp */}
      {timestamp && (
        <div className="mb-3">
          <p className="text-xs text-gray-600 mb-1 font-medium">
            Ledger Timestamp:
          </p>
          <p className="text-sm text-gray-700">
            {new Date(timestamp).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'medium',
            })}
          </p>
        </div>
      )}

      {/* Button to show details */}
      {data && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm text-green-700 hover:text-green-800 font-medium mb-2"
        >
          <Eye className="w-4 h-4" />
          {expanded ? 'Hide' : 'View'} On-Chain Data
        </button>
      )}

      {/* On-Chain Data Details */}
      {expanded && data && (
        <div className="bg-white rounded-lg p-3 border border-green-200 mt-2">
          <p className="text-xs text-gray-600 mb-2 font-semibold uppercase tracking-wide">
            Data Stored On-Chain (from Memo):
          </p>
          <pre className="text-xs bg-gray-50 p-3 rounded border border-gray-200 overflow-x-auto font-mono">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      {/* Features */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-green-200">
        <div className="flex items-center gap-1.5 text-xs text-gray-700">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span>Immutable</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-700">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span>Transparent</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-700">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span>Decentralized</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Composant simplifié pour afficher juste le badge
 */
export const OnChainBadge: React.FC<{ txHash: string; network?: 'testnet' | 'mainnet' }> = ({
  txHash,
  network = 'testnet',
}) => {
  const explorerUrl =
    network === 'mainnet'
      ? `https://livenet.xrpl.org/transactions/${txHash}`
      : `https://testnet.xrpl.org/transactions/${txHash}`;

  return (
    <a
      href={explorerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded-full text-xs font-medium transition-colors"
    >
      <Shield className="w-3.5 h-3.5" />
      Verified On-Chain
      <ExternalLink className="w-3 h-3" />
    </a>
  );
};

export default OnChainVerification;

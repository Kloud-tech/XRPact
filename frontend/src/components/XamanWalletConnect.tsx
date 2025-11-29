/**
 * XamanWalletConnect Component
 * Multisig wallet integration with Xaman
 */

import React, { useState } from 'react';
import {
  Wallet,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Copy,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

interface MultisigRequest {
  id: string;
  status: 'pending' | 'signed' | 'rejected' | 'executed';
  currentSignatures: number;
  requiredSignatures: number;
  signers: string[];
  pendingSigners: string[];
  expiresAt: string;
}

interface WalletInfo {
  address: string;
  isMultisig: boolean;
  activeTransactions: number;
  signingHistory: number;
}

const XamanWalletConnect: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [showQRCode, setShowQRCode] = useState<boolean>(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [pendingTransactions, setPendingTransactions] = useState<MultisigRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [selectedMultisig, setSelectedMultisig] = useState<string | null>(null);

  // Generate connection QR code
  const handleGenerateQR = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/xrpl/xaman/connect');
      const data = await response.json();

      if (data.success) {
        setQrCodeUrl(data.data.qrcode);
        setShowQRCode(true);
        setSuccessMessage('QR code generated! Scan with Xaman app');

        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.error || 'Failed to generate QR code');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  // Fetch wallet info
  const handleFetchWalletInfo = async () => {
    if (!walletAddress) {
      setError('Please enter wallet address');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Fetch wallet info
      const infoResponse = await fetch(`/api/xrpl/xaman/wallet/${walletAddress}/multisig-info`);
      const infoData = await infoResponse.json();

      if (infoData.success) {
        setWalletInfo(infoData.data);
      } else {
        setError(infoData.error || 'Failed to fetch wallet info');
      }

      // Fetch pending transactions
      const pendingResponse = await fetch(`/api/xrpl/xaman/wallet/${walletAddress}/pending`);
      const pendingData = await pendingResponse.json();

      if (pendingData.success) {
        setPendingTransactions(pendingData.data.transactions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wallet info');
    } finally {
      setLoading(false);
    }
  };

  // Get multisig status
  const handleCheckStatus = async (multisigId: string) => {
    try {
      setError('');

      const response = await fetch(`/api/xrpl/xaman/multisig/${multisigId}/status`);
      const data = await response.json();

      if (data.success) {
        // Update the transaction in the list
        setPendingTransactions(
          pendingTransactions.map((tx) =>
            tx.id === multisigId
              ? {
                  ...tx,
                  status: data.data.status,
                  currentSignatures: data.data.currentSignatures,
                }
              : tx
          )
        );

        setSuccessMessage(`Status updated: ${data.data.status}`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.error || 'Failed to check status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check status');
    }
  };

  // Execute multisig transaction
  const handleExecuteMultisig = async (multisigId: string) => {
    if (!window.confirm('Execute this multisig transaction?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/xrpl/xaman/multisig/${multisigId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(`Transaction executed! Hash: ${data.data.txHash}`);
        setTimeout(() => setSuccessMessage(''), 5000);

        // Refresh pending transactions
        if (walletAddress) {
          handleFetchWalletInfo();
        }
      } else {
        setError(data.error || 'Failed to execute transaction');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Execution failed');
    } finally {
      setLoading(false);
    }
  };

  // Reject multisig transaction
  const handleRejectMultisig = async (multisigId: string) => {
    const reason = prompt('Enter reason for rejection:');
    if (!reason) return;

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/xrpl/xaman/multisig/${multisigId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signer: walletAddress,
          reason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Transaction rejected');
        setTimeout(() => setSuccessMessage(''), 3000);

        // Remove from pending list
        setPendingTransactions(pendingTransactions.filter((tx) => tx.id !== multisigId));
      } else {
        setError(data.error || 'Failed to reject transaction');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rejection failed');
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setSuccessMessage('Address copied!');
      setTimeout(() => setSuccessMessage(''), 2000);
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'executed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'signed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'executed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'signed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="w-8 h-8 text-purple-600" />
          <h2 className="text-3xl font-bold text-gray-900">Xaman Multisig Wallet</h2>
        </div>
        <p className="text-gray-600">Secure multisig transactions with Xaman integration</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Connection Section */}
      <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect Wallet</h3>

        <div className="space-y-4">
          <button
            onClick={handleGenerateQR}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all"
          >
            <QrCode className="w-5 h-5" />
            {loading ? 'Generating...' : 'Generate Connection QR'}
          </button>

          {showQRCode && qrCodeUrl && (
            <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg border-2 border-purple-200">
              <img src={qrCodeUrl} alt="Connection QR Code" className="w-48 h-48 border-2 border-purple-200" />
              <p className="text-sm text-gray-600 text-center">Scan with your Xaman app to connect</p>
            </div>
          )}
        </div>
      </div>

      {/* Wallet Lookup Section */}
      <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet Information</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter your XRPL address (rXXXXX...)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleCopyAddress}
                title="Copy address"
                className="px-3 py-2 text-gray-500 hover:text-gray-700"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>

          <button
            onClick={handleFetchWalletInfo}
            disabled={loading || !walletAddress}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            {loading ? 'Loading...' : 'Fetch Wallet Info'}
          </button>

          {walletInfo && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-blue-200">
              <div>
                <p className="text-xs font-medium text-gray-600">Multisig Status</p>
                <p className="text-lg font-bold text-blue-600">{walletInfo.isMultisig ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Active Transactions</p>
                <p className="text-lg font-bold text-blue-600">{walletInfo.activeTransactions}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Signing History</p>
                <p className="text-lg font-bold text-blue-600">{walletInfo.signingHistory}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Address</p>
                <p className="text-xs font-mono text-blue-600 truncate">{walletInfo.address}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pending Transactions */}
      {pendingTransactions.length > 0 && (
        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Pending Multisig Transactions</h3>
            <span className="ml-auto px-3 py-1 bg-green-200 text-green-800 text-sm font-semibold rounded-full">
              {pendingTransactions.length}
            </span>
          </div>

          <div className="space-y-3">
            {pendingTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => setSelectedMultisig(selectedMultisig === tx.id ? null : tx.id)}
                className="p-4 bg-white rounded-lg border border-green-200 hover:border-green-400 cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-mono text-gray-600 mb-2">ID: {tx.id}</p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(tx.status)}`}>
                        {getStatusIcon(tx.status)}
                        {tx.status}
                      </span>
                      <span className="text-sm font-semibold text-green-700">
                        {tx.currentSignatures}/{tx.requiredSignatures} signatures
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                </div>

                {selectedMultisig === tx.id && (
                  <div className="border-t border-green-200 pt-3 mt-3">
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-600 mb-2">Signers Required</p>
                      <div className="flex flex-wrap gap-2">
                        {tx.signers.map((signer) => (
                          <span
                            key={signer}
                            className={`px-2 py-1 text-xs rounded-full font-mono ${
                              tx.pendingSigners.includes(signer)
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {signer.substring(0, 8)}...
                            {tx.pendingSigners.includes(signer) ? ' (pending)' : ' ✓'}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCheckStatus(tx.id);
                        }}
                        className="flex-1 px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                      >
                        Refresh Status
                      </button>

                      {tx.status === 'signed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExecuteMultisig(tx.id);
                          }}
                          disabled={loading}
                          className="flex-1 px-3 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all"
                        >
                          Execute
                        </button>
                      )}

                      {tx.status === 'pending' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRejectMultisig(tx.id);
                          }}
                          disabled={loading}
                          className="flex-1 px-3 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs font-medium text-blue-600 mb-1">SECURITY</p>
          <p className="text-sm text-blue-900">Multi-signature approval required for transactions</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-xs font-medium text-purple-600 mb-1">APPROVAL</p>
          <p className="text-sm text-purple-900">All signers must approve before execution</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-xs font-medium text-green-600 mb-1">EXPIRY</p>
          <p className="text-sm text-green-900">Requests expire after 24 hours</p>
        </div>
      </div>
    </div>
  );
};

export default XamanWalletConnect;

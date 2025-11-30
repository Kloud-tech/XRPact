/**
 * Donation Status Component
 * 
 * Affiche l'état d'une donation avec son escrow et les photos de validation
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, Clock, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';

interface DonationStatusProps {
  escrowId: string;
}

interface Donation {
  id: string;
  projectName: string;
  amount: number;
  status: 'pending' | 'validated' | 'unlocked' | 'cancelled';
  txHash: string;
  createdAt: string;
  deadline?: string;
  unlockedAt?: string;
  unlockTxHash?: string;
  validationImages: any[];
}

export const DonationStatus: React.FC<DonationStatusProps> = ({ escrowId }) => {
  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDonation();
  }, [escrowId]);

  const loadDonation = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/donations/${escrowId}`);
      if (response.data.success) {
        setDonation(response.data.escrow);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load donation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="bg-red-500/20 border-2 border-red-400/50 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <span className="text-white font-bold">{error || 'Donation not found'}</span>
        </div>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (donation.status) {
      case 'unlocked':
        return <Unlock className="w-8 h-8 text-green-400" />;
      case 'validated':
        return <CheckCircle className="w-8 h-8 text-blue-400" />;
      case 'pending':
        return <Lock className="w-8 h-8 text-yellow-400" />;
      case 'cancelled':
        return <AlertCircle className="w-8 h-8 text-red-400" />;
      default:
        return <Clock className="w-8 h-8 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (donation.status) {
      case 'unlocked':
        return 'from-green-500/20 to-emerald-600/20 border-green-400/50';
      case 'validated':
        return 'from-blue-500/20 to-cyan-600/20 border-blue-400/50';
      case 'pending':
        return 'from-yellow-500/20 to-orange-600/20 border-yellow-400/50';
      case 'cancelled':
        return 'from-red-500/20 to-pink-600/20 border-red-400/50';
      default:
        return 'from-gray-500/20 to-slate-600/20 border-gray-400/50';
    }
  };

  const getStatusText = () => {
    switch (donation.status) {
      case 'unlocked':
        return '✅ Funds Released';
      case 'validated':
        return '🔍 Validated - Awaiting Release';
      case 'pending':
        return '🔒 Locked - Awaiting Photo Validation';
      case 'cancelled':
        return '❌ Cancelled';
      default:
        return 'Unknown Status';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${getStatusColor()} backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-2`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {getStatusIcon()}
          <div>
            <h3 className="text-2xl font-bold text-white">{donation.projectName}</h3>
            <p className="text-emerald-200">{getStatusText()}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-white">{donation.amount} XRP</div>
          <div className="text-sm text-emerald-200">Donation Amount</div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-black/20 rounded-xl p-4">
          <div className="text-sm text-emerald-200 mb-1">Created</div>
          <div className="text-white font-bold">
            {new Date(donation.createdAt).toLocaleDateString()}
          </div>
        </div>
        {donation.deadline && (
          <div className="bg-black/20 rounded-xl p-4">
            <div className="text-sm text-emerald-200 mb-1">Deadline</div>
            <div className="text-white font-bold">
              {new Date(donation.deadline).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>

      {/* Transaction Hashes */}
      <div className="space-y-3">
        <div className="bg-black/20 rounded-xl p-4">
          <div className="text-sm text-emerald-200 mb-1">Creation TX</div>
          <div className="text-white font-mono text-sm break-all">
            {donation.txHash}
          </div>
        </div>

        {donation.unlockTxHash && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-500/20 rounded-xl p-4 border border-green-400/30"
          >
            <div className="text-sm text-green-200 mb-1">✨ Unlock TX</div>
            <div className="text-white font-mono text-sm break-all">
              {donation.unlockTxHash}
            </div>
            {donation.unlockedAt && (
              <div className="text-xs text-green-200 mt-2">
                Released: {new Date(donation.unlockedAt).toLocaleString()}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Validation Images */}
      {donation.validationImages && donation.validationImages.length > 0 && (
        <div className="mt-6 p-4 rounded-2xl bg-cyan-400/10 border border-cyan-400/30">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="w-5 h-5 text-cyan-400" />
            <span className="text-white font-bold">
              Validation Photos ({donation.validationImages.length})
            </span>
          </div>
          <div className="text-sm text-cyan-200">
            {donation.validationImages.length} photo(s) validated
          </div>
        </div>
      )}

      {/* Pending Message */}
      {donation.status === 'pending' && (
        <div className="mt-6 p-4 rounded-2xl bg-yellow-400/10 border border-yellow-400/30">
          <p className="text-sm text-white">
            💡 <span className="font-bold">Waiting for photo validation</span> - Once the project
            submits proof photos and they are validated by AI, your donation will be automatically
            released to the beneficiary.
          </p>
        </div>
      )}
    </motion.div>
  );
};

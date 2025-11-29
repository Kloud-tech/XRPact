/**
 * Donation Form Component
 *
 * Allows users to make donations via GemWallet
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { sendPayment } from '../../lib/gemwallet';
import api from '../../services/api';

interface DonationFormProps {
  poolAddress?: string;
  onSuccess?: (txHash: string) => void;
}

export const DonationForm: React.FC<DonationFormProps> = ({
  poolAddress = 'rXRPLImpactPool',
  onSuccess
}) => {
  const { address, isConnected } = useWallet();
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    const donationAmount = parseFloat(amount);
    if (isNaN(donationAmount) || donationAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Send payment via GemWallet
      const txHash = await sendPayment(poolAddress, amount);

      // Register donation with backend
      await api.post('/deposit', {
        donorAddress: address,
        amount: donationAmount,
        txHash,
      });

      setSuccess(`Donation successful! TX: ${txHash.slice(0, 10)}...`);
      setAmount('');

      if (onSuccess) {
        onSuccess(txHash);
      }
    } catch (err: any) {
      console.error('[DonationForm] Failed:', err);
      setError(err.message || 'Donation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickAmounts = [100, 500, 1000, 5000];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-emerald-800/80 to-teal-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-2 border-emerald-500/30"
    >
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-8 h-8 text-pink-400" />
        <h2 className="text-3xl font-bold text-white">💚 Make a Donation</h2>
      </div>

      <p className="text-emerald-200 mb-6">
        Your donation generates perpetual yield for verified humanitarian projects
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount Input */}
        <div>
          <label className="block text-emerald-200 font-bold mb-2">
            Amount (XRP)
          </label>
          <input
            type="number"
            step="0.01"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount in XRP"
            disabled={!isConnected || isSubmitting}
            className="w-full px-6 py-4 rounded-2xl bg-green-950/50 border-2 border-emerald-500/30 text-white text-xl font-bold placeholder-emerald-400/50 focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all disabled:opacity-50"
          />
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-3">
          {quickAmounts.map((quickAmount) => (
            <motion.button
              key={quickAmount}
              type="button"
              onClick={() => setAmount(quickAmount.toString())}
              disabled={!isConnected || isSubmitting}
              className="px-4 py-3 rounded-xl bg-gradient-to-br from-lime-400/20 to-emerald-500/20 border-2 border-lime-400/30 text-white font-bold hover:bg-lime-400/30 transition-all disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {quickAmount} XRP
            </motion.button>
          ))}
        </div>

        {/* Success Message */}
        {success && (
          <motion.div
            className="flex items-center gap-3 bg-green-500/20 border-2 border-green-400/50 rounded-2xl p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <CheckCircle className="w-6 h-6 text-green-400" />
            <span className="text-white font-bold">{success}</span>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            className="flex items-center gap-3 bg-red-500/20 border-2 border-red-400/50 rounded-2xl p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <AlertCircle className="w-6 h-6 text-red-400" />
            <span className="text-white font-bold">{error}</span>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={!isConnected || isSubmitting || !amount}
          className="w-full px-8 py-5 rounded-2xl bg-gradient-to-r from-lime-400 to-emerald-500 text-white font-black text-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          whileHover={!isSubmitting ? { scale: 1.02 } : {}}
          whileTap={!isSubmitting ? { scale: 0.98 } : {}}
        >
          {isSubmitting ? (
            <>
              <Loader className="w-6 h-6 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Heart className="w-6 h-6" />
              {isConnected ? 'Donate Now' : 'Connect Wallet to Donate'}
            </>
          )}
        </motion.button>
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-cyan-400/10 to-blue-500/10 border border-cyan-400/30">
        <p className="text-sm text-white/80">
          💡 <span className="font-bold">100% of profits</span> generated from your donation
          go to verified humanitarian projects. Your principal remains in the pool forever.
        </p>
      </div>
    </motion.div>
  );
};

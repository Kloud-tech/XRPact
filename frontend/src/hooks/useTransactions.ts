/**
 * useTransactions Hook
 *
 * Fetches and manages transactions from the backend API
 */

import { useState, useEffect } from 'react';
import api from '../services/api';

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  type: 'donation' | 'distribution' | 'yield';
  timestamp: Date;
  hash?: string;
}

export interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useTransactions = (limit: number = 20): UseTransactionsReturn => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/transactions?limit=${limit}`);

      if (response.data.success && response.data.transactions) {
        // Convert timestamps to Date objects
        const txs = response.data.transactions.map((tx: any) => ({
          ...tx,
          timestamp: new Date(tx.timestamp || Date.now()),
        }));
        setTransactions(txs);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('[useTransactions] Failed to fetch transactions:', err);
      setError(err.message || 'Failed to fetch transactions');
      // Set empty array on error
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();

    // Poll for new transactions every 10 seconds
    const interval = setInterval(fetchTransactions, 10000);

    return () => clearInterval(interval);
  }, [limit]);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
  };
};

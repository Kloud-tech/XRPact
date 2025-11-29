/**
 * usePoolData Hook
 *
 * Fetches and manages pool state from the backend API
 */

import { useState, useEffect } from 'react';
import api from '../services/api';

export interface PoolState {
  totalBalance: number;
  totalDonations: number;
  totalProfitsGenerated: number;
  totalDistributed: number;
  donorCount: number;
  lastTradingRun: string | null;
}

export interface UsePoolDataReturn {
  poolData: PoolState | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const usePoolData = (): UsePoolDataReturn => {
  const [poolData, setPoolData] = useState<PoolState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoolData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/pool');

      if (response.data.success && response.data.pool) {
        setPoolData(response.data.pool);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('[usePoolData] Failed to fetch pool data:', err);
      setError(err.message || 'Failed to fetch pool data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoolData();
  }, []);

  return {
    poolData,
    loading,
    error,
    refetch: fetchPoolData,
  };
};

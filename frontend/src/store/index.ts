/**
 * Zustand Store - Global State Management
 *
 * Slices:
 * - pool: Pool balance, stats
 * - donor: Current donor info
 * - ngos: NGO list
 * - ui: UI state (modals, loading)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ============================================================================
// TYPES
// ============================================================================

export interface PoolState {
  totalBalance: number;
  totalDonations: number;
  totalProfitsGenerated: number;
  totalDistributed: number;
  donorCount: number;
  lastTradingRun: string;
  co2Offset: number;
}

export interface DonorInfo {
  address: string;
  totalDonated: number;
  xp: number;
  level: number;
  nftTokenId?: string;
  ditTokenId?: string;
  donationCount: number;
  firstDonationDate: string;
  lastDonationDate: string;
}

export interface NGO {
  id: string;
  name: string;
  walletAddress: string;
  category: string;
  impactScore: number;
  weight: number;
  totalReceived: number;
  verified: boolean;
  certifications: string[];
  website?: string;
  description?: string;
}

export interface DonationStory {
  id: string;
  ngoId: string;
  ngoName: string;
  amount: number;
  txHash: string;
  timestamp: string;
  projectTitle?: string;
  projectDescription?: string;
  impactDescription?: string;
}

// ============================================================================
// STORE
// ============================================================================

interface AppState {
  // Pool State
  pool: PoolState | null;
  setPool: (pool: PoolState) => void;
  fetchPool: () => Promise<void>;

  // Donor State
  donor: DonorInfo | null;
  setDonor: (donor: DonorInfo | null) => void;
  fetchDonor: (address: string) => Promise<void>;

  // NGOs State
  ngos: NGO[];
  setNgos: (ngos: NGO[]) => void;
  fetchNgos: () => Promise<void>;

  // Donation Stories
  stories: DonationStory[];
  setStories: (stories: DonationStory[]) => void;
  addStory: (story: DonationStory) => void;

  // UI State
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  showDonationModal: boolean;
  setShowDonationModal: (show: boolean) => void;
  climateMode: boolean;
  setClimateMode: (enabled: boolean) => void;

  // Actions
  donate: (amount: number, address: string) => Promise<boolean>;
  simulateProfit: () => Promise<void>;
}

export const useStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial State
      pool: null,
      donor: null,
      ngos: [],
      stories: [],
      isLoading: false,
      error: null,
      showDonationModal: false,
      climateMode: true, // Default: Climate mode enabled

      // Pool Actions
      setPool: (pool) => set({ pool }),

      fetchPool: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch('http://localhost:3000/api/xrpl/pool');
          const data = await response.json();

          if (data.success) {
            set({ pool: data.pool, isLoading: false });
          } else {
            set({ error: 'Failed to fetch pool data', isLoading: false });
          }
        } catch (error) {
          set({ error: 'Network error', isLoading: false });
          console.error('fetchPool error:', error);
        }
      },

      // Donor Actions
      setDonor: (donor) => set({ donor }),

      fetchDonor: async (address: string) => {
        try {
          const response = await fetch(`http://localhost:3000/api/xrpl/donor/${address}`);
          const data = await response.json();

          if (data.success) {
            set({ donor: data.donor });
          } else {
            set({ donor: null });
          }
        } catch (error) {
          console.error('fetchDonor error:', error);
          set({ donor: null });
        }
      },

      // NGOs Actions
      setNgos: (ngos) => set({ ngos }),

      fetchNgos: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch('http://localhost:3000/api/xrpl/ngos');
          const data = await response.json();

          if (data.success) {
            set({ ngos: data.ngos, isLoading: false });
          } else {
            set({ error: 'Failed to fetch NGOs', isLoading: false });
          }
        } catch (error) {
          set({ error: 'Network error', isLoading: false });
          console.error('fetchNgos error:', error);
        }
      },

      // Donation Stories
      setStories: (stories) => set({ stories }),

      addStory: (story) =>
        set((state) => ({
          stories: [story, ...state.stories].slice(0, 20), // Keep last 20
        })),

      // UI Actions
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setShowDonationModal: (showDonationModal) => set({ showDonationModal }),
      setClimateMode: (climateMode) => set({ climateMode }),

      // Donate Action
      donate: async (amount: number, address: string) => {
        try {
          set({ isLoading: true, error: null });

          const response = await fetch('http://localhost:3000/api/xrpl/deposit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              donorAddress: address,
              amount,
            }),
          });

          const data = await response.json();

          if (data.success) {
            // Refresh pool and donor data
            await get().fetchPool();
            await get().fetchDonor(address);

            set({ isLoading: false, showDonationModal: false });
            return true;
          } else {
            set({ error: data.message || 'Donation failed', isLoading: false });
            return false;
          }
        } catch (error) {
          set({ error: 'Network error', isLoading: false });
          console.error('donate error:', error);
          return false;
        }
      },

      // Simulate Profit
      simulateProfit: async () => {
        try {
          const response = await fetch('http://localhost:3000/api/xrpl/simulate-profit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profitPercentage: 0.67 }),
          });

          const data = await response.json();

          if (data.success) {
            await get().fetchPool();
          }
        } catch (error) {
          console.error('simulateProfit error:', error);
        }
      },
    }),
    { name: 'xrpl-impact-store' }
  )
);

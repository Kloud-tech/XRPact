/**
 * Hook to fetch projects data from backend
 */

import { useState, useEffect } from 'react';
import api from '../services/api';

export interface Project {
  id: string;
  title: string;
  category: string;
  location: {
    lat: number;
    lng: number;
    country: string;
    region: string;
  };
  amount: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'FUNDED' | 'ALERT';
  conditions: {
    photosRequired: number;
    photosReceived: number;
    validatorsRequired: number;
    validatorsApproved: number;
    deadline: Date;
  };
  validationProofs?: Array<{
    validatorName: string;
    photoUrl: string;
    reputation: number;
  }>;
  daysRemaining?: number;
  daysOverdue?: number;
  escrowHash?: string;
}

interface UseProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  countries: string[];
}

export const useProjects = (): UseProjectsReturn => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/projects');

      if (response.data.success && response.data.projects) {
        // Transform backend data to frontend format
        const transformedProjects = response.data.projects.map((p: any) => ({
          id: p.id,
          title: p.title,
          category: p.category,
          location: p.location,
          amount: p.amount,
          status: p.status,
          conditions: {
            ...p.conditions,
            deadline: new Date(p.conditions.deadline),
          },
          validationProofs: p.validationProofs || [],
          daysRemaining: p.daysRemaining,
          daysOverdue: p.daysOverdue,
          escrowHash: p.escrowHash,
        }));

        setProjects(transformedProjects);
      }
    } catch (err: any) {
      console.error('[useProjects] Failed to fetch projects:', err);
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Extract unique countries from projects
  const countries = Array.from(new Set(projects.map(p => p.location.country))).sort();

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    countries,
  };
};

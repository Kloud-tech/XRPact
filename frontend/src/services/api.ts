/**
 * API Service
 *
 * Handles all API requests to the backend
 */

import axios from 'axios';
import { Project } from '../components/map/RealWorldMap';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ProjectsResponse {
  success: boolean;
  total: number;
  projects: Project[];
}

export interface ProjectResponse {
  success: boolean;
  project: Project;
}

export interface StatsResponse {
  success: boolean;
  stats: {
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    totalAmount: number;
    totalDeployed: number;
  };
}

/**
 * Fetch all projects
 */
export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const response = await api.get<ProjectsResponse>('/projects');
    return response.data.projects;
  } catch (error) {
    console.error('[API] Failed to fetch projects:', error);
    throw error;
  }
};

/**
 * Fetch single project by ID
 */
export const fetchProject = async (id: string): Promise<Project> => {
  try {
    const response = await api.get<ProjectResponse>(`/projects/${id}`);
    return response.data.project;
  } catch (error) {
    console.error(`[API] Failed to fetch project ${id}:`, error);
    throw error;
  }
};

/**
 * Fetch projects statistics
 */
export const fetchProjectsStats = async () => {
  try {
    const response = await api.get<StatsResponse>('/projects/stats');
    return response.data.stats;
  } catch (error) {
    console.error('[API] Failed to fetch stats:', error);
    throw error;
  }
};

/**
 * Create a new project
 */
export const createProject = async (projectData: Partial<Project>): Promise<Project> => {
  try {
    const response = await api.post<ProjectResponse>('/projects', projectData);
    return response.data.project;
  } catch (error) {
    console.error('[API] Failed to create project:', error);
    throw error;
  }
};

/**
 * Add validation proof to a project
 */
export const addValidationProof = async (
  projectId: string,
  proof: {
    validatorName: string;
    photoUrl: string;
    reputation: number;
  }
): Promise<Project> => {
  try {
    const response = await api.post<ProjectResponse>(`/projects/${projectId}/validate`, proof);
    return response.data.project;
  } catch (error) {
    console.error(`[API] Failed to add validation to project ${projectId}:`, error);
    throw error;
  }
};

/**
 * Create a donation with escrow
 */
export const createDonation = async (donationData: {
  donorAddress: string;
  amount: number;
  txHash: string;
  beneficiaryAddress: string;
  projectId: string;
  projectName: string;
  projectDescription?: string;
  deadlineDays?: number;
}) => {
  try {
    const response = await api.post('/donations/create', donationData);
    return response.data;
  } catch (error) {
    console.error('[API] Failed to create donation:', error);
    throw error;
  }
};

export default api;

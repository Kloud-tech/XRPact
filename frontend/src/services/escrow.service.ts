/**
 * Escrow API Service
 * 
 * Handles all API calls related to smart escrows
 */

import api from './api';

export interface EscrowConditions {
    photosRequired: number;
    photosReceived: number;
    validatorsRequired: number;
    validatorsApproved: number;
    deadline: string;
    geoLocation?: {
        lat: number;
        lng: number;
        radius: number;
    };
}

export interface Project {
    id: string;
    title: string;
    category: 'Water' | 'Education' | 'Health' | 'Climate' | 'Infrastructure';
    location: {
        lat: number;
        lng: number;
        country: string;
        region: string;
    };
    amount: number;
    status: 'PENDING' | 'IN_PROGRESS' | 'FUNDED' | 'ALERT' | 'CANCELLED';
    escrowSequence?: number;
    escrowHash?: string;
    conditions: EscrowConditions;
    validators: string[];
    createdAt: string;
    fundedAt?: string;
}

export interface CreateEscrowRequest {
    donorSeed: string;
    amount: number;
    beneficiaryAddress: string;
    projectId: string;
    projectName: string;
    projectDescription?: string;
    deadlineDays?: number;
}

export interface EscrowResponse {
    escrowId: string;
    projectId: string;
    projectName: string;
    projectDescription?: string;
    ownerAddress: string;
    sequence: number;
    txHash: string;
    amount: number;
    amountXRP: number;
    beneficiaryAddress: string;
    deadline: number;
    status: 'pending' | 'validating' | 'approved' | 'rejected' | 'unlocked' | 'cancelled';
    createdAt: string;
    validationPhotos?: Array<{
        url: string;
        uploadedAt: string;
    }>;
    aiValidationScore?: number;
    aiValidationDate?: string;
    unlockTxHash?: string;
    unlockedAt?: string;
}

class EscrowService {
    /**
     * Create a new escrow for a project donation
     */
    async createEscrow(data: CreateEscrowRequest): Promise<EscrowResponse> {
        const response = await api.post('/escrows', data);
        return response.data.escrow;
    }

    /**
     * Get escrow details by ID
     */
    async getEscrow(escrowId: string): Promise<EscrowResponse> {
        const response = await api.get(`/escrows/${escrowId}`);
        return response.data;
    }

    /**
     * List all escrows with filters
     */
    async listEscrows(filters?: {
        projectId?: string;
        ownerAddress?: string;
        beneficiaryAddress?: string;
        status?: string;
        limit?: number;
        skip?: number;
    }): Promise<{ escrows: EscrowResponse[]; total: number }> {
        const response = await api.get('/escrows', { params: filters });
        return response.data;
    }

    /**
     * Submit validation photos for an escrow
     */
    async submitValidation(
        escrowId: string,
        photos: string[],
        autoUnlock: boolean = true
    ): Promise<{
        success: boolean;
        validated: boolean;
        unlocked: boolean;
        unlockTxHash?: string;
        escrow: EscrowResponse;
    }> {
        const response = await api.post(`/escrows/${escrowId}/validate`, {
            photos,
            autoUnlock,
        });
        return response.data;
    }

    /**
     * Manually unlock an approved escrow
     */
    async unlockEscrow(escrowId: string): Promise<{
        success: boolean;
        unlockTxHash: string;
        escrow: EscrowResponse;
    }> {
        const response = await api.post(`/escrows/${escrowId}/unlock`);
        return response.data;
    }

    /**
     * Cancel an expired escrow (clawback)
     */
    async cancelEscrow(escrowId: string): Promise<{
        success: boolean;
        cancelTxHash: string;
        escrow: EscrowResponse;
    }> {
        const response = await api.post(`/escrows/${escrowId}/cancel`);
        return response.data;
    }

    /**
     * Get all projects (from XRPL controller)
     */
    async getProjects(): Promise<Project[]> {
        const response = await api.get('/xrpl/projects');
        return response.data.projects || [];
    }

    /**
     * Get project by ID
     */
    async getProject(projectId: string): Promise<Project> {
        const response = await api.get(`/xrpl/projects/${projectId}`);
        return response.data.project;
    }

    /**
     * Create a new project
     */
    async createProject(project: {
        title: string;
        category: string;
        location: {
            lat: number;
            lng: number;
            country: string;
            region: string;
        };
        amount: number;
        conditions: {
            photosRequired: number;
            validatorsRequired: number;
            deadlineDays: number;
            geoLocation?: {
                lat: number;
                lng: number;
                radius: number;
            };
        };
    }): Promise<Project> {
        const response = await api.post('/xrpl/projects', project);
        return response.data.project;
    }
}

export default new EscrowService();

/**
 * Projects Service
 *
 * Manages humanitarian projects with on-chain tracking via XRPL escrows
 */

import { XRPLClientService } from './xrpl-client.service';

export interface ProjectLocation {
  lat: number;
  lng: number;
  country: string;
  region: string;
}

export interface ProjectConditions {
  photosRequired: number;
  photosReceived: number;
  validatorsRequired: number;
  validatorsApproved: number;
  deadline: Date;
}

export interface ValidationProof {
  validatorName: string;
  photoUrl: string;
  reputation: number;
  timestamp?: Date;
  txHash?: string;
}

export type ProjectStatus = 'PENDING' | 'IN_PROGRESS' | 'FUNDED' | 'ALERT' | 'CANCELLED';
export type ProjectCategory = 'Water' | 'Education' | 'Health' | 'Climate' | 'Infrastructure';

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  location: ProjectLocation;
  amount: number;
  status: ProjectStatus;
  conditions: ProjectConditions;
  validationProofs?: ValidationProof[];
  daysRemaining?: number;
  daysOverdue?: number;
  escrowHash?: string;
  escrowSequence?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ProjectsService {
  private xrplClient: XRPLClientService;
  private projects: Map<string, Project> = new Map();

  constructor(xrplClient: XRPLClientService) {
    this.xrplClient = xrplClient;
    this.initializeTestProjects();
  }

  /**
   * Initialize with test projects for testnet demo
   */
  private initializeTestProjects(): void {
    const testProjects: Project[] = [
      {
        id: 'PRJ_001',
        title: 'Puits au Sénégal',
        category: 'Water',
        location: {
          lat: 14.4974,
          lng: -14.4524,
          country: 'Senegal',
          region: 'Dakar'
        },
        amount: 5000,
        status: 'FUNDED',
        conditions: {
          photosRequired: 3,
          photosReceived: 3,
          validatorsRequired: 3,
          validatorsApproved: 3,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        validationProofs: [
          { validatorName: 'Amadou Diallo', photoUrl: '/assets/photo1.jpg', reputation: 98 },
          { validatorName: 'Fatou Sow', photoUrl: '/assets/photo2.jpg', reputation: 95 },
          { validatorName: 'Moussa Kane', photoUrl: '/assets/photo3.jpg', reputation: 97 }
        ],
        escrowHash: 'ESCROW_TESTNET_001',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'PRJ_002',
        title: 'École en Inde',
        category: 'Education',
        location: {
          lat: 12.9716,
          lng: 77.5946,
          country: 'India',
          region: 'Bangalore'
        },
        amount: 8000,
        status: 'IN_PROGRESS',
        conditions: {
          photosRequired: 5,
          photosReceived: 2,
          validatorsRequired: 3,
          validatorsApproved: 1,
          deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
        },
        validationProofs: [
          { validatorName: 'Raj Kumar', photoUrl: '/assets/india-school.jpg', reputation: 92 }
        ],
        daysRemaining: 45,
        escrowHash: 'ESCROW_TESTNET_002',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'PRJ_003',
        title: 'Clinique au Kenya',
        category: 'Health',
        location: {
          lat: -1.2921,
          lng: 36.8219,
          country: 'Kenya',
          region: 'Nairobi'
        },
        amount: 12000,
        status: 'ALERT',
        conditions: {
          photosRequired: 4,
          photosReceived: 1,
          validatorsRequired: 3,
          validatorsApproved: 0,
          deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        daysOverdue: 5,
        escrowHash: 'ESCROW_TESTNET_003',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'PRJ_004',
        title: 'Reforestation au Brésil',
        category: 'Climate',
        location: {
          lat: -3.4653,
          lng: -62.2159,
          country: 'Brazil',
          region: 'Amazonas'
        },
        amount: 15000,
        status: 'IN_PROGRESS',
        conditions: {
          photosRequired: 10,
          photosReceived: 6,
          validatorsRequired: 5,
          validatorsApproved: 3,
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
        },
        daysRemaining: 60,
        validationProofs: [
          { validatorName: 'Carlos Silva', photoUrl: '/assets/brazil1.jpg', reputation: 91 },
          { validatorName: 'Ana Costa', photoUrl: '/assets/brazil2.jpg', reputation: 87 },
          { validatorName: 'Pedro Santos', photoUrl: '/assets/brazil3.jpg', reputation: 89 }
        ],
        escrowHash: 'ESCROW_TESTNET_004',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'PRJ_005',
        title: 'Solar Panels Vietnam',
        category: 'Infrastructure',
        location: {
          lat: 21.0285,
          lng: 105.8542,
          country: 'Vietnam',
          region: 'Hanoi'
        },
        amount: 10000,
        status: 'PENDING',
        conditions: {
          photosRequired: 4,
          photosReceived: 0,
          validatorsRequired: 3,
          validatorsApproved: 0,
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        },
        daysRemaining: 90,
        escrowHash: 'ESCROW_TESTNET_005',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'PRJ_006',
        title: 'École à Dakar',
        category: 'Education',
        location: {
          lat: 14.6937,
          lng: -17.4441,
          country: 'Senegal',
          region: 'Dakar'
        },
        amount: 7500,
        status: 'IN_PROGRESS',
        conditions: {
          photosRequired: 4,
          photosReceived: 2,
          validatorsRequired: 3,
          validatorsApproved: 1,
          deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000)
        },
        daysRemaining: 50,
        escrowHash: 'ESCROW_TESTNET_006',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'PRJ_007',
        title: 'Clinique Dakar Sud',
        category: 'Health',
        location: {
          lat: 14.7167,
          lng: -17.4677,
          country: 'Senegal',
          region: 'Dakar'
        },
        amount: 9000,
        status: 'FUNDED',
        conditions: {
          photosRequired: 3,
          photosReceived: 3,
          validatorsRequired: 3,
          validatorsApproved: 3,
          deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
        },
        validationProofs: [
          { validatorName: 'Awa Diop', photoUrl: '/assets/clinic1.jpg', reputation: 96 },
          { validatorName: 'Mamadou Fall', photoUrl: '/assets/clinic2.jpg', reputation: 94 },
          { validatorName: 'Aissatou Ba', photoUrl: '/assets/clinic3.jpg', reputation: 93 }
        ],
        escrowHash: 'ESCROW_TESTNET_007',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'PRJ_008',
        title: 'Puits rural Karnataka',
        category: 'Water',
        location: {
          lat: 12.9141,
          lng: 77.5837,
          country: 'India',
          region: 'Bangalore'
        },
        amount: 4500,
        status: 'IN_PROGRESS',
        conditions: {
          photosRequired: 3,
          photosReceived: 1,
          validatorsRequired: 3,
          validatorsApproved: 0,
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
        },
        daysRemaining: 60,
        escrowHash: 'ESCROW_TESTNET_008',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'PRJ_009',
        title: 'Panneaux solaires Bangalore',
        category: 'Infrastructure',
        location: {
          lat: 13.0097,
          lng: 77.6241,
          country: 'India',
          region: 'Bangalore'
        },
        amount: 11000,
        status: 'PENDING',
        conditions: {
          photosRequired: 5,
          photosReceived: 0,
          validatorsRequired: 3,
          validatorsApproved: 0,
          deadline: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000)
        },
        daysRemaining: 100,
        escrowHash: 'ESCROW_TESTNET_009',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'PRJ_010',
        title: 'Jardin communautaire Nairobi',
        category: 'Climate',
        location: {
          lat: -1.2864,
          lng: 36.8172,
          country: 'Kenya',
          region: 'Nairobi'
        },
        amount: 3500,
        status: 'FUNDED',
        conditions: {
          photosRequired: 4,
          photosReceived: 4,
          validatorsRequired: 3,
          validatorsApproved: 3,
          deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
        },
        validationProofs: [
          { validatorName: 'Jane Wanjiku', photoUrl: '/assets/garden1.jpg', reputation: 99 },
          { validatorName: 'John Kamau', photoUrl: '/assets/garden2.jpg', reputation: 97 },
          { validatorName: 'Mary Achieng', photoUrl: '/assets/garden3.jpg', reputation: 95 }
        ],
        escrowHash: 'ESCROW_TESTNET_010',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'PRJ_011',
        title: 'Protection faune Amazonie',
        category: 'Climate',
        location: {
          lat: -3.4168,
          lng: -62.1762,
          country: 'Brazil',
          region: 'Amazonas'
        },
        amount: 13500,
        status: 'IN_PROGRESS',
        conditions: {
          photosRequired: 8,
          photosReceived: 4,
          validatorsRequired: 5,
          validatorsApproved: 2,
          deadline: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000)
        },
        daysRemaining: 75,
        validationProofs: [
          { validatorName: 'Maria Silva', photoUrl: '/assets/wildlife1.jpg', reputation: 88 },
          { validatorName: 'José Santos', photoUrl: '/assets/wildlife2.jpg', reputation: 90 }
        ],
        escrowHash: 'ESCROW_TESTNET_011',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'PRJ_012',
        title: 'Réserve naturelle Pará',
        category: 'Climate',
        location: {
          lat: -1.4558,
          lng: -48.4902,
          country: 'Brazil',
          region: 'Pará'
        },
        amount: 18000,
        status: 'PENDING',
        conditions: {
          photosRequired: 6,
          photosReceived: 0,
          validatorsRequired: 4,
          validatorsApproved: 0,
          deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000)
        },
        daysRemaining: 120,
        escrowHash: 'ESCROW_TESTNET_012',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    testProjects.forEach(project => {
      this.projects.set(project.id, project);
    });

    console.log(`[ProjectsService] Initialized with ${this.projects.size} test projects`);
  }

  /**
   * Get all projects
   */
  getAllProjects(): Project[] {
    return Array.from(this.projects.values());
  }

  /**
   * Get project by ID
   */
  getProject(id: string): Project | undefined {
    return this.projects.get(id);
  }

  /**
   * Create a new project with escrow on XRPL
   */
  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const id = `PRJ_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const newProject: Project = {
      ...project,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      // Create escrow on XRPL (works in both testnet and mock mode)
      const escrow = await this.xrplClient.createEscrow(
        this.xrplClient.getPoolWalletAddress(), // Destination (for now, pool itself)
        project.amount,
        project.conditions.deadline
      );

      newProject.escrowHash = escrow.hash;
      newProject.escrowSequence = escrow.sequence;

      console.log(`[ProjectsService] Created project ${id} with escrow ${escrow.hash}`);
    } catch (error) {
      console.error(`[ProjectsService] Failed to create escrow for project ${id}:`, error);
      // Continue without escrow hash if creation fails
    }

    this.projects.set(id, newProject);
    return newProject;
  }

  /**
   * Update project status
   */
  updateProject(id: string, updates: Partial<Project>): Project | null {
    const project = this.projects.get(id);
    if (!project) {
      return null;
    }

    const updated: Project = {
      ...project,
      ...updates,
      id: project.id, // Prevent ID change
      updatedAt: new Date()
    };

    this.projects.set(id, updated);
    console.log(`[ProjectsService] Updated project ${id}`);

    return updated;
  }

  /**
   * Add validation proof to project
   */
  addValidationProof(projectId: string, proof: ValidationProof): Project | null {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    const validationProofs = [...(project.validationProofs || []), proof];
    const photosReceived = validationProofs.length;
    const validatorsApproved = validationProofs.filter(p => p.reputation >= 80).length;

    const updated: Project = {
      ...project,
      validationProofs,
      conditions: {
        ...project.conditions,
        photosReceived,
        validatorsApproved
      },
      updatedAt: new Date()
    };

    // Update status based on validation progress
    if (validatorsApproved >= updated.conditions.validatorsRequired) {
      updated.status = 'FUNDED';
    } else if (photosReceived > 0) {
      updated.status = 'IN_PROGRESS';
    }

    this.projects.set(projectId, updated);
    console.log(`[ProjectsService] Added validation proof to project ${projectId}`);

    return updated;
  }

  /**
   * Get projects statistics
   */
  getStats() {
    const projects = this.getAllProjects();

    return {
      total: projects.length,
      byStatus: {
        PENDING: projects.filter(p => p.status === 'PENDING').length,
        IN_PROGRESS: projects.filter(p => p.status === 'IN_PROGRESS').length,
        FUNDED: projects.filter(p => p.status === 'FUNDED').length,
        ALERT: projects.filter(p => p.status === 'ALERT').length,
        CANCELLED: projects.filter(p => p.status === 'CANCELLED').length
      },
      byCategory: {
        Water: projects.filter(p => p.category === 'Water').length,
        Education: projects.filter(p => p.category === 'Education').length,
        Health: projects.filter(p => p.category === 'Health').length,
        Climate: projects.filter(p => p.category === 'Climate').length,
        Infrastructure: projects.filter(p => p.category === 'Infrastructure').length
      },
      totalAmount: projects.reduce((sum, p) => sum + p.amount, 0),
      totalDeployed: projects.filter(p => p.status === 'FUNDED').reduce((sum, p) => sum + p.amount, 0)
    };
  }
}

/**
 * Smart Escrow Manager - XLS-100 Implementation
 *
 * Manages conditional escrows for project funding:
 * - Locks funds until validation conditions are met
 * - Supports multi-signature oracle validation
 * - Automatic clawback if conditions not met by deadline
 */

import { Client, Wallet, xrpToDrops, EscrowCreate, EscrowFinish, EscrowCancel } from 'xrpl';

export interface EscrowConditions {
  photosRequired: number;
  photosReceived: number;
  validatorsRequired: number;
  validatorsApproved: number;
  deadline: Date;
  geoLocation?: {
    lat: number;
    lng: number;
    radius: number; // meters - photos must be within this radius
  };
}

export interface ProjectEscrow {
  id: string;
  title: string;
  category: 'Water' | 'Education' | 'Health' | 'Climate' | 'Infrastructure';
  location: {
    lat: number;
    lng: number;
    country: string;
    region: string;
  };
  amount: number; // XRP
  status: 'PENDING' | 'IN_PROGRESS' | 'FUNDED' | 'ALERT' | 'CANCELLED';
  escrowSequence?: number;
  escrowHash?: string;
  conditions: EscrowConditions;
  validators: string[]; // Array of validator wallet addresses
  validationProofs: ValidationProof[];
  createdAt: Date;
  fundedAt?: Date;
  cancelledAt?: Date;
}

export interface ValidationProof {
  validatorAddress: string;
  validatorName: string;
  validatorReputation: number;
  photoUrl: string;
  photoGPS: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
  signature: string;
  approvedAt: Date;
}

export class EscrowManager {
  private client: Client;
  private fundWallet: Wallet;

  constructor(client: Client, fundWallet: Wallet) {
    this.client = client;
    this.fundWallet = fundWallet;
  }

  /**
   * Create a conditional escrow for a project
   */
  async createProjectEscrow(project: Omit<ProjectEscrow, 'id' | 'status' | 'validationProofs' | 'createdAt'>): Promise<ProjectEscrow> {
    try {
      // Calculate finish time (deadline)
      const finishAfter = Math.floor(project.conditions.deadline.getTime() / 1000);
      const cancelAfter = finishAfter + (7 * 24 * 60 * 60); // +7 days for clawback window

      // Create escrow transaction
      const escrowTx: EscrowCreate = {
        TransactionType: 'EscrowCreate',
        Account: this.fundWallet.address,
        Destination: this.fundWallet.address, // Will be updated to project wallet later
        Amount: xrpToDrops(project.amount),
        FinishAfter: finishAfter,
        CancelAfter: cancelAfter,
      };

      // Submit and wait for validation
      const prepared = await this.client.autofill(escrowTx);
      const signed = this.fundWallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);

      console.log(`[Escrow] Created for project "${project.title}":`, result.result.hash);

      const newProject: ProjectEscrow = {
        id: `PRJ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...project,
        status: 'PENDING',
        escrowHash: result.result.hash,
        escrowSequence: (result.result as any).Sequence,
        validationProofs: [],
        createdAt: new Date(),
      };

      return newProject;
    } catch (error) {
      console.error('[Escrow] Error creating escrow:', error);
      throw error;
    }
  }

  /**
   * Add validation proof from an oracle/validator
   */
  async addValidationProof(
    project: ProjectEscrow,
    proof: ValidationProof
  ): Promise<ProjectEscrow> {
    // Verify validator is authorized
    if (!project.validators.includes(proof.validatorAddress)) {
      throw new Error('Validator not authorized for this project');
    }

    // Verify GPS proximity if required
    if (project.conditions.geoLocation) {
      const distance = this.calculateDistance(
        project.conditions.geoLocation.lat,
        project.conditions.geoLocation.lng,
        proof.photoGPS.lat,
        proof.photoGPS.lng
      );

      if (distance > project.conditions.geoLocation.radius) {
        throw new Error(`Photo taken too far from project location (${distance}m > ${project.conditions.geoLocation.radius}m)`);
      }
    }

    // Add proof
    project.validationProofs.push(proof);
    project.conditions.photosReceived++;
    project.conditions.validatorsApproved = project.validationProofs.length;

    // Check if conditions are met
    if (this.areConditionsMet(project)) {
      await this.releaseEscrow(project);
      project.status = 'FUNDED';
      project.fundedAt = new Date();
    } else if (project.conditions.validatorsApproved >= project.conditions.validatorsRequired / 2) {
      project.status = 'IN_PROGRESS';
    }

    console.log(`[Escrow] Validation added for "${project.title}": ${project.conditions.validatorsApproved}/${project.conditions.validatorsRequired}`);

    return project;
  }

  /**
   * Check if all conditions are met
   */
  private areConditionsMet(project: ProjectEscrow): boolean {
    const { conditions } = project;
    return (
      conditions.photosReceived >= conditions.photosRequired &&
      conditions.validatorsApproved >= conditions.validatorsRequired &&
      new Date() < conditions.deadline
    );
  }

  /**
   * Release escrow funds when conditions are met
   */
  private async releaseEscrow(project: ProjectEscrow): Promise<void> {
    if (!project.escrowSequence) {
      throw new Error('Escrow sequence not found');
    }

    try {
      const finishTx: EscrowFinish = {
        TransactionType: 'EscrowFinish',
        Account: this.fundWallet.address,
        Owner: this.fundWallet.address,
        OfferSequence: project.escrowSequence,
      };

      const prepared = await this.client.autofill(finishTx);
      const signed = this.fundWallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);

      console.log(`[Escrow] Released for "${project.title}":`, result.result.hash);
    } catch (error) {
      console.error('[Escrow] Error releasing escrow:', error);
      throw error;
    }
  }

  /**
   * Cancel escrow and clawback funds if deadline passed
   */
  async clawbackEscrow(project: ProjectEscrow): Promise<void> {
    if (!project.escrowSequence) {
      throw new Error('Escrow sequence not found');
    }

    // Check if deadline has passed
    if (new Date() < project.conditions.deadline) {
      throw new Error('Cannot clawback before deadline');
    }

    try {
      const cancelTx: EscrowCancel = {
        TransactionType: 'EscrowCancel',
        Account: this.fundWallet.address,
        Owner: this.fundWallet.address,
        OfferSequence: project.escrowSequence,
      };

      const prepared = await this.client.autofill(cancelTx);
      const signed = this.fundWallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);

      project.status = 'CANCELLED';
      project.cancelledAt = new Date();

      console.log(`[Escrow] Clawback executed for "${project.title}":`, result.result.hash);
    } catch (error) {
      console.error('[Escrow] Error during clawback:', error);
      throw error;
    }
  }

  /**
   * Get project status color for map pins
   */
  getProjectPinColor(project: ProjectEscrow): 'yellow' | 'green' | 'red' {
    if (project.status === 'FUNDED') return 'green';
    if (project.status === 'ALERT' || project.status === 'CANCELLED') return 'red';
    return 'yellow'; // PENDING or IN_PROGRESS
  }

  /**
   * Update project status based on conditions and deadline
   */
  updateProjectStatus(project: ProjectEscrow): ProjectEscrow {
    const now = new Date();

    if (project.status === 'FUNDED' || project.status === 'CANCELLED') {
      return project; // Final states
    }

    // Check if deadline passed
    if (now > project.conditions.deadline) {
      if (!this.areConditionsMet(project)) {
        project.status = 'ALERT';
      }
    }

    return project;
  }

  /**
   * Calculate distance between two GPS coordinates (Haversine formula)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Generate mock projects for demo
   */
  static generateMockProjects(): ProjectEscrow[] {
    const now = new Date();

    return [
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
        escrowHash: '0xABC123DEF456789',
        escrowSequence: 12345,
        conditions: {
          photosRequired: 3,
          photosReceived: 3,
          validatorsRequired: 3,
          validatorsApproved: 3,
          deadline: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          geoLocation: {
            lat: 14.4974,
            lng: -14.4524,
            radius: 500
          }
        },
        validators: ['rValidator1XXX', 'rValidator2XXX', 'rValidator3XXX'],
        validationProofs: [
          {
            validatorAddress: 'rValidator1XXX',
            validatorName: 'Amadou Diallo',
            validatorReputation: 98,
            photoUrl: '/assets/senegal-well-1.jpg',
            photoGPS: { lat: 14.4975, lng: -14.4523, timestamp: new Date() },
            signature: '0xSIG1',
            approvedAt: new Date()
          },
          {
            validatorAddress: 'rValidator2XXX',
            validatorName: 'Fatou Sow',
            validatorReputation: 95,
            photoUrl: '/assets/senegal-well-2.jpg',
            photoGPS: { lat: 14.4974, lng: -14.4525, timestamp: new Date() },
            signature: '0xSIG2',
            approvedAt: new Date()
          },
          {
            validatorAddress: 'rValidator3XXX',
            validatorName: 'Moussa Kane',
            validatorReputation: 97,
            photoUrl: '/assets/senegal-well-3.jpg',
            photoGPS: { lat: 14.4973, lng: -14.4524, timestamp: new Date() },
            signature: '0xSIG3',
            approvedAt: new Date()
          }
        ],
        createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        fundedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
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
        escrowHash: '0xDEF456GHI789012',
        escrowSequence: 12346,
        conditions: {
          photosRequired: 5,
          photosReceived: 2,
          validatorsRequired: 3,
          validatorsApproved: 1,
          deadline: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
          geoLocation: {
            lat: 12.9716,
            lng: 77.5946,
            radius: 1000
          }
        },
        validators: ['rValidatorIndia1', 'rValidatorIndia2', 'rValidatorIndia3'],
        validationProofs: [
          {
            validatorAddress: 'rValidatorIndia1',
            validatorName: 'Raj Kumar',
            validatorReputation: 92,
            photoUrl: '/assets/india-school-1.jpg',
            photoGPS: { lat: 12.9717, lng: 77.5945, timestamp: new Date() },
            signature: '0xSIG_IND1',
            approvedAt: new Date()
          }
        ],
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
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
        escrowHash: '0xGHI789JKL012345',
        escrowSequence: 12347,
        conditions: {
          photosRequired: 4,
          photosReceived: 1,
          validatorsRequired: 3,
          validatorsApproved: 0,
          deadline: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days overdue
          geoLocation: {
            lat: -1.2921,
            lng: 36.8219,
            radius: 800
          }
        },
        validators: ['rValidatorKenya1', 'rValidatorKenya2', 'rValidatorKenya3'],
        validationProofs: [],
        createdAt: new Date(now.getTime() - 95 * 24 * 60 * 60 * 1000)
      }
    ];
  }
}

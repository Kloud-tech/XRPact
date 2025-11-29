/**
 * Oracle Registry - Human Validator Network
 *
 * Manages the network of human validators (XRPL Commons ambassadors)
 * who verify project completion on the ground
 */

export interface OracleValidator {
  address: string; // XRPL wallet address
  name: string;
  location: {
    country: string;
    region: string;
    lat: number;
    lng: number;
  };
  reputation: number; // 0-100 score
  specialties: ProjectCategory[];
  validationsCompleted: number;
  validationsAccepted: number;
  validationsRejected: number;
  joinedAt: Date;
  lastActiveAt: Date;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  contactInfo?: {
    email?: string;
    telegram?: string;
    twitter?: string;
  };
}

export type ProjectCategory = 'Water' | 'Education' | 'Health' | 'Climate' | 'Infrastructure';

export interface ValidatorNotification {
  projectId: string;
  projectTitle: string;
  projectLocation: {
    lat: number;
    lng: number;
  };
  estimatedDistance: number; // km from validator
  reward: number; // XRP reward for validation
  deadline: Date;
  sentAt: Date;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED';
}

export class OracleRegistry {
  private validators: Map<string, OracleValidator> = new Map();

  constructor() {
    // Initialize with mock validators
    this.loadMockValidators();
  }

  /**
   * Register a new validator
   */
  registerValidator(validator: Omit<OracleValidator, 'validationsCompleted' | 'validationsAccepted' | 'validationsRejected' | 'joinedAt' | 'lastActiveAt' | 'status'>): OracleValidator {
    const newValidator: OracleValidator = {
      ...validator,
      validationsCompleted: 0,
      validationsAccepted: 0,
      validationsRejected: 0,
      joinedAt: new Date(),
      lastActiveAt: new Date(),
      status: 'ACTIVE',
    };

    this.validators.set(validator.address, newValidator);
    console.log(`[Oracle] Validator registered: ${validator.name} (${validator.address})`);

    return newValidator;
  }

  /**
   * Find validators near a project location
   */
  findNearbyValidators(
    projectLocation: { lat: number; lng: number },
    category: ProjectCategory,
    maxDistance: number = 100 // km
  ): OracleValidator[] {
    const nearby: Array<{ validator: OracleValidator; distance: number }> = [];

    for (const validator of this.validators.values()) {
      // Skip inactive validators
      if (validator.status !== 'ACTIVE') continue;

      // Check if validator has specialty in this category
      if (!validator.specialties.includes(category)) continue;

      // Calculate distance
      const distance = this.calculateDistance(
        projectLocation.lat,
        projectLocation.lng,
        validator.location.lat,
        validator.location.lng
      );

      if (distance <= maxDistance) {
        nearby.push({ validator, distance });
      }
    }

    // Sort by reputation (weighted) and distance
    nearby.sort((a, b) => {
      const scoreA = a.validator.reputation * 0.7 + (1 - a.distance / maxDistance) * 30;
      const scoreB = b.validator.reputation * 0.7 + (1 - b.distance / maxDistance) * 30;
      return scoreB - scoreA;
    });

    return nearby.map(n => n.validator);
  }

  /**
   * Update validator reputation after validation
   */
  updateReputation(
    validatorAddress: string,
    validationAccepted: boolean,
    bonusPoints: number = 0
  ): void {
    const validator = this.validators.get(validatorAddress);
    if (!validator) {
      throw new Error('Validator not found');
    }

    validator.validationsCompleted++;
    validator.lastActiveAt = new Date();

    if (validationAccepted) {
      validator.validationsAccepted++;
      // Increase reputation
      const increase = Math.min(5 + bonusPoints, 10);
      validator.reputation = Math.min(100, validator.reputation + increase);
    } else {
      validator.validationsRejected++;
      // Decrease reputation
      validator.reputation = Math.max(0, validator.reputation - 10);

      // Suspend if reputation too low
      if (validator.reputation < 30) {
        validator.status = 'SUSPENDED';
        console.warn(`[Oracle] Validator ${validator.name} suspended due to low reputation`);
      }
    }

    console.log(`[Oracle] Reputation updated for ${validator.name}: ${validator.reputation}`);
  }

  /**
   * Get validator by address
   */
  getValidator(address: string): OracleValidator | undefined {
    return this.validators.get(address);
  }

  /**
   * Get all active validators
   */
  getAllActiveValidators(): OracleValidator[] {
    return Array.from(this.validators.values()).filter(v => v.status === 'ACTIVE');
  }

  /**
   * Get validator statistics
   */
  getValidatorStats(address: string): {
    successRate: number;
    totalValidations: number;
    avgResponseTime: number;
    rewardsEarned: number;
  } {
    const validator = this.validators.get(address);
    if (!validator) {
      throw new Error('Validator not found');
    }

    const successRate = validator.validationsCompleted > 0
      ? (validator.validationsAccepted / validator.validationsCompleted) * 100
      : 0;

    return {
      successRate,
      totalValidations: validator.validationsCompleted,
      avgResponseTime: 24, // Mock - hours
      rewardsEarned: validator.validationsAccepted * 50, // Mock - 50 XRP per validation
    };
  }

  /**
   * Notify validators about a new project
   */
  async notifyValidators(
    projectId: string,
    projectTitle: string,
    projectLocation: { lat: number; lng: number },
    category: ProjectCategory,
    requiredValidators: number,
    reward: number
  ): Promise<ValidatorNotification[]> {
    const candidates = this.findNearbyValidators(projectLocation, category);
    const notifications: ValidatorNotification[] = [];

    // Select top candidates
    const selected = candidates.slice(0, requiredValidators + 2); // +2 backups

    for (const validator of selected) {
      const distance = this.calculateDistance(
        projectLocation.lat,
        projectLocation.lng,
        validator.location.lat,
        validator.location.lng
      );

      const notification: ValidatorNotification = {
        projectId,
        projectTitle,
        projectLocation,
        estimatedDistance: Math.round(distance),
        reward,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        sentAt: new Date(),
        status: 'PENDING',
      };

      notifications.push(notification);

      // In production, send actual notification (email, push, etc.)
      console.log(`[Oracle] Notification sent to ${validator.name} for project "${projectTitle}"`);
    }

    return notifications;
  }

  /**
   * Calculate distance between two GPS coordinates (Haversine formula)
   * Returns distance in kilometers
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Load mock validators for demo (XRPL Commons ambassadors)
   */
  private loadMockValidators(): void {
    const mockValidators: Array<Omit<OracleValidator, 'validationsCompleted' | 'validationsAccepted' | 'validationsRejected' | 'joinedAt' | 'lastActiveAt' | 'status'>> = [
      // Africa
      {
        address: 'rValidatorSN1ABC123',
        name: 'Amadou Diallo',
        location: {
          country: 'Senegal',
          region: 'Dakar',
          lat: 14.6928,
          lng: -17.4467
        },
        reputation: 98,
        specialties: ['Water', 'Infrastructure'],
        contactInfo: {
          email: 'amadou@xrplcommons.sn',
          telegram: '@amadou_xrpl'
        }
      },
      {
        address: 'rValidatorSN2DEF456',
        name: 'Fatou Sow',
        location: {
          country: 'Senegal',
          region: 'Thiès',
          lat: 14.7886,
          lng: -16.9262
        },
        reputation: 95,
        specialties: ['Education', 'Health'],
        contactInfo: {
          email: 'fatou@xrplcommons.sn'
        }
      },
      {
        address: 'rValidatorKE1GHI789',
        name: 'James Omondi',
        location: {
          country: 'Kenya',
          region: 'Nairobi',
          lat: -1.2864,
          lng: 36.8172
        },
        reputation: 92,
        specialties: ['Health', 'Climate'],
        contactInfo: {
          email: 'james@xrplcommons.ke',
          twitter: '@james_xrpl'
        }
      },

      // Asia
      {
        address: 'rValidatorIN1JKL012',
        name: 'Raj Kumar',
        location: {
          country: 'India',
          region: 'Bangalore',
          lat: 12.9716,
          lng: 77.5946
        },
        reputation: 94,
        specialties: ['Education', 'Infrastructure'],
        contactInfo: {
          email: 'raj@xrplcommons.in',
          telegram: '@raj_xrpl'
        }
      },
      {
        address: 'rValidatorIN2MNO345',
        name: 'Priya Singh',
        location: {
          country: 'India',
          region: 'Mumbai',
          lat: 19.0760,
          lng: 72.8777
        },
        reputation: 89,
        specialties: ['Water', 'Health'],
        contactInfo: {
          email: 'priya@xrplcommons.in'
        }
      },

      // Latin America
      {
        address: 'rValidatorBR1PQR678',
        name: 'Carlos Silva',
        location: {
          country: 'Brazil',
          region: 'São Paulo',
          lat: -23.5505,
          lng: -46.6333
        },
        reputation: 91,
        specialties: ['Climate', 'Infrastructure'],
        contactInfo: {
          email: 'carlos@xrplcommons.br',
          telegram: '@carlos_xrpl'
        }
      },
      {
        address: 'rValidatorBR2STU901',
        name: 'Ana Costa',
        location: {
          country: 'Brazil',
          region: 'Rio de Janeiro',
          lat: -22.9068,
          lng: -43.1729
        },
        reputation: 87,
        specialties: ['Education', 'Water'],
        contactInfo: {
          email: 'ana@xrplcommons.br'
        }
      },

      // Europe
      {
        address: 'rValidatorFR1VWX234',
        name: 'Marie Dubois',
        location: {
          country: 'France',
          region: 'Paris',
          lat: 48.8566,
          lng: 2.3522
        },
        reputation: 96,
        specialties: ['Climate', 'Education'],
        contactInfo: {
          email: 'marie@xrplcommons.fr',
          twitter: '@marie_xrpl'
        }
      }
    ];

    for (const validator of mockValidators) {
      this.registerValidator(validator);
    }

    console.log(`[Oracle] Loaded ${mockValidators.length} mock validators`);
  }
}

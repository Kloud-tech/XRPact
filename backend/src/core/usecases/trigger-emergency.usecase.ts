/**
 * Trigger Emergency Use Case
 * Handles emergency fund releases for urgent situations
 */

import { EmergencyFund, EmergencySeverity } from '../domain/emergency-fund.entity';

export interface TriggerEmergencyCommand {
  triggeredBy: string;
  severity: EmergencySeverity;
  reason: string;
  amountRequested: number;
  affectedNGOs: string[];
}

export interface EmergencyResult {
  emergency: EmergencyFund;
  notificationsSent: number;
}

export interface IEmergencyRepository {
  save(emergency: EmergencyFund): Promise<void>;
  findById(id: string): Promise<EmergencyFund | null>;
  findPending(): Promise<EmergencyFund[]>;
}

export interface INotificationService {
  broadcastEmergency(emergency: EmergencyFund): Promise<number>;
}

export class TriggerEmergencyUseCase {
  constructor(
    private emergencyRepository: IEmergencyRepository,
    private notificationService: INotificationService
  ) {}

  async execute(command: TriggerEmergencyCommand): Promise<EmergencyResult> {
    // 1. Validate
    this.validate(command);

    // 2. Create emergency fund
    const emergency = new EmergencyFund(
      this.generateId(),
      command.triggeredBy,
      command.severity,
      command.reason,
      command.amountRequested,
      command.affectedNGOs
    );

    // 3. Save to repository
    await this.emergencyRepository.save(emergency);

    // 4. Broadcast notification
    const notificationsSent = await this.notificationService.broadcastEmergency(emergency);

    return {
      emergency,
      notificationsSent,
    };
  }

  private validate(command: TriggerEmergencyCommand): void {
    if (!command.triggeredBy.match(/^r[a-zA-Z0-9]{24,34}$/)) {
      throw new Error('Invalid XRPL address');
    }

    if (command.amountRequested <= 0) {
      throw new Error('Amount must be positive');
    }

    if (command.affectedNGOs.length === 0) {
      throw new Error('At least one affected NGO required');
    }

    if (!command.reason || command.reason.length < 10) {
      throw new Error('Reason must be at least 10 characters');
    }
  }

  private generateId(): string {
    return `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

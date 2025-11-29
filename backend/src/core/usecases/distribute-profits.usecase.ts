/**
 * Distribute Profits Use Case
 * Distributes trading profits to verified NGOs based on weights
 */

import { NGO } from '../domain/ngo.entity';

export interface DistributeCommand {
  profitAmount: number;
}

export interface DistributionRecord {
  id: string;
  ngoId: string;
  ngoName: string;
  amount: number;
  txHash: string;
  timestamp: Date;
}

export interface DistributionResult {
  distributions: DistributionRecord[];
  totalDistributed: number;
  newPoolBalance: number;
  transactionCount: number;
}

export interface INGORepository {
  findEligibleForDistribution(): Promise<NGO[]>;
  save(ngo: NGO): Promise<void>;
}

export class DistributeProfitsUseCase {
  constructor(
    private xrplGateway: IXRPLGateway,
    private ngoRepository: INGORepository,
    private poolService: IPoolService
  ) {}

  async execute(command: DistributeCommand): Promise<DistributionResult> {
    // 1. Validate
    this.validate(command);

    // 2. Get eligible NGOs
    const ngos = await this.ngoRepository.findEligibleForDistribution();

    if (ngos.length === 0) {
      throw new Error('No eligible NGOs for distribution');
    }

    // 3. Normalize weights
    const totalWeight = ngos.reduce((sum, ngo) => sum + ngo.weight, 0);
    const normalizedNGOs = ngos.map((ngo) => ({
      ...ngo,
      normalizedWeight: ngo.weight / totalWeight,
    }));

    // 4. Calculate and distribute to each NGO
    const distributions: DistributionRecord[] = [];

    for (const ngo of normalizedNGOs) {
      const amount = command.profitAmount * ngo.normalizedWeight;

      // Send XRPL payment
      const txResult = await this.xrplGateway.sendPayment({
        from: this.poolService.getWalletAddress(),
        to: ngo.walletAddress,
        amount,
      });

      // Update NGO total received
      ngo.addDistribution(amount);
      await this.ngoRepository.save(ngo);

      // Create distribution record
      distributions.push({
        id: this.generateId(),
        ngoId: ngo.id,
        ngoName: ngo.name,
        amount,
        txHash: txResult.txHash,
        timestamp: new Date(),
      });
    }

    // 5. Update pool balance
    this.poolService.subtractFunds(command.profitAmount);

    return {
      distributions,
      totalDistributed: command.profitAmount,
      newPoolBalance: this.poolService.getBalance(),
      transactionCount: distributions.length,
    };
  }

  private validate(command: DistributeCommand): void {
    if (command.profitAmount <= 0) {
      throw new Error('Profit amount must be positive');
    }

    const poolBalance = this.poolService.getBalance();
    if (command.profitAmount > poolBalance) {
      throw new Error('Insufficient pool balance for distribution');
    }
  }

  private generateId(): string {
    return `dist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Extend pool service interface
interface IPoolService {
  getBalance(): number;
  getWalletAddress(): string;
  addDonation(amount: number): void;
  subtractFunds(amount: number): void;
}

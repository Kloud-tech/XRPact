/**
 * Process Donation Use Case
 * Orchestrates the entire donation flow:
 * 1. Validate donation
 * 2. Process XRPL payment
 * 3. Update/create donor
 * 4. Mint NFT if needed
 * 5. Mint DIT token if first donation
 */

import { Donor } from '../domain/donor.entity';

export interface DonateCommand {
  donorAddress: string;
  amount: number;
  signature?: string;
}

export interface DonationResult {
  donor: Donor;
  transaction: {
    txHash: string;
    fee: string;
    validated: boolean;
  };
  nft?: {
    tokenId: string;
    tier: string;
    evolved: boolean;
  };
  dit?: {
    tokenId: string;
    votingPower: number;
  };
  poolState: {
    totalBalance: number;
    donorCount: number;
  };
}

export interface IXRPLGateway {
  sendPayment(params: { from: string; to: string; amount: number }): Promise<any>;
  mintNFT(params: { ownerAddress: string; level: number; xp: number }): Promise<any>;
  mintDIT(params: { ownerAddress: string; votingPower: number }): Promise<any>;
}

export interface IDonorRepository {
  findByAddress(address: string): Promise<Donor | null>;
  save(donor: Donor): Promise<void>;
  count(): Promise<number>;
}

export interface IPoolService {
  getBalance(): number;
  addDonation(amount: number): void;
}

export class ProcessDonationUseCase {
  constructor(
    private xrplGateway: IXRPLGateway,
    private donorRepository: IDonorRepository,
    private poolService: IPoolService,
    private poolWalletAddress: string
  ) {}

  async execute(command: DonateCommand): Promise<DonationResult> {
    // 1. Validate
    this.validate(command);

    // 2. Get or create donor
    let donor = await this.donorRepository.findByAddress(command.donorAddress);
    const isFirstDonation = !donor;
    const previousLevel = donor?.level || 0;

    if (!donor) {
      donor = new Donor(command.donorAddress, 0, 0, 0);
    }

    // 3. Process XRPL payment
    const txResult = await this.xrplGateway.sendPayment({
      from: command.donorAddress,
      to: this.poolWalletAddress,
      amount: command.amount,
    });

    // 4. Update donor
    donor.addDonation(command.amount);

    // 5. Update pool
    this.poolService.addDonation(command.amount);

    // 6. Mint/Evolve NFT if level changed
    let nftResult;
    if (donor.shouldEvolveNFT(previousLevel)) {
      const nft = await this.xrplGateway.mintNFT({
        ownerAddress: donor.address,
        level: donor.level,
        xp: donor.xp,
      });

      donor.nftTokenId = nft.tokenId;

      nftResult = {
        tokenId: nft.tokenId,
        tier: donor.getNFTTier(),
        evolved: previousLevel > 0,
      };
    }

    // 7. Mint DIT token if first donation
    let ditResult;
    if (donor.shouldReceiveDIT()) {
      const dit = await this.xrplGateway.mintDIT({
        ownerAddress: donor.address,
        votingPower: donor.getVotingPower(),
      });

      donor.ditTokenId = dit.tokenId;

      ditResult = {
        tokenId: dit.tokenId,
        votingPower: donor.getVotingPower(),
      };
    }

    // 8. Save donor
    await this.donorRepository.save(donor);

    // 9. Return result
    const donorCount = await this.donorRepository.count();

    return {
      donor,
      transaction: {
        txHash: txResult.txHash,
        fee: txResult.fee,
        validated: txResult.validated,
      },
      nft: nftResult,
      dit: ditResult,
      poolState: {
        totalBalance: this.poolService.getBalance(),
        donorCount,
      },
    };
  }

  private validate(command: DonateCommand): void {
    if (command.amount <= 0) {
      throw new Error('Amount must be positive');
    }

    if (command.amount > 1000000) {
      throw new Error('Amount exceeds maximum allowed');
    }

    if (!command.donorAddress.match(/^r[a-zA-Z0-9]{24,34}$/)) {
      throw new Error('Invalid XRPL address format');
    }
  }
}

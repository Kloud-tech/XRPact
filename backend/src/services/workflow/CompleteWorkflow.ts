/**
 * Complete Workflow Implementation
 *
 * Full flow from donor to NFT proof of impact:
 * 1. Donor creates donation
 * 2. Funds go to AMM pool (generate yield)
 * 3. Smart Escrow created with conditions
 * 4. AI Trust Optimizer selects validators
 * 5. Validators verify on ground (photo + GPS)
 * 6. Decision: Escrow released OR Clawback
 * 7. Pin color updates (Yellow -> Green/Red)
 * 8. NFT minted for successful projects
 */

import { Client, Wallet, xrpToDrops, dropsToXrp } from 'xrpl';
import { trustOptimizer } from '../ai/TrustOptimizer';
import type { OracleValidator } from '../oracle/OracleRegistry';

// ===== Types =====

interface Donor {
  address: string;
  name: string;
}

interface Project {
  id: string;
  title: string;
  category: 'Water' | 'Education' | 'Health' | 'Climate' | 'Infrastructure';
  location: { lat: number; lng: number; country: string; region: string };
  amount: number;
  entrepreneur: { name: string; address: string };
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  riskLevel: number;
}

interface EscrowConditions {
  photosRequired: number;
  validatorsRequired: number;
  deadline: Date;
  gpsRadius: number; // meters
}

interface ValidationProof {
  validatorId: string;
  validatorName: string;
  photoUrl: string;
  gpsLocation: { lat: number; lng: number };
  timestamp: Date;
  signature: string;
  approved: boolean;
}

interface WorkflowState {
  projectId: string;
  status: 'PENDING' | 'ESCROW_CREATED' | 'IN_AMM' | 'VALIDATING' | 'FUNDED' | 'FAILED';
  pinColor: 'YELLOW' | 'GREEN' | 'RED';
  escrowHash?: string;
  ammPoolBalance?: number;
  yieldGenerated?: number;
  selectedValidators?: string[];
  validationProofs?: ValidationProof[];
  nftTokenId?: string;
  finalAmount?: number;
}

export class CompleteWorkflow {
  private client: Client;
  private fundWallet: Wallet;
  private states: Map<string, WorkflowState> = new Map();

  constructor() {
    this.client = new Client('wss://s.altnet.rippletest.net:51233');
    this.fundWallet = Wallet.generate();
  }

  async connect(): Promise<void> {
    await this.client.connect();
    console.log('[Workflow] Connected to XRPL Testnet');
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  /**
   * STEP 1-3: Donor creates donation -> AMM Pool -> Smart Escrow
   */
  async initiateDonation(donor: Donor, project: Project, conditions: EscrowConditions): Promise<string> {
    console.log(`\n[STEP 1] 💰 Donor ${donor.name} initiates ${project.amount} XRP for "${project.title}"`);

    const workflowState: WorkflowState = {
      projectId: project.id,
      status: 'PENDING',
      pinColor: 'YELLOW'
    };

    // STEP 2: Send funds to AMM Pool
    console.log(`\n[STEP 2] 📊 Sending funds to AMM Pool for yield generation...`);
    const ammDeposit = await this.depositToAMM(project.amount);
    workflowState.status = 'IN_AMM';
    workflowState.ammPoolBalance = ammDeposit.poolBalance;
    workflowState.yieldGenerated = 0;

    console.log(`   ✅ Deposited ${project.amount} XRP to AMM`);
    console.log(`   📈 Current pool balance: ${ammDeposit.poolBalance.toLocaleString()} XRP`);
    console.log(`   💹 Expected yield: ~${ammDeposit.expectedYield.toFixed(2)} XRP/month`);

    // STEP 3: Create Smart Escrow with conditions
    console.log(`\n[STEP 3] 🔒 Creating Smart Escrow (XLS-100)...`);
    const escrowHash = await this.createSmartEscrow(project, conditions);
    workflowState.status = 'ESCROW_CREATED';
    workflowState.escrowHash = escrowHash;

    console.log(`   ✅ Escrow created: ${escrowHash}`);
    console.log(`   📋 Conditions:`);
    console.log(`      - ${conditions.photosRequired} photos required`);
    console.log(`      - ${conditions.validatorsRequired} validators needed`);
    console.log(`      - Deadline: ${conditions.deadline.toLocaleDateString()}`);
    console.log(`      - GPS radius: ${conditions.gpsRadius}m`);
    console.log(`   🟡 Pin color: YELLOW (awaiting validation)`);

    this.states.set(project.id, workflowState);

    // STEP 4: Launch AI Trust Optimizer
    await this.selectValidatorsWithAI(project, conditions.validatorsRequired);

    return project.id;
  }

  /**
   * STEP 4: AI Trust Optimizer selects best validators
   */
  private async selectValidatorsWithAI(project: Project, requiredCount: number): Promise<void> {
    console.log(`\n[STEP 4] 🤖 AI Trust Optimizer analyzing validators...`);

    const state = this.states.get(project.id)!;

    // Mock available validators
    const availableValidators = [
      {
        id: 'VAL_001',
        name: 'Amadou Diallo',
        location: { lat: 14.6928, lng: -17.4467 },
        reputation: 98,
        specialties: ['Water', 'Infrastructure'],
        avgResponseTime: 2,
        successRate: 97.9,
        validationsCompleted: 47
      },
      {
        id: 'VAL_003',
        name: 'Fatou Sow',
        location: { lat: 14.7645, lng: -17.3660 },
        reputation: 95,
        specialties: ['Water', 'Health'],
        avgResponseTime: 1.5,
        successRate: 95.2,
        validationsCompleted: 42
      },
      {
        id: 'VAL_005',
        name: 'Moussa Kane',
        location: { lat: 14.5000, lng: -14.5000 },
        reputation: 97,
        specialties: ['Water', 'Education'],
        avgResponseTime: 2.5,
        successRate: 96.8,
        validationsCompleted: 39
      }
    ];

    const projectContext = {
      category: project.category,
      location: project.location,
      amount: project.amount,
      urgency: project.urgency,
      riskLevel: project.riskLevel
    };

    const selectedValidators = await trustOptimizer.selectOptimalValidators(
      projectContext,
      availableValidators,
      requiredCount
    );

    state.selectedValidators = selectedValidators.map(v => v.validatorId);
    state.status = 'VALIDATING';

    console.log(`   ✅ AI selected ${selectedValidators.length} optimal validators:`);
    selectedValidators.forEach((v, i) => {
      console.log(`      ${i + 1}. ${v.validatorName} (Score: ${v.overallScore.toFixed(1)}/100)`);
    });

    const successProb = trustOptimizer.predictSuccessProbability(projectContext, selectedValidators);
    console.log(`   📊 Predicted success probability: ${(successProb * 100).toFixed(1)}%`);
  }

  /**
   * STEP 5: Validators submit validation proofs
   */
  async submitValidation(
    projectId: string,
    validatorId: string,
    validatorName: string,
    photoUrl: string,
    gpsLocation: { lat: number; lng: number }
  ): Promise<void> {
    console.log(`\n[STEP 5] ✅ Validator ${validatorName} submitting proof...`);

    const state = this.states.get(projectId)!;
    if (!state.validationProofs) state.validationProofs = [];

    // Verify GPS proximity
    const project = this.getProjectById(projectId);
    const distance = this.calculateDistance(
      gpsLocation.lat,
      gpsLocation.lng,
      project.location.lat,
      project.location.lng
    );

    const approved = distance <= 500; // 500m radius

    const proof: ValidationProof = {
      validatorId,
      validatorName,
      photoUrl,
      gpsLocation,
      timestamp: new Date(),
      signature: `0x${Math.random().toString(16).substring(2, 66)}`, // Mock signature
      approved
    };

    state.validationProofs.push(proof);

    console.log(`   📸 Photo uploaded: ${photoUrl}`);
    console.log(`   📍 GPS: ${gpsLocation.lat.toFixed(4)}, ${gpsLocation.lng.toFixed(4)}`);
    console.log(`   📏 Distance from project: ${distance.toFixed(0)}m`);
    console.log(`   ${approved ? '✅ APPROVED' : '❌ REJECTED'} (${approved ? 'within' : 'outside'} 500m radius)`);

    // Check if all validators have submitted
    this.checkValidationCompletion(projectId);
  }

  /**
   * STEP 6: Decision - Release escrow OR Clawback
   */
  private async checkValidationCompletion(projectId: string): Promise<void> {
    const state = this.states.get(projectId)!;
    const project = this.getProjectById(projectId);

    const approvedValidations = (state.validationProofs || []).filter(p => p.approved).length;
    const requiredValidations = 3; // From conditions

    if (approvedValidations < requiredValidations) {
      console.log(`   ⏳ Waiting for more validations (${approvedValidations}/${requiredValidations})...`);
      return;
    }

    console.log(`\n[STEP 6] 🎯 All validations complete! Making decision...`);

    // SUCCESS PATH
    if (approvedValidations >= requiredValidations) {
      console.log(`   ✅ CONDITION MET: ${approvedValidations}/${requiredValidations} validators approved`);
      await this.releaseEscrow(projectId);
    } else {
      // FAILURE PATH
      console.log(`   ❌ CONDITION FAILED: Only ${approvedValidations}/${requiredValidations} approved`);
      await this.executeClawback(projectId);
    }
  }

  /**
   * SUCCESS: Release escrow + Update pin to GREEN + Mint NFT
   */
  private async releaseEscrow(projectId: string): Promise<void> {
    console.log(`\n   💚 [SUCCESS PATH] Releasing escrow...`);

    const state = this.states.get(projectId)!;
    const project = this.getProjectById(projectId);

    // Withdraw from AMM (with yield)
    const ammWithdrawal = await this.withdrawFromAMM(project.amount);
    const totalAmount = ammWithdrawal.principal + ammWithdrawal.yield;

    state.yieldGenerated = ammWithdrawal.yield;
    state.finalAmount = totalAmount;

    console.log(`   📤 Withdrew from AMM:`);
    console.log(`      - Principal: ${ammWithdrawal.principal.toLocaleString()} XRP`);
    console.log(`      - Yield: ${ammWithdrawal.yield.toLocaleString()} XRP`);
    console.log(`      - Total: ${totalAmount.toLocaleString()} XRP`);

    // Release escrow to entrepreneur
    console.log(`   💸 Sending ${totalAmount} XRP to ${project.entrepreneur.name}...`);
    console.log(`   ✅ Payment sent to ${project.entrepreneur.address}`);

    // Update pin color to GREEN
    state.pinColor = 'GREEN';
    state.status = 'FUNDED';
    console.log(`   🟢 Pin color updated: GREEN (funded & completed)`);

    // Mint NFT Proof of Impact
    const nftTokenId = await this.mintProofOfImpactNFT(projectId);
    state.nftTokenId = nftTokenId;

    console.log(`   🎨 NFT minted: ${nftTokenId}`);
    console.log(`   📬 NFT sent to donor as permanent proof`);
    console.log(`\n   🎉 PROJECT SUCCESSFULLY FUNDED!`);
  }

  /**
   * FAILURE: Execute clawback + Update pin to RED
   */
  private async executeClawback(projectId: string): Promise<void> {
    console.log(`\n   ❌ [FAILURE PATH] Executing clawback...`);

    const state = this.states.get(projectId)!;
    const project = this.getProjectById(projectId);

    // Withdraw from AMM (return principal only)
    const ammWithdrawal = await this.withdrawFromAMM(project.amount);

    console.log(`   🔙 Returning ${ammWithdrawal.principal} XRP to donor...`);
    console.log(`   ✅ Funds returned to original donor`);
    console.log(`   💹 Yield (${ammWithdrawal.yield} XRP) stays in fund for next projects`);

    // Update pin color to RED
    state.pinColor = 'RED';
    state.status = 'FAILED';
    console.log(`   🔴 Pin color updated: RED (failed validation)`);
    console.log(`\n   ⚠️  PROJECT CANCELLED - FUNDS RETURNED`);
  }

  /**
   * STEP 7: Mint Geographic NFT as Proof of Impact
   */
  private async mintProofOfImpactNFT(projectId: string): Promise<string> {
    const state = this.states.get(projectId)!;
    const project = this.getProjectById(projectId);

    const metadata = {
      projectId: project.id,
      title: project.title,
      category: project.category,
      location: project.location,
      amount: state.finalAmount,
      validations: state.validationProofs,
      completionDate: new Date().toISOString(),
      impact: this.calculateImpactMetrics(project)
    };

    // Mock NFT minting
    const tokenId = `NFT_${project.id}_${Date.now()}`;

    return tokenId;
  }

  // ===== Helper Methods =====

  private async depositToAMM(amount: number): Promise<{ poolBalance: number; expectedYield: number }> {
    // Mock AMM deposit
    const poolBalance = 150000 + amount;
    const expectedYield = amount * 0.098 / 12; // 9.8% APY monthly
    return { poolBalance, expectedYield };
  }

  private async withdrawFromAMM(principal: number): Promise<{ principal: number; yield: number }> {
    // Mock yield generation (assume 1 month passed)
    const yieldAmount = principal * 0.098 / 12; // 9.8% APY monthly
    return { principal, yield: yieldAmount };
  }

  private async createSmartEscrow(project: Project, conditions: EscrowConditions): Promise<string> {
    // Mock escrow creation
    return `ESC_${project.id}_${Date.now()}`;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth radius in meters
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private getProjectById(projectId: string): Project {
    // Mock project data
    return {
      id: projectId,
      title: 'Puits au Sénégal',
      category: 'Water',
      location: { lat: 14.4974, lng: -14.4524, country: 'Senegal', region: 'Dakar' },
      amount: 5000,
      entrepreneur: { name: 'Ibrahima Ndiaye', address: 'rEntrepreneur123...' },
      urgency: 'MEDIUM',
      riskLevel: 20
    };
  }

  private calculateImpactMetrics(project: Project): any {
    // Mock impact calculation
    switch (project.category) {
      case 'Water':
        return { beneficiaries: 500, litersPerDay: 10000, co2Saved: 2.5 };
      case 'Education':
        return { students: 120, teachers: 8, books: 500 };
      case 'Health':
        return { patients: 300, consultations: 1200, vaccines: 800 };
      case 'Climate':
        return { treesPlanted: 1000, co2Captured: 25, hectares: 5 };
      case 'Infrastructure':
        return { households: 200, kwh: 50000, co2Avoided: 15 };
      default:
        return {};
    }
  }

  /**
   * Get workflow state for UI
   */
  getState(projectId: string): WorkflowState | undefined {
    return this.states.get(projectId);
  }

  /**
   * Get all workflow states (for map visualization)
   */
  getAllStates(): WorkflowState[] {
    return Array.from(this.states.values());
  }
}

// ===== DEMO =====

// if (require.main === module) {
//   (async () => {
//     console.log('╔════════════════════════════════════════════════════════╗');
//     console.log('║       COMPLETE WORKFLOW DEMONSTRATION                  ║');
//     console.log('║  Donor → AMM → Escrow → AI → Validators → NFT         ║');
//     console.log('╚════════════════════════════════════════════════════════╝\n');
// 
//     const workflow = new CompleteWorkflow();
// 
//     const donor: Donor = {
//       address: 'rDonor123456789...',
//       name: 'Alice Dupont'
//     };
// 
//     const project: Project = {
//       id: 'PRJ_SENEGAL_WELL_001',
//       title: 'Puits au Sénégal',
//       category: 'Water',
//       location: { lat: 14.4974, lng: -14.4524, country: 'Senegal', region: 'Dakar' },
//       amount: 5000,
//       entrepreneur: { name: 'Ibrahima Ndiaye', address: 'rEntrepreneur123...' },
//       urgency: 'MEDIUM',
//       riskLevel: 20
//     };
// 
//     const conditions: EscrowConditions = {
//       photosRequired: 3,
//       validatorsRequired: 3,
//       deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
//       gpsRadius: 500
//     };
// 
//     // STEPS 1-4: Initiate donation
//     const projectId = await workflow.initiateDonation(donor, project, conditions);
// 
//     // Simulate time passing...
//     console.log('\n⏰ [Time passes... validators visit the site]\n');
// 
//     // STEP 5: Validators submit proofs (3 validations)
//     await workflow.submitValidation(
//       projectId,
//       'VAL_001',
//       'Amadou Diallo',
//       'https://storage.xrpl.org/senegal-well-photo1.jpg',
//       { lat: 14.4980, lng: -14.4530 } // ~60m from project
//     );
// 
//     await workflow.submitValidation(
//       projectId,
//       'VAL_003',
//       'Fatou Sow',
//       'https://storage.xrpl.org/senegal-well-photo2.jpg',
//       { lat: 14.4970, lng: -14.4520 } // ~20m from project
//     );
// 
//     await workflow.submitValidation(
//       projectId,
//       'VAL_005',
//       'Moussa Kane',
//       'https://storage.xrpl.org/senegal-well-photo3.jpg',
//       { lat: 14.4975, lng: -14.4525 } // ~10m from project
//     );
// 
//     // STEP 6-7 happen automatically after all validations
// 
//     console.log('\n═══════════════════════════════════════════════════════');
//     console.log('             WORKFLOW DEMONSTRATION COMPLETE');
//     console.log('═══════════════════════════════════════════════════════\n');
// 
//     const finalState = workflow.getState(projectId);
//     console.log('Final State:', JSON.stringify(finalState, null, 2));
//   })();
// }

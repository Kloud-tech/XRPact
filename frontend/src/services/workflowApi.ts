/**
 * Workflow API Client
 *
 * Communicates with the backend workflow API
 */

const API_BASE_URL = 'http://localhost:3001/api/workflow';

export interface DonationRequest {
  donor: {
    address: string;
    name: string;
  };
  project: {
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
    entrepreneur: {
      name: string;
      address: string;
    };
    urgency: 'LOW' | 'MEDIUM' | 'HIGH';
    riskLevel: number;
  };
  conditions: {
    photosRequired: number;
    validatorsRequired: number;
    deadline: Date;
    gpsRadius: number;
  };
}

export interface ValidationRequest {
  projectId: string;
  validatorId: string;
  validatorName: string;
  photoUrl: string;
  gpsLocation: {
    lat: number;
    lng: number;
  };
}

export interface WorkflowState {
  projectId: string;
  status: 'PENDING' | 'ESCROW_CREATED' | 'IN_AMM' | 'VALIDATING' | 'FUNDED' | 'FAILED';
  pinColor: 'YELLOW' | 'GREEN' | 'RED';
  escrowHash?: string;
  ammPoolBalance?: number;
  yieldGenerated?: number;
  selectedValidators?: string[];
  validationProofs?: Array<{
    validatorId: string;
    validatorName: string;
    photoUrl: string;
    gpsLocation: { lat: number; lng: number };
    timestamp: Date;
    signature: string;
    approved: boolean;
  }>;
  nftTokenId?: string;
  finalAmount?: number;
}

/**
 * Initiate a new donation and start the workflow
 */
export async function initiateDonation(request: DonationRequest): Promise<{
  success: boolean;
  projectId: string;
  state: WorkflowState;
  message: string;
}> {
  const response = await fetch(`${API_BASE_URL}/donate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to initiate donation');
  }

  return response.json();
}

/**
 * Submit a validation proof
 */
export async function submitValidation(request: ValidationRequest): Promise<{
  success: boolean;
  state: WorkflowState;
  message: string;
}> {
  const response = await fetch(`${API_BASE_URL}/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit validation');
  }

  return response.json();
}

/**
 * Get the current state of a project
 */
export async function getProjectState(projectId: string): Promise<WorkflowState> {
  const response = await fetch(`${API_BASE_URL}/state/${projectId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get project state');
  }

  const data = await response.json();
  return data.state;
}

/**
 * Get all project states (for map visualization)
 */
export async function getAllStates(): Promise<WorkflowState[]> {
  const response = await fetch(`${API_BASE_URL}/all-states`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get all states');
  }

  const data = await response.json();
  return data.states;
}

/**
 * Simulate a complete successful workflow (demo)
 */
export async function simulateWorkflow(params?: {
  donorName?: string;
  projectTitle?: string;
  category?: string;
  amount?: number;
}): Promise<{
  success: boolean;
  projectId: string;
  finalState: WorkflowState;
  message: string;
}> {
  const response = await fetch(`${API_BASE_URL}/simulate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params || {}),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to simulate workflow');
  }

  return response.json();
}

/**
 * Workflow API Routes
 *
 * RESTful endpoints to interact with the complete workflow
 */

import express, { Request, Response } from 'express';
import { CompleteWorkflow } from '../services/workflow/CompleteWorkflow';

const router = express.Router();
const workflow = new CompleteWorkflow();

// Initialize workflow (connect to XRPL)
let isConnected = false;

async function ensureConnected() {
  if (!isConnected) {
    await workflow.connect();
    isConnected = true;
  }
}

/**
 * POST /api/workflow/donate
 *
 * Initiate a new donation and start the workflow
 *
 * Body:
 * {
 *   donor: { address: string, name: string },
 *   project: { ... },
 *   conditions: { ... }
 * }
 */
router.post('/donate', async (req: Request, res: Response) => {
  try {
    await ensureConnected();

    const { donor, project, conditions } = req.body;

    // Validate input
    if (!donor?.address || !project?.id || !conditions) {
      return res.status(400).json({
        error: 'Missing required fields: donor, project, or conditions'
      });
    }

    // Parse deadline if string
    if (typeof conditions.deadline === 'string') {
      conditions.deadline = new Date(conditions.deadline);
    }

    // Initiate donation workflow
    const projectId = await workflow.initiateDonation(donor, project, conditions);

    // Get initial state
    const state = workflow.getState(projectId);

    res.json({
      success: true,
      projectId,
      state,
      message: 'Donation initiated successfully. Workflow started.'
    });

  } catch (error: any) {
    console.error('[API] Error initiating donation:', error);
    res.status(500).json({
      error: 'Failed to initiate donation',
      details: error.message
    });
  }
});

/**
 * POST /api/workflow/validate
 *
 * Submit a validation proof from a validator
 *
 * Body:
 * {
 *   projectId: string,
 *   validatorId: string,
 *   validatorName: string,
 *   photoUrl: string,
 *   gpsLocation: { lat: number, lng: number }
 * }
 */
router.post('/validate', async (req: Request, res: Response) => {
  try {
    await ensureConnected();

    const { projectId, validatorId, validatorName, photoUrl, gpsLocation } = req.body;

    // Validate input
    if (!projectId || !validatorId || !validatorName || !photoUrl || !gpsLocation) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    // Submit validation
    await workflow.submitValidation(
      projectId,
      validatorId,
      validatorName,
      photoUrl,
      gpsLocation
    );

    // Get updated state
    const state = workflow.getState(projectId);

    res.json({
      success: true,
      state,
      message: 'Validation submitted successfully'
    });

  } catch (error: any) {
    console.error('[API] Error submitting validation:', error);
    res.status(500).json({
      error: 'Failed to submit validation',
      details: error.message
    });
  }
});

/**
 * GET /api/workflow/state/:projectId
 *
 * Get the current state of a project workflow
 */
router.get('/state/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const state = workflow.getState(projectId);

    if (!state) {
      return res.status(404).json({
        error: 'Project not found'
      });
    }

    res.json({
      success: true,
      state
    });

  } catch (error: any) {
    console.error('[API] Error getting state:', error);
    res.status(500).json({
      error: 'Failed to get project state',
      details: error.message
    });
  }
});

/**
 * GET /api/workflow/all-states
 *
 * Get all project workflow states (for map visualization)
 */
router.get('/all-states', async (req: Request, res: Response) => {
  try {
    const states = workflow.getAllStates();

    res.json({
      success: true,
      count: states.length,
      states
    });

  } catch (error: any) {
    console.error('[API] Error getting all states:', error);
    res.status(500).json({
      error: 'Failed to get workflow states',
      details: error.message
    });
  }
});

/**
 * POST /api/workflow/simulate
 *
 * Simulate a complete successful workflow for demo purposes
 */
router.post('/simulate', async (req: Request, res: Response) => {
  try {
    await ensureConnected();

    // Create demo project
    const donor = {
      address: 'rDonor123456789...',
      name: req.body.donorName || 'Alice Dupont'
    };

    const project = {
      id: `PRJ_DEMO_${Date.now()}`,
      title: req.body.projectTitle || 'Puits au Sénégal',
      category: req.body.category || 'Water',
      location: req.body.location || {
        lat: 14.4974,
        lng: -14.4524,
        country: 'Senegal',
        region: 'Dakar'
      },
      amount: req.body.amount || 5000,
      entrepreneur: {
        name: 'Ibrahima Ndiaye',
        address: 'rEntrepreneur123...'
      },
      urgency: 'MEDIUM' as const,
      riskLevel: 20
    };

    const conditions = {
      photosRequired: 3,
      validatorsRequired: 3,
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      gpsRadius: 500
    };

    // Step 1-4: Initiate donation
    const projectId = await workflow.initiateDonation(donor, project, conditions);

    // Step 5: Submit 3 validations
    await workflow.submitValidation(
      projectId,
      'VAL_001',
      'Amadou Diallo',
      'https://storage.xrpl.org/demo-photo1.jpg',
      { lat: 14.4980, lng: -14.4530 }
    );

    await workflow.submitValidation(
      projectId,
      'VAL_003',
      'Fatou Sow',
      'https://storage.xrpl.org/demo-photo2.jpg',
      { lat: 14.4970, lng: -14.4520 }
    );

    await workflow.submitValidation(
      projectId,
      'VAL_005',
      'Moussa Kane',
      'https://storage.xrpl.org/demo-photo3.jpg',
      { lat: 14.4975, lng: -14.4525 }
    );

    // Get final state
    const finalState = workflow.getState(projectId);

    res.json({
      success: true,
      projectId,
      finalState,
      message: 'Workflow simulation completed successfully'
    });

  } catch (error: any) {
    console.error('[API] Error simulating workflow:', error);
    res.status(500).json({
      error: 'Failed to simulate workflow',
      details: error.message
    });
  }
});

export default router;

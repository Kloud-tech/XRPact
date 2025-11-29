/**
 * Emergency Routes
 */

import { Router } from 'express';
import { EmergencyController } from '../controllers/emergency.controller';

const router = Router();

// Initialize controller (will be properly injected later)
const emergencyController = new EmergencyController(null as any);

/**
 * GET /api/v1/emergency/status
 * Get current emergency status
 */
router.get('/status', (req, res, next) =>
  emergencyController.getStatus(req, res, next)
);

/**
 * POST /api/v1/emergency/trigger
 * Trigger new emergency
 */
router.post('/trigger', (req, res, next) =>
  emergencyController.trigger(req, res, next)
);

/**
 * POST /api/v1/emergency/:id/vote
 * Vote on emergency
 */
router.post('/:id/vote', (req, res, next) =>
  emergencyController.vote(req, res, next)
);

/**
 * GET /api/v1/emergency/history
 * Get emergency history
 */
router.get('/history', (req, res) => {
  res.json({
    success: true,
    data: {
      emergencies: [],
      total: 0,
    },
  });
});

export default router;

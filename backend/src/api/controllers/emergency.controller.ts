/**
 * Emergency Controller
 * Handles HTTP requests for emergency fund management
 */

import { Request, Response, NextFunction } from 'express';
import { TriggerEmergencyUseCase } from '../../core/usecases/trigger-emergency.usecase';

export class EmergencyController {
  constructor(
    private triggerEmergencyUseCase: TriggerEmergencyUseCase
  ) {}

  /**
   * POST /api/v1/emergency/trigger
   * Trigger a new emergency fund release
   */
  async trigger(req: Request, res: Response, next: NextFunction) {
    try {
      const command = {
        triggeredBy: req.body.triggeredBy,
        severity: req.body.severity,
        reason: req.body.reason,
        amountRequested: req.body.amountRequested,
        affectedNGOs: req.body.affectedNGOs || [],
      };

      const result = await this.triggerEmergencyUseCase.execute(command);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/emergency/status
   * Get current emergency status
   */
  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: Implement with repository
      res.json({
        success: true,
        data: {
          active: false,
          pending: [],
          history: [],
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/emergency/:id/vote
   * Vote on an emergency proposal
   */
  async vote(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { voterAddress, inFavor } = req.body;

      // TODO: Implement voting logic

      res.json({
        success: true,
        data: {
          emergencyId: id,
          voted: true,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

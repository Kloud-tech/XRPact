/**
 * Global Error Handler Middleware
 * Catches all errors and returns consistent error responses
 */

import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(400, message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(404, message, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class XRPLError extends AppError {
  constructor(message: string, public txHash?: string) {
    super(500, message, 'XRPL_ERROR', { txHash });
    this.name = 'XRPLError';
  }
}

/**
 * Error Handler Middleware
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  console.error('[Error]', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Default error response
  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';
  let details: any = undefined;

  // Handle known errors
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code || 'APP_ERROR';
    details = err.details;
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
      }),
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * 404 Not Found Handler
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
    timestamp: new Date().toISOString(),
  });
}

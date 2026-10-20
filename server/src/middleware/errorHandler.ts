import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.message,
    });
    return;
  }

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern || {})[0] || 'field';
    res.status(409).json({
      success: false,
      message: `Duplicate value for ${field}`,
    });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
}

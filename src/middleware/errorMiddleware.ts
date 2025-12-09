
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../errors/HttpError';
import { logger } from '../lib/logger';

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    logger.warn('Validation error', err.issues);
    return res.status(400).json({
      message: 'Invalid request parameters',
      details: err.issues
    });
  }

  if (err instanceof HttpError) {
    logger.warn('HttpError thrown', { statusCode: err.statusCode, message: err.message, details: err.details });
    return res.status(err.statusCode).json({
      message: err.message,
      details: err.details
    });
  }

  logger.error('Unhandled error', err);
  return res.status(500).json({
    message: 'Internal server error'
  });
}

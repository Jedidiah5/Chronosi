import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let { statusCode = 500, message, code } = error;

  // Log the error
  logger.error('Error occurred:', {
    error: {
      message: error.message,
      stack: error.stack,
      statusCode,
      code,
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id,
    },
  });

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (error.code === '23505') { // PostgreSQL unique constraint violation
    statusCode = 409;
    message = 'Resource already exists';
  } else if (error.code === '23503') { // PostgreSQL foreign key constraint violation
    statusCode = 400;
    message = 'Invalid reference';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal Server Error';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
    timestamp: new Date().toISOString(),
    path: req.url,
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  logger.warn('Route not found:', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
    },
    timestamp: new Date().toISOString(),
    path: req.url,
  });
};

// Utility function to create custom errors
export const createError = (message: string, statusCode: number = 500, code?: string): CustomError => {
  return new CustomError(message, statusCode, code);
};

// Common error types
export const BadRequestError = (message: string = 'Bad Request') => 
  createError(message, 400, 'BAD_REQUEST');

export const UnauthorizedError = (message: string = 'Unauthorized') => 
  createError(message, 401, 'UNAUTHORIZED');

export const ForbiddenError = (message: string = 'Forbidden') => 
  createError(message, 403, 'FORBIDDEN');

export const NotFoundError = (message: string = 'Not Found') => 
  createError(message, 404, 'NOT_FOUND');

export const ConflictError = (message: string = 'Conflict') => 
  createError(message, 409, 'CONFLICT');

export const ValidationError = (message: string = 'Validation Error') => 
  createError(message, 422, 'VALIDATION_ERROR');

export const TooManyRequestsError = (message: string = 'Too Many Requests') => 
  createError(message, 429, 'TOO_MANY_REQUESTS');

export const InternalServerError = (message: string = 'Internal Server Error') => 
  createError(message, 500, 'INTERNAL_SERVER_ERROR');







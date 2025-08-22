import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from './errorHandler.js';
import { logger } from '../utils/logger.js';
import { query } from '../database/connection.js';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        isActive: boolean;
        isVerified: boolean;
      };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw UnauthorizedError('Access token is required');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET environment variable is not set');
      throw InternalServerError('Server configuration error');
    }

    // Verify JWT token
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    if (!decoded || !decoded.userId) {
      throw UnauthorizedError('Invalid token');
    }

    // Check if user exists and is active
    const userResult = await query(
      'SELECT id, email, username, is_active, is_verified FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      throw UnauthorizedError('User not found');
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      throw ForbiddenError('User account is deactivated');
    }

    // Add user info to request
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      isActive: user.is_active,
      isVerified: user.is_verified,
    };

    logger.debug('User authenticated successfully', {
      userId: user.id,
      username: user.username,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(UnauthorizedError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(UnauthorizedError('Token expired'));
    } else {
      next(error);
    }
  }
};

export const requireVerifiedUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    next(UnauthorizedError('Authentication required'));
    return;
  }

  if (!req.user.isVerified) {
    next(ForbiddenError('Email verification required'));
    return;
  }

  next();
};

export const requireActiveUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    next(UnauthorizedError('Authentication required'));
    return;
  }

  if (!req.user.isActive) {
    next(ForbiddenError('Account is deactivated'));
    return;
  }

  next();
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      next(); // Continue without user context
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      next(); // Continue without user context
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    if (!decoded || !decoded.userId) {
      next(); // Continue without user context
      return;
    }

    // Check if user exists and is active
    const userResult = await query(
      'SELECT id, email, username, is_active, is_verified FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      if (user.is_active) {
        req.user = {
          id: user.id,
          email: user.email,
          username: user.username,
          isActive: user.is_active,
          isVerified: user.is_verified,
        };
      }
    }

    next();
  } catch (error) {
    // Continue without user context on any error
    next();
  }
};

// Rate limiting for authentication endpoints
export const authRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: 15 * 60, // 15 minutes
  },
  standardHeaders: true,
  legacyHeaders: false,
};

// Import InternalServerError for use in this file
import { InternalServerError } from './errorHandler.js';







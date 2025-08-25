import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import rateLimit from 'express-rate-limit';

import { query } from '../database/sqlite-connection.js';
import { logger } from '../utils/logger.js';
import { authenticateToken } from '../middleware/auth.js';
import { 
  BadRequestError, 
  UnauthorizedError, 
  ConflictError, 
  ValidationError,
  InternalServerError 
} from '../middleware/errorHandler.js';

const router = Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: 15 * 60, // 15 minutes
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Helper function to generate tokens
const generateTokens = (userId: string) => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  
  if (!jwtSecret || !jwtRefreshSecret) {
    throw InternalServerError('Server configuration error');
  }

  const accessToken = jwt.sign(
    { userId, type: 'access' },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    jwtRefreshSecret,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );

  return { accessToken, refreshToken };
};

// Register new user
router.post('/register', authLimiter, validateRegistration, async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ValidationError(errors.array()[0].msg);
    }

    const { email, username, password } = req.body;

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      throw ConflictError('User with this email or username already exists');
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await query(
      `INSERT INTO users (email, username, password_hash, is_verified)
       VALUES ($1, $2, $3, false)
       RETURNING id, email, username, created_at`,
      [email, username, passwordHash]
    );

    const user = result.rows[0];

    // Create user preferences
    await query(
      'INSERT INTO user_preferences (user_id) VALUES ($1)',
      [user.id]
    );

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Store refresh token hash in database
    const refreshTokenHash = await bcrypt.hash(refreshToken, saltRounds);
    await query(
      `INSERT INTO user_sessions (user_id, refresh_token_hash, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        user.id,
        refreshTokenHash,
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        req.ip,
        req.get('User-Agent'),
      ]
    );

    logger.info('User registered successfully', {
      userId: user.id,
      email: user.email,
      username: user.username,
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          createdAt: user.created_at,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Login user
router.post('/login', authLimiter, validateLogin, async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ValidationError(errors.array()[0].msg);
    }

    const { email, password } = req.body;

    // Find user by email
    const result = await query(
      'SELECT id, email, username, password_hash, is_active, is_verified FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw UnauthorizedError('Invalid email or password');
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.is_active) {
      throw UnauthorizedError('Account is deactivated');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw UnauthorizedError('Invalid email or password');
    }

    // Update last login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Store refresh token hash in database
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const refreshTokenHash = await bcrypt.hash(refreshToken, saltRounds);
    await query(
      `INSERT INTO user_sessions (user_id, refresh_token_hash, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        user.id,
        refreshTokenHash,
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        req.ip,
        req.get('User-Agent'),
      ]
    );

    logger.info('User logged in successfully', {
      userId: user.id,
      email: user.email,
      username: user.username,
      ip: req.ip,
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          isVerified: user.is_verified,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Refresh access token
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw BadRequestError('Refresh token is required');
    }

    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtRefreshSecret) {
      throw InternalServerError('Server configuration error');
    }

    // Verify refresh token JWT signature and expiration
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, jwtRefreshSecret);
    } catch (jwtError) {
      const errorMessage = jwtError instanceof Error ? jwtError.message : 'Unknown JWT error';
      logger.warn('Invalid refresh token JWT', {
        error: errorMessage,
        ip: req.ip,
      });
      
      // Provide more specific error messages for different JWT errors
      if (errorMessage.includes('expired')) {
        throw UnauthorizedError('Refresh token has expired');
      } else if (errorMessage.includes('invalid signature')) {
        throw UnauthorizedError('Invalid refresh token signature');
      } else {
        throw UnauthorizedError('Invalid refresh token');
      }
    }

    if (!decoded || !decoded.userId || decoded.type !== 'refresh') {
      logger.warn('Malformed refresh token payload', {
        decoded,
        ip: req.ip,
      });
      throw UnauthorizedError('Invalid refresh token');
    }

    // Get all active sessions for this user to compare against stored hashes
    const sessionResult = await query(
      'SELECT id, user_id, refresh_token_hash FROM user_sessions WHERE user_id = $1 AND is_active = true AND expires_at > CURRENT_TIMESTAMP',
      [decoded.userId]
    );

    if (sessionResult.rows.length === 0) {
      logger.warn('No active sessions found for user', {
        userId: decoded.userId,
        ip: req.ip,
      });
      throw UnauthorizedError('Invalid or expired refresh token');
    }

    // Find matching session by comparing refresh token against stored hashes
    let matchingSession = null;
    for (const session of sessionResult.rows) {
      try {
        const isValidToken = await bcrypt.compare(refreshToken, session.refresh_token_hash);
        if (isValidToken) {
          matchingSession = session;
          break;
        }
      } catch (bcryptError) {
        logger.error('Error comparing refresh token hash', {
          error: bcryptError instanceof Error ? bcryptError.message : 'Unknown bcrypt error',
          sessionId: session.id,
          userId: decoded.userId,
        });
        // Continue checking other sessions
      }
    }

    if (!matchingSession) {
      logger.warn('Refresh token does not match any stored session', {
        userId: decoded.userId,
        ip: req.ip,
      });
      throw UnauthorizedError('Invalid refresh token');
    }

    // Verify user still exists and is active
    const userResult = await query(
      'SELECT id, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
      logger.warn('User not found or inactive during token refresh', {
        userId: decoded.userId,
        ip: req.ip,
      });
      // Invalidate the session
      await query(
        'UPDATE user_sessions SET is_active = false WHERE id = $1',
        [matchingSession.id]
      );
      throw UnauthorizedError('User account is not active');
    }

    // Generate new access token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw InternalServerError('Server configuration error');
    }

    const newAccessToken = jwt.sign(
      { userId: decoded.userId, type: 'access' },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    logger.info('Access token refreshed successfully', {
      userId: decoded.userId,
      sessionId: matchingSession.id,
      ip: req.ip,
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    // Log the error for debugging but don't expose internal details
    if (error instanceof Error && !error.message.includes('Invalid') && !error.message.includes('required')) {
      logger.error('Unexpected error during token refresh', {
        error: error.message,
        stack: error.stack,
        ip: req.ip,
      });
    }
    next(error);
  }
});

// Logout user
router.post('/logout', authenticateToken, async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user!.id;

    let sessionInvalidated = false;

    if (refreshToken) {
      try {
        // Get all active sessions for this user
        const sessionResult = await query(
          'SELECT id, refresh_token_hash FROM user_sessions WHERE user_id = $1 AND is_active = true',
          [userId]
        );

        // Find and invalidate the matching session
        for (const session of sessionResult.rows) {
          try {
            const isValidToken = await bcrypt.compare(refreshToken, session.refresh_token_hash);
            if (isValidToken) {
              await query(
                'UPDATE user_sessions SET is_active = false WHERE id = $1',
                [session.id]
              );
              sessionInvalidated = true;
              logger.info('Refresh token session invalidated during logout', {
                userId,
                sessionId: session.id,
                ip: req.ip,
              });
              break;
            }
          } catch (bcryptError) {
            logger.error('Error comparing refresh token during logout', {
              error: bcryptError instanceof Error ? bcryptError.message : 'Unknown bcrypt error',
              sessionId: session.id,
              userId,
            });
            // Continue checking other sessions
          }
        }

        if (!sessionInvalidated) {
          logger.warn('Refresh token not found during logout - may already be invalid', {
            userId,
            ip: req.ip,
          });
        }
      } catch (error) {
        logger.error('Error invalidating refresh token during logout', {
          error: error instanceof Error ? error.message : 'Unknown error',
          userId,
          ip: req.ip,
        });
        // Don't fail logout if token invalidation fails
      }
    } else {
      // If no refresh token provided, invalidate all sessions for this user
      try {
        const result = await query(
          'UPDATE user_sessions SET is_active = false WHERE user_id = $1 AND is_active = true',
          [userId]
        );
        logger.info('All user sessions invalidated during logout', {
          userId,
          sessionsInvalidated: result.rowCount || 0,
          ip: req.ip,
        });
      } catch (error) {
        logger.error('Error invalidating all sessions during logout', {
          error: error instanceof Error ? error.message : 'Unknown error',
          userId,
          ip: req.ip,
        });
        // Don't fail logout if session cleanup fails
      }
    }

    logger.info('User logged out successfully', {
      userId,
      sessionInvalidated,
      ip: req.ip,
    });

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    // Even if there are errors, we should still consider logout successful
    // to prevent users from being stuck in a logged-in state
    logger.error('Error during logout process', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id,
      ip: req.ip,
    });

    res.json({
      success: true,
      message: 'Logout successful',
    });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const result = await query(
      `SELECT id, email, username, first_name, last_name, avatar_url, is_verified, 
              last_login, created_at, updated_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw UnauthorizedError('User not found');
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          avatarUrl: user.avatar_url,
          isVerified: user.is_verified,
          lastLogin: user.last_login,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;







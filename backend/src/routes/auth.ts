import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import rateLimit from 'express-rate-limit';

import { query } from '../database/connection.js';
import { setCache, deleteCache } from '../database/redis.js';
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
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'),
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .trim()
    .withMessage('First name must be 1-100 characters'),
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .trim()
    .withMessage('Last name must be 1-100 characters'),
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

    const { email, username, password, firstName, lastName } = req.body;

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
      `INSERT INTO users (email, username, password_hash, first_name, last_name, is_verified)
       VALUES ($1, $2, $3, $4, $5, false)
       RETURNING id, email, username, first_name, last_name, created_at`,
      [email, username, passwordHash, firstName, lastName]
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
          firstName: user.first_name,
          lastName: user.last_name,
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

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, jwtRefreshSecret) as any;
    if (!decoded || !decoded.userId || decoded.type !== 'refresh') {
      throw UnauthorizedError('Invalid refresh token');
    }

    // Check if refresh token exists in database
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const refreshTokenHash = await bcrypt.hash(refreshToken, saltRounds);
    
    const sessionResult = await query(
      'SELECT id, user_id FROM user_sessions WHERE refresh_token_hash = $1 AND is_active = true AND expires_at > CURRENT_TIMESTAMP',
      [refreshTokenHash]
    );

    if (sessionResult.rows.length === 0) {
      throw UnauthorizedError('Invalid or expired refresh token');
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
    next(error);
  }
});

// Logout user
router.post('/logout', authenticateToken, async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user!.id;

    if (refreshToken) {
      // Invalidate refresh token
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const refreshTokenHash = await bcrypt.hash(refreshToken, saltRounds);
      
      await query(
        'UPDATE user_sessions SET is_active = false WHERE user_id = $1 AND refresh_token_hash = $2',
        [userId, refreshTokenHash]
      );
    }

    // Clear user cache
    await deleteCache(`user:${userId}`);

    logger.info('User logged out successfully', {
      userId,
      ip: req.ip,
    });

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
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







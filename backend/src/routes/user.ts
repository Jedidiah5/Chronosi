import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';

import { query } from '../database/connection.js';
import { setCache, deleteCache } from '../database/redis.js';
import { logger } from '../utils/logger.js';
import { authenticateToken, requireVerifiedUser } from '../middleware/auth.js';
import { 
  BadRequestError, 
  UnauthorizedError, 
  ValidationError,
  ConflictError 
} from '../middleware/errorHandler.js';

const router = Router();

// Validation middleware
const validateProfileUpdate = [
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
  body('avatarUrl')
    .optional()
    .isURL()
    .withMessage('Avatar URL must be a valid URL'),
];

const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must be at least 8 characters and contain uppercase, lowercase, number, and special character'),
];

const validatePreferences = [
  body('theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Theme must be light, dark, or auto'),
  body('language')
    .optional()
    .isLength({ min: 2, max: 10 })
    .trim()
    .withMessage('Language must be 2-10 characters'),
  body('timezone')
    .optional()
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('Timezone must be 1-50 characters'),
  body('notificationPreferences')
    .optional()
    .isObject()
    .withMessage('Notification preferences must be an object'),
];

// Get user profile
router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user!.id;

    // Check cache first
    const cacheKey = `user_profile:${userId}`;
    const cachedProfile = await getCache(cacheKey);
    if (cachedProfile) {
      return res.json({
        success: true,
        data: { profile: cachedProfile },
      });
    }

    // Get user profile with preferences
    const result = await query(
      `SELECT u.id, u.email, u.username, u.first_name, u.last_name, u.avatar_url, 
              u.is_verified, u.last_login, u.created_at, u.updated_at,
              up.theme, up.language, up.timezone, up.notification_preferences
       FROM users u
       LEFT JOIN user_preferences up ON u.id = up.user_id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw UnauthorizedError('User not found');
    }

    const user = result.rows[0];

    const profile = {
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
      preferences: {
        theme: user.theme || 'light',
        language: user.language || 'en',
        timezone: user.timezone || 'UTC',
        notificationPreferences: user.notification_preferences || {},
      },
    };

    // Cache the result for 10 minutes
    await setCache(cacheKey, profile, 600);

    res.json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', authenticateToken, requireVerifiedUser, validateProfileUpdate, async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ValidationError(errors.array()[0].msg);
    }

    const userId = req.user!.id;
    const { firstName, lastName, avatarUrl } = req.body;

    // Update user profile
    const result = await query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name), 
           last_name = COALESCE($2, last_name), 
           avatar_url = COALESCE($3, avatar_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, first_name, last_name, avatar_url, updated_at`,
      [firstName, lastName, avatarUrl, userId]
    );

    if (result.rows.length === 0) {
      throw UnauthorizedError('User not found');
    }

    const user = result.rows[0];

    // Clear cache
    await deleteCache(`user_profile:${userId}`);

    logger.info('User profile updated successfully', {
      userId,
      firstName: user.first_name,
      lastName: user.last_name,
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        profile: {
          firstName: user.first_name,
          lastName: user.last_name,
          avatarUrl: user.avatar_url,
          updatedAt: user.updated_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Change password
router.put('/password', authenticateToken, requireVerifiedUser, validatePasswordChange, async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ValidationError(errors.array()[0].msg);
    }

    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    // Get current password hash
    const userResult = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw UnauthorizedError('User not found');
    }

    const currentPasswordHash = userResult.rows[0].password_hash;

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, currentPasswordHash);
    if (!isValidPassword) {
      throw BadRequestError('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );

    // Invalidate all user sessions (force re-login)
    await query(
      'UPDATE user_sessions SET is_active = false WHERE user_id = $1',
      [userId]
    );

    // Clear cache
    await deleteCache(`user_profile:${userId}`);

    logger.info('User password changed successfully', {
      userId,
    });

    res.json({
      success: true,
      message: 'Password changed successfully. Please log in again.',
    });
  } catch (error) {
    next(error);
  }
});

// Update user preferences
router.put('/preferences', authenticateToken, requireVerifiedUser, validatePreferences, async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ValidationError(errors.array()[0].msg);
    }

    const userId = req.user!.id;
    const { theme, language, timezone, notificationPreferences } = req.body;

    // Update user preferences
    const result = await query(
      `UPDATE user_preferences 
       SET theme = COALESCE($1, theme), 
           language = COALESCE($2, language), 
           timezone = COALESCE($3, timezone),
           notification_preferences = COALESCE($4, notification_preferences),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $5
       RETURNING theme, language, timezone, notification_preferences, updated_at`,
      [theme, language, timezone, notificationPreferences, userId]
    );

    if (result.rows.length === 0) {
      // Create preferences if they don't exist
      const createResult = await query(
        `INSERT INTO user_preferences (user_id, theme, language, timezone, notification_preferences)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING theme, language, timezone, notification_preferences, updated_at`,
        [userId, theme || 'light', language || 'en', timezone || 'UTC', notificationPreferences || {}]
      );
      result.rows = createResult.rows;
    }

    const preferences = result.rows[0];

    // Clear cache
    await deleteCache(`user_profile:${userId}`);

    logger.info('User preferences updated successfully', {
      userId,
      theme: preferences.theme,
      language: preferences.language,
    });

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: {
          theme: preferences.theme,
          language: preferences.language,
          timezone: preferences.timezone,
          notificationPreferences: preferences.notification_preferences,
          updatedAt: preferences.updated_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get user statistics
router.get('/stats', authenticateToken, requireVerifiedUser, async (req, res, next) => {
  try {
    const userId = req.user!.id;

    // Get study plan statistics
    const planStats = await query(
      `SELECT 
         COUNT(*) as total_plans,
         COUNT(CASE WHEN status = 'active' THEN 1 END) as active_plans,
         COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_plans,
         COUNT(CASE WHEN status = 'paused' THEN 1 END) as paused_plans
       FROM study_plans 
       WHERE user_id = $1`,
      [userId]
    );

    // Get progress statistics
    const progressStats = await query(
      `SELECT 
         COUNT(*) as total_steps,
         COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_steps,
         COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_steps,
         SUM(time_spent_minutes) as total_time_spent
       FROM user_progress up
       JOIN study_plans sp ON up.study_plan_id = sp.id
       WHERE sp.user_id = $1`,
      [userId]
    );

    // Get recent activity
    const recentActivity = await query(
      `SELECT 
         sp.topic,
         sps.title as step_title,
         up.status,
         up.updated_at
       FROM user_progress up
       JOIN study_plan_steps sps ON up.step_id = sps.id
       JOIN study_plans sp ON sps.study_plan_id = sp.id
       WHERE sp.user_id = $1
       ORDER BY up.updated_at DESC
       LIMIT 5`,
      [userId]
    );

    const stats = {
      plans: {
        total: parseInt(planStats.rows[0].total_plans) || 0,
        active: parseInt(planStats.rows[0].active_plans) || 0,
        completed: parseInt(planStats.rows[0].completed_plans) || 0,
        paused: parseInt(planStats.rows[0].paused_plans) || 0,
      },
      progress: {
        totalSteps: parseInt(progressStats.rows[0].total_steps) || 0,
        completedSteps: parseInt(progressStats.rows[0].completed_steps) || 0,
        inProgressSteps: parseInt(progressStats.rows[0].in_progress_steps) || 0,
        totalTimeSpent: parseInt(progressStats.rows[0].total_time_spent) || 0,
      },
      recentActivity: recentActivity.rows.map(row => ({
        topic: row.topic,
        stepTitle: row.step_title,
        status: row.status,
        updatedAt: row.updated_at,
      })),
    };

    res.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
});

// Delete user account
router.delete('/account', authenticateToken, requireVerifiedUser, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { password } = req.body;

    if (!password) {
      throw BadRequestError('Password is required to delete account');
    }

    // Verify password
    const userResult = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw UnauthorizedError('User not found');
    }

    const passwordHash = userResult.rows[0].password_hash;
    const isValidPassword = await bcrypt.compare(password, passwordHash);
    
    if (!isValidPassword) {
      throw BadRequestError('Password is incorrect');
    }

    // Delete user (cascade will handle related data)
    await query('DELETE FROM users WHERE id = $1', [userId]);

    // Clear all user cache
    await deleteCache(`user_profile:${userId}`);

    logger.info('User account deleted successfully', {
      userId,
    });

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;











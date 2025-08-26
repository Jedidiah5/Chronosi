import { logger } from './logger.js';
import { query } from '../database/sqlite-connection.js';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface UserActivity {
  id?: string;
  userId: string;
  action: string;
  resource?: string;
  resourceId?: string;
  ip: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  sessionId?: string;
}

export interface SecurityMetrics {
  failedLogins: number;
  successfulLogins: number;
  tokenRefreshes: number;
  suspiciousActivities: number;
  rateLimitHits: number;
  timeWindow: string;
}

/**
 * Initialize user activity tracking table
 */
export const initUserActivityTable = (): void => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS user_activities (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        action TEXT NOT NULL,
        resource TEXT,
        resource_id TEXT,
        ip_address TEXT NOT NULL,
        user_agent TEXT,
        metadata TEXT,
        session_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `;
    
    query(createTableQuery);
    
    // Create indexes for better performance
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_activities_action ON user_activities(action)',
      'CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_user_activities_ip ON user_activities(ip_address)',
    ];
    
    indexQueries.forEach(indexQuery => {
      query(indexQuery);
    });
    
    logger.info('User activity tracking table initialized');
  } catch (error) {
    logger.error('Failed to initialize user activity table:', error);
  }
};

/**
 * Log user activity to database and logger
 */
export const logUserActivity = async (activity: UserActivity): Promise<void> => {
  try {
    const activityId = activity.id || uuidv4();
    
    // Store in database
    await query(
      `INSERT INTO user_activities 
       (id, user_id, action, resource, resource_id, ip_address, user_agent, metadata, session_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        activityId,
        activity.userId,
        activity.action,
        activity.resource || null,
        activity.resourceId || null,
        activity.ip,
        activity.userAgent || null,
        activity.metadata ? JSON.stringify(activity.metadata) : null,
        activity.sessionId || null,
      ]
    );

    // Also log to Winston for real-time monitoring
    logger.info('User Activity', {
      category: 'user_activity',
      activityId,
      userId: activity.userId,
      action: activity.action,
      resource: activity.resource,
      resourceId: activity.resourceId,
      ip: activity.ip,
      userAgent: activity.userAgent,
      metadata: activity.metadata,
      sessionId: activity.sessionId,
      timestamp: activity.timestamp,
    });
  } catch (error) {
    logger.error('Failed to log user activity:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      activity,
    });
  }
};

/**
 * Helper function to extract activity context from request
 */
export const getActivityContext = (req: Request): Partial<UserActivity> => {
  return {
    userId: (req as any).user?.id,
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  };
};

/**
 * Log authentication activities
 */
export const logAuthActivity = async (req: Request, action: 'login' | 'logout' | 'register' | 'token_refresh', success: boolean, metadata?: Record<string, any>): Promise<void> => {
  const context = getActivityContext(req);
  
  await logUserActivity({
    ...context,
    userId: context.userId || 'anonymous',
    action: `auth_${action}`,
    resource: 'authentication',
    metadata: {
      success,
      endpoint: req.path,
      method: req.method,
      ...metadata,
    },
  });
};

/**
 * Log study plan activities
 */
export const logStudyPlanActivity = async (req: Request, action: string, studyPlanId?: string, metadata?: Record<string, any>): Promise<void> => {
  const context = getActivityContext(req);
  
  if (!context.userId) {
    logger.warn('Attempted to log study plan activity without user context');
    return;
  }
  
  await logUserActivity({
    ...context,
    userId: context.userId,
    action: `study_plan_${action}`,
    resource: 'study_plan',
    resourceId: studyPlanId,
    metadata: {
      endpoint: req.path,
      method: req.method,
      ...metadata,
    },
  });
};

/**
 * Log API access activities
 */
export const logApiActivity = async (req: Request, action: string, resource?: string, resourceId?: string, metadata?: Record<string, any>): Promise<void> => {
  const context = getActivityContext(req);
  
  await logUserActivity({
    ...context,
    userId: context.userId || 'anonymous',
    action: `api_${action}`,
    resource,
    resourceId,
    metadata: {
      endpoint: req.path,
      method: req.method,
      statusCode: (req as any).res?.statusCode,
      ...metadata,
    },
  });
};

/**
 * Get user activity history
 */
export const getUserActivityHistory = async (userId: string, limit: number = 100, offset: number = 0): Promise<UserActivity[]> => {
  try {
    const result = await query(
      `SELECT id, user_id, action, resource, resource_id, ip_address, user_agent, metadata, session_id, created_at
       FROM user_activities 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    return result.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      action: row.action,
      resource: row.resource,
      resourceId: row.resource_id,
      ip: row.ip_address,
      userAgent: row.user_agent,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
      sessionId: row.session_id,
      timestamp: row.created_at,
    }));
  } catch (error) {
    logger.error('Failed to get user activity history:', error);
    return [];
  }
};

/**
 * Get security metrics for monitoring
 */
export const getSecurityMetrics = async (timeWindowHours: number = 24): Promise<SecurityMetrics> => {
  try {
    const timeWindow = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000).toISOString();
    
    const result = await query(
      `SELECT 
         action,
         COUNT(*) as count,
         SUM(CASE WHEN json_extract(metadata, '$.success') = 0 THEN 1 ELSE 0 END) as failed_count,
         SUM(CASE WHEN json_extract(metadata, '$.success') = 1 THEN 1 ELSE 0 END) as success_count
       FROM user_activities 
       WHERE created_at >= ? AND action LIKE 'auth_%'
       GROUP BY action`,
      [timeWindow]
    );

    const metrics: SecurityMetrics = {
      failedLogins: 0,
      successfulLogins: 0,
      tokenRefreshes: 0,
      suspiciousActivities: 0,
      rateLimitHits: 0,
      timeWindow: `${timeWindowHours} hours`,
    };

    result.rows.forEach((row: any) => {
      switch (row.action) {
        case 'auth_login':
          metrics.failedLogins += row.failed_count || 0;
          metrics.successfulLogins += row.success_count || 0;
          break;
        case 'auth_token_refresh':
          metrics.tokenRefreshes += row.count || 0;
          break;
      }
    });

    // Get rate limit hits from logs (this would need to be implemented based on your rate limiting setup)
    const rateLimitResult = await query(
      `SELECT COUNT(*) as count 
       FROM user_activities 
       WHERE created_at >= ? AND action = 'rate_limit_exceeded'`,
      [timeWindow]
    );
    
    metrics.rateLimitHits = rateLimitResult.rows[0]?.count || 0;

    return metrics;
  } catch (error) {
    logger.error('Failed to get security metrics:', error);
    return {
      failedLogins: 0,
      successfulLogins: 0,
      tokenRefreshes: 0,
      suspiciousActivities: 0,
      rateLimitHits: 0,
      timeWindow: `${timeWindowHours} hours`,
    };
  }
};

/**
 * Clean up old activity logs (for data retention)
 */
export const cleanupOldActivities = async (retentionDays: number = 90): Promise<void> => {
  try {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
    
    const result = await query(
      'DELETE FROM user_activities WHERE created_at < ?',
      [cutoffDate]
    );

    logger.info('Cleaned up old user activities', {
      retentionDays,
      deletedRecords: result.rowCount || 0,
    });
  } catch (error) {
    logger.error('Failed to cleanup old activities:', error);
  }
};
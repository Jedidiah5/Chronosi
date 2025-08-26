import { logger } from './logger.js';
import { Request } from 'express';

export interface AuthLogContext {
  userId?: string;
  email?: string;
  username?: string;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
  action: string;
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
  additionalData?: Record<string, any>;
}

export interface SecurityEvent {
  type: 'auth_failure' | 'suspicious_activity' | 'rate_limit_exceeded' | 'token_abuse' | 'account_lockout';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ip?: string;
  userAgent?: string;
  details: Record<string, any>;
  timestamp: string;
}

/**
 * Log authentication events with structured data for security monitoring
 */
export const logAuthEvent = (context: AuthLogContext): void => {
  const logData = {
    category: 'authentication',
    action: context.action,
    success: context.success,
    userId: context.userId,
    email: context.email,
    username: context.username,
    ip: context.ip,
    userAgent: context.userAgent,
    sessionId: context.sessionId,
    timestamp: new Date().toISOString(),
    ...(context.errorCode && { errorCode: context.errorCode }),
    ...(context.errorMessage && { errorMessage: context.errorMessage }),
    ...(context.additionalData && { additionalData: context.additionalData }),
  };

  if (context.success) {
    logger.info(`Auth Success: ${context.action}`, logData);
  } else {
    logger.warn(`Auth Failure: ${context.action}`, logData);
  }
};

/**
 * Log security events that require monitoring
 */
export const logSecurityEvent = (event: SecurityEvent): void => {
  const logData = {
    category: 'security',
    eventType: event.type,
    severity: event.severity,
    userId: event.userId,
    ip: event.ip,
    userAgent: event.userAgent,
    details: event.details,
    timestamp: event.timestamp,
  };

  switch (event.severity) {
    case 'critical':
      logger.error(`Security Alert [CRITICAL]: ${event.type}`, logData);
      break;
    case 'high':
      logger.error(`Security Alert [HIGH]: ${event.type}`, logData);
      break;
    case 'medium':
      logger.warn(`Security Alert [MEDIUM]: ${event.type}`, logData);
      break;
    case 'low':
      logger.info(`Security Alert [LOW]: ${event.type}`, logData);
      break;
  }
};

/**
 * Extract request context for logging
 */
export const getRequestContext = (req: Request): Partial<AuthLogContext> => {
  return {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
    email: (req as any).user?.email,
    username: (req as any).user?.username,
  };
};

/**
 * Log failed login attempts for security monitoring
 */
export const logFailedLogin = (req: Request, email: string, reason: string): void => {
  const context = getRequestContext(req);
  
  logAuthEvent({
    ...context,
    email,
    action: 'login',
    success: false,
    errorMessage: reason,
  });

  // Also log as security event for monitoring
  logSecurityEvent({
    type: 'auth_failure',
    severity: 'medium',
    ip: context.ip,
    userAgent: context.userAgent,
    details: {
      email,
      reason,
      endpoint: req.path,
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log successful authentication events
 */
export const logSuccessfulAuth = (req: Request, userId: string, action: string, additionalData?: Record<string, any>): void => {
  const context = getRequestContext(req);
  
  logAuthEvent({
    ...context,
    userId,
    action,
    success: true,
    additionalData,
  });
};

/**
 * Log token-related security events
 */
export const logTokenEvent = (req: Request, event: 'refresh_success' | 'refresh_failure' | 'invalid_token' | 'expired_token', details?: Record<string, any>): void => {
  const context = getRequestContext(req);
  
  const severity = event.includes('failure') || event.includes('invalid') ? 'medium' : 'low';
  
  logSecurityEvent({
    type: 'token_abuse',
    severity,
    userId: context.userId,
    ip: context.ip,
    userAgent: context.userAgent,
    details: {
      event,
      endpoint: req.path,
      ...details,
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log rate limiting events
 */
export const logRateLimitEvent = (req: Request, limit: number, windowMs: number): void => {
  const context = getRequestContext(req);
  
  logSecurityEvent({
    type: 'rate_limit_exceeded',
    severity: 'high',
    userId: context.userId,
    ip: context.ip,
    userAgent: context.userAgent,
    details: {
      endpoint: req.path,
      limit,
      windowMs,
      method: req.method,
    },
    timestamp: new Date().toISOString(),
  });
};
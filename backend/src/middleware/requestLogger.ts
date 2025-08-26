import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

export interface RequestLogData {
  requestId: string;
  method: string;
  url: string;
  ip: string;
  userAgent?: string;
  userId?: string;
  timestamp: string;
  headers?: Record<string, any>;
  body?: any;
  query?: any;
  params?: any;
}

export interface ResponseLogData {
  requestId: string;
  statusCode: number;
  responseTime: number;
  contentLength?: number;
  timestamp: string;
  error?: any;
}

// Extend Express Request to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: number;
    }
  }
}

/**
 * Middleware to log detailed request/response information for debugging
 */
export const requestResponseLogger = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = uuidv4();
  const startTime = Date.now();
  
  req.requestId = requestId;
  req.startTime = startTime;

  // Log incoming request
  const requestLogData: RequestLogData = {
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
    timestamp: new Date().toISOString(),
    headers: sanitizeHeaders(req.headers),
    query: req.query,
    params: req.params,
  };

  // Only log body for non-GET requests and exclude sensitive data
  if (req.method !== 'GET' && req.body) {
    requestLogData.body = sanitizeRequestBody(req.body);
  }

  logger.info('Incoming Request', {
    category: 'request',
    ...requestLogData,
  });

  // Override res.json to capture response data
  const originalJson = res.json;
  res.json = function(body: any) {
    const responseTime = Date.now() - startTime;
    
    const responseLogData: ResponseLogData = {
      requestId,
      statusCode: res.statusCode,
      responseTime,
      contentLength: JSON.stringify(body).length,
      timestamp: new Date().toISOString(),
    };

    // Log response (exclude sensitive data)
    logger.info('Outgoing Response', {
      category: 'response',
      ...responseLogData,
      body: sanitizeResponseBody(body),
    });

    return originalJson.call(this, body);
  };

  // Override res.send to capture non-JSON responses
  const originalSend = res.send;
  res.send = function(body: any) {
    const responseTime = Date.now() - startTime;
    
    const responseLogData: ResponseLogData = {
      requestId,
      statusCode: res.statusCode,
      responseTime,
      contentLength: typeof body === 'string' ? body.length : JSON.stringify(body).length,
      timestamp: new Date().toISOString(),
    };

    logger.info('Outgoing Response', {
      category: 'response',
      ...responseLogData,
    });

    return originalSend.call(this, body);
  };

  next();
};

/**
 * Sanitize request headers to remove sensitive information
 */
const sanitizeHeaders = (headers: Record<string, any>): Record<string, any> => {
  const sanitized = { ...headers };
  
  // Remove or mask sensitive headers
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
  
  sensitiveHeaders.forEach(header => {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  });

  return sanitized;
};

/**
 * Sanitize request body to remove sensitive information
 */
const sanitizeRequestBody = (body: any): any => {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sanitized = { ...body };
  
  // Remove or mask sensitive fields
  const sensitiveFields = ['password', 'token', 'refreshToken', 'secret', 'apiKey'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
};

/**
 * Sanitize response body to remove sensitive information
 */
const sanitizeResponseBody = (body: any): any => {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sanitized = JSON.parse(JSON.stringify(body));
  
  // Remove or mask sensitive fields in response
  const removeSensitiveData = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(removeSensitiveData);
    }
    
    if (obj && typeof obj === 'object') {
      const cleaned = { ...obj };
      
      // Remove tokens and sensitive data
      if (cleaned.tokens) {
        cleaned.tokens = {
          accessToken: '[REDACTED]',
          refreshToken: '[REDACTED]',
        };
      }
      
      if (cleaned.password_hash) {
        cleaned.password_hash = '[REDACTED]';
      }
      
      if (cleaned.refresh_token_hash) {
        cleaned.refresh_token_hash = '[REDACTED]';
      }

      // Recursively clean nested objects
      Object.keys(cleaned).forEach(key => {
        if (cleaned[key] && typeof cleaned[key] === 'object') {
          cleaned[key] = removeSensitiveData(cleaned[key]);
        }
      });
      
      return cleaned;
    }
    
    return obj;
  };

  return removeSensitiveData(sanitized);
};

/**
 * Middleware to log slow requests for performance monitoring
 */
export const slowRequestLogger = (threshold: number = 1000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      
      if (responseTime > threshold) {
        logger.warn('Slow Request Detected', {
          category: 'performance',
          requestId: req.requestId,
          method: req.method,
          url: req.url,
          responseTime,
          threshold,
          statusCode: res.statusCode,
          userId: (req as any).user?.id,
          ip: req.ip,
          timestamp: new Date().toISOString(),
        });
      }
    });
    
    next();
  };
};
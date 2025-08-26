import { logger } from './logger.js';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface ErrorReport {
  id: string;
  timestamp: string;
  environment: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  error: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  context: {
    userId?: string;
    requestId?: string;
    method?: string;
    url?: string;
    ip?: string;
    userAgent?: string;
    headers?: Record<string, any>;
    body?: any;
    query?: any;
    params?: any;
  };
  system: {
    nodeVersion: string;
    platform: string;
    memory: NodeJS.MemoryUsage;
    uptime: number;
  };
  additionalData?: Record<string, any>;
}

export interface ProductionErrorSummary {
  errorId: string;
  count: number;
  firstOccurrence: string;
  lastOccurrence: string;
  affectedUsers: string[];
  endpoints: string[];
}

/**
 * Create a comprehensive error report for production issues
 */
export const createErrorReport = (error: Error, req?: Request, additionalData?: Record<string, any>): ErrorReport => {
  const errorId = uuidv4();
  
  const report: ErrorReport = {
    id: errorId,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    severity: determineSeverity(error),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: (error as any).code,
    },
    context: req ? extractRequestContext(req) : {},
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
    },
    additionalData,
  };

  return report;
};

/**
 * Report error to logging system and external services
 */
export const reportError = async (error: Error, req?: Request, additionalData?: Record<string, any>): Promise<string> => {
  const report = createErrorReport(error, req, additionalData);
  
  // Log to Winston
  logger.error('Production Error Report', {
    category: 'error_report',
    errorId: report.id,
    ...report,
  });

  // In production, you might want to send to external services
  if (process.env.NODE_ENV === 'production') {
    await sendToExternalServices(report);
  }

  // Store in database for analysis
  await storeErrorReport(report);

  return report.id;
};

/**
 * Determine error severity based on error type and context
 */
const determineSeverity = (error: Error): 'low' | 'medium' | 'high' | 'critical' => {
  // Critical errors that affect system stability
  if (error.name === 'ECONNREFUSED' || 
      error.name === 'ENOTFOUND' || 
      error.message.includes('database') ||
      error.message.includes('SQLITE_CANTOPEN')) {
    return 'critical';
  }

  // High severity for authentication and security issues
  if (error.name === 'UnauthorizedError' ||
      error.name === 'ForbiddenError' ||
      error.message.includes('token') ||
      error.message.includes('authentication')) {
    return 'high';
  }

  // Medium severity for validation and business logic errors
  if (error.name === 'ValidationError' ||
      error.name === 'BadRequestError' ||
      (error as any).statusCode >= 400 && (error as any).statusCode < 500) {
    return 'medium';
  }

  // Default to low severity
  return 'low';
};

/**
 * Extract relevant request context for error reporting
 */
const extractRequestContext = (req: Request): ErrorReport['context'] => {
  return {
    userId: (req as any).user?.id,
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    headers: sanitizeHeaders(req.headers),
    body: sanitizeBody(req.body),
    query: req.query,
    params: req.params,
  };
};

/**
 * Sanitize headers to remove sensitive information
 */
const sanitizeHeaders = (headers: Record<string, any>): Record<string, any> => {
  const sanitized = { ...headers };
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
const sanitizeBody = (body: any): any => {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'refreshToken', 'secret', 'apiKey'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
};

/**
 * Send error report to external monitoring services
 */
const sendToExternalServices = async (report: ErrorReport): Promise<void> => {
  try {
    // Example: Send to Sentry, DataDog, or other monitoring services
    // This is where you would integrate with your preferred error tracking service
    
    // For now, we'll just log that we would send to external services
    logger.info('Would send error report to external services', {
      errorId: report.id,
      severity: report.severity,
      environment: report.environment,
    });

    // Example integration with a webhook or API:
    // if (process.env.ERROR_WEBHOOK_URL) {
    //   await fetch(process.env.ERROR_WEBHOOK_URL, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(report),
    //   });
    // }
  } catch (error) {
    logger.error('Failed to send error report to external services:', error);
  }
};

/**
 * Store error report in database for analysis
 */
const storeErrorReport = async (report: ErrorReport): Promise<void> => {
  try {
    // This would store the error report in a database table
    // For now, we'll create a simple file-based storage
    
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const errorLogDir = 'logs/errors';
    const errorLogFile = path.join(errorLogDir, `${new Date().toISOString().split('T')[0]}.json`);
    
    // Ensure directory exists
    try {
      await fs.mkdir(errorLogDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Read existing errors for the day
    let existingErrors: ErrorReport[] = [];
    try {
      const existingData = await fs.readFile(errorLogFile, 'utf-8');
      existingErrors = JSON.parse(existingData);
    } catch (error) {
      // File might not exist yet
    }

    // Add new error report
    existingErrors.push(report);

    // Write back to file
    await fs.writeFile(errorLogFile, JSON.stringify(existingErrors, null, 2));

    logger.debug('Error report stored successfully', {
      errorId: report.id,
      file: errorLogFile,
    });
  } catch (error) {
    logger.error('Failed to store error report:', error);
  }
};

/**
 * Get error summary for monitoring dashboard
 */
export const getErrorSummary = async (timeWindowHours: number = 24): Promise<ProductionErrorSummary[]> => {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const errorLogDir = 'logs/errors';
    const cutoffTime = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);
    
    // Get all error log files within the time window
    const files = await fs.readdir(errorLogDir);
    const relevantFiles = files.filter(file => {
      const fileDate = new Date(file.replace('.json', ''));
      return fileDate >= cutoffTime;
    });

    const errorSummary: Map<string, ProductionErrorSummary> = new Map();

    // Process each file
    for (const file of relevantFiles) {
      const filePath = path.join(errorLogDir, file);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const errors: ErrorReport[] = JSON.parse(fileContent);

      errors.forEach(error => {
        const errorKey = `${error.error.name}:${error.error.message}`;
        
        if (errorSummary.has(errorKey)) {
          const summary = errorSummary.get(errorKey)!;
          summary.count++;
          summary.lastOccurrence = error.timestamp;
          
          if (error.context.userId && !summary.affectedUsers.includes(error.context.userId)) {
            summary.affectedUsers.push(error.context.userId);
          }
          
          if (error.context.url && !summary.endpoints.includes(error.context.url)) {
            summary.endpoints.push(error.context.url);
          }
        } else {
          errorSummary.set(errorKey, {
            errorId: error.id,
            count: 1,
            firstOccurrence: error.timestamp,
            lastOccurrence: error.timestamp,
            affectedUsers: error.context.userId ? [error.context.userId] : [],
            endpoints: error.context.url ? [error.context.url] : [],
          });
        }
      });
    }

    return Array.from(errorSummary.values()).sort((a, b) => b.count - a.count);
  } catch (error) {
    logger.error('Failed to get error summary:', error);
    return [];
  }
};

/**
 * Clean up old error reports
 */
export const cleanupOldErrorReports = async (retentionDays: number = 30): Promise<void> => {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const errorLogDir = 'logs/errors';
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    
    const files = await fs.readdir(errorLogDir);
    let deletedCount = 0;

    for (const file of files) {
      const fileDate = new Date(file.replace('.json', ''));
      if (fileDate < cutoffDate) {
        await fs.unlink(path.join(errorLogDir, file));
        deletedCount++;
      }
    }

    logger.info('Cleaned up old error reports', {
      retentionDays,
      deletedFiles: deletedCount,
    });
  } catch (error) {
    logger.error('Failed to cleanup old error reports:', error);
  }
};
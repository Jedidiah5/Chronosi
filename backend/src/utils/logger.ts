import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || 'info';

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    return log;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'chronosi-backend' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat,
    }),
    
    // File transports for different log levels
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  
  // Handle exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: 'logs/exceptions.log',
      format: fileFormat,
    }),
  ],
  
  // Handle rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: 'logs/rejections.log',
      format: fileFormat,
    }),
  ],
});

// Create logs directory if it doesn't exist
import { mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';

if (!existsSync('logs')) {
  mkdirSync('logs', { recursive: true });
}

// Export convenience methods
export const logInfo = (message: string, meta?: any) => logger.info(message, meta);
export const logError = (message: string, meta?: any) => logger.error(message, meta);
export const logWarn = (message: string, meta?: any) => logger.warn(message, meta);
export const logDebug = (message: string, meta?: any) => logger.debug(message, meta);





import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger.js';

let redisClient: RedisClientType;

export const connectRedis = async (): Promise<void> => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 10000,
        lazyConnect: true,
      },
    });

    // Handle connection events
    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    redisClient.on('error', (err) => {
      logger.error('Redis client error:', err);
    });

    redisClient.on('end', () => {
      logger.info('Redis client disconnected');
    });

    // Connect to Redis
    await redisClient.connect();
    
    // Test the connection
    await redisClient.ping();
    logger.info('Redis connection established successfully');
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis not connected. Call connectRedis() first.');
  }
  return redisClient;
};

// Cache utility functions
export const setCache = async (key: string, value: any, ttl?: number): Promise<void> => {
  try {
    const serializedValue = JSON.stringify(value);
    if (ttl) {
      await redisClient.setEx(key, ttl, serializedValue);
    } else {
      await redisClient.set(key, serializedValue);
    }
    logger.debug('Cache set successfully', { key, ttl });
  } catch (error) {
    logger.error('Failed to set cache:', { key, error });
    throw error;
  }
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const value = await redisClient.get(key);
    if (value) {
      logger.debug('Cache hit', { key });
      return JSON.parse(value) as T;
    }
    logger.debug('Cache miss', { key });
    return null;
  } catch (error) {
    logger.error('Failed to get cache:', { key, error });
    return null;
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
    logger.debug('Cache deleted successfully', { key });
  } catch (error) {
    logger.error('Failed to delete cache:', { key, error });
    throw error;
  }
};

export const clearCache = async (): Promise<void> => {
  try {
    await redisClient.flushAll();
    logger.info('Cache cleared successfully');
  } catch (error) {
    logger.error('Failed to clear cache:', error);
    throw error;
  }
};

export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await closeRedis();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeRedis();
  process.exit(0);
});





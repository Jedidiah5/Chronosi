import { Pool, PoolClient } from 'pg';
import { logger } from '../utils/logger.js';

let pool: Pool;

export const connectDatabase = async (): Promise<void> => {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    pool = new Pool({
      connectionString: databaseUrl,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    // Test the connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    
    logger.info('Database connection pool created successfully');
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
};

export const getPool = (): Pool => {
  if (!pool) {
    throw new Error('Database not connected. Call connectDatabase() first.');
  }
  return pool;
};

export const query = async (text: string, params?: any[]): Promise<any> => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('Query error:', { text, params, error });
    throw error;
  }
};

export const getClient = async (): Promise<PoolClient> => {
  return await pool.connect();
};

export const closeDatabase = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    logger.info('Database connection pool closed');
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDatabase();
  process.exit(0);
});





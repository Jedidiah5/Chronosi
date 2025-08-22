import Database from 'better-sqlite3';
import { logger } from '../utils/logger.js';

let db: Database.Database;

export const initSQLite = () => {
  try {
    db = new Database('chronosi.db');
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Create tables if they don't exist
    createTables();
    
    logger.info('SQLite database initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize SQLite database:', error);
    throw error;
  }
};

const createTables = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      avatar_url TEXT,
      is_verified INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      last_login TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User preferences table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      learning_style TEXT,
      preferred_duration INTEGER,
      difficulty_level TEXT,
      topics_of_interest TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // User sessions table for refresh tokens
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      refresh_token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Study plans table
  db.exec(`
    CREATE TABLE IF NOT EXISTS study_plans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      subject TEXT NOT NULL,
      difficulty_level TEXT,
      estimated_duration INTEGER,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Study plan steps table
  db.exec(`
    CREATE TABLE IF NOT EXISTS study_plan_steps (
      id TEXT PRIMARY KEY,
      study_plan_id TEXT NOT NULL,
      step_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      resource_type TEXT,
      resource_url TEXT,
      estimated_duration INTEGER,
      completed INTEGER DEFAULT 0,
      completed_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (study_plan_id) REFERENCES study_plans(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON study_plans(user_id);
    CREATE INDEX IF NOT EXISTS idx_study_plan_steps_plan_id ON study_plan_steps(study_plan_id);
  `);
};

export const query = (sql: string, params: any[] = []): any => {
  try {
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      const stmt = db.prepare(sql);
      return { rows: stmt.all(params) };
    } else {
      const stmt = db.prepare(sql);
      const result = stmt.run(params);
      return { rows: [{ id: result.lastInsertRowid }] };
    }
  } catch (error) {
    logger.error('SQLite query error:', error);
    throw error;
  }
};

export const closeSQLite = () => {
  if (db) {
    db.close();
  }
};

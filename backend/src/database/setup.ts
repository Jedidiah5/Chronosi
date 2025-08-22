import { query } from './connection.js';
import { logger } from '../utils/logger.js';

const createTables = async () => {
  try {
    logger.info('Creating database tables...');

    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        avatar_url TEXT,
        is_verified BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User preferences table
    await query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        learning_style VARCHAR(50),
        preferred_duration INTEGER,
        difficulty_level VARCHAR(20),
        topics_of_interest TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User sessions table for refresh tokens
    await query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        refresh_token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        ip_address INET,
        user_agent TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Study plans table
    await query(`
      CREATE TABLE IF NOT EXISTS study_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        subject VARCHAR(100) NOT NULL,
        difficulty_level VARCHAR(20),
        estimated_duration INTEGER,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Study plan steps table
    await query(`
      CREATE TABLE IF NOT EXISTS study_plan_steps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        study_plan_id UUID REFERENCES study_plans(id) ON DELETE CASCADE,
        step_number INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        resource_type VARCHAR(50),
        resource_url TEXT,
        estimated_duration INTEGER,
        completed BOOLEAN DEFAULT false,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token ON user_sessions(refresh_token_hash);
      CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON study_plans(user_id);
      CREATE INDEX IF NOT EXISTS idx_study_plan_steps_plan_id ON study_plan_steps(study_plan_id);
    `);

    logger.info('Database tables created successfully!');
  } catch (error) {
    logger.error('Error creating database tables:', error);
    throw error;
  }
};

const setupDatabase = async () => {
  try {
    await createTables();
    logger.info('Database setup completed successfully!');
  } catch (error) {
    logger.error('Database setup failed:', error);
    process.exit(1);
  }
};

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}

export { setupDatabase };

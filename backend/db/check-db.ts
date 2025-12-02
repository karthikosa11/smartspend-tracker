import { pool } from '../config/database.js';

export const checkDatabaseSetup = async () => {
  try {
    // Check if users table exists
    const [tables] = await pool.execute(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'",
      [process.env.DB_NAME || 'smartspend']
    );

    if (!Array.isArray(tables) || tables.length === 0) {
      console.log('⚠️  Database tables not found. Run: npm run db:init');
      return false;
    }

    console.log('✅ Database tables exist');
    return true;
  } catch (error: any) {
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('❌ MySQL Access Denied. Please check your DB_PASSWORD in .env file');
    } else {
      console.error('❌ Database check error:', error.message);
    }
    return false;
  }
};


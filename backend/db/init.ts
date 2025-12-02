import { pool } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    
    // First create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'smartspend';
    console.log(`📦 Creating database: ${dbName}`);
    
    // Connect without specifying database first
    const tempPool = require('mysql2/promise').createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });
    
    await tempPool.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    await tempPool.execute(`USE ${dbName}`);
    console.log(`✅ Database ${dbName} ready`);
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Split by semicolon and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('CREATE DATABASE') && !s.startsWith('USE'));

    console.log('📋 Creating tables...');
    for (const statement of statements) {
      if (statement.trim() && !statement.includes('CREATE DATABASE') && !statement.includes('USE')) {
        await tempPool.execute(statement);
      }
    }
    
    await tempPool.end();
    console.log('✅ Database schema initialized successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Database initialization error:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   Please check your DB_PASSWORD in .env file');
    }
    return false;
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('init.ts')) {
  initializeDatabase().then((success) => {
    process.exit(success ? 0 : 1);
  }).catch((error) => {
    console.error('Failed to initialize:', error);
    process.exit(1);
  });
}

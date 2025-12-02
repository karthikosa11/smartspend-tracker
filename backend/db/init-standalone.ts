import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Create connection without database first
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });
    
    const dbName = process.env.DB_NAME || 'smartspend';
    console.log(`📦 Creating database: ${dbName}`);
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    await connection.query(`USE ${dbName}`);
    console.log(`✅ Database ${dbName} ready`);
    
    // Create tables directly
    console.log('📋 Creating tables...');
    
    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255),
        password VARCHAR(255) NOT NULL,
        role ENUM('USER', 'ADMIN') DEFAULT 'USER',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      )
    `);
    console.log('   ✅ users table created');
    
    // Items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS items (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        default_category_id VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name)
      )
    `);
    console.log('   ✅ items table created');
    
    // Expenses table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        item_id VARCHAR(36),
        item_name VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        date DATE NOT NULL,
        category_id VARCHAR(36) NOT NULL,
        receipt_image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_date (date),
        INDEX idx_item_name (item_name)
      )
    `);
    console.log('   ✅ expenses table created');
    
    await connection.end();
    console.log('✅ Database schema initialized successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Database initialization error:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   Please check your DB_PASSWORD in .env file');
    }
    return false;
  }
}

initializeDatabase().then((success) => {
  process.exit(success ? 0 : 1);
}).catch((error) => {
  console.error('Failed:', error);
  process.exit(1);
});


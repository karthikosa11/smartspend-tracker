import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import expenseRoutes from './routes/expenses.js';
import itemRoutes from './routes/items.js';
import debugRoutes from './routes/debug-expenses.js';
import { testConnection } from './config/database.js';
import { checkDatabaseSetup } from './db/check-db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const getCorsOrigin = () => {
  // In production, use FRONTEND_URL or extract from VITE_API_URL
  if (process.env.NODE_ENV === 'production') {
    return process.env.FRONTEND_URL || process.env.VITE_API_URL?.replace('/api', '') || '*';
  }
  // In development, always allow localhost:3000 (frontend dev server)
  return 'http://localhost:3000';
};

const corsOptions = {
  origin: getCorsOrigin(),
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/debug', debugRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  // Path to frontend build (relative to backend directory)
  const buildPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(buildPath));
  
  // Serve React app for all non-API routes
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Start server
const startServer = async () => {
  // Test database connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('⚠️  Warning: Database connection failed. Please check your database configuration.');
    console.error('   Make sure:');
    console.error('   1. MySQL is running');
    console.error('   2. DB_PASSWORD in .env matches your MySQL root password');
    console.error('   3. Database "smartspend" exists (or will be created)');
    process.exit(1);
  }

  // Check if database tables exist
  const tablesExist = await checkDatabaseSetup();
  if (!tablesExist) {
    console.error('⚠️  Database tables not initialized. Please run: npm run db:init');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
  });
};

startServer();


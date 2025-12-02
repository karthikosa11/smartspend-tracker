import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // Default: 7 days

// Validate email helper
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    const defaultUsername = username?.trim() || normalizedEmail.split('@')[0];

    await pool.execute(
      'INSERT INTO users (id, email, username, password, role) VALUES (?, ?, ?, ?, ?)',
      [userId, normalizedEmail, defaultUsername, hashedPassword, 'USER']
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email: normalizedEmail, role: 'USER' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      id: userId,
      email: normalizedEmail,
      username: defaultUsername,
      role: 'USER',
      token,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    // Provide more detailed error information in development
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message || 'Internal server error';
    res.status(500).json({ error: errorMessage });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const [users] = await pool.execute(
      'SELECT id, email, username, password, role FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0] as any;

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    // Provide more detailed error information in development
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message || 'Internal server error';
    res.status(500).json({ error: errorMessage });
  }
});

// Verify token (middleware)
export const verifyToken = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Get user from database
    const [users] = await pool.execute(
      'SELECT id, email, username, role FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get current user
router.get('/me', verifyToken, async (req: any, res) => {
  res.json(req.user);
});

export default router;


import express from 'express';
import { pool } from '../config/database.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get all items
router.get('/', async (req: any, res) => {
  try {
    const [items] = await pool.execute(
      'SELECT id, name, default_category_id as defaultCategoryId FROM items'
    );

    res.json(items);
  } catch (error: any) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


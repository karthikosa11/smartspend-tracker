import express from 'express';
import { pool } from '../config/database.js';
import { verifyToken } from './auth.js';

const router = express.Router();
router.use(verifyToken);

// Debug endpoint to check actual database values
router.get('/debug', async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    const [allExpenses] = await pool.execute(
      `SELECT id, item_name, amount, date, created_at 
       FROM expenses 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 20`,
      [userId]
    );
    
    console.log('=== ALL EXPENSES DEBUG ===');
    (allExpenses as any[]).forEach((exp, idx) => {
      console.log(`Expense ${idx}:`, {
        id: exp.id,
        item_name: exp.item_name,
        amount: exp.amount,
        amountType: typeof exp.amount,
        date: exp.date
      });
    });
    
    res.json({
      count: (allExpenses as any[]).length,
      expenses: allExpenses
    });
  } catch (error: any) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;


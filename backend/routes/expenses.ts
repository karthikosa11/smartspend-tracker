import express from 'express';
import { pool } from '../config/database.js';
import { verifyToken } from './auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get all expenses for user
router.get('/', async (req: any, res) => {
  try {
    const userId = req.user.id;

    const [expenses] = await pool.execute(
      `SELECT id, user_id as userId, item_id as itemId, item_name as itemName, 
       amount, date, category_id as categoryId, receipt_image_url as receiptImageUrl
       FROM expenses 
       WHERE user_id = ? 
       ORDER BY date DESC`,
      [userId]
    );

    // Convert amount from Decimal to number
    const formattedExpenses = (expenses as any[]).map(expense => ({
      ...expense,
      amount: parseFloat(expense.amount) || 0,
    }));

    res.json(formattedExpenses);
  } catch (error: any) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add expense
router.post('/', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { itemName, amount, date, categoryId, receiptImageUrl } = req.body;

    if (!itemName || !amount || !date || !categoryId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find or create item
    const [existingItems] = await pool.execute(
      'SELECT id FROM items WHERE name = ?',
      [itemName]
    );

    let itemId: string;
    if (Array.isArray(existingItems) && existingItems.length > 0) {
      itemId = (existingItems[0] as any).id;
    } else {
      itemId = uuidv4();
      await pool.execute(
        'INSERT INTO items (id, name, default_category_id) VALUES (?, ?, ?)',
        [itemId, itemName, categoryId]
      );
    }

    // Create expense
    const expenseId = uuidv4();
    await pool.execute(
      `INSERT INTO expenses (id, user_id, item_id, item_name, amount, date, category_id, receipt_image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [expenseId, userId, itemId, itemName, amount, date, categoryId, receiptImageUrl || null]
    );

    const [newExpense] = await pool.execute(
      `SELECT id, user_id as userId, item_id as itemId, item_name as itemName, 
       amount, date, category_id as categoryId, receipt_image_url as receiptImageUrl
       FROM expenses WHERE id = ?`,
      [expenseId]
    );

    const expense = Array.isArray(newExpense) ? newExpense[0] : newExpense;
    // Convert amount from Decimal to number
    const formattedExpense = {
      ...expense,
      amount: parseFloat((expense as any).amount) || 0,
    };

    res.status(201).json(formattedExpense);
  } catch (error: any) {
    console.error('Add expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get price history for an item
router.get('/price-history', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { itemName } = req.query;

    if (!itemName) {
      return res.status(400).json({ error: 'Item name is required' });
    }

    console.log('=== PRICE HISTORY QUERY ===');
    console.log('User ID:', userId);
    console.log('Item name search:', itemName);

    // Use exact match or case-insensitive match instead of LIKE
    const [history] = await pool.execute(
      `SELECT id, date, amount, created_at, item_name
       FROM expenses 
       WHERE user_id = ? AND LOWER(item_name) = LOWER(?)
       ORDER BY date ASC, created_at ASC`,
      [userId, itemName.trim()]
    );

    console.log('Raw SQL result:', (history as any[]).length, 'records');
    (history as any[]).forEach((item, idx) => {
      console.log(`DB Record ${idx}:`, {
        id: item.id,
        item_name: item.item_name,
        amount: item.amount,
        amountType: typeof item.amount,
        date: item.date
      });
    });

    // Convert price from Decimal to number and ensure proper formatting
    const formattedHistory = (history as any[]).map((item, index) => {
      // Use 'amount' field directly, not 'price' alias
      const rawAmount = item.amount;
      let numPrice = 0;
      
      if (rawAmount !== undefined && rawAmount !== null) {
        if (typeof rawAmount === 'string') {
          numPrice = parseFloat(rawAmount);
        } else if (typeof rawAmount === 'number') {
          numPrice = rawAmount;
        } else {
          numPrice = parseFloat(String(rawAmount)) || 0;
        }
      }
      
      if (isNaN(numPrice)) {
        console.warn(`Invalid price for record ${item.id}:`, rawAmount);
        numPrice = 0;
      }
      
      const result = {
        id: item.id,
        date: item.date,
        price: numPrice,
        created_at: item.created_at,
        item_name: item.item_name,
        index: index,
        rawAmount: rawAmount, // Keep for debugging
      };
      
      console.log(`Formatted record ${index}:`, result);
      return result;
    });

    console.log('=== FINAL RESPONSE ===');
    console.log('All prices:', formattedHistory.map(h => h.price));
    console.log('Unique prices:', [...new Set(formattedHistory.map(h => h.price))]);
    console.log('Full response:', JSON.stringify(formattedHistory, null, 2));
    
    res.json(formattedHistory);
  } catch (error: any) {
    console.error('Get price history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all expenses (Admin only)
router.get('/', authMiddleware(['ADMIN']), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM expenses ORDER BY date DESC, created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create an expense (Admin only)
router.post('/', authMiddleware(['ADMIN']), async (req, res) => {
  try {
    const { date, category, amount, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO expenses (date, category, amount, notes)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [date, category, amount, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an expense (Admin only)
router.delete('/:id', authMiddleware(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM expenses WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

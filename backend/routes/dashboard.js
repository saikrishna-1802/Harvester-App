const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/summary', authMiddleware(['ADMIN']), async (req, res) => {
  try {
    const { startDate, endDate, harvester_id, mode } = req.query;

    let jobsQuery = `
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_income,
        COALESCE(SUM(pending_amount), 0) as total_pending
      FROM jobs
      WHERE 1=1
    `;
    const jobsParams = [];

    // Apply filters
    if (startDate && endDate) {
      jobsParams.push(startDate, endDate);
      jobsQuery += ` AND date BETWEEN $${jobsParams.length - 1} AND $${jobsParams.length}`;
    }
    if (harvester_id) {
      jobsParams.push(harvester_id);
      jobsQuery += ` AND harvester_id = $${jobsParams.length}`;
    }
    if (mode) {
      jobsParams.push(mode);
      jobsQuery += ` AND mode = $${jobsParams.length}`;
    }

    const expensesQuery = `
      SELECT COALESCE(SUM(amount), 0) as total_expenses
      FROM expenses
      ${startDate && endDate ? 'WHERE date BETWEEN $1 AND $2' : ''}
    `;
    const expensesParams = startDate && endDate ? [startDate, endDate] : [];

    const [jobsRes, expensesRes] = await Promise.all([
      pool.query(jobsQuery, jobsParams),
      pool.query(expensesQuery, expensesParams)
    ]);

    const total_income = parseFloat(jobsRes.rows[0].total_income);
    const total_pending = parseFloat(jobsRes.rows[0].total_pending);
    const total_expenses = parseFloat(expensesRes.rows[0].total_expenses);
    const profit = total_income - total_expenses;

    res.json({
      total_income,
      total_expenses,
      profit,
      total_pending
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

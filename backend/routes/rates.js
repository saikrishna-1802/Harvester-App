const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all rates (Accessible to both admin and driver for calculations)
router.get('/', authMiddleware(['ADMIN', 'DRIVER']), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rates ORDER BY harvester_id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
// Post rates //
router.post('/', async (req, res) => {
  try {
    const { rate_2x2, rate_4x4, tractor_trip_rate = 0 } = req.body;

    const existing = await pool.query('SELECT * FROM rates LIMIT 1');

    if (existing.rows.length > 0) {
      const result = await pool.query(
        `UPDATE rates
         SET rate_2x2 = $1, rate_4x4 = $2, tractor_trip_rate = $3
         WHERE id = $4 RETURNING *`,
        [
          rate_2x2,
          rate_4x4,
          tractor_trip_rate,
          existing.rows[0].id
        ]
      );

      return res.json(result.rows[0]);
    }

    const result = await pool.query(
      `INSERT INTO rates (rate_2x2, rate_4x4, tractor_trip_rate)
       VALUES ($1, $2, $3) RETURNING *`,
      [rate_2x2, rate_4x4, tractor_trip_rate]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error("RATES SAVE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});
// Update specific rate (Admin only)
router.put('/:id', authMiddleware(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { rate_2x2, rate_4x4, tractor_trip_rate } = req.body;

    const result = await pool.query(
      `UPDATE rates 
       SET rate_2x2 = $1, rate_4x4 = $2, tractor_trip_rate = $3 
       WHERE id = $4 RETURNING *`,
      [rate_2x2, rate_4x4, tractor_trip_rate, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Rate config not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

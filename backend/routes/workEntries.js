const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all jobs (Admin only)
router.get('/', authMiddleware(['ADMIN']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT jobs.*, users.username as driver_name
      FROM jobs
      LEFT JOIN users ON jobs.driver_id = users.id
      ORDER BY date DESC, start_time DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get jobs for the logged-in driver only
router.get('/my', authMiddleware(['ADMIN', 'DRIVER']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM jobs
      WHERE driver_id = $1
      ORDER BY date DESC, created_at DESC
      LIMIT 20
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a job (Admin and Driver)
router.post('/', authMiddleware(['ADMIN', 'DRIVER']), async (req, res) => {
  try {
    const driver_id = req.user.id;
    const {
      date, farmer_name, farmer_mobile, bill_number, location, crop_type, harvester_id,
      works,
      total_hours, work_amount,
      tractor_trips, tractor_trip_rate, tractor_total,
      total_amount, amount_paid, pending_amount, notes,
      work_breakdown   // ← full array of { mode, start_time, end_time, hours, rate, amount }
    } = req.body;

    // Use first work entry for legacy columns (mode, start_time, end_time)
    const primaryWork = (works && works.length > 0) ? works[0] : {};
    const mode        = primaryWork.mode       || '2x2';
    const start_time  = primaryWork.start_time || null;
    const end_time    = primaryWork.end_time   || null;

    // Calculate hourly_rate from first entry in breakdown for legacy column
    let hourly_rate = 0;
    if (work_breakdown && work_breakdown.length > 0) {
      hourly_rate = work_breakdown[0].rate || 0;
    } else if (total_hours > 0) {
      hourly_rate = parseFloat((work_amount / total_hours).toFixed(2));
    }

    if (!start_time || !end_time) {
      return res.status(400).json({ message: 'At least one work entry with start and end time is required.' });
    }

    // Build a clean work_breakdown to store — include all entries
    // Each entry: { mode, start_time, end_time, hours, rate, amount }
    const breakdownToSave = (work_breakdown || []).map((bd, i) => ({
      entry:      i + 1,
      mode:       (works && works[i]) ? works[i].mode : mode,
      start_time: (works && works[i]) ? works[i].start_time : start_time,
      end_time:   (works && works[i]) ? works[i].end_time   : end_time,
      hours:      bd.hours  || 0,
      rate:       bd.rate   || 0,
      amount:     bd.amount || 0,
    }));

    const result = await pool.query(
      `INSERT INTO jobs (
        driver_id, date, bill_number, farmer_name, farmer_mobile, location, crop_type, harvester_id, mode,
        start_time, end_time, total_hours, hourly_rate, work_amount,
        tractor_trips, tractor_trip_rate, tractor_total, total_amount,
        amount_paid, pending_amount, notes, work_breakdown
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
      ) RETURNING *`,
      [
        driver_id, date, bill_number || null, farmer_name, farmer_mobile || null,
        location, crop_type || 'Paddy', harvester_id, mode,
        start_time, end_time, total_hours, hourly_rate, work_amount,
        tractor_trips || 0, tractor_trip_rate || 0, tractor_total || 0, total_amount,
        amount_paid || 0, pending_amount || 0, notes,
        JSON.stringify(breakdownToSave)   // ← save all work entries
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a job (Admin only)
router.put('/:id', authMiddleware(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date, bill_number, farmer_name, farmer_mobile, location, crop_type, harvester_id, mode,
      start_time, end_time, total_hours, hourly_rate, work_amount,
      tractor_trips, tractor_trip_rate, tractor_total,
      total_amount, amount_paid, pending_amount, notes,
      work_breakdown
    } = req.body;

    const result = await pool.query(
      `UPDATE jobs SET
        date=$1, bill_number=$2, farmer_name=$3, farmer_mobile=$4,
        location=$5, crop_type=$6, harvester_id=$7, mode=$8,
        start_time=$9, end_time=$10, total_hours=$11, hourly_rate=$12, work_amount=$13,
        tractor_trips=$14, tractor_trip_rate=$15, tractor_total=$16, total_amount=$17,
        amount_paid=$18, pending_amount=$19, notes=$20,
        work_breakdown=$21
      WHERE id=$22 RETURNING *`,
      [
        date, bill_number || null, farmer_name, farmer_mobile || null,
        location, crop_type, harvester_id, mode,
        start_time, end_time, total_hours, hourly_rate, work_amount,
        tractor_trips, tractor_trip_rate, tractor_total, total_amount,
        amount_paid, pending_amount, notes,
        work_breakdown ? JSON.stringify(work_breakdown) : null,
        id
      ]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Job not found' });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a job (Admin only)
router.delete('/:id', authMiddleware(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM jobs WHERE id=$1 RETURNING id', [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');

// GET all users (Admin only)
router.get('/', auth(['ADMIN']), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, username, role FROM users ORDER BY id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// CREATE user (Admin only)
router.post('/', auth(['ADMIN']), async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role)
      return res.status(400).json({ message: 'Username, password and role are required' });

    const existing = await db.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0)
      return res.status(409).json({ message: 'Username already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (username, password_hash, role)
       VALUES ($1, $2, $3) RETURNING id, username, role`,
      [username, hashed, role.toLowerCase()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE role (Admin only)
router.put('/:id', auth(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const result = await db.query(
      `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, role`,
      [role.toLowerCase(), id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE user (Admin only)
router.delete('/:id', auth(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id)
      return res.status(400).json({ message: 'You cannot delete your own account' });

    const result = await db.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, username', [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'User not found' });

    res.json({ message: `User "${result.rows[0].username}" deleted successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

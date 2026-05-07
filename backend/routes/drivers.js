const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');

// CREATE DRIVER (admin only)
router.post('/', auth(['ADMIN']), async (req, res) => {
  const { username, password, name, phone } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  // Create user
  const user = await db.query(
    `INSERT INTO users (username, password_hash, role)
     VALUES ($1, $2, 'DRIVER') RETURNING id`,
    [username, hashed]
  );

  // Create driver
  const driver = await db.query(
    `INSERT INTO drivers (user_id, name, phone)
     VALUES ($1, $2, $3) RETURNING *`,
    [user.rows[0].id, name, phone]
  );

  res.json(driver.rows[0]);
});

module.exports = router;

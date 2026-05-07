const pool = require('./db');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    // 1. Run schema.sql
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await pool.query(schemaSql);
    console.log('Schema created successfully.');

    // 2. Insert admin user if not exists
    const adminRes = await pool.query('SELECT * FROM users WHERE username = $1', ['admin']);
    if (adminRes.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)',
        ['admin', hashedPassword, 'admin']
      );
      console.log('Admin user seeded (admin / admin123).');
    }

    // 3. Insert driver user if not exists
    const driverRes = await pool.query('SELECT * FROM users WHERE username = $1', ['driver1']);
    if (driverRes.rows.length === 0) {
        const hashedPassword = await bcrypt.hash('driver123', 10);
        await pool.query(
          'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)',
          ['driver1', hashedPassword, 'driver']
        );
        console.log('Driver user seeded (driver1 / driver123).');
    }

    // 4. Insert initial rates if not exists
    const ratesRes = await pool.query('SELECT * FROM rates');
    if (ratesRes.rows.length === 0) {
      await pool.query(`
        INSERT INTO rates (harvester_id, rate_2x2, rate_4x4, tractor_trip_rate)
        VALUES 
        ('Harvester 1', 2000.00, 3000.00, 500.00),
        ('Harvester 2', 2000.00, 3000.00, 500.00)
      `);
      console.log('Initial rates seeded.');
    }

    console.log('Database seeding completed.');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

seed();

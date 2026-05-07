const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,                  // max connections in pool
  idleTimeoutMillis: 30000, // close idle connections after 30s
  connectionTimeoutMillis: 5000, // fail fast if cant connect in 5s
});

// ✅ This is the critical fix - catches pool-level errors
// Without this, a dropped DB connection CRASHES the whole server
pool.on('error', (err, client) => {
  console.error('❌ Unexpected PostgreSQL pool error:', err.message);
  // Do NOT exit here - let the pool recover automatically
});

// Test connection on startup
pool.query('SELECT NOW()')
  .then(() => console.log('✅ PostgreSQL connected successfully'))
  .catch(err => console.error('❌ PostgreSQL connection failed:', err.message));

module.exports = {
  query: (text, params) => pool.query(text, params),
  // ✅ Also export pool for transactions
  pool,
};

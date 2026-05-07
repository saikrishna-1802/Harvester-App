const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');
const app = express();

// ✅ Catch crashes BEFORE they kill the process
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
  // Don't exit - let PM2 decide
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  // Don't exit - log and continue
});

// ✅ Test DB connection on startup
db.query('SELECT NOW()')
  .then(() => console.log('✅ Database connected successfully'))
  .catch((err) => console.error('❌ Database connection failed:', err.message));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/rates', require('./routes/rates'));
app.use('/api/jobs', require('./routes/workEntries'));
app.use('/api/drivers', require('./routes/drivers'));
app.use('/api/users', require('./routes/users'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.send('Harvester API is running...');
});

// ✅ Global error handler - catches ALL route errors
app.use((err, req, res, next) => {
  console.error('🔥 Route Error:', err.message);
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message  // ← helps debug on frontend
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

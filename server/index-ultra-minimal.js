const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3003;

// Minimal middleware
app.use(cors());
app.use(express.json());

// MySQL connection
let db;
async function connectDB() {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'akaydin',
      password: process.env.DB_PASSWORD || '518518',
      database: process.env.DB_NAME || 'akaydin_tarim'
    });
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Minimal Server is running!', 
    timestamp: new Date(),
    nodeVersion: process.version,
    memory: process.memoryUsage()
  });
});

// Services endpoint
app.get('/api/services', async (req, res) => {
  try {
    if (!db) {
      await connectDB();
    }
    const [rows] = await db.execute('SELECT * FROM services ORDER BY id DESC LIMIT 5');
    res.json(rows);
  } catch (error) {
    console.error('Services error:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    memory: process.memoryUsage(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Akaydın Tarım API Server Running' });
});

// Start server
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Ultra minimal server running on port ${PORT}`);
      console.log(`Node version: ${process.version}`);
      console.log(`Memory usage:`, process.memoryUsage());
    });
  } catch (error) {
    console.error('Server startup error:', error);
  }
}

startServer();

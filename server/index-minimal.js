// Minimal memory-optimized server for Node.js 16+
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3003;

// Very minimal middleware
app.use(cors({
  origin: "*",
  credentials: false
}));
app.use(express.json({ limit: '100kb' }));

// MySQL connection with reduced settings for hosting
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'akaydin',
  password: process.env.DB_PASSWORD || '518518',
  database: process.env.DB_NAME || 'akaydin_tarim',
  waitForConnections: true,
  connectionLimit: 2,
  queueLimit: 0,
  acquireTimeout: 30000,
  timeout: 30000,
  idleTimeout: 30000
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running', timestamp: new Date() });
});

// Basic services endpoint
app.get('/api/services', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM services ORDER BY id DESC LIMIT 10');
    res.json(rows);
  } catch (error) {
    console.error('Services error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', memory: process.memoryUsage() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Minimal server running on port ${PORT}`);
  console.log(`Memory usage:`, process.memoryUsage());
}).on('error', (err) => {
  console.error('Server error:', err);
});

// Handle process
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

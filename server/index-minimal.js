// Minimal memory-optimized server startup
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3003;

// Minimal middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// MySQL connection with environment variables
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'akaydin',
  password: process.env.DB_PASSWORD || '518518',
  database: process.env.DB_NAME || 'akaydin_tarim',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000
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

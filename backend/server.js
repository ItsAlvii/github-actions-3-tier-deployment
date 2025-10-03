const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Allow requests from S3 frontend
app.use(cors({
  origin: '*', // for testing; in production, replace '*' with your S3 website URL
  methods: ['GET','POST']
}));

app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get all thoughts
app.get('/api/thoughts', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM thoughts ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Add a new thought
app.post('/api/thoughts', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text required' });

    await pool.query('INSERT INTO thoughts (text, created_at) VALUES (?, NOW())', [text]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});


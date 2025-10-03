// server.js
const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// create pool (recommended instead of single connection)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// test route
app.get('/', (req, res) => {
  res.send('Backend is running with MySQL 🚀');
});

// get all thoughts
app.get('/api/thoughts', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM thoughts ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// add a new thought
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
  console.log(`Server running on port ${PORT}`);
});


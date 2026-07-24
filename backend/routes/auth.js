const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const SECRET = process.env.JWT_SECRET || 'eksu_health_secret_2026';

// REGISTER
router.post('/register', (req, res) => {
  const { fullname, email, password, level, department } = req.body;

  if (!fullname || !email || !password) {
    return res.status(400).json({ error: 'Please fill all required fields' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    const stmt = db.prepare(`
      INSERT INTO users (fullname, email, password, level, department)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(fullname, email, hashedPassword, level, department);

    const token = jwt.sign({ id: result.lastInsertRowid, fullname }, SECRET, { expiresIn: '7d' });

    res.json({ message: 'Registration successful', token, fullname });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// LOGIN
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter email and password' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user) {
    return res.status(400).json({ error: 'Email not found' });
  }

  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) {
    return res.status(400).json({ error: 'Incorrect password' });
  }

  const token = jwt.sign({ id: user.id, fullname: user.fullname }, SECRET, { expiresIn: '7d' });

  res.json({ message: 'Login successful', token, fullname: user.fullname });
});

module.exports = router;
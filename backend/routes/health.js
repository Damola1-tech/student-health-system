const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');
const { calculateScore } = require('../engine/scorer');

const SECRET = process.env.JWT_SECRET || 'eksu_health_secret_2026';

// Middleware to verify token
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. Please log in.' });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

// SUBMIT HEALTH LOG
router.post('/submit', verifyToken, (req, res) => {
  const data = req.body;
  const userId = req.user.id;

  // Calculate BMI
  const weight = parseFloat(data.weight);
  const heightCm = parseFloat(data.height);
  let bmi = null;
  if (weight && heightCm) {
    const heightM = heightCm / 100;
    bmi = (weight / (heightM * heightM)).toFixed(1);
    data.bmi = bmi;
  }

  // Run scoring engine
  const result = calculateScore(data);

  // Save to database
  const stmt = db.prepare(`
    INSERT INTO health_logs (
      user_id, water, sleep, meals, breakfast,
      weight, height, bmi, activity, stress,
      fatigue, skipping, headaches, symptoms,
      score, risk, recommendations
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    userId,
    data.water, data.sleep, data.meals, data.breakfast,
    weight || null, heightCm || null, bmi,
    data.activity, data.stress, data.fatigue,
    data.skipping, data.headaches,
    JSON.stringify(data.symptoms || []),
    result.score, result.risk,
    JSON.stringify(result.recommendations)
  );

  res.json({ success: true, result });
});

// GET HEALTH HISTORY
router.get('/history', verifyToken, (req, res) => {
  const userId = req.user.id;

  const logs = db.prepare(`
    SELECT * FROM health_logs
    WHERE user_id = ?
    ORDER BY logged_at DESC
    LIMIT 10
  `).all(userId);

  const formatted = logs.map(log => ({
    ...log,
    symptoms: JSON.parse(log.symptoms || '[]'),
    recommendations: JSON.parse(log.recommendations || '[]')
  }));

  res.json({ logs: formatted });
});

// GET LATEST LOG
router.get('/latest', verifyToken, (req, res) => {
  const userId = req.user.id;

  const log = db.prepare(`
    SELECT * FROM health_logs
    WHERE user_id = ?
    ORDER BY logged_at DESC
    LIMIT 1
  `).get(userId);

  if (!log) return res.json({ log: null });

  log.symptoms = JSON.parse(log.symptoms || '[]');
  log.recommendations = JSON.parse(log.recommendations || '[]');

  res.json({ log });
});

module.exports = router;
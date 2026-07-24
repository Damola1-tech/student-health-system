const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'health.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullname TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    level TEXT,
    department TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS health_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    water TEXT,
    sleep TEXT,
    meals TEXT,
    breakfast TEXT,
    weight REAL,
    height REAL,
    bmi REAL,
    activity TEXT,
    stress TEXT,
    fatigue TEXT,
    skipping TEXT,
    headaches TEXT,
    symptoms TEXT,
    score INTEGER,
    risk TEXT,
    recommendations TEXT,
    logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

console.log('Database ready');

module.exports = db;
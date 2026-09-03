const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'zabandaan-dev-secret-key';

function signToken(user) {
  return jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
}

// POST /register
router.post('/register', (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const hash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    const result = stmt.run(name, email, hash);

    const user = { id: Number(result.lastInsertRowid), name, email };
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error('register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = bcrypt.compareSync(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const tokenPayload = { id: user.id, name: user.name, email: user.email };
    const token = signToken(tokenPayload);
    res.json({ token, user: tokenPayload });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /convert-guest
router.post('/convert-guest', (req, res) => {
  try {
    const { name, email, password, progress } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const hash = bcrypt.hashSync(password, 10);

    const insertUser = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    const insertProgress = db.prepare(
      'INSERT OR REPLACE INTO progress (user_id, category, difficulty, completed_levels) VALUES (?, ?, ?, ?)'
    );

    const transaction = () => {
      db.exec('BEGIN');
      try {
        const result = insertUser.run(name, email, hash);
        const userId = Number(result.lastInsertRowid);

        if (Array.isArray(progress)) {
          for (const entry of progress) {
            const levels = typeof entry.completed_levels === 'string'
              ? entry.completed_levels
              : JSON.stringify(entry.completed_levels || []);
            insertProgress.run(userId, entry.category, entry.difficulty || null, levels);
          }
        }

        db.exec('COMMIT');
        return userId;
      } catch (err) {
        db.exec('ROLLBACK');
        throw err;
      }
    };

    const userId = transaction();
    const user = { id: userId, name, email };
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error('convert-guest error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

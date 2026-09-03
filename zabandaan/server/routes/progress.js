const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

function parseProgress(rows) {
  return rows.map((row) => ({
    ...row,
    completed_levels: JSON.parse(row.completed_levels || '[]'),
  }));
}

// GET / — all progress for user
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM progress WHERE user_id = ?').all(req.user.id);
    res.json({ progress: parseProgress(rows) });
  } catch (err) {
    console.error('get progress error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /alphabets — alphabets-only progress
router.get('/alphabets', (req, res) => {
  try {
    const rows = db.prepare(
      "SELECT * FROM progress WHERE user_id = ? AND category = 'alphabets'"
    ).all(req.user.id);
    res.json({ progress: parseProgress(rows) });
  } catch (err) {
    console.error('get alphabets progress error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

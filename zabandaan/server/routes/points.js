const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET / — total points
router.get('/', (req, res) => {
  try {
    const row = db.prepare(
      `SELECT SUM(json_array_length(completed_levels)) as total FROM progress WHERE user_id = ?`
    ).get(req.user.id);
    res.json({ points: row?.total || 0 });
  } catch (err) {
    console.error('get points error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST / — add a completed level
router.post('/', (req, res) => {
  try {
    const { category, difficulty, level_id } = req.body;
    if (!category || !level_id) {
      return res.status(400).json({ error: 'category and level_id are required' });
    }

    // Find or create progress row
    db.prepare(
      `INSERT OR IGNORE INTO progress (user_id, category, difficulty, completed_levels) VALUES (?, ?, ?, '[]')`
    ).run(req.user.id, category, difficulty || null);

    // Read current row
    const row = db.prepare(
      `SELECT id, completed_levels FROM progress WHERE user_id = ? AND category = ? AND (difficulty = ? OR (difficulty IS NULL AND ? IS NULL))`
    ).get(req.user.id, category, difficulty || null, difficulty || null);

    if (!row) {
      return res.status(404).json({ error: 'Progress row not found' });
    }

    const levels = JSON.parse(row.completed_levels || '[]');
    if (!levels.includes(level_id)) {
      levels.push(level_id);
      db.prepare(
        `UPDATE progress SET completed_levels = ?, last_played = CURRENT_TIMESTAMP WHERE id = ?`
      ).run(JSON.stringify(levels), row.id);
    }

    // Sum all points for this user
    const total = db.prepare(
      `SELECT SUM(json_array_length(completed_levels)) as total FROM progress WHERE user_id = ?`
    ).get(req.user.id);

    res.json({ points: total?.total || 0 });
  } catch (err) {
    console.error('post points error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

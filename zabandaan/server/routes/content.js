const express = require('express');
const db = require('../db');

const router = express.Router();

// Cache-Control for all content routes
router.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=3600');
  next();
});

// GET /idioms/:difficulty
router.get('/idioms/:difficulty', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM idioms_content WHERE difficulty = ?').all(req.params.difficulty);
    res.json({ idioms: rows });
  } catch (err) {
    console.error('get idioms error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /poetry
router.get('/poetry', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM poetry_content').all();
    const couplets = rows.map((row) => ({
      ...row,
      word_breakdown: JSON.parse(row.word_breakdown || '{}'),
    }));
    res.json({ couplets });
  } catch (err) {
    console.error('get poetry error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /wordsearch/:difficulty
router.get('/wordsearch/:difficulty', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM wordsearch_wordlists WHERE difficulty = ?').all(req.params.difficulty);
    res.json({ words: rows });
  } catch (err) {
    console.error('get wordsearch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

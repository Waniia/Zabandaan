const express = require('express');
const db = require('../db');

const router = express.Router();
const parseOption = (value) => {
  try {
    const parsed = JSON.parse(value);
    if (parsed && parsed.urdu && parsed.english) return parsed;
  } catch {
    // Existing seeded rows use plain English strings.
  }
  return { urdu: value, english: value };
};

// Cache-Control for all content routes
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// GET /idioms/:difficulty
router.get('/idioms/:difficulty', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM idioms_content WHERE difficulty = ?').all(req.params.difficulty)
      .map(row => ({
        ...row,
        audio_path: `/audio/idioms/${row.id}.mp3`,
        correct_option: parseOption(row.correct_meaning),
        distractor_1_option: parseOption(row.distractor_1),
        distractor_2_option: parseOption(row.distractor_2),
        distractor_3_option: parseOption(row.distractor_3),
      }));
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
      word_breakdown: JSON.parse(row.word_breakdown || '[]').map((word, index) => ({
        ...word,
        audio_path: `/audio/poetry/${row.id}-word-${index}.mp3`,
      })),
      audio_path: `/audio/poetry/${row.id}.mp3`,
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
    const query = req.params.difficulty === 'all'
      ? db.prepare('SELECT * FROM wordsearch_wordlists')
      : db.prepare('SELECT * FROM wordsearch_wordlists WHERE difficulty = ?');
    const rows = (req.params.difficulty === 'all' ? query.all() : query.all(req.params.difficulty))
      .map(row => ({ ...row, audio_path: `/audio/wordsearch/${row.id}.mp3` }));
    res.json({ words: rows });
  } catch (err) {
    console.error('get wordsearch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

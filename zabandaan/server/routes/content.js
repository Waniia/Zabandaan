const express = require('express');
const db = require('../db');

const router = express.Router();
const optionTranslations = {
  "The apple of one's eye; someone very dear and beloved": 'بہت پیارا اور عزیز شخص',
  'To keep a close watch on someone': 'کسی پر کڑی نظر رکھنا',
  'To feel jealous of someone': 'کسی سے حسد کرنا',
  'To be extremely angry with someone': 'کسی سے بہت ناراض ہونا',
  'To make a lot of noise; raise a huge commotion': 'بہت شور مچانا',
  'To achieve the impossible': 'ناممکن کام کر دکھانا',
  'To be overjoyed with happiness': 'خوشی سے پھولے نہ سمانا',
  'To burden someone with heavy responsibilities': 'کسی پر بھاری ذمہ داریاں ڈالنا',
  'Something fishy; a suspicious element in the affair': 'معاملے میں کچھ گڑبڑ یا شک والی بات',
  'To spoil a well-made plan': 'بنا بنایا منصوبہ خراب کرنا',
  'A very generous and kind person': 'بہت سخی اور مہربان شخص',
  'To mix up two different things': 'دو مختلف چیزوں کو ملا دینا',
  'To be utterly amazed; completely astonished': 'بہت حیران و ششدر ہونا',
  'To be extremely frightened': 'بہت زیادہ ڈر جانا',
  "To suppress one's laughter": 'اپنی ہنسی روکنا',
  'To regret a missed opportunity': 'گزرے ہوئے موقع پر افسوس کرنا',
  "To poison someone's mind; fill someone's ears with gossip": 'کسی کے کان بھر کر اس کا ذہن خراب کرنا',
  'To listen very attentively': 'بہت غور سے سننا',
  "To obey someone's every command": 'کسی کے ہر حکم کی تعمیل کرنا',
  'To pretend not to hear anything': 'ان سنی کرنے کا بہانہ کرنا',
  "To crave something; to have one's mouth water": 'کسی چیز کی شدید خواہش ہونا',
  'To be speechless with anger': 'غصے سے بے زبان ہو جانا',
  'To speak rudely to elders': 'بڑوں سے بدتمیزی سے بات کرنا',
  'To feel pity for someone': 'کسی پر ترس آنا',
  'To annoy someone greatly; to be a constant nuisance': 'کسی کو بہت تنگ کرنا',
  "To help someone catch their breath": 'کسی کو سانس بحال کرنے میں مدد دینا',
  'To praise someone excessively': 'کسی کی حد سے زیادہ تعریف کرنا',
  'To breathe peacefully after hard work': 'محنت کے بعد سکون کا سانس لینا',
  'A drop in the ocean; an amount far too small for the need': 'ضرورت کے مقابلے میں بہت کم مقدار',
  'A perfect match made in heaven': 'بہترین اور موزوں جوڑی',
  'Too much of a good thing': 'اچھی چیز کی بھی زیادتی',
  'A very expensive bargain': 'بہت مہنگا سودا',
  'To be overjoyed; so happy that one floats on air': 'بہت خوش ہونا',
  'To be extremely tired and weak': 'بہت تھکا ہوا اور کمزور ہونا',
  'To feel lost and confused': 'گم اور پریشان محسوس کرنا',
  'To stumble repeatedly while walking': 'چلتے ہوئے بار بار لڑکھڑانا',
  'To do things the wrong way round; reverse the natural order': 'کام الٹے طریقے سے کرنا',
  'To go with the flow of events': 'حالات کے ساتھ چلنا',
  'To finish work smoothly and quickly': 'کام آسانی اور جلدی سے مکمل کرنا',
  'To waste a golden opportunity': 'سنہری موقع ضائع کرنا',
};

const parseOption = (value) => {
  try {
    const parsed = JSON.parse(value);
    if (parsed && parsed.urdu && parsed.english) return parsed;
  } catch {
    // Existing seeded rows use plain English strings.
  }
  return { urdu: optionTranslations[value] || value, english: value };
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

const pptxgen = require('pptxgenjs');
const path = require('path');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Zabandaan';
pptx.subject = 'Gamified Urdu learning';
pptx.title = 'Zabandaan: Learn Urdu, Playfully';
pptx.company = 'Zabandaan';
pptx.lang = 'en-US';
pptx.theme = {
  headFontFace: 'Trebuchet MS',
  bodyFontFace: 'Trebuchet MS',
  lang: 'en-US'
};
pptx.defineSlideMaster({
  title: 'MASTER',
  background: { color: 'F7F0DF' },
  objects: [
    { line: { x: 0.55, y: 7.08, w: 12.25, h: 0, line: { color: 'DFD5BE', width: 1 } } },
    { text: { text: 'ZABANDAAN  /  URDU, REIMAGINED', options: { x: 0.58, y: 7.13, w: 4, h: 0.18, fontFace: 'Trebuchet MS', fontSize: 7, bold: true, color: '176B68', charSpacing: 1.2, margin: 0 } } },
    { text: { text: '2026', options: { x: 11.9, y: 7.13, w: 0.4, h: 0.18, fontFace: 'Trebuchet MS', fontSize: 7, color: '687572', align: 'right', margin: 0 } } }
  ],
  slideNumber: { x: 12.37, y: 7.13, color: '687572', fontFace: 'Trebuchet MS', fontSize: 7 }
});

const C = { teal: '176B68', dark: '243B3A', coral: 'D86F45', gold: 'F2BD68', paper: 'F7F0DF', white: 'FFFDF7', muted: '687572', border: 'DFD5BE', green: '3D8661' };
const root = __dirname;
const uploaded = name => path.join(root, 'presentation-images', name);
const logo = uploaded('WhatsApp Image 2026-09-04 at 4.47.11 PM.jpeg');
const assets = {
  alif: path.join(root, 'client', 'public', 'images', 'alphabets', 'alif-anar.png'),
  idiom: path.join(root, 'client', 'public', 'images', 'idioms', 'aankhon-ka-tara.png'),
  adjective: path.join(root, 'client', 'public', 'images', 'adjectives', 'khoobsurat.png'),
  dashboard: uploaded('WhatsApp Image 2026-09-04 at 4.55.17 PM.jpeg'),
  account: uploaded('WhatsApp Image 2026-09-04 at 4.55.53 PM.jpeg'),
  tracing: uploaded('WhatsApp Image 2026-09-04 at 4.56.40 PM.jpeg'),
  numbers: uploaded('WhatsApp Image 2026-09-04 at 4.57.09 PM.jpeg'),
  idiomScreen: uploaded('WhatsApp Image 2026-09-04 at 4.58.11 PM.jpeg'),
  wordsearch: uploaded('WhatsApp Image 2026-09-04 at 4.58.27 PM.jpeg'),
  adjectiveScreen: uploaded('WhatsApp Image 2026-09-04 at 4.59.34 PM.jpeg'),
  poetry: uploaded('WhatsApp Image 2026-09-04 at 4.59.56 PM.jpeg')
};

function addText(slide, text, x, y, w, h, options = {}) {
  slide.addText(text, { x, y, w, h, margin: 0, fontFace: 'Trebuchet MS', color: C.dark, breakLine: false, fit: 'shrink', ...options });
}
function addTitle(slide, kicker, title, subtitle = '') {
  addText(slide, kicker.toUpperCase(), 0.65, 0.42, 4.5, 0.22, { fontSize: 9, bold: true, color: C.coral, charSpacing: 1.5 });
  addText(slide, title, 0.62, 0.72, 11.5, 0.62, { fontSize: 28, bold: true, color: C.dark });
  if (subtitle) addText(slide, subtitle, 0.65, 1.42, 10.8, 0.36, { fontSize: 12, color: C.muted });
}
function addCard(slide, x, y, w, h, title, body, accent = C.teal) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: C.white }, line: { color: C.border, width: 1 } });
  slide.addShape(pptx.ShapeType.rect, { x, y, w: 0.08, h, fill: { color: accent }, line: { color: accent } });
  addText(slide, title, x + 0.25, y + 0.2, w - 0.45, 0.28, { fontSize: 15, bold: true, color: C.dark });
  addText(slide, body, x + 0.25, y + 0.62, w - 0.45, h - 0.78, { fontSize: 11, color: C.muted, breakLine: true, valign: 'top', paraSpaceAfterPt: 8 });
}
function addPill(slide, text, x, y, w, color = C.teal) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h: 0.3, rectRadius: 0.12, fill: { color }, line: { color } });
  addText(slide, text, x, y + 0.07, w, 0.12, { fontSize: 8, bold: true, color: C.white, align: 'center', charSpacing: 0.8 });
}
function addIconCircle(slide, x, y, label, color = C.teal) {
  slide.addShape(pptx.ShapeType.ellipse, { x, y, w: 0.58, h: 0.58, fill: { color }, line: { color } });
  addText(slide, label, x, y + 0.16, 0.58, 0.18, { fontSize: 14, bold: true, color: C.white, align: 'center' });
}
function addImageSafe(slide, file, x, y, w, h) {
  slide.addImage({ path: file, x, y, w, h, transparency: 0 });
}
function newSlide() { return pptx.addSlide('MASTER'); }

// 1. Cover
{
  const s = newSlide();
  s.background = { color: C.teal };
  s.addShape(pptx.ShapeType.arc, { x: 8.7, y: -0.8, w: 5.2, h: 5.2, adjustPoint: 0.25, line: { color: C.gold, transparency: 15, width: 5 }, rotate: 25 });
  s.addShape(pptx.ShapeType.arc, { x: 9.2, y: 3.9, w: 4.7, h: 4.7, line: { color: C.coral, transparency: 15, width: 5 }, rotate: 200 });
  s.addImage({ path: logo, x: 0.72, y: 0.65, w: 1.35, h: 1.35 });
  addText(s, 'ZABANDAAN', 0.72, 2.35, 6.8, 0.7, { fontSize: 35, bold: true, color: C.white, charSpacing: 2 });
  addText(s, 'Learn Urdu.\nPlay your way.', 0.72, 3.17, 7.2, 1.25, { fontSize: 32, bold: true, color: C.gold, breakLine: true, valign: 'mid' });
  addText(s, 'A gamified Urdu-learning experience for the new generation and everyone ready to reconnect with the language.', 0.75, 4.75, 5.9, 0.68, { fontSize: 14, color: 'E9F1E8', breakLine: true });
  addPill(s, 'PROJECT PRESENTATION', 0.75, 6.05, 1.95, C.coral);
  addText(s, 'Built to make practice feel like progress.', 8.1, 5.8, 4.1, 0.35, { fontSize: 15, italic: true, color: C.white, align: 'right' });
}

// 2. Problem
{
  const s = newSlide(); addTitle(s, '01 / The gap', 'Urdu learning should not feel like a chore.', 'The motivation is there. The learning experience often is not.');
  addCard(s, 0.7, 2.15, 3.7, 2.45, 'Low engagement', 'Traditional practice can feel repetitive, especially for learners who grew up with interactive digital experiences.', C.coral);
  addCard(s, 4.8, 2.15, 3.7, 2.45, 'Fragmented practice', 'Learners need one place to build fundamentals, vocabulary, comprehension, pronunciation, and confidence.', C.gold);
  addCard(s, 8.9, 2.15, 3.7, 2.45, 'Fear of getting it wrong', 'Without immediate feedback, handwriting, pronunciation, and word meaning remain difficult to practice alone.', C.teal);
  addText(s, 'The opportunity', 0.72, 5.3, 2.2, 0.25, { fontSize: 12, bold: true, color: C.coral });
  addText(s, 'Turn Urdu practice into a small, rewarding habit: choose a challenge, get feedback, earn points, come back tomorrow.', 0.72, 5.7, 11.4, 0.55, { fontSize: 22, bold: true, color: C.dark });
}

// 3. Audience
{
  const s = newSlide(); addTitle(s, '02 / Who it serves', 'One app, several reasons to learn.', 'Zabandaan meets learners at different starting points without making anyone feel behind.');
  const people = [
    ['The new generation', 'Wants a playful, visual, mobile-first way to connect with Urdu.', C.teal],
    ['Heritage learners', 'Wants to rebuild vocabulary, reading confidence, and cultural connection.', C.coral],
    ['Curious beginners', 'Wants a welcoming entry point with clear progress and no pressure.', C.gold],
    ['Everyday improvers', 'Wants short practice sessions that fit around real life.', C.green]
  ];
  people.forEach((p, i) => { const x = 0.75 + (i % 2) * 6.1; const y = 2.0 + Math.floor(i / 2) * 1.9; addIconCircle(s, x, y + 0.1, String(i + 1), p[2]); addText(s, p[0], x + 0.82, y, 4.6, 0.28, { fontSize: 16, bold: true }); addText(s, p[1], x + 0.82, y + 0.46, 4.9, 0.54, { fontSize: 11, color: C.muted, breakLine: true }); });
  s.addShape(pptx.ShapeType.line, { x: 6.75, y: 2.0, w: 0, h: 3.7, line: { color: C.border, width: 1 } });
  addText(s, 'The common need', 0.75, 6.0, 2.1, 0.25, { fontSize: 11, bold: true, color: C.coral });
  addText(s, 'A learning space that feels inviting, useful, and distinctly Urdu.', 2.7, 5.95, 8.9, 0.35, { fontSize: 18, bold: true, color: C.dark });
}

// 4. Solution
{
  const s = newSlide(); addTitle(s, '03 / The solution', 'Zabandaan makes language practice feel playable.', 'A structured learning journey wrapped in feedback, variety, and small wins.');
  s.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 2.15, w: 11.7, h: 2.15, rectRadius: 0.1, fill: { color: C.dark }, line: { color: C.dark } });
  const steps = [['01', 'Choose', 'Pick a skill or challenge'], ['02', 'Practice', 'Learn through interaction'], ['03', 'Listen', 'Hear Urdu aloud'], ['04', 'Earn', 'Collect points and progress']];
  steps.forEach((st, i) => { const x = 1.15 + i * 2.85; addText(s, st[0], x, 2.55, 0.5, 0.25, { fontSize: 11, bold: true, color: C.gold }); addText(s, st[1], x, 2.95, 2.1, 0.3, { fontSize: 17, bold: true, color: C.white }); addText(s, st[2], x, 3.45, 2.2, 0.42, { fontSize: 10, color: 'C8D8D0', breakLine: true }); if (i < 3) s.addShape(pptx.ShapeType.chevron, { x: x + 2.3, y: 3.03, w: 0.35, h: 0.35, fill: { color: C.coral }, line: { color: C.coral } }); });
  addText(s, 'The result', 0.8, 5.0, 1.5, 0.25, { fontSize: 11, bold: true, color: C.coral });
  addText(s, 'Progress is visible. Practice is varied. Urdu feels alive.', 0.8, 5.42, 10.2, 0.42, { fontSize: 25, bold: true, color: C.dark });
}

// 5. Modules
{
  const s = newSlide(); addTitle(s, '04 / The experience', 'Six ways to build an Urdu habit.', 'The dashboard turns a broad language goal into focused, approachable choices.');
  const modules = [['A', 'Alphabets', 'Trace, recognize, and build writing confidence.', C.teal], ['1', 'Numbers', 'Practice number recognition and recall.', C.coral], ['Aa', 'Adjectives', 'Grow useful vocabulary through levels.', C.gold], ['!', 'Idioms', 'Discover expressions and what they really mean.', C.green], ['Po', 'Poetry', 'Read, listen, and explore meaning.', C.teal], ['WS', 'Word search', 'Turn vocabulary review into a puzzle.', C.coral]];
  modules.forEach((m, i) => { const x = 0.72 + (i % 3) * 4.12; const y = 2.0 + Math.floor(i / 3) * 1.75; s.addShape(pptx.ShapeType.roundRect, { x, y, w: 3.65, h: 1.35, rectRadius: 0.07, fill: { color: C.white }, line: { color: C.border, width: 1 } }); addIconCircle(s, x + 0.22, y + 0.35, m[0], m[3]); addText(s, m[1], x + 0.98, y + 0.25, 2.3, 0.25, { fontSize: 15, bold: true }); addText(s, m[2], x + 0.98, y + 0.62, 2.35, 0.45, { fontSize: 10, color: C.muted, breakLine: true }); });
  addImageSafe(s, assets.dashboard, 9.18, 5.23, 2.95, 1.42);
  addText(s, 'The learning desk', 6.85, 5.65, 2.0, 0.25, { fontSize: 11, bold: true, color: C.coral });
}

// 6. Learning loop
{
  const s = newSlide(); addTitle(s, '05 / The learning loop', 'Every interaction has a job.', 'Zabandaan combines exposure, action, feedback, and repetition in one continuous loop.');
  const loop = [['See', 'Visual examples make new words memorable.', C.coral], ['Do', 'Trace, match, solve, choose, and search.', C.teal], ['Hear', 'Audio pronunciation makes Urdu audible.', C.gold], ['Know', 'Points and levels make progress tangible.', C.green]];
  loop.forEach((m, i) => { const angle = [-90, 0, 90, 180][i] * Math.PI / 180; const cx = 6.6 + Math.cos(angle) * 2.75; const cy = 3.95 + Math.sin(angle) * 1.45; s.addShape(pptx.ShapeType.ellipse, { x: cx - 1.35, y: cy - 0.48, w: 2.7, h: 0.96, fill: { color: C.white }, line: { color: m[2], width: 2 } }); addText(s, m[0], cx - 1.1, cy - 0.3, 2.2, 0.25, { fontSize: 16, bold: true, align: 'center' }); addText(s, m[1], cx - 1.1, cy + 0.04, 2.2, 0.3, { fontSize: 8, color: C.muted, align: 'center', breakLine: true }); });
  s.addShape(pptx.ShapeType.ellipse, { x: 5.45, y: 3.22, w: 2.3, h: 1.45, fill: { color: C.teal }, line: { color: C.teal } }); addText(s, 'REPEAT\nWITH\nCONFIDENCE', 5.7, 3.55, 1.8, 0.62, { fontSize: 13, bold: true, color: C.white, align: 'center', breakLine: true });
}

// 7. Alphabets
{
  const s = newSlide(); addTitle(s, '06 / Core feature', 'Start with the shape of the language.', 'Alphabet tracing turns recognition into muscle memory, with accuracy feedback along the way.');
  s.addShape(pptx.ShapeType.roundRect, { x: 0.82, y: 2.0, w: 4.1, h: 3.65, rectRadius: 0.08, fill: { color: C.dark }, line: { color: C.dark } });
  addImageSafe(s, assets.alif, 1.38, 2.45, 2.95, 2.25);
  addText(s, 'ا', 2.1, 4.78, 1.5, 0.5, { fontSize: 30, bold: true, color: C.gold, align: 'center' });
  addText(s, 'Alif / anar', 1.3, 5.32, 3.1, 0.25, { fontSize: 12, color: C.white, align: 'center' });
  addCard(s, 5.35, 2.0, 3.15, 1.55, 'Trace', 'Follow the guided letter path and build writing confidence.', C.teal);
  addCard(s, 8.85, 2.0, 3.15, 1.55, 'Check', 'Accuracy feedback helps learners understand and improve.', C.coral);
  addCard(s, 5.35, 3.95, 3.15, 1.55, 'Recognize', 'Connect the letter shape to a familiar word and image.', C.gold);
  addCard(s, 8.85, 3.95, 3.15, 1.55, 'Listen', 'Hear pronunciation while learning the sound-symbol link.', C.green);
  addImageSafe(s, assets.tracing, 5.22, 5.72, 2.1, 1.12);
  addImageSafe(s, assets.numbers, 7.55, 5.72, 2.1, 1.12);
  addText(s, 'Practice screens from the working app', 9.85, 6.02, 2.0, 0.3, { fontSize: 10, color: C.muted, breakLine: true });
}

// 8. Vocabulary
{
  const s = newSlide(); addTitle(s, '07 / Vocabulary in context', 'Words become easier when they have a world around them.', 'Images, audio, and escalating difficulty turn memorization into meaningful recall.');
  addImageSafe(s, assets.adjective, 0.85, 2.0, 3.35, 3.35);
  addText(s, 'خوبصورت', 0.95, 5.55, 3.1, 0.35, { fontSize: 24, bold: true, color: C.teal, align: 'center' });
  addText(s, 'khoobsurat  /  beautiful', 0.95, 5.98, 3.1, 0.22, { fontSize: 10, color: C.muted, align: 'center' });
  addCard(s, 4.75, 2.0, 3.45, 1.55, 'Build vocabulary', 'Adjectives and everyday words arrive with a visual anchor.', C.teal);
  addCard(s, 8.55, 2.0, 3.45, 1.55, 'Level up', 'Difficulty grows so learners can move from familiar to fluent.', C.coral);
  addCard(s, 4.75, 3.95, 3.45, 1.55, 'Use audio', 'Listen and repeat wherever pronunciation matters.', C.gold);
  addCard(s, 8.55, 3.95, 3.45, 1.55, 'Practice recall', 'Word search and challenges make review active, not passive.', C.green);
}

// 9. Idioms
{
  const s = newSlide(); addTitle(s, '08 / Cultural fluency', 'Idioms teach the Urdu behind the words.', 'Zabandaan helps learners understand expression, not only translation.');
  addImageSafe(s, assets.idiomScreen, 0.8, 2.0, 4.05, 3.55);
  addText(s, 'آنکھوں کا تارا', 1.0, 5.72, 3.65, 0.34, { fontSize: 22, bold: true, color: C.teal, align: 'center' });
  addText(s, 'aankhon ka tara  /  apple of one\'s eye', 1.0, 6.12, 3.65, 0.2, { fontSize: 10, color: C.muted, align: 'center' });
  addText(s, 'From literal words to lived meaning', 5.65, 2.15, 6.4, 0.35, { fontSize: 21, bold: true, color: C.dark });
  const rows = [['IMAGE', 'Recognize the visual idea'], ['MEANING', 'Connect it to natural English'], ['LEVELS', 'Progress from approachable to challenging'], ['AUDIO', 'Hear how it sounds in Urdu']];
  rows.forEach((r, i) => { const y = 2.9 + i * 0.78; addPill(s, r[0], 5.7, y, 1.15, [C.coral, C.teal, C.gold, C.green][i]); addText(s, r[1], 7.15, y + 0.05, 4.3, 0.22, { fontSize: 13, color: C.muted }); });
}

// 10. Poetry/audio
{
  const s = newSlide(); addTitle(s, '09 / Language with a voice', 'Poetry makes Urdu feel close.', 'Meaning and sound work together: read the couplet, explore the words, listen aloud.');
  addImageSafe(s, assets.poetry, 0.8, 2.0, 5.0, 4.2);
  addText(s, 'Read a couplet.\nUnlock its meaning.\nHear it come alive.', 6.35, 2.25, 5.2, 1.35, { fontSize: 25, bold: true, color: C.dark, breakLine: true });
  addText(s, 'Audio is available across the experience, so pronunciation is never an afterthought.', 6.35, 4.05, 5.0, 0.8, { fontSize: 16, color: C.muted, breakLine: true });
  addIconCircle(s, 6.35, 5.35, '♪', C.teal); addText(s, 'Listen anywhere', 7.15, 5.52, 2.6, 0.25, { fontSize: 14, bold: true });
}

// 11. Engagement/auth
{
  const s = newSlide(); addTitle(s, '10 / Motivation architecture', 'Progress should be easy to see.', 'Accountability is optional. Momentum is always available.');
  addCard(s, 0.78, 2.1, 3.6, 2.1, 'Login to grow', 'Save points, track progress, and build a personal learning journey.', C.teal);
  addCard(s, 4.85, 2.1, 3.6, 2.1, 'Play as a guest', 'Start immediately and explore without a commitment barrier.', C.coral);
  addCard(s, 8.92, 2.1, 3.6, 2.1, 'Earn points', 'Make effort visible and give every session a satisfying finish.', C.gold);
  addImageSafe(s, assets.account, 0.82, 4.62, 2.55, 2.05);
  addText(s, 'Optional account creation keeps the first step welcoming.', 3.72, 5.0, 4.25, 0.55, { fontSize: 16, bold: true, color: C.dark, breakLine: true });
  s.addShape(pptx.ShapeType.roundRect, { x: 1.0, y: 5.0, w: 11.15, h: 0.8, rectRadius: 0.08, fill: { color: 'E6E0CC' }, line: { color: 'E6E0CC' } });
  addText(s, 'LOW FRICTION', 1.35, 5.28, 1.4, 0.2, { fontSize: 9, bold: true, color: C.coral, charSpacing: 1 });
  addText(s, '→', 3.0, 5.23, 0.4, 0.25, { fontSize: 18, bold: true, color: C.teal });
  addText(s, 'REPEATED PRACTICE', 4.0, 5.28, 1.9, 0.2, { fontSize: 9, bold: true, color: C.teal, charSpacing: 1 });
  addText(s, '→', 6.35, 5.23, 0.4, 0.25, { fontSize: 18, bold: true, color: C.teal });
  addText(s, 'VISIBLE PROGRESS', 7.35, 5.28, 1.8, 0.2, { fontSize: 9, bold: true, color: C.green, charSpacing: 1 });
  addText(s, '→', 9.6, 5.23, 0.4, 0.25, { fontSize: 18, bold: true, color: C.teal });
  addText(s, 'LASTING HABIT', 10.55, 5.28, 1.3, 0.2, { fontSize: 9, bold: true, color: C.coral, charSpacing: 1 });
}

// 12. Innovation
{
  const s = newSlide(); addTitle(s, '11 / What makes it different', 'The innovation is in the combination.', 'Zabandaan connects literacy, culture, sound, and game design in one coherent experience.');
  const points = [
    ['01', 'Culturally grounded', 'Idioms and poetry make the app about how Urdu is actually lived.', C.coral],
    ['02', 'Multi-sensory', 'Visuals, handwriting, text, and audio reinforce one another.', C.teal],
    ['03', 'Adaptive by design', 'Difficulty levels support both first steps and deeper practice.', C.gold],
    ['04', 'Welcoming by default', 'Guest mode lowers the barrier; accounts reward commitment.', C.green]
  ];
  points.forEach((p, i) => { const y = 2.0 + i * 1.08; addText(s, p[0], 0.82, y, 0.55, 0.25, { fontSize: 12, bold: true, color: p[3] }); addText(s, p[1], 1.65, y, 3.0, 0.28, { fontSize: 16, bold: true }); addText(s, p[2], 5.0, y + 0.02, 6.5, 0.28, { fontSize: 12, color: C.muted }); s.addShape(pptx.ShapeType.line, { x: 1.65, y: y + 0.58, w: 10.2, h: 0, line: { color: C.border, width: 1 } }); });
}

// 13. Technology
{
  const s = newSlide(); addTitle(s, '12 / Technology', 'A focused stack for a focused experience.', 'The architecture keeps the learning loop fast, persistent, and easy to extend.');
  const layers = [
    ['FRONTEND', 'React + Vite', 'Responsive learning UI, routes, game modules, tracing canvas', C.teal],
    ['API', 'Node.js + Express', 'Authentication, content, progress, and points endpoints', C.coral],
    ['DATA', 'SQLite', 'Local-first persistence for users, content, progress, and scores', C.gold],
    ['MEDIA', 'Audio + visual assets', 'Pronunciation clips and illustrated learning content', C.green]
  ];
  layers.forEach((l, i) => { const y = 1.95 + i * 1.0; addPill(s, l[0], 0.85, y + 0.15, 1.35, l[3]); addText(s, l[1], 2.55, y + 0.12, 2.4, 0.25, { fontSize: 16, bold: true }); addText(s, l[2], 5.15, y + 0.14, 6.5, 0.25, { fontSize: 11, color: C.muted }); if (i < layers.length - 1) s.addShape(pptx.ShapeType.line, { x: 1.52, y: y + 0.75, w: 9.9, h: 0, line: { color: C.border, width: 1, dash: 'dash' } }); });
  addText(s, 'Built for a real product workflow: content can grow without rewriting the learning experience.', 0.85, 6.15, 10.8, 0.3, { fontSize: 15, bold: true, color: C.dark });
}

// 14. Feasibility
{
  const s = newSlide(); addTitle(s, '13 / Feasibility', 'This is more than an idea. It is working software.', 'The core experience is already built, connected, and ready to demonstrate.');
  const built = [['AUTH', 'Login and guest access', C.teal], ['CONTENT', 'Six learning modules', C.coral], ['FEEDBACK', 'Tracing accuracy and game results', C.gold], ['PROGRESS', 'Points and saved progress', C.green], ['MEDIA', 'Audio and visual learning assets', C.teal], ['DATA', 'Seeded content and API routes', C.coral]];
  built.forEach((b, i) => { const x = 0.82 + (i % 3) * 4.1; const y = 2.05 + Math.floor(i / 3) * 1.55; s.addShape(pptx.ShapeType.roundRect, { x, y, w: 3.55, h: 1.12, rectRadius: 0.06, fill: { color: C.white }, line: { color: C.border, width: 1 } }); addIconCircle(s, x + 0.2, y + 0.27, '✓', b[2]); addText(s, b[0], x + 0.93, y + 0.24, 2.2, 0.2, { fontSize: 10, bold: true, color: b[2], charSpacing: 1 }); addText(s, b[1], x + 0.93, y + 0.58, 2.25, 0.25, { fontSize: 12, bold: true }); });
  addText(s, 'Demo-ready today', 0.85, 5.72, 2.0, 0.25, { fontSize: 12, bold: true, color: C.coral });
  addText(s, 'A learner can enter, choose, practice, listen, earn, and return.', 3.0, 5.68, 8.4, 0.35, { fontSize: 19, bold: true, color: C.dark });
}

// 15. Close
{
  const s = newSlide(); s.background = { color: C.dark };
  s.addShape(pptx.ShapeType.arc, { x: 8.2, y: -1.0, w: 6, h: 6, line: { color: C.teal, transparency: 12, width: 5 }, rotate: 40 });
  s.addShape(pptx.ShapeType.arc, { x: -1.0, y: 4.9, w: 5.4, h: 5.4, line: { color: C.coral, transparency: 12, width: 5 }, rotate: 130 });
  s.addImage({ path: logo, x: 0.72, y: 0.7, w: 1.22, h: 1.22 });
  addText(s, 'ZABANDAAN', 0.72, 2.35, 6.8, 0.55, { fontSize: 31, bold: true, color: C.white, charSpacing: 2 });
  addText(s, 'Urdu is not just\nsomething to study.\nIt is something to feel.', 0.72, 3.08, 8.4, 1.65, { fontSize: 30, bold: true, color: C.gold, breakLine: true });
  addText(s, 'A playful path to language, culture, and confidence.', 0.75, 5.35, 6.8, 0.35, { fontSize: 15, color: 'DCE9E1' });
  addPill(s, 'THANK YOU', 0.75, 6.05, 1.15, C.coral);
  addText(s, 'Learn Urdu. Play your way.', 8.2, 5.72, 3.9, 0.35, { fontSize: 17, bold: true, color: C.white, align: 'right' });
}

pptx.writeFile({ fileName: path.join(root, 'Zabandaan-Presentation.pptx') });

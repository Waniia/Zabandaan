# Build Zabandaan -- Complete Implementation Plan

## Summary

Full-stack gamified Urdu-learning web app. React + Vite frontend, Node.js + Express backend, SQLite database (same relational schema as MySQL, zero-config). **Four working modules** (Alphabets, Idioms, Word Search, Poetry), **two Coming Soon placeholders** (Numbers, Adjectives). No external APIs -- voice via browser Web Speech API, all content pre-generated at build time.

---

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | React 18 + Vite + React Router v6 | Fast dev/build, SPA routing, canvas support |
| Styling | Plain CSS with CSS variables | Warm palette, responsive, no extra dependency overhead |
| Backend | Node.js + Express | REST API, JWT auth, bcrypt password hashing |
| Database | SQLite via `better-sqlite3` | Same relational schema as MySQL, zero config on Windows |
| Voice | Browser `speechSynthesis` (Web Speech API) | Zero API keys, works offline |
| Canvas | HTML5 Canvas (vanilla) | For alphabet tracing with stroke scoring |

---

## Project Structure

```
zabandaan/
  package.json
  client/
    index.html
    vite.config.js
    public/
    src/
      main.jsx
      App.jsx
      api/                  # fetch helpers, auth interceptor
      context/
        AuthContext.jsx
        PointsContext.jsx
      components/
        Navbar.jsx
        SpeakerIcon.jsx
        PointsBadge.jsx
        ComingSoon.jsx
        FeedbackFlash.jsx
      pages/
        Login.jsx
        Home.jsx
        DifficultySelect.jsx
        alphabets/
          AlphabetMap.jsx
          TracingCanvas.jsx
        idioms/
          IdiomsGame.jsx
        wordsearch/
          WordSearchGame.jsx
          WordSearchGrid.jsx
          DemoPanel.jsx
        poetry/
          PoetryPage.jsx     # Scrollable couplet browser (no quiz)
          CoupletCard.jsx    # Single couplet with tappable words + recitation
        Profile.jsx
      data/
        alphabets.js
      utils/
        speech.js
        wordsearch.js
        scoring.js
      styles/
        global.css
        variables.css
  server/
    package.json
    index.js
    db.js
    routes/
      auth.js
      progress.js
      content.js            # GET /api/idioms/:diff, GET /api/wordsearch/:diff, GET /api/poetry
      points.js
    middleware/
      auth.js
    seed/
      idioms.js
      wordlists.js
      poetry.js             # Famous couplets from Ghalib, Iqbal, Faiz with word meanings
  database/
    schema.sql
```

---

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  category TEXT NOT NULL,        -- 'alphabets' | 'idioms' | 'wordsearch' | 'poetry'
  difficulty TEXT,               -- NULL for alphabets and poetry
  current_level INTEGER DEFAULT 0,
  completed_levels TEXT DEFAULT '[]',
  last_played DATETIME,
  UNIQUE(user_id, category, difficulty)
);

CREATE TABLE IF NOT EXISTS idioms_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idiom_urdu TEXT NOT NULL,
  idiom_roman TEXT NOT NULL,
  correct_meaning TEXT NOT NULL,
  distractor_1 TEXT NOT NULL,
  distractor_2 TEXT NOT NULL,
  distractor_3 TEXT NOT NULL,
  example_sentence TEXT NOT NULL,
  difficulty TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS wordsearch_wordlists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word_urdu TEXT NOT NULL,
  word_meaning TEXT NOT NULL,
  difficulty TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS poetry_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  couplet_urdu TEXT NOT NULL,
  couplet_roman TEXT NOT NULL,
  poet_name TEXT NOT NULL,          -- 'Ghalib', 'Iqbal', 'Faiz Ahmed Faiz'
  poem_title TEXT,                  -- name of the ghazal/nazm if known
  word_breakdown TEXT NOT NULL,     -- JSON: [{word_urdu, word_meaning, word_roman}]
  overall_meaning TEXT NOT NULL     -- plain-English paraphrase of the couplet
);
```

---

## Key Implementation Details

### 1. Authentication Flow (`server/routes/auth.js`)

- **Register**: `POST /api/auth/register` -- name, email, password. Hash with bcrypt (10 rounds). Return JWT.
- **Login**: `POST /api/auth/login` -- email, password. Verify bcrypt hash. Return JWT.
- **Get Me**: `GET /api/auth/me` -- JWT in header, return user data (no password).
- **Guest**: No backend call. Frontend stores guest state in `localStorage`.
- **Guest-to-Account**: `POST /api/auth/convert-guest` -- takes local progress + new credentials, creates account + writes progress in one transaction.

### 2. Alphabet Tracing (`client/src/pages/alphabets/`)

- 10 letters (Alif through Khay) with reference stroke paths as `{x, y}` coordinate arrays in `alphabets.js`.
- `TracingCanvas.jsx`: HTML5 Canvas with mouse/touch capture.
- Scoring: average-distance comparison of user path vs reference path, 0-100% accuracy, 40%+ threshold.
- Sequential unlock: complete letter N to unlock letter N+1.

### 3. Idioms Game (`client/src/pages/idioms/`)

- Multiple choice: 1 correct + 3 distractors, shuffled.
- Easy = obviously wrong distractors. Hard = close/plausible distractors.
- Correct = green flash, +1 point. Wrong = red flash, correct highlighted, no deduction. Auto-advance.

### 4. Word Search (`client/src/pages/wordsearch/`)

- Algorithmic grid generation (horizontal/vertical placement, random Urdu fill).
- Easy: 10x10 grid, 15 common words. Hard: 12x12 grid, 10 longer words.
- Tap/drag to select. Found word shows meaning + plays voice.
- **Demo Panel**: paste custom words, generate fresh puzzle client-side.

### 5. Poetry Module (`client/src/pages/poetry/`) -- READING/LISTENING ONLY, NO QUIZ

- **No difficulty select** -- tapping Poetry on Home goes straight to the couplet browser (same as Alphabets skips difficulty).
- **PoetryPage.jsx**: A scrollable page showing all couplets as cards. Each card displays the couplet in large Nastaliq Urdu text, the poet's name, and the poem title.
- **CoupletCard.jsx**:
  - Full couplet displayed prominently in Urdu with roman transliteration below.
  - Every word is individually tappable -- tapping a word highlights it and shows its English meaning inline beneath the couplet (from `word_breakdown` JSON).
  - A small speaker icon next to each word plays that word's pronunciation via Web Speech API.
  - A "Listen" button speaks the entire couplet aloud using Web Speech API (`ur-PK`).
  - An "Overall Meaning" section shows a plain-English paraphrase of the couplet.
  - A "Mark as Read" or auto-mark-on-scroll marks the couplet as completed in the user's progress (+1 point per couplet read, points only increase).
- **Progression**: Couplets are all available to browse (not locked sequentially). Progress tracks which couplets the user has read/listened to. The progress ring on the Home card shows % of couplets read.
- **Seed data** (`server/seed/poetry.js`): 10-12 famous two-line couplets (ashaar) from three poets:
  - **Allama Iqbal** (4 couplets, e.g. from "Khudi Ko Kar Buland Itna", "Sitaron Se Aage Jahan Aur Bhi Hain")
  - **Faiz Ahmed Faiz** (3-4 couplets, e.g. from "Mujh Se Pehli Si Mohabbat", "Bol Ke Lab Azaad Hain Tere")
  - **Mirza Ghalib** (3-4 couplets, e.g. "Hazaron Khwahishen Aisi", "Dil-e-Nadaan Tujhe Hua Kya Hai")
  - Each with complete word-by-word breakdown, roman transliteration, and overall meaning -- all pre-generated at build time.
- **API**: `GET /api/poetry` returns all couplets (no difficulty filter).

### 6. Points System

- Frontend: `addPoints(n)` only ever increases. Backend validates `new_total > current_total`.
- Points earned: +1 per correct alphabet trace, +1 per correct idiom answer, +1 per word found in word search, +1 per poetry couplet read.

### 7. Web Speech API (`client/src/utils/speech.js`)

```js
export function speak(text, lang = 'ur-PK') {
  if (!window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  const voices = speechSynthesis.getVoices();
  const urduVoice = voices.find(v => v.lang.startsWith('ur'));
  if (urduVoice) utterance.voice = urduVoice;
  speechSynthesis.speak(utterance);
}
```

### 8. UI Design

- Warm greens (#2E7D32, #66BB6A), amber/gold (#FFA726), cream (#FFF8E1), red (#E53935) for wrong answers.
- "Noto Nastaliq Urdu" from Google Fonts CDN for Urdu text, system fonts for Latin.
- Rounded cards (12px radius), soft shadows, large tap targets (min 48px).

### 9. Responsive Design

- CSS Grid (2 cols mobile, 3 cols desktop). Canvas scales to container. Navbar collapses below 600px. Touch + mouse events.

---

## Build Steps (Execution Order)

### Step 1: Project Scaffolding
- Init root `package.json`. Create `client/` (Vite + React) and `server/` (Express).
- Install deps: Client: `react`, `react-dom`, `react-router-dom`, `axios`. Server: `express`, `better-sqlite3`, `bcryptjs`, `jsonwebtoken`, `cors`.

### Step 2: Backend + Database
- `server/db.js`: create SQLite file, run schema, seed idioms + wordlists + poetry couplets.
- `server/index.js`: Express with CORS, JSON, route mounting.
- All API routes: auth, progress, content (including `GET /api/poetry`), points.
- JWT middleware. Seed test accounts (ali@test.com, sara@test.com).

### Step 3: Frontend Shell
- React Router with all pages. AuthContext, PointsContext. Navbar, SpeakerIcon, PointsBadge, FeedbackFlash. Vite proxy for `/api`.

### Step 4: Login + Guest Mode
- Login page (name/email/password form + "Continue as Guest"). Guest localStorage state. Guest-to-account conversion.

### Step 5: Home Dashboard
- 6 category cards: Alphabets, Idioms, Word Search, Poetry (all working); Numbers, Adjectives (Coming Soon). Points badge, progress rings.

### Step 6: Alphabets Module
- Reference stroke paths for 10 letters. TracingCanvas with mouse/touch. Scoring. AlphabetMap with sequential unlock. Voice.

### Step 7: Idioms Module
- IdiomsGame with multiple-choice. Fetch by difficulty. Feedback flash, auto-advance, points. Speaker icons.

### Step 8: Word Search Module
- Grid algorithm. WordSearchGrid with tap/drag. DemoPanel for live demo. Voice + meaning on word found.

### Step 9: Poetry Module
- Seed `poetry_content` with 10-12 couplets from Iqbal, Faiz, Ghalib with word breakdowns (done in Step 2).
- `GET /api/poetry` endpoint (done in Step 2).
- Build `CoupletCard.jsx`: couplet display, tappable words with inline meanings, per-word speaker icons, full-recitation button, overall meaning.
- Build `PoetryPage.jsx`: scrollable list of all couplets, auto-marks as read on interaction, +1 point per new couplet read.
- No difficulty select -- Poetry tile on Home goes directly to PoetryPage.

### Step 10: Profile Page
- Name, email, total points, per-category progress (Alphabets / Idioms / Word Search / Poetry). Guest "Save My Progress" button. Logout.

### Step 11: Polish + Testing
- Responsive pass (mobile, tablet, desktop).
- End-to-end test: register, login, guest, all 4 modules, points, profile, logout.
- Poetry test: couplet rendering, word-tap meanings, recitation audio, read-progress tracking.
- Security: protected routes, user isolation, direct URL access.
- Fix issues. Start servers. Provide preview link.

---

## Test Accounts

| Email | Name | Password |
|---|---|---|
| ali@test.com | Ali | zabandaan123 |
| sara@test.com | Sara | zabandaan123 |

---

## Assumptions and Constraints

- **SQLite instead of MySQL**: Same schema, zero config. Portable to MySQL if needed.
- **No external APIs**: Voice via Web Speech API. Idiom and poetry content seeded at build time. Word search grids generated algorithmically.
- **Urdu voice availability**: Browser/OS dependent. Fallback to closest voice with a small UI note.
- **Noto Nastaliq Urdu font**: Google Fonts CDN, falls back to system fonts.
- **Password field**: Registration uses name + email + password. Login uses email + password. Required by the security spec (hashed passwords, JWT tokens).
- **Poetry has no difficulty**: It is a reading/listening experience, not a quiz. All couplets are browsable. No Easy/Hard split.
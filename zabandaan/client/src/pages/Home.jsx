import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePoints } from '../context/PointsContext';
import ComingSoon from '../components/ComingSoon';
import Navbar from '../components/Navbar';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const { user, isGuest, loading: authLoading } = useAuth();
  const { points, loadPoints } = usePoints();
  const [progress, setProgress] = useState({});
  const navigate = useNavigate();
  const { t, isUrdu } = useLanguage();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadPoints();
      loadProgress();
    }
  }, [user, isGuest]);

  const loadProgress = async () => {
    if (isGuest) {
      // Load from localStorage
      const p = {};
      const guestKeyMap = [
        { storageKey: 'alphabets_none', progressKey: 'alphabets' },
        { storageKey: 'numbers_none', progressKey: 'numbers' },
        { storageKey: 'idioms_easy', progressKey: 'idioms_easy' },
        { storageKey: 'idioms_hard', progressKey: 'idioms_hard' },
        { storageKey: 'wordsearch_easy', progressKey: 'wordsearch_easy' },
        { storageKey: 'wordsearch_hard', progressKey: 'wordsearch_hard' },
        { storageKey: 'adjectives_level-1', progressKey: 'adjectives_level-1' },
        { storageKey: 'adjectives_level-2', progressKey: 'adjectives_level-2' },
        { storageKey: 'adjectives_level-3', progressKey: 'adjectives_level-3' },
        { storageKey: 'poetry_none', progressKey: 'poetry' },
      ];
      guestKeyMap.forEach(({ storageKey, progressKey }) => {
        const stored = localStorage.getItem(`guest_progress_${storageKey}`);
        if (stored) {
          const data = JSON.parse(stored);
          p[progressKey] = (data.completed || []).length;
        }
      });
      setProgress(p);
    } else {
      try {
        const res = await api.get('/progress');
        const p = {};
        (res.data.progress || []).forEach(row => {
          const key = row.difficulty ? `${row.category}_${row.difficulty}` : row.category;
          p[key] = (row.completed_levels || []).length;
        });
        setProgress(p);
      } catch (err) {
        console.error('Load progress error:', err);
      }
    }
  };

  if (authLoading || !user) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;

  const getProgressPct = (category, total) => {
    const count = Array.isArray(category) ? category.reduce((sum, key) => sum + (progress[key] || 0), 0) : (progress[category] || 0);
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  const categories = [
    {
      id: 'alphabets', title: t('alphabets', 'Alphabets'), subtitle: isUrdu ? 'اردو حروف' : 'Urdu Harf',
      description: isUrdu ? 'رہنمائی کے ساتھ اردو کے ۳۹ حروف لکھنا سیکھیں' : 'Trace and learn all 39 Urdu letters with guided stroke practice',
      icon: '✏️', route: '/alphabets', total: 39, progressKey: 'alphabets', working: true,
      accent: '#3d8661', accentBg: '#e4f0e5',
    },
    {
      id: 'numbers', title: t('numbers', 'Numbers'), subtitle: isUrdu ? 'اردو اعداد' : 'Urdu Adad',
      description: isUrdu ? 'اردو کے ۱ سے ۱۰ تک اعداد پڑھنا اور لکھنا سیکھیں' : 'Learn to read and write Urdu numerals ۱ through ۱۰',
      icon: '🔢', route: '/numbers', total: 10, progressKey: 'numbers', working: true,
      accent: '#397b91', accentBg: '#e4eff0',
    },
    {
      id: 'idioms', title: t('idioms', 'Idioms'), subtitle: isUrdu ? 'محاورے' : 'Muhavare',
      description: isUrdu ? 'تصویری اشاروں سے اردو محاوروں کو ان کے معنی سے ملائیں' : 'Match Urdu idioms to their meanings with picture clues',
      icon: '💬', route: '/difficulty/idioms', total: 10, progressKey: 'idioms', working: true,
      accent: '#c67b3f', accentBg: '#f8ead6',
    },
    {
      id: 'wordsearch', title: t('wordSearch', 'Word Search'), subtitle: isUrdu ? 'لفظ ڈھونڈیں' : 'Lafz Dhundo',
      description: isUrdu ? 'حروف کی پہیلی میں چھپے ہوئے اردو الفاظ تلاش کریں' : 'Find hidden Urdu words in a letter grid puzzle',
      icon: '🔍', route: '/wordsearch', total: 25, progressKey: 'wordsearch', working: true,
      accent: '#76608d', accentBg: '#eee8f1',
    },
    {
      id: 'adjectives', title: t('adjectives', 'Adjectives'), subtitle: isUrdu ? 'صفات' : 'Sifaat',
      description: isUrdu ? 'تصویروں کو صفات سے ملا کر اردو کے وضاحتی الفاظ سیکھیں' : 'Learn descriptive Urdu words by matching pictures to adjectives',
      icon: '🌟', route: '/difficulty/adjectives', total: 30, progressKeys: ['adjectives_level-1', 'adjectives_level-2', 'adjectives_level-3'], working: true,
      accent: '#c9574d', accentBg: '#f8e5df',
    },
    {
      id: 'poetry', title: t('poetry', 'Poetry'), subtitle: isUrdu ? 'شاعری' : 'Shairi',
      description: isUrdu ? 'اردو شاعری کے اشعار اور ان کے معنی دریافت کریں' : 'Explore classic Urdu poetry couplets and their meanings',
      icon: '📜', route: '/poetry', total: 12, progressKey: 'poetry', working: true,
      accent: '#80634e', accentBg: '#eee7dd',
    },
  ];

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.welcome}>
          <div>
            <p style={styles.welcomeKicker}>{t('learningDesk', 'YOUR LEARNING DESK')}</p>
            <h1 style={styles.welcomeTitle}>{t('welcome', 'Welcome')}, {user.name}!</h1>
            <p style={styles.welcomeSub}>
              {isGuest ? t('guestNote', 'Playing as guest — your practice is saved on this device.') : (isUrdu ? 'تھوڑی سی اردو مشق بہت آگے لے جاتی ہے۔' : 'A little Urdu practice goes a long way.')}
            </p>
          </div>
          <div style={styles.dailyMark}>
            <span style={styles.dailyMarkNumber}>{points}</span>
            <span style={styles.dailyMarkLabel}>{isUrdu ? <>حاصل کردہ<br />پوائنٹس</> : <>points<br />earned</>}</span>
          </div>
        </div>

        <div style={styles.heroPanel}>
          <div style={styles.heroTextWrap}>
            <div style={styles.heroTag}>Learning grows here</div>
            <h2 style={styles.heroTitle}>{isUrdu ? 'اردو سیکھنے کا خوشگوار سفر' : 'A cheerful path to learning Urdu'}</h2>
            <p style={styles.heroText}>
              {isUrdu
                ? 'بچوں کے لیے دلکش کھیل، خوشی، اور سیکھنے کی سرگرمیوں سے بھرپور تجربہ۔'
                : 'Engaging activities, playful practice, and steady progress for curious learners.'}
            </p>
          </div>
          <div style={styles.heroArtWrap} aria-label="Decorative learning tree illustration">
            <svg viewBox="0 0 420 320" style={styles.heroArt} role="img" aria-hidden="true">
              <ellipse cx="210" cy="285" rx="120" ry="20" fill="#dfeee9" />
              <g transform="translate(0,4)">
                <path d="M210 260 L210 120" stroke="#7a4f2a" strokeWidth="18" strokeLinecap="round" />
                <path d="M210 130 C185 110, 170 84, 150 56 C138 40, 122 48, 128 66 C116 60, 104 70, 109 88 C98 80, 82 92, 86 114 C70 105, 59 118, 64 142 C51 138, 38 149, 46 170 C29 175, 36 195, 58 196 C42 214, 62 235, 88 232 C81 252, 98 266, 122 263 C121 273, 133 283, 146 281 C161 296, 184 287, 190 270 C202 287, 230 293, 245 280 C260 289, 279 279, 286 266 C310 268, 329 254, 330 231 C352 232, 365 221, 362 200 C379 194, 382 176, 368 166 C385 153, 374 130, 355 124 C353 108, 341 94, 320 96 C318 82, 303 72, 287 80 C281 58, 260 53, 240 63 C232 46, 215 37, 198 45 C188 28, 170 27, 156 40 C141 28, 120 34, 112 52 C89 50, 73 63, 75 82 C56 88, 46 104, 52 125 C35 130, 27 147, 34 164 C22 174, 23 197, 43 204 C34 220, 46 239, 65 240 C51 257, 66 272, 89 272 C99 287, 118 294, 138 292 C149 308, 171 314, 191 306 C198 316, 214 322, 232 315 C248 321, 266 318, 276 307 C298 311, 319 304, 330 288 C343 295, 363 292, 374 276 C393 275, 404 260, 399 242 C416 232, 418 210, 403 197 C417 182, 411 158, 392 150 C390 133, 380 121, 360 122 C358 104, 342 90, 323 90 C321 71, 306 58, 288 59 C279 41, 257 30, 237 34 C228 17, 208 11, 191 18 C176 6, 151 9, 138 24 C119 15, 96 17, 82 31 C63 29, 45 42, 40 62 C22 68, 16 86, 26 101 C14 112, 12 136, 30 145 C14 159, 15 181, 30 195 C16 208, 21 230, 41 238 C34 255, 51 271, 69 275 C79 288, 98 293, 115 289 C125 304, 147 311, 166 306 C176 320, 195 325, 210 321 C226 325, 246 318, 258 306 C279 309, 300 303, 314 288 C332 293, 353 289, 365 272 C382 272, 398 261, 399 242 C413 238, 423 227, 418 212 C427 204, 427 188, 415 179 C421 161, 410 142, 391 142 C393 129, 385 118, 368 115 C365 98, 352 83, 334 84 C328 70, 311 60, 294 64 C286 45, 264 30, 242 32 C232 14, 214 2, 196 9 C176 -1, 152 0, 140 17 C123 8, 100 10, 88 24 C70 18, 51 25, 39 41 C20 46, 12 66, 18 84 C4 96, 3 119, 17 133 C8 146, 9 166, 24 176 C9 191, 13 216, 33 225 C26 239, 34 259, 50 268 C48 277, 56 287, 68 289 C80 301, 99 307, 118 304 C128 316, 146 322, 165 319 C175 332, 191 340, 211 340 C232 340, 251 332, 263 318 C287 322, 312 315, 325 298 C347 302, 370 295, 382 277 C394 279, 406 272, 414 259 C429 256, 438 241, 433 227 C443 214, 442 196, 426 186 C433 167, 425 147, 402 140 C398 123, 381 108, 360 105 C355 88, 336 75, 316 78 C309 58, 290 41, 267 42 C258 24, 233 13, 212 18 C193 5, 168 5, 151 17 C133 8, 110 10, 95 23 C75 20, 54 27, 42 45 C27 48, 20 67, 29 80 C18 90, 16 105, 22 117 C11 127, 9 143, 22 153 C8 169, 11 192, 29 203 C20 219, 28 238, 44 248 C42 260, 52 275, 66 280 C80 290, 97 293, 112 289 C124 300, 138 308, 154 309 C168 323, 186 329, 206 326 C222 329, 240 324, 254 312 C274 314, 294 308, 308 292 C323 296, 340 293, 352 282 C369 282, 384 275, 394 261 C410 257, 420 245, 420 229 C429 220, 430 208, 422 199 C428 184, 418 170, 401 166 C398 149, 384 136, 367 133 C367 121, 362 109, 350 99 C335 97, 321 107, 315 121 C299 112, 280 111, 267 122 C253 110, 234 108, 220 118 C207 105, 186 103, 171 113 C158 103, 140 102, 125 111 C109 99, 87 101, 74 116 C60 106, 42 111, 31 129 C19 124, 9 134, 8 149 C-5 154, -9 171, 0 186 C-11 192, -11 214, 0 223 C-11 238, -7 255, 8 264 C18 278, 37 283, 54 279 C64 295, 83 303, 103 299 C115 312, 137 318, 157 315 C169 328, 192 335, 210 334 C229 336, 251 329, 267 316 C286 319, 304 313, 318 298 C338 303, 359 300, 373 284 C390 286, 405 276, 412 260 C423 255, 429 245, 430 234 L430 260 L210 260 Z" fill="#b7e3e5" opacity="0.8"/>
                <path d="M210 260 L210 120" stroke="#7a4f2a" strokeWidth="18" strokeLinecap="round" opacity="0.7" />
                <circle cx="212" cy="62" r="16" fill="#f4d694" opacity="0.8"/>
                <circle cx="164" cy="106" r="18" fill="#f4d694" opacity="0.8"/>
                <circle cx="260" cy="90" r="17" fill="#f4d694" opacity="0.8"/>
                <circle cx="132" cy="160" r="17" fill="#f4d694" opacity="0.8"/>
                <circle cx="280" cy="155" r="16" fill="#f4d694" opacity="0.8"/>
                <circle cx="182" cy="200" r="18" fill="#f4d694" opacity="0.8"/>
                <circle cx="244" cy="196" r="18" fill="#f4d694" opacity="0.8"/>
                <g fill="#f0c778">
                  <path d="M100 100 C110 84, 116 74, 123 60 C109 70, 96 84, 88 95 Z"/>
                  <path d="M308 118 C319 102, 328 90, 339 76 C325 88, 315 99, 305 113 Z"/>
                  <path d="M85 188 C95 172, 100 159, 110 146 C96 160, 86 174, 79 188 Z"/>
                  <path d="M327 192 C336 175, 344 165, 352 151 C339 161, 330 176, 322 192 Z"/>
                </g>
              </g>
            </svg>
          </div>
        </div>

        {points === 0 && (
          <div style={styles.emptyState}>
            <p>🌱 {isUrdu ? 'اپنے پہلے اردو حروف سیکھنے کے لیے' : 'Start with'} <strong>{t('alphabets', 'Alphabets')}</strong> {isUrdu ? 'سے شروع کریں!' : 'to learn your first Urdu letters!'}</p>
          </div>
        )}

        <div style={styles.grid}>
          {categories.map(cat => (
            cat.working ? (
              <div
                key={cat.id}
                onClick={() => navigate(cat.route)}
                style={{ ...styles.card, borderLeft: `4px solid ${cat.accent}` }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; }}
              >
                <div style={{ ...styles.iconBadge, background: cat.accentBg }}>
                  <span style={styles.cardIcon}>{cat.icon}</span>
                </div>
                <h3 style={styles.cardTitle}>{cat.title}</h3>
                <p style={styles.cardSub}>{cat.subtitle}</p>
                <p style={styles.cardDesc}>{cat.description}</p>
                <div style={styles.progressWrap}>
                  <div style={{ ...styles.progressBar, width: `${getProgressPct(cat.progressKeys || cat.progressKey, cat.total)}%`, background: `linear-gradient(90deg, ${cat.accent}88, ${cat.accent})` }} />
                </div>
                <span style={styles.progressLabel}>{getProgressPct(cat.progressKeys || cat.progressKey, cat.total)}% complete</span>
              </div>
            ) : (
              <ComingSoon key={cat.id} title={cat.title} subtitle={cat.subtitle} />
            )
          ))}
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    maxWidth: 900,
    margin: '0 auto',
    padding: 24,
  },
  welcome: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 30,
    padding: '18px 0 6px',
    borderBottom: '1px solid #dfd5be',
  },
  welcomeKicker: {
    margin: 0,
    color: '#d86f45',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.8,
  },
  welcomeTitle: {
    fontSize: 34,
    fontWeight: 800,
    color: '#263b3a',
    margin: 0,
  },
  welcomeSub: {
    color: '#687572',
    margin: '4px 0 0',
    fontSize: 15,
  },
  dailyMark: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    color: '#9d6423',
    background: '#fff4d9',
    border: '1px solid #e5b65d',
    borderRadius: 12,
    padding: '9px 14px',
  },
  dailyMarkNumber: {
    fontSize: 26,
    fontWeight: 800,
  },
  dailyMarkLabel: {
    fontSize: 11,
    lineHeight: 1.15,
    fontWeight: 700,
  },
  heroPanel: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #fef9f1 0%, #edf9f6 100%)',
    border: '1px solid #dfe9e2',
    borderRadius: 22,
    padding: '26px 20px 18px',
    marginBottom: 28,
    boxShadow: '0 12px 30px rgba(40, 87, 83, 0.08)',
    gap: 20,
  },
  heroTextWrap: {
    padding: '8px 8px 8px 10px',
  },
  heroTag: {
    display: 'inline-block',
    background: '#ecf8f2',
    color: '#2b7d68',
    border: '1px solid #bfe4d7',
    borderRadius: 999,
    padding: '7px 12px',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    margin: '16px 0 10px',
    fontSize: 30,
    lineHeight: 1.15,
    color: '#233b3d',
  },
  heroText: {
    margin: 0,
    color: '#596c69',
    fontSize: 15,
    lineHeight: 1.7,
    maxWidth: 430,
  },
  heroArtWrap: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 260,
  },
  heroArt: {
    width: '100%',
    maxWidth: 390,
    height: 'auto',
    filter: 'drop-shadow(0 18px 20px rgba(77, 127, 120, 0.12))',
  },
  emptyState: {
    background: '#e4f0e5',
    border: '1px dashed #8dbb96',
    borderRadius: 10,
    padding: '16px 20px',
    marginBottom: 20,
    color: '#286448',
    fontSize: 15,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: 20,
  },
  card: {
    background: '#fffdf7',
    borderRadius: 16,
    border: '1px solid #dfd5be',
    padding: 26,
    textAlign: 'center',
    cursor: 'pointer',
    boxShadow: '0 3px 0 rgba(38, 59, 58, 0.08)',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    minHeight: 200,
  },
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: '14px 14px 14px 4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  cardIcon: {
    fontSize: 32,
  },
  cardTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: '#263b3a',
  },
  cardSub: {
    margin: 0,
    fontSize: 13,
    color: '#687572',
    fontFamily: "'Noto Nastaliq Urdu', serif",
  },
  cardDesc: {
    margin: '4px 0 0',
    fontSize: 12,
    color: '#7f8b86',
    lineHeight: 1.4,
  },
  progressWrap: {
    width: '100%',
    height: 6,
    background: '#e8e0cf',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressBar: {
    height: '100%',
    background: '#3d8661',
    borderRadius: 3,
    transition: 'width 0.5s ease',
  },
  progressLabel: {
    fontSize: 12,
    color: '#7f8b86',
    marginTop: 2,
  },
};

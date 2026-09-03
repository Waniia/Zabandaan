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
        { storageKey: 'adjectives_none', progressKey: 'adjectives' },
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
    const count = progress[category] || 0;
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
      icon: '🌟', route: '/adjectives', total: 15, progressKey: 'adjectives', working: true,
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
                  <div style={{ ...styles.progressBar, width: `${getProgressPct(cat.progressKey, cat.total)}%`, background: `linear-gradient(90deg, ${cat.accent}88, ${cat.accent})` }} />
                </div>
                <span style={styles.progressLabel}>{getProgressPct(cat.progressKey, cat.total)}% complete</span>
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

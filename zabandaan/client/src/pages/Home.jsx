import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePoints } from '../context/PointsContext';
import ComingSoon from '../components/ComingSoon';
import Navbar from '../components/Navbar';
import api from '../api';

export default function Home() {
  const { user, isGuest, loading: authLoading } = useAuth();
  const { points, loadPoints } = usePoints();
  const [progress, setProgress] = useState({});
  const navigate = useNavigate();

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
      id: 'alphabets', title: 'Alphabets', subtitle: 'Urdu Harf',
      description: 'Trace and learn all 39 Urdu letters with guided stroke practice',
      icon: '✏️', route: '/alphabets', total: 39, progressKey: 'alphabets', working: true,
      accent: '#43A047', accentBg: '#E8F5E9',
    },
    {
      id: 'numbers', title: 'Numbers', subtitle: 'Urdu Adad',
      description: 'Learn to read and write Urdu numerals ۱ through ۱۰',
      icon: '🔢', route: '/numbers', total: 10, progressKey: 'numbers', working: true,
      accent: '#1E88E5', accentBg: '#E3F2FD',
    },
    {
      id: 'idioms', title: 'Idioms', subtitle: 'Muhavare',
      description: 'Match Urdu idioms to their meanings with picture clues',
      icon: '💬', route: '/difficulty/idioms', total: 10, progressKey: 'idioms', working: true,
      accent: '#FB8C00', accentBg: '#FFF3E0',
    },
    {
      id: 'wordsearch', title: 'Word Search', subtitle: 'Lafz Dhundo',
      description: 'Find hidden Urdu words in a letter grid puzzle',
      icon: '🔍', route: '/difficulty/wordsearch', total: 15, progressKey: 'wordsearch', working: true,
      accent: '#8E24AA', accentBg: '#F3E5F5',
    },
    {
      id: 'adjectives', title: 'Adjectives', subtitle: 'Sifaat',
      description: 'Learn descriptive Urdu words by matching pictures to adjectives',
      icon: '🌟', route: '/adjectives', total: 15, progressKey: 'adjectives', working: true,
      accent: '#F4511E', accentBg: '#FBE9E7',
    },
    {
      id: 'poetry', title: 'Poetry', subtitle: 'Shairi',
      description: 'Explore classic Urdu poetry couplets and their meanings',
      icon: '📜', route: '/poetry', total: 12, progressKey: 'poetry', working: true,
      accent: '#6D4C41', accentBg: '#EFEBE9',
    },
  ];

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.welcome}>
          <h1 style={styles.welcomeTitle}>
            Welcome, {user.name}! 👋
          </h1>
          <p style={styles.welcomeSub}>
            {isGuest ? 'Playing as guest — save your progress anytime from Profile' : 'Ready to learn some Urdu today?'}
          </p>
        </div>

        {points === 0 && (
          <div style={styles.emptyState}>
            <p>🌱 Start with <strong>Alphabets</strong> to learn your first Urdu letters!</p>
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
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: '#333',
    margin: 0,
  },
  welcomeSub: {
    color: '#888',
    margin: '4px 0 0',
    fontSize: 15,
  },
  emptyState: {
    background: '#E8F5E9',
    borderRadius: 12,
    padding: '16px 20px',
    marginBottom: 20,
    color: '#2E7D32',
    fontSize: 15,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: 16,
  },
  card: {
    background: 'white',
    borderRadius: 12,
    padding: 24,
    textAlign: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    minHeight: 180,
  },
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: '50%',
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
    color: '#333',
  },
  cardSub: {
    margin: 0,
    fontSize: 13,
    color: '#888',
    fontFamily: "'Noto Nastaliq Urdu', serif",
  },
  cardDesc: {
    margin: '4px 0 0',
    fontSize: 12,
    color: '#AAA',
    lineHeight: 1.4,
  },
  progressWrap: {
    width: '100%',
    height: 6,
    background: '#EEE',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #66BB6A, #2E7D32)',
    borderRadius: 3,
    transition: 'width 0.5s ease',
  },
  progressLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
};

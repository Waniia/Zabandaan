import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { usePoints } from '../context/PointsContext';
import api from '../api';

export default function Profile() {
  const { user, isGuest, convertGuest, logout } = useAuth();
  const { points, loadPoints, getAllGuestProgress } = usePoints();
  const [progress, setProgress] = useState([]);
  const [showConvert, setShowConvert] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [converting, setConverting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setName(user.name || '');
    loadPoints();
    loadProgress();
  }, [user]);

  const loadProgress = async () => {
    if (isGuest) {
      const p = getAllGuestProgress();
      setProgress(p);
    } else {
      try {
        const res = await api.get('/progress');
        setProgress(res.data.progress || []);
      } catch (err) {
        console.error('Load progress error:', err);
      }
    }
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || password.length < 6) {
      return setError('Please fill all fields. Password must be at least 6 characters.');
    }
    setConverting(true);
    try {
      const guestProgress = getAllGuestProgress();
      await convertGuest(name, email, password, guestProgress);
      setShowConvert(false);
      loadPoints();
      loadProgress();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create account');
    }
    setConverting(false);
  };

  const getCategoryProgress = (category, difficulty) => {
    if (isGuest) {
      const key = difficulty ? `${category}_${difficulty}` : category;
      const row = progress.find(p => {
        const pKey = p.difficulty ? `${p.category}_${p.difficulty}` : p.category;
        return pKey === key;
      });
      return row ? row.completed_levels.length : 0;
    }
    const row = progress.find(p => p.category === category && p.difficulty === (difficulty || null));
    return row ? row.completed_levels.length : 0;
  };

  if (!user) return null;

  const categories = [
    { name: 'Alphabets', key: 'alphabets', diff: null, total: 10, icon: '✏️' },
    { name: 'Idioms (Easy)', key: 'idioms', diff: 'easy', total: 10, icon: '💬' },
    { name: 'Idioms (Hard)', key: 'idioms', diff: 'hard', total: 10, icon: '💬' },
    { name: 'Word Search (Easy)', key: 'wordsearch', diff: 'easy', total: 15, icon: '🔍' },
    { name: 'Word Search (Hard)', key: 'wordsearch', diff: 'hard', total: 10, icon: '🔍' },
    { name: 'Poetry', key: 'poetry', diff: null, total: 12, icon: '📜' },
  ];

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.profileCard}>
          <div style={styles.avatar}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'G'}
          </div>
          <h1 style={styles.name}>{user.name}</h1>
          {user.email && <p style={styles.email}>{user.email}</p>}
          {isGuest && (
            <span style={styles.guestBadge}>Guest Mode</span>
          )}
        </div>

        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <span style={styles.statValue}>⭐ {points}</span>
            <span style={styles.statLabel}>Total Points</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statValue}>
              {categories.reduce((sum, c) => sum + getCategoryProgress(c.key, c.diff), 0)}
            </span>
            <span style={styles.statLabel}>Levels Completed</span>
          </div>
        </div>

        <h2 style={styles.sectionTitle}>Progress by Category</h2>
        <div style={styles.progressGrid}>
          {categories.map((cat, i) => {
            const done = getCategoryProgress(cat.key, cat.diff);
            const pct = cat.total > 0 ? Math.round((done / cat.total) * 100) : 0;
            return (
              <div key={i} style={styles.progressItem}>
                <div style={styles.progressHeader}>
                  <span>{cat.icon} {cat.name}</span>
                  <span style={styles.progressPct}>{pct}%</span>
                </div>
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFill, width: `${pct}%` }} />
                </div>
                <span style={styles.progressCount}>{done} / {cat.total}</span>
              </div>
            );
          })}
        </div>

        {isGuest && !showConvert && (
          <div style={styles.convertSection}>
            <p style={styles.convertText}>
              Playing as a guest? Create an account to save your progress permanently!
            </p>
            <button onClick={() => setShowConvert(true)} style={styles.convertBtn}>
              Save My Progress
            </button>
          </div>
        )}

        {showConvert && (
          <div style={styles.convertForm}>
            <h3 style={{ margin: '0 0 16px', color: '#333' }}>Create Account & Save Progress</h3>
            <form onSubmit={handleConvert}>
              <div style={styles.formGroup}>
                <label>Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div style={styles.formGroup}>
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div style={styles.formGroup}>
                <label>Password (min 6 chars)</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              </div>
              {error && <p style={styles.error}>{error}</p>}
              <button type="submit" disabled={converting} style={styles.submitBtn}>
                {converting ? 'Creating...' : 'Create Account & Save Progress'}
              </button>
              <button type="button" onClick={() => setShowConvert(false)} style={styles.cancelBtn}>
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}

const styles = {
  container: {
    maxWidth: 700,
    margin: '0 auto',
    padding: 24,
  },
  profileCard: {
    textAlign: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: '#2E7D32',
    color: 'white',
    fontSize: 28,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 8px',
  },
  name: {
    fontSize: 24,
    fontWeight: 700,
    margin: 0,
    color: '#333',
  },
  email: {
    color: '#888',
    fontSize: 15,
    margin: '4px 0',
  },
  guestBadge: {
    display: 'inline-block',
    background: '#FFA726',
    color: 'white',
    padding: '4px 12px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    marginTop: 4,
  },
  statsRow: {
    display: 'flex',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    background: 'white',
    borderRadius: 12,
    padding: 20,
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 700,
    color: '#2E7D32',
  },
  statLabel: {
    fontSize: 13,
    color: '#999',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#333',
    marginBottom: 12,
  },
  progressGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginBottom: 24,
  },
  progressItem: {
    background: 'white',
    borderRadius: 10,
    padding: '12px 16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 6,
  },
  progressPct: {
    color: '#2E7D32',
    fontWeight: 600,
  },
  progressBar: {
    height: 8,
    background: '#EEE',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #66BB6A, #2E7D32)',
    borderRadius: 4,
    transition: 'width 0.5s ease',
  },
  progressCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
    display: 'block',
  },
  convertSection: {
    background: '#E8F5E9',
    borderRadius: 12,
    padding: 20,
    textAlign: 'center',
    marginTop: 16,
  },
  convertText: {
    color: '#2E7D32',
    fontSize: 15,
    marginBottom: 12,
  },
  convertBtn: {
    background: '#FFA726',
    color: 'white',
    border: 'none',
    padding: '12px 28px',
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 16,
    cursor: 'pointer',
  },
  convertForm: {
    background: 'white',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    marginTop: 16,
  },
  formGroup: {
    marginBottom: 14,
  },
  error: {
    color: '#E53935',
    fontSize: 14,
    marginBottom: 8,
  },
  submitBtn: {
    width: '100%',
    background: '#2E7D32',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 16,
    cursor: 'pointer',
    marginBottom: 8,
  },
  cancelBtn: {
    width: '100%',
    background: 'transparent',
    color: '#888',
    border: '2px solid #DDD',
    padding: '10px',
    borderRadius: 8,
    fontWeight: 500,
    cursor: 'pointer',
  },
};

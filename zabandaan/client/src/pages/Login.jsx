import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';

export default function Login() {
  const [mode, setMode] = useState('landing'); // landing | login | register
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Please enter your name');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  const handleGuest = () => {
    continueAsGuest(guestName.trim() || 'Guest');
    navigate('/');
  };

  if (mode === 'landing') {
    return (
      <div style={styles.container}>
        <div style={styles.languageControl}><LanguageToggle /></div>
        <div className="login-landing" style={styles.landing}>
          <div style={styles.hero}>
            <div style={styles.kicker}>URDU, ONE LITTLE STEP AT A TIME</div>
            <div style={styles.logoCircle}>Z</div>
            <h1 style={styles.title}>Zabandaan</h1>
            <p style={styles.urduTitle}>زبان سیکھیں، مزے سے</p>
            <p style={styles.tagline}>A friendly place to trace letters, discover words, and make Urdu part of your day.</p>
            <div style={styles.lessonNote}>
              <span style={styles.noteDot}></span>
              <span>Short practice. Real progress.</span>
            </div>
          </div>

          <div style={styles.entryCard}>
            <p style={styles.entryEyebrow}>{t('startLearning', 'START LEARNING')}</p>
            <h2 style={styles.entryTitle}>{t('whereBegin', 'Where shall we begin?')}</h2>
            <div style={styles.btnGroup}>
            <button onClick={() => setMode('register')} style={styles.btnPrimary}>
              {t('createAccount', 'Create Account')}
            </button>
            <button onClick={() => setMode('login')} style={styles.btnOutline}>
              {t('login', 'Log In')}
            </button>
            <div style={styles.divider}>
              <span style={styles.dividerLine}></span>
              <span style={styles.dividerText}>or</span>
              <span style={styles.dividerLine}></span>
            </div>
            <div style={styles.guestRow}>
              <input
                type="text"
                placeholder={t('optionalName', 'Your name (optional)')}
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                style={styles.guestInput}
              />
              <button onClick={handleGuest} style={styles.btnGhost}>
                {t('guest', 'Continue as Guest')}
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <button onClick={() => { setMode('landing'); setError(''); }} style={styles.backBtn}>
          ← Back
        </button>
        <h2 style={styles.formTitle}>
          {mode === 'login' ? 'Log In' : 'Create Account'}
        </h2>

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
          {mode === 'register' && (
            <div style={styles.formGroup}>
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
          )}
          <div style={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={{ ...styles.btnPrimary, width: '100%', marginTop: 8 }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <p style={styles.switchText}>
          {mode === 'login' ? (
            <>Don't have an account? <button onClick={() => { setMode('register'); setError(''); }} style={styles.linkBtn}>Sign up</button></>
          ) : (
            <>Already have an account? <button onClick={() => { setMode('login'); setError(''); }} style={styles.linkBtn}>Log in</button></>
          )}
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f7f0df',
    padding: '32px 20px',
    backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(216,111,69,0.11) 0 2px, transparent 2px), radial-gradient(circle at 90% 80%, rgba(23,107,104,0.1) 0 2px, transparent 2px)',
    backgroundSize: '30px 30px, 38px 38px',
  },
  languageControl: {
    position: 'fixed',
    top: 18,
    right: 18,
    zIndex: 2,
  },
  landing: {
    width: '100%',
    maxWidth: 980,
    display: 'grid',
    gridTemplateColumns: '1.1fr 0.9fr',
    gap: 56,
    alignItems: 'center',
  },
  kicker: {
    color: '#d86f45',
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 2,
    marginBottom: 24,
  },
  hero: {
    padding: 24,
  },
  logoCircle: {
    width: 92,
    height: 92,
    borderRadius: '28px 28px 28px 8px',
    background: '#d86f45',
    color: 'white',
    fontSize: 44,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 0 22px',
    boxShadow: '0 6px 0 #b85435',
  },
  title: {
    fontSize: 58,
    fontWeight: 800,
    color: '#263b3a',
    margin: '0 0 2px',
    letterSpacing: '-2px',
  },
  urduTitle: {
    color: '#176b68',
    fontFamily: "'Noto Nastaliq Urdu', serif",
    direction: 'rtl',
    fontSize: 25,
    margin: '0 0 18px',
  },
  tagline: {
    fontSize: 18,
    color: '#687572',
    lineHeight: 1.6,
    maxWidth: 460,
    marginBottom: 24,
  },
  lessonNote: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 9,
    color: '#526361',
    fontSize: 14,
    fontWeight: 700,
  },
  noteDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#3d8661',
  },
  btnGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  entryCard: {
    background: '#fffdf7',
    border: '1px solid #dfd5be',
    borderRadius: 20,
    padding: 34,
    boxShadow: '0 7px 0 rgba(38, 59, 58, 0.1)',
  },
  entryEyebrow: {
    color: '#d86f45',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.7,
    margin: 0,
  },
  entryTitle: {
    color: '#263b3a',
    fontSize: 27,
    margin: '8px 0 24px',
  },
  btnPrimary: {
    background: '#176b68',
    color: 'white',
    border: 'none',
    padding: '14px 32px',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 3px 0 #0d4f4d',
  },
  btnOutline: {
    background: 'transparent',
    color: '#176b68',
    border: '2px solid #176b68',
    padding: '14px 32px',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  btnGhost: {
    background: '#d86f45',
    color: 'white',
    border: 'none',
    padding: '14px 24px',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flex: '1 1 180px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '8px 0',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: '#dfd5be',
  },
  dividerText: {
    color: '#7f8b86',
    fontSize: 14,
  },
  guestRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  guestInput: {
    flex: 1,
    minWidth: 0,
    padding: '12px 16px',
    border: '2px solid #dfd5be',
    borderRadius: 10,
    fontSize: 15,
    outline: 'none',
  },
  formCard: {
    background: '#fffdf7',
    borderRadius: 18,
    padding: 32,
    maxWidth: 400,
    width: '100%',
    border: '1px solid #dfd5be',
    boxShadow: '0 7px 0 rgba(38, 59, 58, 0.1)',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#687572',
    fontSize: 14,
    cursor: 'pointer',
    marginBottom: 16,
    padding: 0,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#263b3a',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  error: {
    color: '#c9574d',
    fontSize: 14,
    marginTop: 4,
  },
  switchText: {
    textAlign: 'center',
    color: '#687572',
    fontSize: 14,
    marginTop: 16,
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: '#176b68',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 14,
    padding: 0,
  },
};

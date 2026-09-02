import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
        <div style={styles.hero}>
          <div style={styles.logoCircle}>Z</div>
          <h1 style={styles.title}>Zabandaan</h1>
          <p style={styles.tagline}>Learn Urdu the fun way — alphabets, idioms, word puzzles, and poetry, all in one place.</p>
          
          <div style={styles.btnGroup}>
            <button onClick={() => setMode('register')} style={styles.btnPrimary}>
              Create Account
            </button>
            <button onClick={() => setMode('login')} style={styles.btnOutline}>
              Log In
            </button>
            <div style={styles.divider}>
              <span style={styles.dividerLine}></span>
              <span style={styles.dividerText}>or</span>
              <span style={styles.dividerLine}></span>
            </div>
            <div style={styles.guestRow}>
              <input
                type="text"
                placeholder="Your name (optional)"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                style={styles.guestInput}
              />
              <button onClick={handleGuest} style={styles.btnGhost}>
                Continue as Guest
              </button>
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
    background: 'linear-gradient(135deg, #FFF8E1 0%, #E8F5E9 100%)',
    padding: 20,
  },
  hero: {
    textAlign: 'center',
    maxWidth: 440,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: '#2E7D32',
    color: 'white',
    fontSize: 36,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    boxShadow: '0 4px 16px rgba(46,125,50,0.3)',
  },
  title: {
    fontSize: 40,
    fontWeight: 700,
    color: '#333',
    margin: '0 0 8px',
  },
  tagline: {
    fontSize: 17,
    color: '#666',
    lineHeight: 1.6,
    marginBottom: 32,
  },
  btnGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  btnPrimary: {
    background: '#2E7D32',
    color: 'white',
    border: 'none',
    padding: '14px 32px',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  btnOutline: {
    background: 'transparent',
    color: '#2E7D32',
    border: '2px solid #2E7D32',
    padding: '14px 32px',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  btnGhost: {
    background: '#FFA726',
    color: 'white',
    border: 'none',
    padding: '14px 24px',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
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
    background: '#DDD',
  },
  dividerText: {
    color: '#999',
    fontSize: 14,
  },
  guestRow: {
    display: 'flex',
    gap: 8,
  },
  guestInput: {
    flex: 1,
    padding: '12px 16px',
    border: '2px solid #E0E0E0',
    borderRadius: 10,
    fontSize: 15,
    outline: 'none',
  },
  formCard: {
    background: 'white',
    borderRadius: 16,
    padding: 32,
    maxWidth: 400,
    width: '100%',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: 14,
    cursor: 'pointer',
    marginBottom: 16,
    padding: 0,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#333',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  error: {
    color: '#E53935',
    fontSize: 14,
    marginTop: 4,
  },
  switchText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    marginTop: 16,
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: '#2E7D32',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 14,
    padding: 0,
  },
};

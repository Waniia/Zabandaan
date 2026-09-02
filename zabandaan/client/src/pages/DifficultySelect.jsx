import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function DifficultySelect() {
  const { module } = useParams();
  const navigate = useNavigate();

  const moduleNames = {
    idioms: 'Idioms',
    wordsearch: 'Word Search',
  };

  const moduleName = moduleNames[module] || module;

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>← Back to Home</button>
        <h1 style={styles.title}>{moduleName}</h1>
        <p style={styles.subtitle}>Choose your difficulty level</p>

        <div style={styles.btnRow}>
          <button
            onClick={() => navigate(`/${module}/easy`)}
            style={styles.easyBtn}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={styles.emoji}>😊</span>
            <span style={styles.btnTitle}>Easy</span>
            <span style={styles.btnDesc}>Beginner-friendly</span>
          </button>

          <button
            onClick={() => navigate(`/${module}/hard`)}
            style={styles.hardBtn}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={styles.emoji}>🔥</span>
            <span style={styles.btnTitle}>Hard</span>
            <span style={styles.btnDesc}>Challenge yourself</span>
          </button>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    maxWidth: 600,
    margin: '0 auto',
    padding: 32,
    textAlign: 'center',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: 14,
    cursor: 'pointer',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    color: '#333',
    margin: '0 0 8px',
  },
  subtitle: {
    color: '#888',
    fontSize: 16,
    marginBottom: 40,
  },
  btnRow: {
    display: 'flex',
    gap: 20,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  easyBtn: {
    flex: '1 1 200px',
    maxWidth: 240,
    background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
    border: '3px solid #66BB6A',
    borderRadius: 16,
    padding: '32px 24px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    transition: 'transform 0.2s',
  },
  hardBtn: {
    flex: '1 1 200px',
    maxWidth: 240,
    background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
    border: '3px solid #FFA726',
    borderRadius: 16,
    padding: '32px 24px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    transition: 'transform 0.2s',
  },
  emoji: {
    fontSize: 40,
  },
  btnTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#333',
  },
  btnDesc: {
    fontSize: 14,
    color: '#666',
  },
};

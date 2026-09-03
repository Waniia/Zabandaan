import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useLanguage } from '../context/LanguageContext';

export default function DifficultySelect() {
  const { module } = useParams();
  const navigate = useNavigate();
  const { t, isUrdu } = useLanguage();

  const moduleNames = {
    idioms: 'Idioms',
    wordsearch: 'Word Search',
  };

  const moduleName = isUrdu
    ? (module === 'idioms' ? 'محاورے' : module === 'wordsearch' ? 'لفظ تلاش کریں' : module)
    : (moduleNames[module] || module);

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>← {t('backHome', 'Back to Home')}</button>
        <h1 style={styles.title}>{moduleName}</h1>
        <p style={styles.subtitle}>{isUrdu ? 'محاورے کی سطح منتخب کریں' : 'Choose an idiom level'}</p>

        <div style={styles.btnRow}>
          {(module === 'idioms' ? [1, 2, 3] : ['easy', 'hard']).map((level, index) => (
            <button
              key={level}
              onClick={() => navigate(`/${module}/${module === 'idioms' ? `level-${level}` : level}`)}
              style={index === 0 ? styles.easyBtn : styles.hardBtn}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={styles.emoji}>{module === 'idioms' ? ['🌱', '🌿', '🔥'][index] : index === 0 ? '😊' : '🔥'}</span>
              <span style={styles.btnTitle}>{module === 'idioms' ? (isUrdu ? `سطح ${level}` : `Level ${level}`) : level === 'easy' ? (isUrdu ? 'آسان' : 'Easy') : (isUrdu ? 'مشکل' : 'Hard')}</span>
              <span style={styles.btnDesc}>{module === 'idioms' ? (isUrdu ? `${level === 1 ? 10 : level === 2 ? 6 : 7} محاورے` : `${level === 1 ? 10 : level === 2 ? 6 : 7} idioms`) : (isUrdu ? 'اپنا چیلنج آزمائیں' : 'Challenge yourself')}</span>
            </button>
          ))}
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
    color: '#687572',
    fontSize: 14,
    cursor: 'pointer',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    color: '#263b3a',
    margin: '0 0 8px',
  },
  subtitle: {
    color: '#687572',
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
    background: '#e4f0e5',
    border: '2px solid #8dbb96',
    borderRadius: 14,
    padding: '32px 24px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    boxShadow: '0 3px 0 rgba(38, 59, 58, 0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  hardBtn: {
    flex: '1 1 200px',
    maxWidth: 240,
    background: '#f8ead6',
    border: '2px solid #dfb477',
    borderRadius: 14,
    padding: '32px 24px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    boxShadow: '0 3px 0 rgba(38, 59, 58, 0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  emoji: {
    fontSize: 40,
  },
  btnTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#263b3a',
  },
  btnDesc: {
    fontSize: 14,
    color: '#687572',
  },
};

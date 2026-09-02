import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import FeedbackFlash from '../../components/FeedbackFlash';
import SpeakerIcon from '../../components/SpeakerIcon';
import TracingCanvas from './TracingCanvas';
import { alphabets } from '../../data/alphabets';
import { usePoints } from '../../context/PointsContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

export default function AlphabetMap() {
  const [currentLetter, setCurrentLetter] = useState(null); // null = show map
  const [completedLevels, setCompletedLevels] = useState([]);
  const [flash, setFlash] = useState(null);
  const { addPoints } = usePoints();
  const { isGuest } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    if (isGuest) {
      const stored = localStorage.getItem('guest_progress_alphabets_none');
      if (stored) {
        const data = JSON.parse(stored);
        setCompletedLevels(data.completed || []);
      }
    } else {
      try {
        const res = await api.get('/progress/alphabets');
        if (res.data.progress && res.data.progress.length > 0) {
          setCompletedLevels(res.data.progress[0].completed_levels || []);
        }
      } catch (err) {
        console.error('Load alphabets progress:', err);
      }
    }
  };

  const isUnlocked = (index) => {
    if (index === 0) return true;
    return completedLevels.includes(alphabets[index - 1].id);
  };

  const handleComplete = async (score) => {
    const letterId = alphabets[currentLetter].id;
    
    if (!completedLevels.includes(letterId)) {
      setCompletedLevels(prev => [...prev, letterId]);
      await addPoints('alphabets', null, letterId);
    }
    
    setFlash('correct');
  };

  const handleFlashDone = () => {
    setFlash(null);
    // Auto-advance to next letter
    if (currentLetter < alphabets.length - 1) {
      setCurrentLetter(currentLetter + 1);
    } else {
      setCurrentLetter(null); // Back to map
    }
  };

  if (currentLetter !== null) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <button onClick={() => setCurrentLetter(null)} style={styles.backBtn}>
            ← Back to Letter Map
          </button>
          
          <div style={styles.progressInfo}>
            Letter {currentLetter + 1} of {alphabets.length}
          </div>

          <TracingCanvas
            letter={alphabets[currentLetter]}
            onComplete={handleComplete}
          />

          {flash && (
            <FeedbackFlash type={flash} onDone={handleFlashDone} />
          )}
        </div>
      </>
    );
  }

  // Show level map
  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>← Back to Home</button>
        <h1 style={styles.title}>Urdu Alphabets</h1>
        <p style={styles.subtitle}>Trace each letter to learn Urdu writing. Complete one to unlock the next!</p>

        <div style={styles.grid}>
          {alphabets.map((letter, index) => {
            const completed = completedLevels.includes(letter.id);
            const unlocked = isUnlocked(index);
            
            return (
              <div
                key={letter.id}
                onClick={() => unlocked && setCurrentLetter(index)}
                style={{
                  ...styles.letterCard,
                  opacity: unlocked ? 1 : 0.4,
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  borderColor: completed ? '#66BB6A' : unlocked ? '#E0E0E0' : '#EEE',
                  background: completed ? '#E8F5E9' : 'white',
                }}
                onMouseEnter={e => { if (unlocked) e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <span style={styles.letterChar} className="urdu-text">{letter.letter}</span>
                <div style={styles.nameRow}>
                  <SpeakerIcon text={letter.nameUrdu} size={14} audioUrl={letter.audioPath} />
                  <span style={styles.letterName}>{letter.name}</span>
                </div>
                {letter.imagePath && (
                  <img
                    src={letter.imagePath}
                    alt={letter.exampleWordEnglish}
                    style={styles.letterImage}
                  />
                )}
                {letter.exampleWord && (
                  <span style={styles.exampleWord} className="urdu-text">{letter.exampleWord}</span>
                )}
                {completed && <span style={styles.checkmark}>✅</span>}
                {!unlocked && <span style={styles.lock}>🔒</span>}
              </div>
            );
          })}
        </div>

        <div style={styles.summary}>
          {completedLevels.length} of {alphabets.length} letters completed
        </div>
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
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: 14,
    cursor: 'pointer',
    marginBottom: 16,
    padding: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#333',
    margin: '0 0 4px',
    textAlign: 'center',
  },
  subtitle: {
    color: '#888',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
  },
  progressInfo: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    marginBottom: 12,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: 12,
  },
  letterCard: {
    borderRadius: 12,
    padding: 12,
    textAlign: 'center',
    border: '2px solid',
    transition: 'all 0.3s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  letterChar: {
    fontSize: 36,
    lineHeight: 1.5,
  },
  letterName: {
    fontSize: 12,
    color: '#666',
    fontWeight: 500,
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  letterImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    objectFit: 'cover',
    marginTop: 4,
  },
  exampleWord: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 14,
    position: 'absolute',
    top: 4,
    right: 4,
  },
  lock: {
    fontSize: 14,
    position: 'absolute',
    top: 4,
    right: 4,
  },
  summary: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
    fontSize: 14,
  },
};

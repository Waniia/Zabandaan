import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import FeedbackFlash from '../../components/FeedbackFlash';
import SpeakerIcon from '../../components/SpeakerIcon';
import TracingCanvas from '../alphabets/TracingCanvas';
import { numbers } from '../../data/numbers';
import { usePoints } from '../../context/PointsContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

export default function NumberMap() {
  const [currentNumber, setCurrentNumber] = useState(null); // null = show map
  const [completedLevels, setCompletedLevels] = useState([]);
  const [flash, setFlash] = useState(null);
  const { addPoints, getGuestProgress } = usePoints();
  const { isGuest } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    if (isGuest) {
      setCompletedLevels(getGuestProgress('numbers'));
    } else {
      try {
        const res = await api.get('/progress');
        const numbersProgress = (res.data.progress || []).filter(
          p => p.category === 'numbers'
        );
        if (numbersProgress.length > 0) {
          setCompletedLevels(numbersProgress[0].completed_levels || []);
        }
      } catch (err) {
        console.error('Load numbers progress:', err);
      }
    }
  };

  const isUnlocked = (index) => {
    if (index === 0) return true;
    return completedLevels.includes(numbers[index - 1].id);
  };

  const handleComplete = async (score) => {
    const numberId = numbers[currentNumber].id;

    if (!completedLevels.includes(numberId)) {
      setCompletedLevels(prev => [...prev, numberId]);
      await addPoints('numbers', null, numberId);
    }

    setFlash('correct');
  };

  const handleFlashDone = () => {
    setFlash(null);
    // Auto-advance to next number
    if (currentNumber < numbers.length - 1) {
      setCurrentNumber(currentNumber + 1);
    } else {
      setCurrentNumber(null); // Back to map
    }
  };

  if (currentNumber !== null) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <button onClick={() => setCurrentNumber(null)} style={styles.backBtn}>
            ← Back to Number Map
          </button>

          <div style={styles.progressInfo}>
            Number {currentNumber + 1} of {numbers.length}
          </div>

          <TracingCanvas
            key={numbers[currentNumber].id}
            letter={numbers[currentNumber]}
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
        <h1 style={styles.title}>Urdu Numbers</h1>
        <p style={styles.subtitle}>Trace each numeral from ۱ to ۱۰ to learn Urdu numbers. Complete one to unlock the next!</p>

        <div style={styles.statusBanner}>
          <span style={styles.statusText}>
            {completedLevels.length} of {numbers.length} numbers completed
          </span>
          <div style={styles.statusTrack}>
            <div style={{ ...styles.statusFill, width: `${(completedLevels.length / numbers.length) * 100}%` }} />
          </div>
        </div>

        <div style={styles.grid}>
          {numbers.map((number, index) => {
            const completed = completedLevels.includes(number.id);
            const unlocked = isUnlocked(index);

            return (
              <div
                key={number.id}
                onClick={() => unlocked && setCurrentNumber(index)}
                style={{
                  ...styles.numberCard,
                  opacity: unlocked ? 1 : 0.4,
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  borderColor: completed ? '#66BB6A' : unlocked ? '#E0E0E0' : '#EEE',
                  background: completed ? '#E8F5E9' : 'white',
                }}
                onMouseEnter={e => { if (unlocked) e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <span style={styles.numberChar} className="urdu-text">{number.letter}</span>
                <div style={styles.nameRow}>
                  <SpeakerIcon text={number.nameUrdu} size={14} audioUrl={number.audioPath} />
                  <span style={styles.numberName}>{number.name}</span>
                </div>
                {number.exampleWord && (
                  <span style={styles.exampleWord} className="urdu-text">{number.exampleWord}</span>
                )}
                {completed && <span style={styles.checkmark}>✅</span>}
                {!unlocked && <span style={styles.lock}>🔒</span>}
              </div>
            );
          })}
        </div>

        <div style={styles.summary}>
          {completedLevels.length === numbers.length
            ? '🎉 All numbers completed! Great job!'
            : `${numbers.length - completedLevels.length} numbers remaining — keep going!`}
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
  numberCard: {
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
  numberChar: {
    fontSize: 40,
    lineHeight: 1.4,
  },
  numberName: {
    fontSize: 12,
    color: '#666',
    fontWeight: 500,
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
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
  statusBanner: {
    background: '#E8F5E9',
    borderRadius: 10,
    padding: '12px 16px',
    marginBottom: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#2E7D32',
    textAlign: 'center',
  },
  statusTrack: {
    height: 6,
    background: '#C8E6C9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  statusFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #66BB6A, #2E7D32)',
    borderRadius: 3,
    transition: 'width 0.5s ease',
  },
};

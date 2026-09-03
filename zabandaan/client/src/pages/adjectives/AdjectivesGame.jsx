import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import FeedbackFlash from '../../components/FeedbackFlash';
import { usePoints } from '../../context/PointsContext';
import { useAuth } from '../../context/AuthContext';
import { adjectives } from '../../data/adjectives';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const TOTAL = adjectives.length;

export default function AdjectivesGame() {
  const navigate = useNavigate();
  const { addPoints } = usePoints();
  const { isGuest } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [hadWrong, setHadWrong] = useState(false); // missed on current adjective
  const [score, setScore] = useState(0);          // first-try correct count

  // Build shuffled options whenever the current adjective changes
  useEffect(() => {
    const adjective = adjectives[currentIndex];
    if (!adjective) return; // quiz finished (sentinel index)
    setOptions(shuffleArray(adjective.options));
    setSelected(null);
    setFeedback(null);
    setHadWrong(false);
  }, [currentIndex]);

  const current = adjectives[currentIndex] || null;

  const handleSelect = useCallback((option) => {
    if (selected !== null) return; // already answered
    if (!current) return;
    setSelected(option);

    if (option === current.adjective_urdu) {
      setFeedback('correct');
      if (!hadWrong) setScore(prev => prev + 1);
      addPoints('adjectives', null, current.id);
    } else {
      setFeedback('wrong');
      setHadWrong(true);
    }
  }, [selected, current, hadWrong, addPoints]);

  // Called by FeedbackFlash when the flash animation finishes
  const handleFlashDone = useCallback(() => {
    if (feedback === 'correct') {
      if (currentIndex < TOTAL - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setCurrentIndex(TOTAL); // sentinel: quiz done
      }
    } else {
      // Wrong answer: the correct choice was highlighted during the flash.
      // Clear the selection so the learner can try again.
      setFeedback(null);
      setSelected(null);
    }
  }, [feedback, currentIndex]);

  const restartQuiz = useCallback(() => {
    setCurrentIndex(0);
    setSelected(null);
    setFeedback(null);
    setHadWrong(false);
    setScore(0);
  }, []);

  // --- Quiz complete ---
  if (currentIndex >= TOTAL) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.doneCard}>
            <span style={{ fontSize: 56 }}>🎉</span>
            <h2 style={{ margin: '12px 0 4px', color: '#2E7D32' }}>Adjectives Complete!</h2>
            <p style={{ color: '#666', fontSize: 15, margin: '0 0 8px' }}>
              You finished all {TOTAL} adjectives
            </p>
            <p style={{ color: '#FFA726', fontSize: 15, fontWeight: 600, margin: '0 0 20px' }}>
              First-try score: {score} / {TOTAL}
            </p>
            {isGuest && (
              <p style={{ color: '#999', fontSize: 13, margin: '-12px 0 20px' }}>
                Playing as guest — points are saved on this device.
              </p>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button style={styles.primaryBtn} onClick={restartQuiz}>Play Again</button>
              <button style={styles.backBtn} onClick={() => navigate('/')}>Back to Home</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // --- Quiz in progress ---
  const questionNum = currentIndex + 1;

  return (
    <>
      <Navbar />
      {feedback && <FeedbackFlash type={feedback} onDone={handleFlashDone} duration={1500} />}

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <button style={styles.backArrow} onClick={() => navigate('/')} title="Back to home">
            ← Back
          </button>
          <span style={styles.progress}>
            Adjective {questionNum} of {TOTAL}
          </span>
        </div>

        {/* Status message */}
        <div style={styles.statusBanner}>
          <span style={styles.statusText}>
            {questionNum === TOTAL
              ? '🏁 Last one! Match the final adjective!'
              : questionNum === 1
                ? '🌱 Starting adjectives — match the picture to the Urdu word!'
                : `${TOTAL - questionNum + 1} adjectives remaining — keep matching!`}
          </span>
        </div>

        {/* Progress bar */}
        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressFill,
              width: `${(questionNum / TOTAL) * 100}%`,
            }}
          />
        </div>

        {/* Adjective card */}
        <div style={styles.card}>
          <div style={styles.imageWrap}>
            <img
              src={current.imagePath}
              alt={current.adjective_english}
              style={styles.adjectiveImage}
            />
          </div>

          <p style={styles.promptText}>Which adjective matches this picture?</p>

          {/* Options */}
          <div style={styles.optionsGrid}>
            {options.map((opt, idx) => {
              let bg = '#FFF8E1';
              let border = '#E0D8B8';
              let color = '#1B5E20';

              if (selected !== null && current) {
                if (opt === current.adjective_urdu) {
                  // correct answer: always highlighted once a choice is made
                  bg = '#C8E6C9';
                  border = '#2E7D32';
                } else if (opt === selected) {
                  bg = '#FFCDD2';
                  border = '#E53935';
                } else {
                  bg = '#F5F5F5';
                  border = '#DDD';
                }
              }

              return (
                <button
                  key={idx}
                  className="urdu-text"
                  style={{
                    ...styles.optionBtn,
                    background: bg,
                    borderColor: border,
                    color,
                    cursor: selected !== null ? 'default' : 'pointer',
                    opacity: selected !== null && opt !== selected && opt !== current?.adjective_urdu ? 0.7 : 1,
                  }}
                  onClick={() => handleSelect(opt)}
                  disabled={selected !== null}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    maxWidth: 640,
    margin: '0 auto',
    padding: '20px 16px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backArrow: {
    background: 'none',
    border: 'none',
    fontSize: 15,
    color: '#2E7D32',
    cursor: 'pointer',
    fontWeight: 600,
    padding: '4px 0',
  },
  progress: {
    fontSize: 14,
    color: '#888',
    fontWeight: 500,
  },
  progressTrack: {
    height: 6,
    background: '#E8E0C8',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #FFA726, #2E7D32)',
    borderRadius: 3,
    transition: 'width 0.4s ease',
  },
  statusBanner: {
    background: '#FFF8E1',
    borderRadius: 8,
    padding: '8px 14px',
    marginBottom: 14,
    textAlign: 'center',
    border: '1px solid #FFE082',
  },
  statusText: {
    fontSize: 13,
    fontWeight: 600,
    color: '#F57F17',
  },
  card: {
    background: '#FFFEF7',
    borderRadius: 16,
    padding: '28px 24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    border: '1px solid #F0E8D0',
  },
  imageWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 16,
  },
  adjectiveImage: {
    width: 300,
    height: 300,
    borderRadius: 20,
    objectFit: 'cover',
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    border: '4px solid #FFFFFF',
    background: '#FFF',
  },
  promptText: {
    fontSize: 15,
    fontWeight: 600,
    color: '#555',
    textAlign: 'center',
    margin: '0 0 16px',
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
  optionBtn: {
    padding: '20px 12px',
    borderRadius: 14,
    border: '2px solid',
    fontSize: 32,
    lineHeight: 1.6,
    fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif",
    direction: 'rtl',
    textAlign: 'center',
    transition: 'all 0.2s ease',
  },
  doneCard: {
    textAlign: 'center',
    background: '#FFFEF7',
    borderRadius: 16,
    padding: '48px 32px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    border: '1px solid #F0E8D0',
    marginTop: 40,
  },
  primaryBtn: {
    background: '#2E7D32',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    padding: '12px 24px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  backBtn: {
    background: 'none',
    color: '#2E7D32',
    border: '2px solid #2E7D32',
    borderRadius: 10,
    padding: '10px 22px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
};

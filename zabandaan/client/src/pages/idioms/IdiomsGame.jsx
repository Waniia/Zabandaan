import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import Navbar from '../../components/Navbar';
import SpeakerIcon from '../../components/SpeakerIcon';
import FeedbackFlash from '../../components/FeedbackFlash';
import { usePoints } from '../../context/PointsContext';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function IdiomsGame() {
  const { difficulty } = useParams();
  const navigate = useNavigate();
  const { addPoints } = usePoints();

  const [idioms, setIdioms] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch idioms on mount
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get('/content/idioms/' + difficulty)
      .then(res => {
        if (cancelled) return;
        const data = res.data.idioms || [];
        setIdioms(data);
        setCurrentIndex(0);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        console.error('Failed to load idioms:', err);
        setError('Failed to load idioms. Please try again.');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [difficulty]);

  // Build shuffled options whenever currentIndex changes
  useEffect(() => {
    if (idioms.length === 0) return;
    const idiom = idioms[currentIndex];
    if (!idiom) return;
    const opts = shuffleArray([
      idiom.correct_option,
      idiom.distractor_1_option,
      idiom.distractor_2_option,
      idiom.distractor_3_option,
    ]);
    setOptions(opts);
    setSelected(null);
    setFeedback(null);
  }, [currentIndex, idioms]);

  const currentIdiom = idioms[currentIndex] || null;

  const handleSelect = useCallback((option) => {
    if (selected !== null) return; // already answered
    if (!currentIdiom) return;
    setSelected(option);

    const isCorrect = option.english === currentIdiom.correct_option.english;
    if (isCorrect) {
      setFeedback('correct');
      addPoints('idioms', difficulty, currentIdiom.id);
    } else {
      setFeedback('wrong');
    }
  }, [selected, currentIdiom, addPoints, difficulty]);

  const advanceToNext = useCallback(() => {
    if (currentIndex < idioms.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Finished all questions
      setCurrentIndex(idioms.length); // sentinel: quiz done
    }
    setFeedback(null);
    setSelected(null);
  }, [currentIndex, idioms.length]);

  const handleFlashDone = useCallback(() => {
    advanceToNext();
  }, [advanceToNext]);

  const restartQuiz = useCallback(() => {
    setCurrentIndex(0);
    setSelected(null);
    setFeedback(null);
  }, []);

  // --- Loading / Error states ---
  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.center}>
          <div style={styles.spinner} />
          <p style={{ color: '#888', marginTop: 12 }}>Loading idioms...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div style={styles.center}>
          <p style={{ color: '#E53935', fontSize: 16 }}>{error}</p>
          <button style={styles.backBtn} onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </>
    );
  }

  // --- Quiz complete ---
  if (currentIndex >= idioms.length) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.doneCard}>
            <span style={{ fontSize: 56 }}>🎉</span>
            <h2 style={{ margin: '12px 0 4px', color: '#2E7D32' }}>Quiz Complete!</h2>
            <p style={{ color: '#666', fontSize: 15, margin: '0 0 20px' }}>
              You finished all {idioms.length} idioms (Level {difficulty.replace('level-', '')})
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
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
  const totalQuestions = idioms.length;

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
            Level {difficulty.replace('level-', '')} · Question {questionNum} of {totalQuestions}
          </span>
        </div>

        {/* Progress bar */}
        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressFill,
              width: `${(questionNum / totalQuestions) * 100}%`,
            }}
          />
        </div>

        {/* Idiom card */}
        <div style={styles.card}>
          {currentIdiom.image_path && (
            <div style={styles.imageWrap}>
              <img
                src={currentIdiom.image_path}
                alt={currentIdiom.idiom_roman}
                style={styles.idiomImage}
              />
            </div>
          )}

          <div style={styles.idiomRow}>
            <span className="urdu-text" style={styles.urduText}>
              {currentIdiom.idiom_urdu}
            </span>
            <SpeakerIcon
              text={currentIdiom.idiom_urdu}
              size={24}
              audioUrl={currentIdiom.audio_path || `/audio/idioms/${currentIdiom.id}.mp3`}
            />
          </div>

          <p style={styles.roman}>{currentIdiom.idiom_roman}</p>

          <div style={styles.exampleBox}>
            <span style={styles.exampleLabel}>Example:</span>
            <span className="urdu-text" style={styles.exampleText}>
              {currentIdiom.example_sentence}
            </span>
          </div>

          <p style={styles.promptText}>What does this idiom mean?</p>

          {/* Options */}
          <div style={styles.optionsList}>
            {options.map((opt, idx) => {
              let bg = '#FFF8E1';
              let border = '#E0D8B8';
              let color = '#333';

              if (selected !== null) {
                if (opt.english === currentIdiom.correct_option.english) {
                  bg = '#C8E6C9';
                  border = '#2E7D32';
                  color = '#1B5E20';
                } else if (opt.english === selected.english && opt.english !== currentIdiom.correct_option.english) {
                  bg = '#FFCDD2';
                  border = '#E53935';
                  color = '#B71C1C';
                } else {
                  bg = '#F5F5F5';
                  border = '#DDD';
                  color = '#999';
                }
              }

              return (
                <button
                  key={idx}
                  style={{
                    ...styles.optionBtn,
                    background: bg,
                    borderColor: border,
                    color,
                    cursor: selected !== null ? 'default' : 'pointer',
                    opacity: selected !== null && opt.english !== selected.english && opt.english !== currentIdiom.correct_option.english ? 0.6 : 1,
                  }}
                  onClick={() => handleSelect(opt)}
                  disabled={selected !== null}
                >
                  <span style={styles.optionLetter}>
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <span>
                    <strong className="urdu-text" style={styles.optionUrdu}>{opt.urdu}</strong>
                    <span style={styles.optionEnglish}>{opt.english}</span>
                  </span>
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
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    padding: 24,
  },
  spinner: {
    width: 40,
    height: 40,
    border: '4px solid #E0E0E0',
    borderTop: '4px solid #2E7D32',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
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
  idiomImage: {
    width: 160,
    height: 160,
    borderRadius: 16,
    objectFit: 'cover',
    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
  },
  idiomRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 8,
  },
  urduText: {
    fontSize: 32,
    lineHeight: 1.8,
    color: '#1B5E20',
    fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif",
    direction: 'rtl',
    textAlign: 'center',
  },
  roman: {
    textAlign: 'center',
    fontSize: 15,
    color: '#888',
    fontStyle: 'italic',
    margin: '0 0 16px',
  },
  exampleBox: {
    background: '#FFF8E1',
    borderRadius: 10,
    padding: '12px 16px',
    marginBottom: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    border: '1px solid #FFE082',
  },
  exampleLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#FFA726',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exampleText: {
    fontSize: 20,
    color: '#5D4037',
    fontFamily: "'Noto Nastaliq Urdu', serif",
    direction: 'rtl',
    textAlign: 'right',
    lineHeight: 1.8,
  },
  promptText: {
    fontSize: 15,
    fontWeight: 600,
    color: '#555',
    textAlign: 'center',
    margin: '0 0 16px',
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  optionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '14px 16px',
    borderRadius: 12,
    border: '2px solid',
    fontSize: 15,
    fontWeight: 500,
    textAlign: 'left',
    transition: 'all 0.2s ease',
    lineHeight: 1.4,
  },
  optionLetter: {
    fontWeight: 700,
    fontSize: 14,
    minWidth: 20,
  },
  optionUrdu: {
    display: 'block',
    fontSize: 21,
    direction: 'rtl',
    textAlign: 'right',
    marginBottom: 2,
  },
  optionEnglish: {
    display: 'block',
    fontSize: 14,
    color: '#666',
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

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { speak } from '../../utils/speech';
import SpeakerIcon from '../../components/SpeakerIcon';
import { scoreGlyphTrace } from '../../utils/scoring';

export default function TracingCanvas({ letter, onComplete }) {
  const canvasRef = useRef(null);
  const [userStrokes, setUserStrokes] = useState([]); // [{type:'main', points:[{x,y}]}]
  const [currentStroke, setCurrentStroke] = useState(null); // {points:[{x,y}]} while drawing
  const [drawing, setDrawing] = useState(false);
  const [mode, setMode] = useState('main'); // 'main' | 'done'
  const [score, setScore] = useState(null);
  const [canvasSize, setCanvasSize] = useState(350);
  const [autoPlayed, setAutoPlayed] = useState(false); // whether auto-speak succeeded
  const [fontReady, setFontReady] = useState(false);
  const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
  const guideFont = `${canvasSize * 0.72}px 'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif`;
  const guideBaseLetter = {
    'ب': 'ب', 'پ': 'ب', 'ت': 'ب', 'ٹ': 'ب', 'ث': 'ب',
    'ج': 'ح', 'چ': 'ح', 'خ': 'خ',
    'ڈ': 'د', 'ذ': 'د',
    'ڑ': 'ر', 'ز': 'ر', 'ژ': 'ر',
    'ش': 'س', 'ض': 'ص', 'ظ': 'ط',
    'غ': 'ع', 'ف': 'ف', 'ق': 'ق', 'گ': 'ک',
    'ن': 'ن', 'ی': 'ی',
  }[letter.letter] || letter.letter;
  // Render the complete glyph so distinguishing dots and the ڑ/ژ topi remain
  // visible, while scoring the trace against only the shared base shape.
  const guideLetter = letter.letter;

  // Responsive canvas size
  useEffect(() => {
    const updateSize = () => {
      const w = Math.min(380, window.innerWidth - 48);
      setCanvasSize(w);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Redraw after the web font loads; canvas does not automatically repaint
  // text that was drawn while the fallback font was active.
  useEffect(() => {
    setFontReady(false);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => setFontReady(true));
    } else {
      setFontReady(true);
    }
  }, [letter]);

  // Speak letter name on load; track whether auto-speak succeeded
  useEffect(() => {
    setAutoPlayed(false);
    const timer = setTimeout(async () => {
      const result = await speak(letter.nameUrdu, 'ur-PK', {
        audioUrl: letter.audioPath || `/audio/alphabets/${letter.id}.mp3`,
      });
      setAutoPlayed(result && result.ended);
    }, 400);
    return () => clearTimeout(timer);
  }, [letter]);

  // Draw everything
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set up high-DPI canvas
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const size = canvasSize;

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Background
    ctx.fillStyle = '#FEFEFE';
    ctx.fillRect(0, 0, size, size);

    // The rendered glyph is the guide. This keeps the visible target aligned
    // with the letter shape instead of showing a separate generic skeleton.
    ctx.save();
    ctx.font = guideFont;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(117,117,117,0.18)';
    ctx.fillText(guideLetter, size / 2, size / 2 + size * 0.08);
    ctx.restore();

    // Draw completed user main strokes (smooth)
    for (const stroke of userStrokes) {
      if (stroke.type === 'main' && stroke.points.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = '#2E7D32';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const pts = stroke.points;
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length - 1; i++) {
          const xc = (pts[i].x + pts[i + 1].x) / 2;
          const yc = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.stroke();
      }
    }

    // Draw current stroke being drawn
    if (currentStroke && currentStroke.points.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#2E7D32';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const pts = currentStroke.points;
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke();
    }
  }, [userStrokes, currentStroke, letter, canvasSize, guideFont, dpr, fontReady]);

  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  const startDraw = (e) => {
    e.preventDefault();
    if (mode === 'done') return;
    const pos = getPos(e);
    if (!pos) return;

    // Main stroke mode
    setDrawing(true);
    setCurrentStroke({ points: [pos] });
    setScore(null);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing || mode !== 'main') return;
    const pos = getPos(e);
    if (!pos) return;
    setCurrentStroke(prev => ({
      ...prev,
      points: [...prev.points, pos]
    }));
  };

  const endDraw = (e) => {
    e.preventDefault();
    if (!drawing || mode !== 'main') return;
    setDrawing(false);

    if (currentStroke && currentStroke.points.length > 3) {
      setUserStrokes(prev => [...prev, { type: 'main', points: currentStroke.points }]);
    }
    setCurrentStroke(null);
  };

  const checkScore = () => {
    const result = scoreGlyphTrace(
      userStrokes,
      guideBaseLetter,
      canvasSize,
      guideFont,
      canvasSize * 0.08
    );
    setScore(result);
    setMode('done');
  };

  const clearCanvas = () => {
    setUserStrokes([]);
    setCurrentStroke(null);
    setScore(null);
    setMode('main');
  };

  const handleComplete = () => {
    if (score && score.total >= 40) {
      onComplete(score.total);
    }
  };

  const userMainStrokes = userStrokes.filter(s => s.type === 'main');
  const mainDrawn = userMainStrokes.length > 0;

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div style={styles.letterDisplay}>
          <span style={styles.letterChar} className="urdu-text">{letter.letter}</span>
          <SpeakerIcon
            text={letter.nameUrdu}
            size={24}
            audioUrl={letter.audioPath || `/audio/alphabets/${letter.id}.mp3`}
          />
        </div>
        <div style={styles.letterInfo}>
          <strong>{letter.name}</strong>
          <span style={styles.nameUrdu} className="urdu-text">{letter.nameUrdu}</span>
          {letter.exampleWord && (
            <span style={styles.example}>
              e.g. {letter.exampleWord} ({letter.exampleWordEnglish})
            </span>
          )}
        </div>
      </div>

      {/* Tap-to-hear prompt when browser blocked auto-play */}
      {!autoPlayed && (
        <button
          style={styles.tapPrompt}
          onClick={() => {
            speak(letter.nameUrdu, 'ur-PK', {
              audioUrl: letter.audioPath || `/audio/alphabets/${letter.id}.mp3`,
            }).then(() => setAutoPlayed(true));
          }}
        >
          🔊 Tap to hear "{letter.name}"
        </button>
      )}

      <div style={styles.canvasWrap}>
        <canvas
          ref={canvasRef}
          style={{
            ...styles.canvas,
            width: canvasSize,
            height: canvasSize,
          }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>

      {/* Mode indicator / instructions */}
      <div style={styles.instructionBox}>
        {mode === 'main' && !mainDrawn && (
          <p style={styles.hint}>
            Trace the visible grey letter shape{letter.letter === 'خ' ? ' including the dot' : ''}
          </p>
        )}
        {mode === 'main' && mainDrawn && (
          <p style={{ ...styles.hint, color: '#2E7D32', fontWeight: 600 }}>
            Main stroke drawn! Tap "Check My Trace" to see your score
          </p>
        )}
        {mode === 'done' && score && (
          <p style={{ ...styles.hint, color: score.total >= 40 ? '#2E7D32' : '#E53935', fontWeight: 600 }}>
            {score.total >= 40 ? 'Great job!' : 'Keep practicing!'}
          </p>
        )}
      </div>

      {/* Score display */}
      {score && (
        <div style={{
          ...styles.scoreBox,
          background: score.total >= 40 ? '#E8F5E9' : '#FFEBEE',
          borderColor: score.total >= 40 ? '#66BB6A' : '#E53935',
        }}>
          <strong style={{ color: score.total >= 40 ? '#2E7D32' : '#E53935', fontSize: 20 }}>
            Accuracy: {score.total}%
          </strong>
          <div style={styles.scoreBreakdown}>
            <span>Stroke: {score.mainScore}%</span>
          </div>
          {score.total < 40 && <p style={{ color: '#E53935', fontSize: 13, margin: '4px 0 0' }}>Try again! Aim for at least 40%</p>}
        </div>
      )}

      {/* Action buttons */}
      <div style={styles.btnRow}>
        <button onClick={clearCanvas} style={styles.clearBtn}>Clear & Retry</button>

        {mode === 'main' && mainDrawn && (
          <button onClick={checkScore} style={styles.checkBtn}>
            Check My Trace
          </button>
        )}

        {mode === 'done' && score && score.total >= 40 && (
          <button onClick={handleComplete} style={styles.completeBtn}>
            Continue
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  letterDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'white',
    borderRadius: 12,
    padding: '12px 20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  letterChar: {
    fontSize: 48,
    lineHeight: 1.4,
  },
  letterInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  nameUrdu: {
    fontSize: 18,
    color: '#888',
  },
  example: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  tapPrompt: {
    background: '#E3F2FD',
    border: '1.5px solid #90CAF9',
    borderRadius: 8,
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    color: '#1565C0',
    transition: 'background 0.2s',
  },
  canvasWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
  },
  canvas: {
    display: 'block',
    cursor: 'crosshair',
    touchAction: 'none',
    borderRadius: 12,
    border: '2px solid #E0E0E0',
  },
  instructionBox: {
    minHeight: 24,
    textAlign: 'center',
  },
  hint: {
    color: '#999',
    fontSize: 14,
    margin: 0,
  },
  scoreBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '10px 24px',
    borderRadius: 12,
    border: '2px solid',
    textAlign: 'center',
  },
  scoreBreakdown: {
    display: 'flex',
    gap: 16,
    fontSize: 13,
    color: '#888',
  },
  btnRow: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  clearBtn: {
    background: '#F5F5F5',
    border: '2px solid #DDD',
    borderRadius: 8,
    padding: '10px 18px',
    fontWeight: 600,
    cursor: 'pointer',
    color: '#666',
    fontSize: 14,
  },
  checkBtn: {
    background: '#2E7D32',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    padding: '10px 20px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 14,
  },
  completeBtn: {
    background: '#2E7D32',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    padding: '10px 24px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 14,
  },
};

import { useRef, useState, useEffect, useCallback } from 'react';
import { speak } from '../../utils/speech';
import SpeakerIcon from '../../components/SpeakerIcon';
import { scoreTrace } from '../../utils/scoring';

export default function TracingCanvas({ letter, onComplete }) {
  const canvasRef = useRef(null);
  const [userStrokes, setUserStrokes] = useState([]); // [{type:'main'|'dot', points:[{x,y}]}]
  const [currentStroke, setCurrentStroke] = useState(null); // {points:[{x,y}]} while drawing
  const [drawing, setDrawing] = useState(false);
  const [mode, setMode] = useState('main'); // 'main' | 'dots' | 'done'
  const [score, setScore] = useState(null);
  const [canvasSize, setCanvasSize] = useState(350);
  const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;

  const strokes = letter.strokes;
  const mainStroke = strokes.find(s => s.type === 'main');
  const dotStrokes = strokes.filter(s => s.type === 'dot');
  const hasDots = dotStrokes.length > 0;
  const expectedDotPositions = dotStrokes.flatMap(s => s.points);

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

  // Speak letter name on load
  useEffect(() => {
    const timer = setTimeout(() => speak(letter.nameUrdu), 400);
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

    // Faint letter guide
    ctx.save();
    ctx.font = `${size * 0.55}px 'Noto Nastaliq Urdu', serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fillText(letter.letter, size / 2, size / 2);
    ctx.restore();

    // Draw reference main path (dotted, smooth)
    if (mainStroke) {
      const pts = mainStroke.points;
      ctx.beginPath();
      ctx.setLineDash([8, 6]);
      ctx.strokeStyle = '#BDBDBD';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (pts.length > 2) {
        ctx.moveTo(pts[0].x * size, pts[0].y * size);
        for (let i = 1; i < pts.length - 1; i++) {
          const xc = (pts[i].x * size + pts[i + 1].x * size) / 2;
          const yc = (pts[i].y * size + pts[i + 1].y * size) / 2;
          ctx.quadraticCurveTo(pts[i].x * size, pts[i].y * size, xc, yc);
        }
        const last = pts[pts.length - 1];
        ctx.lineTo(last.x * size, last.y * size);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Start marker (green circle)
      ctx.fillStyle = '#66BB6A';
      ctx.beginPath();
      ctx.arc(pts[0].x * size, pts[0].y * size, 7, 0, Math.PI * 2);
      ctx.fill();

      // End marker (red circle)
      const endPt = pts[pts.length - 1];
      ctx.fillStyle = '#E53935';
      ctx.beginPath();
      ctx.arc(endPt.x * size, endPt.y * size, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw expected dot positions (faint targets)
    for (const dot of expectedDotPositions) {
      ctx.beginPath();
      ctx.arc(dot.x * size, dot.y * size, size * 0.04, 0, Math.PI * 2);
      ctx.strokeStyle = mode === 'dots' ? '#FFA726' : '#E0E0E0';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
      // Small filled center
      ctx.fillStyle = mode === 'dots' ? 'rgba(255,167,38,0.3)' : 'rgba(0,0,0,0.05)';
      ctx.beginPath();
      ctx.arc(dot.x * size, dot.y * size, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw completed user main strokes (smooth)
    for (const stroke of userStrokes) {
      if (stroke.type === 'main' && stroke.points.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = '#2E7D32';
        ctx.lineWidth = 5;
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

    // Draw user placed dots
    for (const stroke of userStrokes) {
      if (stroke.type === 'dot') {
        for (const pt of stroke.points) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, size * 0.03, 0, Math.PI * 2);
          ctx.fillStyle = '#E65100';
          ctx.fill();
          ctx.strokeStyle = '#FFA726';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }

    // Draw current stroke being drawn
    if (currentStroke && currentStroke.points.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#2E7D32';
      ctx.lineWidth = 5;
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
  }, [userStrokes, currentStroke, letter, canvasSize, mode, mainStroke, expectedDotPositions, dpr]);

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

    if (mode === 'dots') {
      // In dot mode, each click places a dot
      const dotStroke = { type: 'dot', points: [pos] };
      setUserStrokes(prev => [...prev, dotStroke]);
      return;
    }

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

  const switchToDots = () => {
    setMode('dots');
  };

  const checkScore = () => {
    const result = scoreTrace(userStrokes, strokes, canvasSize);
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
  const userDotStrokes = userStrokes.filter(s => s.type === 'dot');
  const userDotsPlaced = userDotStrokes.reduce((count, s) => count + s.points.length, 0);
  const mainDrawn = userMainStrokes.length > 0;

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div style={styles.letterDisplay}>
          <span style={styles.letterChar} className="urdu-text">{letter.letter}</span>
          <SpeakerIcon text={letter.nameUrdu} size={24} />
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
          <p style={styles.hint}>Draw the main stroke following the dotted path</p>
        )}
        {mode === 'main' && mainDrawn && hasDots && (
          <p style={{ ...styles.hint, color: '#E65100', fontWeight: 600 }}>
            Main stroke drawn! Now tap to place the {expectedDotPositions.length} dot(s)
          </p>
        )}
        {mode === 'dots' && (
          <p style={{ ...styles.hint, color: '#E65100' }}>
            Tap near the orange circles to place dots ({userDotsPlaced}/{expectedDotPositions.length} placed)
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
            {hasDots && <span>Dots: {score.dotScore}%</span>}
          </div>
          {score.total < 40 && <p style={{ color: '#E53935', fontSize: 13, margin: '4px 0 0' }}>Try again! Aim for at least 40%</p>}
        </div>
      )}

      {/* Action buttons */}
      <div style={styles.btnRow}>
        <button onClick={clearCanvas} style={styles.clearBtn}>Clear & Retry</button>

        {mode === 'main' && mainDrawn && hasDots && (
          <button onClick={switchToDots} style={styles.dotsBtn}>
            Place Dots ({expectedDotPositions.length})
          </button>
        )}

        {mode === 'dots' && userDotsPlaced > 0 && (
          <button onClick={checkScore} style={styles.checkBtn}>
            Check My Trace
          </button>
        )}

        {mode === 'main' && mainDrawn && !hasDots && (
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
  dotsBtn: {
    background: '#FFA726',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    padding: '10px 18px',
    fontWeight: 600,
    cursor: 'pointer',
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

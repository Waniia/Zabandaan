import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import Navbar from '../../components/Navbar';
import SpeakerIcon from '../../components/SpeakerIcon';
import { usePoints } from '../../context/PointsContext';
import { generateGrid, checkSelection } from '../../utils/wordsearch';
import WordSearchGrid from './WordSearchGrid';
import DemoPanel from './DemoPanel';

export default function WordSearchGame() {
  const { difficulty } = useParams();
  const navigate = useNavigate();
  const { addPoints } = usePoints();

  const [words, setWords] = useState([]);
  const [grid, setGrid] = useState(null);
  const [placements, setPlacements] = useState([]);
  const [foundWords, setFoundWords] = useState([]); // array of { word, meaning, cells, direction }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFound, setLastFound] = useState(null); // most recently found word info

  const gridSize = difficulty === 'hard' ? 12 : 10;

  // Fetch words and generate grid on mount
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get('/content/wordsearch/' + difficulty)
      .then(res => {
        if (cancelled) return;
        const data = res.data.words || [];
        setWords(data);
        // Generate the grid
        const result = generateGrid(data, gridSize);
        setGrid(result.grid);
        setPlacements(result.placements);
        setFoundWords([]);
        setLastFound(null);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        console.error('Failed to load wordsearch:', err);
        setError('Failed to load words. Please try again.');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [difficulty, gridSize]);

  const handleSelect = useCallback((startCell, endCell) => {
    if (!grid || placements.length === 0) return;

    const result = checkSelection(grid, startCell, endCell, placements);
    if (result.found && result.placement) {
      // Check if already found
      const alreadyFound = foundWords.some(
        fw => fw.word === result.placement.word
      );
      if (alreadyFound) return;

      const newFound = {
        word: result.placement.word,
        meaning: result.placement.meaning,
        cells: result.cells,
        direction: result.placement.direction,
      };

      setFoundWords(prev => [...prev, newFound]);
      setLastFound(newFound);
      addPoints('wordsearch', difficulty, result.placement.word);

      // Clear last found highlight after 2 seconds
      setTimeout(() => setLastFound(null), 2000);
    }
  }, [grid, placements, foundWords, addPoints, difficulty]);

  const regeneratePuzzle = useCallback(() => {
    if (words.length === 0) return;
    const result = generateGrid(words, gridSize);
    setGrid(result.grid);
    setPlacements(result.placements);
    setFoundWords([]);
    setLastFound(null);
  }, [words, gridSize]);

  // --- Loading ---
  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.center}>
          <div style={styles.spinner} />
          <p style={{ color: '#888', marginTop: 12 }}>Generating puzzle...</p>
        </div>
      </>
    );
  }

  // --- Error ---
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

  const foundWordSet = new Set(foundWords.map(fw => fw.word));
  const allFound = foundWords.length === placements.length && placements.length > 0;

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <button style={styles.backArrow} onClick={() => navigate('/')}>
            ← Back
          </button>
          <h2 style={styles.title}>
            Word Search
            <span style={styles.diffBadge}>
              {difficulty === 'hard' ? 'Hard' : 'Easy'}
            </span>
          </h2>
          <button style={styles.regenBtn} onClick={regeneratePuzzle}>
            🔀 Shuffle
          </button>
        </div>

        {lastFound && (
          <div style={styles.foundFlash}>
            Found: <strong style={styles.foundWord}>{lastFound.word}</strong>
            {lastFound.meaning && (
              <span style={styles.foundMeaning}> — {lastFound.meaning}</span>
            )}
            <SpeakerIcon text={lastFound.word} size={18} />
          </div>
        )}

        {/* All found celebration */}
        {allFound && (
          <div style={styles.allFoundCard}>
            <span style={{ fontSize: 40 }}>🎉</span>
            <h3 style={{ margin: '8px 0 4px', color: '#2E7D32' }}>
              All Words Found!
            </h3>
            <p style={{ color: '#666', margin: '0 0 12px', fontSize: 14 }}>
              You found all {placements.length} words!
            </p>
            <button style={styles.primaryBtn} onClick={regeneratePuzzle}>
              Play Again
            </button>
          </div>
        )}

        {/* Grid */}
        {grid && (
          <div style={styles.gridArea}>
            <WordSearchGrid
              grid={grid}
              placements={placements}
              foundWords={foundWords}
              onSelect={handleSelect}
            />
          </div>
        )}

        {/* Word list */}
        <div style={styles.wordListSection}>
          <h3 style={styles.wordListTitle}>
            Find these words ({foundWords.length}/{placements.length})
          </h3>
          <div style={styles.wordListGrid}>
            {placements.map((p, idx) => {
              const isFound = foundWordSet.has(p.word);
              return (
                <div
                  key={idx}
                  style={{
                    ...styles.wordCard,
                    opacity: isFound ? 0.6 : 1,
                    background: isFound ? '#E8F5E9' : '#FFF8E1',
                    borderColor: isFound ? '#81C784' : '#FFE082',
                  }}
                >
                  <div style={styles.wordCardTop}>
                    <span
                      style={{
                        ...styles.wordUrdu,
                        textDecoration: isFound ? 'line-through' : 'none',
                      }}
                    >
                      {p.word}
                    </span>
                    <SpeakerIcon text={p.word} size={16} />
                  </div>
                  {isFound && (
                    <div style={styles.wordMeaningRow}>
                      <span style={styles.wordMeaning}>{p.meaning}</span>
                      <span style={styles.checkmark}>✓</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Demo panel */}
        <DemoPanel />
      </div>
    </>
  );
}

const styles = {
  container: {
    maxWidth: 720,
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
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
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
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  diffBadge: {
    background: '#FFA726',
    color: 'white',
    fontSize: 12,
    fontWeight: 600,
    padding: '2px 10px',
    borderRadius: 12,
  },
  regenBtn: {
    background: 'none',
    border: '2px solid #E8E0C8',
    borderRadius: 10,
    padding: '6px 14px',
    fontSize: 14,
    cursor: 'pointer',
    color: '#555',
    fontWeight: 500,
  },
  foundFlash: {
    background: '#C8E6C9',
    borderRadius: 10,
    padding: '10px 16px',
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 16,
    color: '#1B5E20',
    animation: 'fadeIn 0.3s ease',
  },
  foundWord: {
    fontFamily: "'Noto Nastaliq Urdu', serif",
    fontSize: 20,
  },
  foundMeaning: {
    fontSize: 14,
    color: '#2E7D32',
  },
  allFoundCard: {
    textAlign: 'center',
    background: '#E8F5E9',
    borderRadius: 14,
    padding: '24px 20px',
    marginBottom: 20,
    border: '2px solid #81C784',
  },
  primaryBtn: {
    background: '#2E7D32',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    padding: '10px 24px',
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
    marginTop: 16,
  },
  gridArea: {
    marginBottom: 24,
  },
  wordListSection: {
    marginTop: 8,
  },
  wordListTitle: {
    margin: '0 0 12px',
    fontSize: 16,
    fontWeight: 600,
    color: '#555',
  },
  wordListGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
  },
  wordCard: {
    borderRadius: 10,
    padding: '10px 14px',
    border: '2px solid',
    minWidth: 100,
    textAlign: 'center',
    transition: 'all 0.3s ease',
  },
  wordCardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  wordUrdu: {
    fontFamily: "'Noto Nastaliq Urdu', serif",
    fontSize: 22,
    fontWeight: 600,
    color: '#333',
    lineHeight: 1.6,
  },
  wordMeaningRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 4,
  },
  wordMeaning: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: 500,
  },
  checkmark: {
    color: '#2E7D32',
    fontWeight: 700,
    fontSize: 14,
  },
};

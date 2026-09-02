import { useState, useCallback } from 'react';
import { generateGrid } from '../../utils/wordsearch';

export default function DemoPanel() {
  const [inputText, setInputText] = useState(
    'سلام\nمحبت\nدوستی\nخوشی\nزندگی'
  );
  const [demoGrid, setDemoGrid] = useState(null);
  const [demoPlacements, setDemoPlacements] = useState([]);
  const [demoError, setDemoError] = useState(null);

  const handleGenerate = useCallback(() => {
    setDemoError(null);
    const lines = inputText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) {
      setDemoError('Please enter at least one Urdu word.');
      setDemoGrid(null);
      setDemoPlacements([]);
      return;
    }

    const words = lines.map(w => ({ word_urdu: w, word_meaning: '' }));
    const size = Math.max(10, ...words.map(w => Array.from(w.word_urdu).length + 2));
    const gridSize = Math.min(size, 15);

    try {
      const result = generateGrid(words, gridSize);
      setDemoGrid(result.grid);
      setDemoPlacements(result.placements);
    } catch (err) {
      console.error('Demo generate error:', err);
      setDemoError('Failed to generate puzzle. Try different words.');
      setDemoGrid(null);
      setDemoPlacements([]);
    }
  }, [inputText]);

  const demoCellSize = 32;

  return (
    <div style={styles.panel}>
      <h3 style={styles.title}>Puzzle Generator Demo</h3>
      <p style={styles.subtitle}>
        Paste Urdu words (one per line) and generate a word search puzzle client-side.
      </p>

      <textarea
        style={styles.textarea}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        rows={6}
        placeholder="Enter Urdu words, one per line..."
        dir="rtl"
      />

      <button style={styles.generateBtn} onClick={handleGenerate}>
        Generate Puzzle
      </button>

      {demoError && (
        <p style={styles.error}>{demoError}</p>
      )}

      {demoGrid && (
        <div style={styles.resultArea}>
          <h4 style={styles.resultTitle}>
            Generated Grid ({demoGrid.length}x{demoGrid.length})
          </h4>

          <div style={styles.gridWrapper}>
            <div
              style={{
                ...styles.grid,
                gridTemplateColumns: `repeat(${demoGrid.length}, ${demoCellSize}px)`,
                gridTemplateRows: `repeat(${demoGrid.length}, ${demoCellSize}px)`,
              }}
            >
              {demoGrid.map((row, ri) =>
                row.map((letter, ci) => {
                  const key = `${ri}-${ci}`;
                  return (
                    <div key={key} style={styles.cell}>
                      {letter}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {demoPlacements.length > 0 && (
            <div style={styles.placedWords}>
              <h4 style={styles.resultTitle}>
                Words Placed ({demoPlacements.length})
              </h4>
              <ul style={styles.wordList}>
                {demoPlacements.map((p, idx) => (
                  <li key={idx} style={styles.wordItem}>
                    <span
                      style={styles.wordUrdu}
                      dir="rtl"
                    >
                      {p.word}
                    </span>
                    {p.meaning && (
                      <span style={styles.wordMeaning}> — {p.meaning}</span>
                    )}
                    <span style={styles.wordDir}>({p.direction})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {demoPlacements.length === 0 && (
            <p style={styles.noPlaced}>
              No words could be placed. Try shorter words or fewer words.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  panel: {
    marginTop: 40,
    padding: '24px 20px',
    background: '#FFFEF7',
    borderRadius: 16,
    border: '1px solid #F0E8D0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  title: {
    margin: '0 0 4px',
    fontSize: 18,
    fontWeight: 700,
    color: '#333',
  },
  subtitle: {
    margin: '0 0 16px',
    fontSize: 14,
    color: '#888',
  },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    fontSize: 20,
    fontFamily: "'Noto Nastaliq Urdu', serif",
    border: '2px solid #E0D8C0',
    borderRadius: 10,
    background: '#FFFDF5',
    resize: 'vertical',
    outline: 'none',
    lineHeight: 1.8,
    boxSizing: 'border-box',
  },
  generateBtn: {
    marginTop: 12,
    background: '#FFA726',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    padding: '12px 28px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'block',
  },
  error: {
    color: '#E53935',
    fontSize: 14,
    marginTop: 12,
  },
  resultArea: {
    marginTop: 24,
  },
  resultTitle: {
    margin: '0 0 12px',
    fontSize: 15,
    fontWeight: 600,
    color: '#555',
  },
  gridWrapper: {
    display: 'flex',
    justifyContent: 'center',
    overflowX: 'auto',
    paddingBottom: 8,
  },
  grid: {
    display: 'grid',
    gap: 1,
    padding: 6,
    background: '#E8E0C8',
    borderRadius: 8,
  },
  cell: {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#FFFEF7',
    borderRadius: 4,
    border: '1px solid #D7CEB8',
    fontFamily: "'Noto Nastaliq Urdu', serif",
    fontWeight: 600,
    fontSize: 14,
    color: '#333',
    lineHeight: 1,
  },
  placedWords: {
    marginTop: 20,
  },
  wordList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordItem: {
    background: '#FFF8E1',
    border: '1px solid #FFE082',
    borderRadius: 8,
    padding: '6px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 14,
  },
  wordUrdu: {
    fontFamily: "'Noto Nastaliq Urdu', serif",
    fontWeight: 600,
    fontSize: 16,
    color: '#2E7D32',
  },
  wordMeaning: {
    color: '#666',
    fontSize: 13,
  },
  wordDir: {
    color: '#BBB',
    fontSize: 11,
    fontStyle: 'italic',
  },
  noPlaced: {
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
  },
};

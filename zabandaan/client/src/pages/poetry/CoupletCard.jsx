import { useState, useCallback } from 'react';
import SpeakerIcon from '../../components/SpeakerIcon';

export default function CoupletCard({ couplet, onRead, isRead }) {
  const [selectedWord, setSelectedWord] = useState(null);

  const handleWordClick = useCallback((wordObj, idx) => {
    if (selectedWord && selectedWord.idx === idx) {
      setSelectedWord(null);
    } else {
      setSelectedWord({ ...wordObj, idx });
    }
  }, [selectedWord]);

  const handleRead = useCallback(() => {
    if (onRead) onRead(couplet);
  }, [onRead, couplet]);

  const wordBreakdown = couplet.word_breakdown || [];

  return (
    <div style={styles.card}>
      {/* Poet reference header */}
      <div style={styles.poetHeader}>
        <span style={styles.poetName}>{couplet.poet_name}</span>
        {couplet.poem_title && (
          <>
            <span style={styles.poetDash}> — </span>
            <span style={styles.poemTitle}>{couplet.poem_title}</span>
          </>
        )}
      </div>

      {/* Full couplet display in large Urdu text */}
      <div
        className="urdu-text"
        style={styles.urduFull}
      >
        {(couplet.couplet_urdu || '').split('\n').map((line, i, arr) => (
          <span key={i}>
            {line}
            {i < arr.length - 1 && <br />}
          </span>
        ))}
      </div>

      {/* Roman transliteration */}
      <div style={styles.roman}>
        {(couplet.couplet_roman || '').split('\n').join(' — ')}
      </div>

      {/* Listen button */}
      <SpeakerIcon
        text={couplet.couplet_urdu}
        size={18}
        audioUrl={couplet.audio_path}
        style={styles.listenBtn}
      />

      {/* English Paraphrase section */}
      <div style={styles.meaningSection}>
        <h4 style={styles.meaningHeading}>English Meaning</h4>
        <p style={styles.meaningText}>{couplet.overall_meaning}</p>
      </div>

      {/* Tashri section (Urdu explanation) */}
      {couplet.tashri && (
        <div style={styles.tashriSection}>
          <h4 style={styles.tashriHeading} className="urdu-text">تشریح</h4>
          <p style={styles.tashriText} className="urdu-text">{couplet.tashri}</p>
        </div>
      )}

      {/* Word breakdown (tappable words) */}
      {wordBreakdown.length > 0 && (
        <div style={styles.wordSection}>
          <h4 style={styles.wordSectionTitle}>Word Breakdown</h4>
          <div style={styles.coupletWords}>
            {wordBreakdown.map((w, idx) => (
              <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                <span
                  onClick={() => handleWordClick(w, idx)}
                  style={{
                    ...styles.tapWord,
                    background:
                      selectedWord && selectedWord.idx === idx
                        ? '#FFF8E1'
                        : 'transparent',
                    borderColor:
                      selectedWord && selectedWord.idx === idx
                        ? '#FFA726'
                        : 'transparent',
                    color:
                      selectedWord && selectedWord.idx === idx
                        ? '#E65100'
                        : '#1B5E20',
                  }}
                >
                  {w.word_urdu}
                </span>
                <SpeakerIcon
                  text={w.word_urdu}
                  size={12}
                  audioUrl={w.audio_path || `/audio/poetry/${couplet.id}-word-${idx}.mp3`}
                  style={{ padding: 2 }}
                />
              </span>
            ))}
          </div>

          {/* Selected word meaning */}
          {selectedWord && (
            <div style={styles.wordInfoBox}>
              <div style={styles.wordInfoRow}>
                <span style={styles.wordInfoUrdu} className="urdu-text">{selectedWord.word_urdu}</span>
                {selectedWord.word_roman && (
                  <span style={styles.wordInfoRoman}>({selectedWord.word_roman})</span>
                )}
              </div>
              <span style={styles.wordInfoMeaning}>{selectedWord.word_meaning}</span>
            </div>
          )}
        </div>
      )}

      {/* Mark as read */}
      <div style={styles.readRow}>
        {isRead ? (
          <span style={styles.readBadge}>Read</span>
        ) : (
          <button style={styles.readBtn} onClick={handleRead}>
            Mark as Read (+1 point)
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#FFFEF7',
    borderRadius: 16,
    padding: '24px 20px',
    border: '1px solid #F0E8D0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    marginBottom: 20,
  },
  poetHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: '1px solid #F0E8D0',
  },
  poetName: {
    fontWeight: 700,
    fontSize: 16,
    color: '#2E7D32',
  },
  poetDash: {
    color: '#CCC',
    fontSize: 15,
  },
  poemTitle: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  urduFull: {
    fontSize: 28,
    lineHeight: 2,
    color: '#1B5E20',
    fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif",
    direction: 'rtl',
    textAlign: 'center',
    margin: '8px 0 12px',
    padding: '16px 8px',
    background: '#FAFAF0',
    borderRadius: 10,
    border: '1px solid #E8E0C8',
  },
  roman: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: '4px 0 12px',
    lineHeight: 1.6,
  },
  listenBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    background: 'none',
    border: '2px solid #2E7D32',
    color: '#2E7D32',
    borderRadius: 10,
    padding: '10px 24px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  meaningSection: {
    marginBottom: 16,
    padding: '14px 16px',
    background: '#F5FAF5',
    borderRadius: 10,
    border: '1px solid #E0EDE0',
  },
  meaningHeading: {
    margin: '0 0 8px',
    fontSize: 14,
    fontWeight: 700,
    color: '#2E7D32',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  meaningText: {
    margin: 0,
    fontSize: 15,
    color: '#444',
    lineHeight: 1.7,
  },
  tashriSection: {
    marginBottom: 16,
    padding: '14px 16px',
    background: '#FFFDF0',
    borderRadius: 10,
    border: '1px solid #F0E8D0',
    direction: 'rtl',
    textAlign: 'right',
  },
  tashriHeading: {
    margin: '0 0 8px',
    fontSize: 18,
    fontWeight: 700,
    color: '#5D4037',
  },
  tashriText: {
    margin: 0,
    fontSize: 16,
    color: '#444',
    lineHeight: 2.2,
    fontFamily: "'Noto Nastaliq Urdu', serif",
  },
  wordSection: {
    marginBottom: 16,
  },
  wordSectionTitle: {
    margin: '0 0 8px',
    fontSize: 13,
    fontWeight: 600,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coupletWords: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
    direction: 'rtl',
    marginBottom: 8,
    lineHeight: 2.2,
  },
  tapWord: {
    fontFamily: "'Noto Nastaliq Urdu', serif",
    fontSize: 18,
    fontWeight: 600,
    cursor: 'pointer',
    padding: '2px 6px',
    borderRadius: 6,
    border: '2px solid transparent',
    transition: 'all 0.2s ease',
    lineHeight: 1.6,
    direction: 'rtl',
  },
  wordInfoBox: {
    background: '#FFF8E1',
    border: '1px solid #FFE082',
    borderRadius: 10,
    padding: '10px 14px',
    marginTop: 8,
    textAlign: 'center',
  },
  wordInfoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  wordInfoUrdu: {
    fontFamily: "'Noto Nastaliq Urdu', serif",
    fontSize: 20,
    fontWeight: 600,
    color: '#E65100',
    direction: 'rtl',
  },
  wordInfoRoman: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  wordInfoMeaning: {
    fontSize: 14,
    color: '#555',
    fontWeight: 500,
    display: 'block',
    marginTop: 4,
  },
  readRow: {
    marginTop: 12,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  readBtn: {
    background: '#FFA726',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    padding: '8px 20px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  readBadge: {
    color: '#2E7D32',
    fontWeight: 600,
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '8px 16px',
    background: '#E8F5E9',
    borderRadius: 10,
  },
};

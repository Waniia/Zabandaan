import { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import Navbar from '../../components/Navbar';
import { usePoints } from '../../context/PointsContext';
import CoupletCard from './CoupletCard';

export default function PoetryPage() {
  const { addPoints } = usePoints();

  const [couplets, setCouplets] = useState([]);
  const [readIds, setReadIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch couplets on mount
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get('/content/poetry')
      .then(res => {
        if (cancelled) return;
        setCouplets(res.data.couplets || []);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        console.error('Failed to load poetry:', err);
        setError('Failed to load poetry. Please try again.');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleRead = useCallback((couplet) => {
    if (readIds.has(couplet.id)) return; // already read
    setReadIds(prev => new Set([...prev, couplet.id]));
    addPoints('poetry', null, couplet.id);
  }, [readIds, addPoints]);

  // --- Loading ---
  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.center}>
          <div style={styles.spinner} />
          <p style={{ color: '#888', marginTop: 12 }}>Loading poetry...</p>
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
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>📜 Poetry — Shairi</h1>
          <p style={styles.subtitle}>
            Explore famous Urdu couplets from Iqbal, Faiz, and Ghalib. Tap words to learn
            their meanings, then mark each couplet as read.
          </p>
          <div style={styles.statsBar}>
            <span style={styles.stat}>
              {readIds.size} of {couplets.length} read
            </span>
            <div style={styles.progressTrack}>
              <div
                style={{
                  ...styles.progressFill,
                  width: couplets.length > 0
                    ? `${(readIds.size / couplets.length) * 100}%`
                    : '0%',
                }}
              />
            </div>
          </div>
        </div>

        {/* Couplet cards */}
        <div style={styles.cardList}>
          {couplets.map(c => (
            <CoupletCard
              key={c.id}
              couplet={c}
              onRead={handleRead}
              isRead={readIds.has(c.id)}
            />
          ))}
        </div>

        {couplets.length === 0 && (
          <div style={styles.empty}>
            <p>No couplets available yet.</p>
          </div>
        )}
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
    marginBottom: 24,
  },
  title: {
    margin: '0 0 4px',
    fontSize: 26,
    fontWeight: 700,
    color: '#333',
  },
  subtitle: {
    margin: '0 0 16px',
    fontSize: 15,
    color: '#888',
    lineHeight: 1.5,
  },
  statsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  stat: {
    fontSize: 14,
    fontWeight: 600,
    color: '#2E7D32',
    whiteSpace: 'nowrap',
  },
  progressTrack: {
    flex: 1,
    height: 6,
    background: '#E8E0C8',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #FFA726, #2E7D32)',
    borderRadius: 3,
    transition: 'width 0.4s ease',
  },
  cardList: {
    display: 'flex',
    flexDirection: 'column',
  },
  empty: {
    textAlign: 'center',
    padding: 40,
    color: '#999',
    fontSize: 15,
  },
};

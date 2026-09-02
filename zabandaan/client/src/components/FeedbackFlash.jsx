import { useEffect, useState } from 'react';

export default function FeedbackFlash({ type, onDone, duration = 1500 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onDone) onDone();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDone]);

  if (!visible) return null;

  const isCorrect = type === 'correct';

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: isCorrect ? 'rgba(67,160,71,0.15)' : 'rgba(229,57,53,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 300,
      pointerEvents: 'none',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: '24px 40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        textAlign: 'center',
      }}>
        <span style={{ fontSize: 48 }}>{isCorrect ? '✅' : '❌'}</span>
        <h3 style={{
          margin: '8px 0 0',
          color: isCorrect ? '#43A047' : '#E53935',
          fontSize: 20,
        }}>
          {isCorrect ? 'Correct! +1 Point' : 'Not quite!'}
        </h3>
      </div>
    </div>
  );
}

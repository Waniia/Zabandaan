import { useState, useCallback } from 'react';
import { speak, stopSpeaking } from '../utils/speech';

export default function SpeakerIcon({ text, size = 20, style = {} }) {
  const [state, setState] = useState('idle'); // 'idle' | 'loading' | 'speaking'

  const handleClick = useCallback(async (e) => {
    e.stopPropagation();
    if (state === 'speaking') {
      stopSpeaking();
      setState('idle');
    } else {
      setState('loading');
      try {
        const result = await speak(text);
        if (result && result.ended) {
          setState('idle');
        } else {
          // Speech ended or failed
          setState('idle');
        }
      } catch {
        setState('idle');
      }
    }
  }, [text, state]);

  // Listen for speech end to reset state
  // (speak() returns a promise, but we also handle the case where speech is interrupted)

  const icon = state === 'loading' ? '⏳' : state === 'speaking' ? '🔊' : '🔈';
  const color = state !== 'idle' ? '#2E7D32' : '#888';

  return (
    <button
      onClick={handleClick}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 4,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size,
        color,
        transition: 'color 0.3s, transform 0.2s',
        transform: state !== 'idle' ? 'scale(1.15)' : 'scale(1)',
        ...style,
      }}
      title={`Listen: ${text}`}
      aria-label={`Play pronunciation of ${text}`}
      disabled={state === 'loading'}
    >
      {icon}
    </button>
  );
}

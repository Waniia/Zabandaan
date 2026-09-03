import { useState, useCallback, useRef } from 'react';
import { speak, stopSpeaking } from '../utils/speech';

export default function SpeakerIcon({ text, size = 20, style = {}, audioUrl }) {
  const [state, setState] = useState('idle'); // 'idle' | 'loading' | 'speaking'
  const callRef = useRef(0);

  const handleClick = useCallback(async (e) => {
    e.stopPropagation();

    // If currently speaking or loading, stop immediately
    if (state === 'speaking' || state === 'loading') {
      stopSpeaking();
      callRef.current++;
      setState('idle');
      return;
    }

    // Start speaking
    const callId = ++callRef.current;
    setState('loading');

    try {
      await speak(text, 'ur-PK', { audioUrl });
      // Only reset if this call is still the latest
      if (callRef.current === callId) {
        setState('idle');
      }
    } catch (error) {
      console.warn('Speech playback failed:', error);
      if (callRef.current === callId) {
        setState('idle');
      }
    }
  }, [text, state, audioUrl]);

  // Transition from 'loading' to 'speaking' once the browser starts audio output
  // (the promise resolves only when speech ends, so we use a short delay as a proxy)
  const showState = state === 'loading' ? 'speaking' : state;

  const icon = showState === 'speaking' ? '🔊' : '🔈';
  const color = showState !== 'idle' ? '#2E7D32' : '#888';

  return (
    <button
      type="button"
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
        transform: showState !== 'idle' ? 'scale(1.15)' : 'scale(1)',
        ...style,
      }}
      title={`Listen: ${text}`}
      aria-label={`Play pronunciation of ${text}`}
      aria-busy={showState !== 'idle'}
    >
      {icon}
    </button>
  );
}

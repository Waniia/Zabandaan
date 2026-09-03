// Text-to-speech: local audio files (primary) with Web Speech API fallback.
// Local pre-recorded MP3 files ensure reliable Urdu pronunciation regardless of
// browser/OS voice support.

let voicesCache = [];
let voicesReady = false;
let voicesReadyPromise = null;

// Currently active Audio element (for stopSpeaking)
let currentAudio = null;

function resolveAudioUrl(audioUrl) {
  if (!audioUrl || typeof window === 'undefined') return audioUrl;

  // Data files use /audio/... paths. Resolve them against Vite's base so the
  // same files work when the client is hosted below the domain root.
  if (audioUrl.startsWith('/')) {
    const base = import.meta.env.BASE_URL || '/';
    return new URL(audioUrl.slice(1), new URL(base, window.location.origin)).href;
  }
  return new URL(audioUrl, document.baseURI).href;
}

// --- Web Speech API voice initialization (used as fallback) ---
function initVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  const loadVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      voicesCache = voices;
      voicesReady = true;
    }
  };

  loadVoices();

  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
  }

  if (!voicesReady) {
    let attempts = 0;
    const interval = setInterval(() => {
      loadVoices();
      attempts++;
      if (voicesReady || attempts > 10) {
        clearInterval(interval);
      }
    }, 200);
  }
}

initVoices();

function getVoicesAsync(timeout = 2000) {
  if (voicesReady) return Promise.resolve(voicesCache);
  if (voicesReadyPromise) return voicesReadyPromise;

  voicesReadyPromise = new Promise((resolve) => {
    const start = Date.now();
    const check = () => {
      if (voicesReady || Date.now() - start > timeout) {
        resolve(voicesCache);
        voicesReadyPromise = null;
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });

  return voicesReadyPromise;
}

function findBestVoice(lang, availableVoices = voicesCache) {
  const voices = availableVoices;
  if (voices.length === 0) return null;

  return voices.find(v => v.lang === 'ur-PK')
    || voices.find(v => v.lang === 'ur')
    || voices.find(v => v.lang.startsWith('ur'))
    || voices.find(v => v.lang === 'hi-IN')
    || voices.find(v => v.lang.startsWith('hi'))
    || voices.find(v => v.lang === 'ar-SA')
    || voices.find(v => v.lang.startsWith('ar'));
}

// --- Primary: Play a pre-recorded audio file ---
function speakAudioFile(audioUrl) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') {
      resolve({ ended: false });
      return;
    }

    // Stop any previous audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }

    let audio;
    try {
      audio = new Audio(resolveAudioUrl(audioUrl));
    } catch (error) {
      console.warn('Unable to create audio element:', error);
      resolve({ ended: false });
      return;
    }
    audio.preload = 'auto';
    currentAudio = audio;
    let settled = false;
    let timeoutId;
    const finish = (ended) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      if (currentAudio === audio) currentAudio = null;
      resolve({ ended });
    };

    audio.onended = () => {
      finish(true);
    };

    audio.onerror = () => {
      console.warn(`Audio file playback error: ${audioUrl}`);
      finish(false);
    };

    timeoutId = setTimeout(() => finish(false), 10000);

    // Calling play directly is important: waiting for canplaythrough can
    // lose the user-activation required by browsers for media playback.
    audio.play().catch((err) => {
      console.warn('Audio play() rejected:', err);
      finish(false);
    });
  });
}

// --- Fallback: Web Speech API ---
function speakWithWebSpeech(text, lang = 'ur-PK') {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !text) {
      resolve({ ended: false });
      return;
    }

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        voicesCache = availableVoices;
        voicesReady = true;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = findBestVoice(lang, availableVoices);
      utterance.lang = voice ? voice.lang : lang;
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      if (voice) utterance.voice = voice;
      utterance.onend = () => resolve({ ended: true });
      utterance.onerror = () => resolve({ ended: false });
      window.speechSynthesis.speak(utterance);
      window.speechSynthesis.resume();
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      resolve({ ended: false });
    }
  });
}

/**
 * Speak text aloud.
 * @param {string} text - Text to speak (used for Web Speech fallback)
 * @param {string} lang - Language code (default: 'ur-PK')
 * @param {object} [options]
 * @param {string} [options.audioUrl] - Path to a pre-recorded audio file (preferred)
 * @returns {Promise<{ended: boolean}>}
 */
export async function speak(text, lang = 'ur-PK', options = {}) {
  if (!text) return { ended: false };

  if (options.audioUrl) {
    const result = await speakAudioFile(options.audioUrl);
    if (result.ended) return result;
  }

  return speakWithWebSpeech(text, lang);
}

export function stopSpeaking() {
  // Stop local audio file
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  // Stop Web Speech API
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function isUrduVoiceAvailable() {
  return voicesCache.some(v => v.lang.startsWith('ur'));
}

export function getAvailableVoices() {
  return voicesCache;
}

// Text-to-speech: local audio files (primary) with Web Speech API fallback.
// Local pre-recorded MP3 files ensure reliable Urdu pronunciation regardless of
// browser/OS voice support.

let voicesCache = [];
let voicesReady = false;
let voicesReadyPromise = null;

// Currently active Audio element (for stopSpeaking)
let currentAudio = null;

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

function findBestVoice(lang) {
  const voices = voicesCache;
  if (voices.length === 0) return null;

  return voices.find(v => v.lang === 'ur-PK')
    || voices.find(v => v.lang === 'ur')
    || voices.find(v => v.lang.startsWith('ur'))
    || voices.find(v => v.lang === 'hi-IN')
    || voices.find(v => v.lang.startsWith('hi'))
    || voices.find(v => v.lang === 'ar-SA')
    || voices.find(v => v.lang.startsWith('ar'))
    || voices[0];
}

// --- Primary: Play a pre-recorded audio file ---
function speakAudioFile(audioUrl) {
  return new Promise((resolve) => {
    // Stop any previous audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }

    const audio = new Audio(audioUrl);
    currentAudio = audio;

    audio.onended = () => {
      if (currentAudio === audio) currentAudio = null;
      resolve({ ended: true });
    };

    audio.onerror = (e) => {
      console.warn('Audio file playback error:', e);
      if (currentAudio === audio) currentAudio = null;
      resolve({ ended: false });
    };

    audio.play().catch((err) => {
      console.warn('Audio play() rejected:', err);
      if (currentAudio === audio) currentAudio = null;
      resolve({ ended: false });
    });
  });
}

// --- Fallback: Web Speech API ---
function speakWithWebSpeech(text, lang = 'ur-PK') {
  return new Promise(async (resolve) => {
    if (!window.speechSynthesis) return resolve({ ended: false });

    window.speechSynthesis.cancel();
    await getVoicesAsync(2000);
    await new Promise(r => Promise.resolve().then(r));

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voice = findBestVoice(lang);
    if (voice) utterance.voice = voice;

    utterance.onend = () => resolve({ ended: true });
    utterance.onerror = () => resolve({ ended: false });

    try {
      window.speechSynthesis.speak(utterance);
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
  // If a local audio file is provided, play it first
  if (options.audioUrl) {
    const result = await speakAudioFile(options.audioUrl);
    if (result.ended) return result;
    // Fall through to Web Speech API if file playback failed
  }

  // Fallback to Web Speech API
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
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function isUrduVoiceAvailable() {
  return voicesCache.some(v => v.lang.startsWith('ur'));
}

export function getAvailableVoices() {
  return voicesCache;
}

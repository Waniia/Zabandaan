// Web Speech API wrapper with async voice loading and fallback
let voicesCache = [];
let voicesReady = false;
let voicesReadyPromise = null;

// Initialize voice loading - voices load asynchronously in Chrome/Edge
function initVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  
  const loadVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      voicesCache = voices;
      voicesReady = true;
    }
  };

  // Try loading immediately
  loadVoices();

  // Listen for voices loaded event (Chrome requires this)
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
  }

  // Also poll briefly as a fallback for browsers that don't fire the event
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

// Call init on module load
initVoices();

/**
 * Get a promise that resolves when voices are available
 */
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

/**
 * Find the best available voice for the given language
 */
function findBestVoice(lang) {
  const voices = voicesCache;
  if (voices.length === 0) return null;
  
  // Priority chain for Urdu
  return voices.find(v => v.lang === 'ur-PK')
    || voices.find(v => v.lang === 'ur')
    || voices.find(v => v.lang.startsWith('ur'))
    || voices.find(v => v.lang === 'hi-IN')
    || voices.find(v => v.lang.startsWith('hi'))
    || voices.find(v => v.lang === 'ar-SA')
    || voices.find(v => v.lang.startsWith('ar'))
    || voices[0]; // fallback to any available voice
}

/**
 * Speak text aloud using Web Speech API
 * @param {string} text - Text to speak
 * @param {string} lang - Language code (default: 'ur-PK')
 * @returns {Promise<{ended: boolean}>} - Resolves when speech ends
 */
export async function speak(text, lang = 'ur-PK') {
  if (!window.speechSynthesis) return { ended: false };
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  // Wait for voices to be available
  await getVoicesAsync(2000);
  
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Find best voice
    const voice = findBestVoice(lang);
    if (voice) utterance.voice = voice;
    
    // Resolve on end
    utterance.onend = () => resolve({ ended: true });
    utterance.onerror = () => resolve({ ended: false });
    
    // Chrome sometimes requires a small delay after cancel
    setTimeout(() => {
      try {
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis error:', e);
        resolve({ ended: false });
      }
    }, 50);
  });
}

export function stopSpeaking() {
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

---
kind: external_dependency
name: Browser-native text-to-speech via Web Speech API
slug: web-speech-api
category: external_dependency
category_hints:
    - framework_behavior
    - client_constraint
scope:
    - '**'
---

The app uses the browser's built-in Web Speech API (`window.speechSynthesis`) for all audio output — letter pronunciation in the alphabet section and idiom/poetry playback. There is no server-side TTS or pre-recorded audio files for speech; audio is generated at runtime by the client.

Key integration notes:
- Auto-play on page load is blocked by browsers; the UI should fall back to a tap-to-hear prompt when auto-speak fails.
- The `SpeakerIcon` component must track a proper `loading → speaking → idle` lifecycle and guard against stale async callbacks.
- Verify exact `SpeechSynthesisUtterance` properties (lang, rate, pitch) against the target browser docs since behavior varies across Chrome, Edge, Safari.
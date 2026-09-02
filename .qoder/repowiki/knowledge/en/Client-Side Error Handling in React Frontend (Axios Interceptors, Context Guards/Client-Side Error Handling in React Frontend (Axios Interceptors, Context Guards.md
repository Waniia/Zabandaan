---
kind: error_handling
name: Client-Side Error Handling in React Frontend (Axios Interceptors, Context Guards, and UI State)
category: error_handling
scope:
    - '**'
source_files:
    - zabandaan/client/src/api/index.js
    - zabandaan/client/src/context/AuthContext.jsx
    - zabandaan/client/src/context/PointsContext.jsx
    - zabandaan/client/src/pages/Login.jsx
    - zabandaan/client/src/pages/Profile.jsx
    - zabandaan/client/src/utils/speech.js
---

## Overview

This repository is a React frontend (Vite + React) for the Zabandaan learning app. There is no backend server code in this workspace; error handling is implemented entirely on the client side using standard JavaScript/React patterns.

## Architecture and Conventions

### Centralized HTTP Client with Axios Interceptors

All network requests go through a single `axios` instance defined in `zabandaan/client/src/api/index.js`. Two interceptors are registered:

- **Request interceptor**: reads `zabandaan_token` from `localStorage` and attaches it as a `Bearer` Authorization header on every request.
- **Response interceptor**: intercepts errors; if the response status is `401`, it clears both `zabandaan_token` and `zabandaan_user` from `localStorage`, then re-throws the error via `Promise.reject(error)` so callers can handle it.

There are no custom error classes or sentinel values — raw `Error` objects and axios error shapes (`error.response?.status`) are propagated up the call stack.

### Context Provider Guards

Both `AuthContext` and `PointsContext` use a guard pattern in their exported hooks: `useAuth()` and `usePoints()` throw a plain `new Error('useX must be used within XProvider')` when called outside their respective providers. This enforces correct component tree composition at runtime.

### Page-Level Error State

User-facing pages manage errors as local React state:

- `Login.jsx` maintains an `error` string state, sets it inside `try/catch` blocks around `login()` and `register()`, and renders it inline via `<p style={styles.error}>{error}</p>` styled in red (`#E53935`). The error message falls back to `err.response?.data?.error || 'Login failed. Please try again.'`.
- `Profile.jsx` follows the same pattern with its own `error` state and `setError('')` resets.
- `Home.jsx` catches fetch failures with `console.error('Load progress error:', err)` without surfacing them to the user.

### Background / Non-Critical Error Handling

Operations that do not block user flow log rather than surface errors:

- `PointsContext.jsx`: `addPoints` and `loadPoints` wrap API calls in `try/catch` and log via `console.error('Add points error:', err)` / `console.error('Load points error:', err)` — no user-visible feedback.
- `speech.js`: Web Speech API errors are handled gracefully — `utterance.onerror` resolves `{ ended: false }`, and a `try/catch` around `window.speechSynthesis.speak` logs `console.warn('Speech synthesis error:', e)` and returns `{ ended: false }`.
- JSON parsing of `localStorage` data uses bare `catch { /* ignore */ }` blocks in `AuthContext` and `PointsContext` to tolerate corrupted stored state.

### No Global Error Boundary

No `ErrorBoundary` component or global `window.onerror` handler was found in the scanned files. Errors bubble unhandled unless caught by page-level `try/catch` or context guards.

### No Backend Server Code

The `database/` directory contains only SQLite schema and database files; there is no Node/Express server code in this workspace to analyze for server-side error handling conventions.

## Key Files

- `zabandaan/client/src/api/index.js` — centralized axios instance with auth token injection and 401 cleanup interceptor
- `zabandaan/client/src/context/AuthContext.jsx` — auth provider with localStorage session management and `useAuth` guard
- `zabandaan/client/src/context/PointsContext.jsx` — points provider with guest-mode fallback and silent error logging
- `zabandaan/client/src/pages/Login.jsx` — form validation, async login/register with user-visible error state
- `zabandaan/client/src/pages/Profile.jsx` — profile page with similar error-state pattern
- `zabandaan/client/src/utils/speech.js` — Web Speech API wrapper with graceful error fallbacks

## Conventions Observed

1. Network errors are surfaced to users only on interactive flows (login/register); background operations fail silently via `console.error`.
2. Authentication failures (401) are handled centrally by clearing persisted session data in the axios response interceptor.
3. Context misuse is treated as a programming error and surfaced via thrown `Error`.
4. Corrupted local storage is tolerated by swallowing parse errors rather than crashing.
5. Browser API failures (speech synthesis) resolve to safe default values instead of throwing.
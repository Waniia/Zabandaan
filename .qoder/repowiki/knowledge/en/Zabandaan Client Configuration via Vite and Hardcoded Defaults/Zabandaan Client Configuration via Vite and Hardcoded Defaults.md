---
kind: configuration_system
name: Zabandaan Client Configuration via Vite and Hardcoded Defaults
category: configuration_system
scope:
    - '**'
source_files:
    - zabandaan/client/vite.config.js
    - zabandaan/client/src/api/index.js
    - zabandaan/client/package.json
    - zabandaan/package.json
    - zabandaan/database/schema.sql
---

## What system/approach is used

The Zabandaan application (a React + Vite frontend) uses a minimal, code-first configuration approach with no dedicated configuration framework. Runtime settings are defined inline in source files and build-time options are declared in `vite.config.js`. There is **no `.env` file**, no environment variable loading (`process.env`, `import.meta.env`, or `VITE_` prefixed variables are not referenced anywhere in the client source), and no feature-flag or secrets management layer.

## Key files and packages

- `zabandaan/client/vite.config.js` — Build/dev server configuration: defines the dev server port (`5173`) and a proxy that forwards `/api` requests to `http://localhost:3001` with `changeOrigin: true`.
- `zabandaan/client/src/api/index.js` — Axios instance configured with a hardcoded `baseURL: '/api'` and default headers; also contains auth token injection from `localStorage` keys `zabandaan_token` and `zabandaan_user`, plus a 401 response interceptor that clears those items.
- `zabandaan/client/package.json` — Declares scripts (`dev`, `build`, `preview`) and dependencies; no config-related fields beyond standard npm metadata.
- `zabandaan/package.json` — Root-level orchestration script using `concurrently` to run both the (external) server (`cd server && node index.js`) and the client (`cd client && npx vite --host`).
- `zabandaan/database/` — SQLite database files (`zabandaan.db`, `-shm`, `-wal`) plus `schema.sql`; these act as the data-layer configuration for the backend but contain no runtime config loader.

## Architecture and conventions

1. **Build-time config only**: All configurable behavior is baked into source files at development time. The dev server proxy target (`http://localhost:3001`) is hard-coded in `vite.config.js`; there is no per-environment config file (e.g., `vite.config.dev.js`, `vite.config.prod.js`) or env-var override.
2. **Relative API base path**: The frontend talks to the backend exclusively through the `/api` path prefix, relying on the Vite dev proxy to forward it to the backend server. In production builds this would require the backend to serve the same origin so the relative `/api` path resolves correctly.
3. **Auth state stored in localStorage**: Authentication tokens and user info are persisted under fixed `localStorage` keys (`zabandaan_token`, `zabandaan_user`). There is no cookie-based session or server-side session configuration visible in the client.
4. **No environment-specific overrides**: No `.env`, `.env.local`, `.env.development`, or similar files exist in the repository. There is no mechanism to swap endpoints, toggle features, or inject secrets at build or runtime.
5. **Database as immutable asset**: The SQLite database file (`zabandaan.db`) and its WAL/shm files are committed alongside `schema.sql`, treating the database schema and seed data as part of the deployment artifact rather than something loaded from a config-driven migration system.

## Conventions and constraints

- **Hardcoded defaults everywhere**: Backend host/port, API base URL, dev server port, and storage key names are all literal strings in source code. Changing them requires editing the relevant source file.
- **Single-origin assumption for production**: The client expects the backend to be served from the same origin (or proxied identically) because it uses a relative `/api` baseURL with no fallback.
- **No secrets in code**: While no explicit secret-loading pattern exists, the absence of any `.env` usage means secrets cannot be injected via environment variables either; they would need to be embedded in source (which is not observed here).
- **Dev vs. prod boundary is implicit**: The only distinction between environments is whether the Vite dev proxy is active; there is no conditional logic based on an environment flag.
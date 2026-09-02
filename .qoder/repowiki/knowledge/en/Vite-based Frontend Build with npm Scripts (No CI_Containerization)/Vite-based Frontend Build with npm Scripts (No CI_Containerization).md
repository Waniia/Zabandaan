---
kind: build_system
name: Vite-based Frontend Build with npm Scripts (No CI/Containerization)
category: build_system
scope:
    - '**'
source_files:
    - zabandaan/package.json
    - zabandaan/client/package.json
    - zabandaan/client/vite.config.js
---

## What system/approach is used

The repository uses a simple **npm + Vite** build pipeline for the React frontend. There is no Makefile, Dockerfile, or CI configuration present in the repository. The build is driven entirely by `package.json` scripts and Vite's built-in bundler.

## Key files and packages

- `zabandaan/package.json` — root workspace script that orchestrates client/server development via `concurrently`. Defines `dev`, `build`, and `start` scripts; depends on `concurrently` to run both server and client dev servers together.
- `zabandaan/client/package.json` — the actual frontend project manifest. Declares dependencies (`react`, `react-dom`, `react-router-dom`, `axios`) and devDependencies (`vite`, `@vitejs/plugin-react`). Exposes `dev`, `build`, `preview` scripts.
- `zabandaan/client/vite.config.js` — Vite configuration: enables the React plugin, sets the dev server port to `5173`, and proxies `/api` requests to `http://localhost:3001` during development.
- `zabandaan/client/dist/` — output directory where `vite build` emits the production bundle (present but empty in this snapshot).
- `zabandaan/database/zabandaan.db` — SQLite database file checked into the repo alongside schema (`schema.sql`); there is no migration/build step for it.

## Architecture and conventions

- **Monorepo-style layout**: the `zabandaan/` folder contains both the client (React/Vite) and a `server/` subdirectory referenced from the root scripts. The root `package.json` acts as an orchestration layer rather than owning source code.
- **Development workflow**: `npm run dev` launches both the backend (via `cd server && node index.js`) and the Vite dev server concurrently. The Vite dev server proxies API calls to the backend at port 3001.
- **Production build**: `npm run build` delegates to `cd client && npx vite build`, producing a static asset bundle under `zabandaan/client/dist/`. There is no separate server build step defined.
- **Versioning**: version strings live only in `package.json` files (`1.0.0` for both root and client). No git tags or release automation are visible.

## Conventions and constraints

- All build logic is expressed through npm scripts; no external task runners (Make, Gulp, etc.) are used.
- The frontend is configured as an ES module (`"type": "module"` in `client/package.json`) and uses JSX via the `@vitejs/plugin-react`.
- Development proxying is hardcoded to `http://localhost:3001`; any change to the backend port requires editing `vite.config.js`.
- There is **no containerization** (no Dockerfile), **no CI/CD pipeline** (no `.github/workflows`, `.gitlab-ci.yml`, etc.), **no linting/formatting build steps**, and **no artifact publishing** scripts beyond `vite build`.
- The SQLite database file (`zabandaan.db`) is committed directly to the repository alongside its schema, bypassing any migration tooling.
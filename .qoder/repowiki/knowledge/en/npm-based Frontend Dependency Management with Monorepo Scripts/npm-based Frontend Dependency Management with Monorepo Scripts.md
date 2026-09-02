---
kind: dependency_management
name: npm-based Frontend Dependency Management with Monorepo Scripts
category: dependency_management
scope:
    - '**'
source_files:
    - zabandaan/package.json
    - zabandaan/client/package.json
    - package-lock.json
    - zabandaan/client/package-lock.json
    - zabandaan/client/vite.config.js
---

## What system/approach is used

This repository uses **npm** as the package manager for all JavaScript/TypeScript dependencies. The project is organized as a simple monorepo under `zabandaan/` containing a client application (React + Vite) and a root-level workspace that orchestrates development via scripts. There is no backend server code in this snapshot — only a SQLite database directory (`zabandaan/database/`) and frontend assets.

## Key files and packages

- `zabandaan/package.json` — Root workspace manifest declaring `concurrently` to run the dev server and client simultaneously; provides `dev`, `build`, and `start` scripts that delegate into the `client/` subdirectory.
- `zabandaan/client/package.json` — Client application manifest declaring runtime dependencies (`react`, `react-dom`, `react-router-dom`, `axios`) and dev dependencies (`vite`, `@vitejs/plugin-react`).
- `package-lock.json` (root) and `zabandaan/client/package-lock.json` — npm lockfiles pinning exact transitive dependency versions for reproducible installs.
- `zabandaan/node_modules/` and `zabandaan/client/node_modules/` — Vendored dependency trees installed from the lockfiles.
- `vite.config.js` — Vite build configuration referenced by the client's scripts.

## Architecture and conventions

- **Monorepo layout**: A single top-level `package.json` acts as a workspace entry point, while the actual application lives in `zabandaan/client/`. The root script uses `concurrently` to launch both the (referenced but not present) server and the Vite dev server together.
- **Lockfile-driven installs**: Both the root and client directories ship `package-lock.json` files, which npm uses to resolve deterministic dependency trees. This ensures builds are reproducible across environments.
- **No private registry or vendoring beyond node_modules**: Dependencies are pulled from the public npm registry; there is no `.npmrc` file, no `vendor/` directory, and no private registry configuration observed.
- **Dependency versioning style**: All dependencies use caret (`^`) ranges in `package.json`, allowing minor/patch updates within the major version. Lockfiles then freeze the exact resolved versions at install time.
- **Client-only JS stack**: Only the `client/` subdirectory declares application dependencies; the root workspace only manages orchestration tooling (`concurrently`).

## Conventions and constraints

- Dependencies are declared exclusively in `package.json` files under `zabandaan/`; no other language-specific manifests (e.g., `go.mod`, `Gemfile`, `requirements.txt`) exist in this repository.
- Transitive dependencies are not manually pinned in source — they are resolved and locked by npm via the generated `package-lock.json` files.
- The project is marked `"private": true` in both manifests, indicating these packages are not intended to be published to the npm registry.
- Development workflow relies on npm scripts rather than external task runners (e.g., Make, Gulp); the root `dev` script coordinates multiple processes through `concurrently`.
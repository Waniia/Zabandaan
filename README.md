# Zabandaan

Zabandaan is a gamified Urdu-learning web app with alphabet tracing, numbers,
adjectives, idioms, poetry, word search, audio pronunciation, progress
tracking, points, guest mode, and account authentication.

## Requirements

- Node.js 22 or newer (the server uses the built-in `node:sqlite` module)
- npm

## Quick start

From the repository root, enter the application directory:

```bash
cd zabandaan
npm run install:all
```

Create the server environment file:

```bash
cp server/.env.example server/.env
```

On Windows PowerShell, use:

```powershell
Copy-Item server/.env.example server/.env
```

Edit `zabandaan/server/.env` and replace `JWT_SECRET` with a random value of
at least 32 characters. Never commit that file.

Seed the learning content:

```bash
npm run seed
```

Start the frontend and API together:

```bash
npm run dev
```

Open the frontend at <http://localhost:5173>.

The API health check is available at <http://localhost:3001/api/health>.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite frontend and Express API |
| `npm run build` | Create a production frontend build |
| `npm run seed` | Populate idioms, poetry, and word-search content |
| `npm run install:all` | Install root, client, and server dependencies |

The seed script only refreshes learning content. It does not delete users or
progress.

## Security

- Do not commit `.env` or `.env.*` files.
- Use `server/.env.example` as the template for required variables.
- Do not commit API keys, tokens, passwords, or credentials.
- The local SQLite database is intentionally ignored because it can contain
  user password hashes and progress.

## Project layout

```text
zabandaan/
  client/       React + Vite frontend
  server/       Express API and authentication
  database/     SQLite schema and local database files
```

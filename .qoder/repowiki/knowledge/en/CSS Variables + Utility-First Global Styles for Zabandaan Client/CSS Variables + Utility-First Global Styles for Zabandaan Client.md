---
kind: frontend_style
name: CSS Variables + Utility-First Global Styles for Zabandaan Client
category: frontend_style
scope:
    - '**'
source_files:
    - zabandaan/client/src/styles/variables.css
    - zabandaan/client/src/styles/global.css
    - zabandaan/client/package.json
---

## What system/approach is used

The Zabandaan client (`zabandaan/client`) uses a **plain CSS** styling approach built on **CSS custom properties (design tokens)** with a small set of global utility classes. There is no CSS-in-JS library, no component-scoped CSS framework (no Tailwind, Styled Components, Emotion), and no preprocessor — just vanilla `.css` files consumed by a Vite + React application.

## Key files and packages

- `zabandaan/client/src/styles/variables.css` — central design-token file defining all colors, radii, shadows, fonts, and transitions under `:root`.
- `zabandaan/client/src/styles/global.css` — global reset, base typography, reusable UI primitives (`.btn`, `.card`, `.form-group`, `.page-container`), feedback animations (`flash-correct`, `flash-wrong`, `points-pop`, `speaking`), and a mobile breakpoint at `600px`.
- `zabandaan/client/package.json` — confirms the stack: React 19 + Vite; no styling-related dependencies beyond the runtime.
- `zabandaan/client/index.html` — entry point that imports the stylesheet (via Vite's default CSS handling).

## Architecture and conventions

1. **Design tokens in a single source**: All visual constants live in `variables.css` as CSS variables (`--color-primary`, `--color-accent`, `--color-bg`, `--radius`, `--shadow`, `--font-urdu`, `--font-latin`, `--transition`). Components never hard-code color values or spacing numbers; they reference these tokens via `var(--...)`.
2. **Global utility-first layer**: `global.css` provides shared class names reused across components:
   - Layout: `.page-container` (max-width 900px, centered, full viewport minus navbar height).
   - Buttons: `.btn` base plus `.btn-primary`, `.btn-accent`, `.btn-outline`, `.btn-ghost` variants.
   - Cards: `.card` with shadow and hover elevation.
   - Forms: `.form-group` with label/input styles and focus ring via `border-color`.
   - Feedback: `.error-msg`, `.success-msg`, and animated flash classes.
3. **Bilingual typography**: A dedicated `.urdu-text` class applies `direction: rtl` and the Urdu font stack (`Noto Nastaliq Urdu`, `Jameel Noori Nastaleeq`), while Latin text uses Inter/system sans-serif. This separates language-specific rendering concerns from layout.
4. **No component-scoped CSS**: Components import and compose these global classes directly rather than defining per-component stylesheets. The codebase does not use CSS modules, CSS-in-JS, or scoped styles.
5. **Responsive strategy**: A single `@media (max-width: 600px)` block adjusts page padding and button sizing for small screens. No multi-breakpoint grid system is defined.
6. **Animation conventions**: Short, purpose-driven keyframe animations are declared inline in `global.css` (`flashGreen`, `flashRed`, `pointsPop`, `pulse`) and applied via utility class names rather than JS-driven animation libraries.

## Conventions and constraints

- **Colors must come from `variables.css`**: All UI elements reference `var(--color-*)` tokens; no literal hex values are used in component markup or other stylesheets.
- **Button usage follows the four-variant palette**: New interactive elements should extend one of `.btn-primary`, `.btn-accent`, `.btn-outline`, or `.btn-ghost` rather than inventing new button styles.
- **Card surfaces use the tokenized radius/shadow pair**: `.card` applies `--radius` and `--shadow` (with `--shadow-lg` on hover); new surface components should follow this pattern.
- **Urdu content must be wrapped in `.urdu-text`** to ensure correct RTL direction and font selection.
- **Form inputs rely on `.form-group`** for consistent spacing, border color, and focus state; ad-hoc input styling is avoided.
- **Transitions use the shared `--transition` token** (0.3s ease) so hover/focus effects remain uniform across buttons and cards.
- **Mobile breakpoint is fixed at 600px**: Any responsive adjustments should target `@media (max-width: 600px)` rather than introducing new breakpoints.
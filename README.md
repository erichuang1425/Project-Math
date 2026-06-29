# Project Math

**A calm, local-first studybook for learning calculus with structure, feedback, and visible progress.**

Project Math is a desktop learning app built for people who want math to feel less scattered. It packages a curated Calculus I course as validated JSON, renders it through reusable lesson blocks, and keeps progress on the learner's machine. The result is closer to an interactive studybook than a notes app: explanations, LaTeX, graphs, worked examples, common mistakes, quizzes, glossary popovers, and exportable summaries live in one deterministic flow.

The current course is a 12-lesson Calculus I starter path covering foundations, derivatives from first principles, and the core differentiation rules.

## Preview

Screenshots are not checked in yet. The app currently includes these first-run surfaces:

```text
Courses Dashboard -> Course Detail -> Lesson Reader
                     |                  |
                     |                  +-- section progress, glossary, quizzes
                     +-- module progress, lesson status, prerequisites
```

The UI ships with two display modes:

- **Polished:** warm neutral surfaces, subtle depth, progress rings, and restrained motion.
- **Calm:** higher contrast, no decorative motion, no elevation, and a lower-sensory reading surface.

## Features

- **Offline-first desktop app:** Tauri wraps a Vite/React frontend; bundled lessons and learner state work without runtime network calls.
- **Structured course model:** courses contain modules, lessons, sections, and typed blocks, all validated before rendering.
- **Math-native reader:** KaTeX-backed inline and display math, deterministic SVG graphs, glossary term popovers, and section navigation.
- **Guided practice:** worked-example step rails, common-mistake blocks, quizzes with per-option feedback, retry state, and saved attempts.
- **Progress that stays visible:** course rings, lesson status chips, active section markers, and continue cards.
- **Local learner state:** Tauri-backed JSON storage on desktop, with `localStorage` fallback for browser/dev runs.
- **Export helpers:** deterministic lesson-summary export and clipboard/download paths.
- **Public web build:** the browser version can be deployed as a static Vite site; progress remains local to that browser profile.

## Tech Stack

- **Desktop:** Tauri 2
- **Frontend:** React 18, TypeScript, Vite
- **Styling:** CSS Modules and CSS custom properties
- **Math:** KaTeX
- **Graphs:** deterministic internal SVG renderer
- **Testing:** Vitest, jsdom, React Testing Library
- **Quality:** ESLint, Prettier, GitHub Actions

## Getting Started

Prerequisites:

- Node.js 20+
- npm
- Rust toolchain, only needed for Tauri desktop commands

Install dependencies:

```powershell
npm install
```

Run the web app locally:

```powershell
npm run dev
```

Run the desktop shell:

```powershell
npm run desktop:dev
```

Build the static web bundle:

```powershell
npm run build
```

Build the desktop app:

```powershell
npm run desktop:build
```

On Windows PowerShell, use `npm.cmd` if script execution policy blocks the npm shim.

## Project Structure

```text
src/
  app/          App shell, routing, views, reader controls
  content/      Course schema, validation, quiz scoring, fixtures
  design/       Tokens, primitives, illustrations
  export/       Lesson summary export helpers
  graphs/       Deterministic SVG graph renderer
  math/         KaTeX rendering helpers
  rendering/    Lesson and block renderers
  storage/      Learner-state repositories
src-tauri/      Native desktop shell and Tauri configuration
docs/           Product, architecture, schema, UI, and testing docs
public/         Static hosting assets
```

## Testing

Run the full local verification set:

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

Useful focused commands:

```powershell
npm run format:check
npm run test:coverage
```

CI runs install, lint, format check, typecheck, tests, and build on `main` and `work/**` branches.

## Deployment

The Vite frontend can be deployed as a static site. The checked-in `netlify.toml` uses:

- Build command: `npm run build`
- Publish directory: `dist`

The hosted version is the browser studybook, not the native Tauri shell. Learner progress is stored in that browser's local storage.

## Roadmap

Near-term work:

- Finish the Calculus I differentiation-rules capstone lesson.
- Add desktop import/export flows for learner state.
- Polish desktop packaging, app icons, recent courses, and restored window state.
- Add screenshots and a short demo link once the public build is stable.

Longer-term direction:

- More calculus modules.
- Richer authoring and review tools for structured lesson JSON.
- Broader technical-subject support while keeping the same deterministic renderer.

## License

No license file is currently included. All rights are reserved unless a license is added later.

# Project-Math Agent Guide

A polished, MOOC-style local-first learning app for math. Built for low-motivation learners who need a beautiful, calm shell that always shows progress. Inspired by Brilliant for surface polish; never noisy.

## Product Model

- **Courses → Modules → Lessons → Blocks.** A course holds modules; a module holds lessons; a lesson holds a typed block stream (concept, intuition, latex, worked-example, graph, common-mistake, quiz, summary, title).
- **Local-first, fully offline.** Content is shipped as JSON, validated at load. No network calls at runtime.
- **Deterministic rendering.** Given the same content + learner state, the app renders identically every time.
- **One course is real today: Calculus I** (Foundations → Derivatives from First Principles → Differentiation Rules).

## Design Modes

Two first-class display modes. Both are tokenized; switching is a single attribute on `<html>`.

- **Polished (default).** Warm neutral surfaces, deep indigo + amber accent, generous spacing, subtle elevation, 120–180ms transform/opacity transitions on hover/focus/route-change. Made to invite a learner in.
- **Calm (opt-in).** Higher-contrast warm neutrals, no elevation, no transitions, no decorative illustration. Optimized for low-sensory and neurodivergent reading. Must remain a first-class peer — never a degraded fallback.

All motion is gated behind `@media (prefers-reduced-motion: no-preference)` and the `<MotionGate>` helper.

## Design Principles

1. **Clarity beats novelty.** Every surface answers "what do I do next?" without reading instructions.
2. **Progress is always visible.** Course cards have rings, lessons have status chips, the reader has a section marker. No hidden state.
3. **Motion serves comprehension.** Use motion to show relationships (route change, focus, expansion). Never to decorate.

## Stack

- **Desktop:** Tauri 2.
- **Frontend:** React 18, TypeScript (strict), Vite.
- **Styling:** CSS Modules + `src/design/tokens.css` (CSS custom properties). No CSS framework.
- **Math:** KaTeX.
- **Graphs:** internal deterministic SVG (`src/graphs/`).
- **Storage:** local JSON on disk via Tauri; `localStorage` fallback for web.
- **Tests:** Vitest + jsdom + `@testing-library/react`.
- **Lint/format:** ESLint + Prettier.

## Approved Dependencies

Already in `package.json` or pre-approved — add without further sign-off:

- **Runtime:** `react`, `react-dom`, `katex`, `lucide-react`, `clsx`.
- **Dev:** `vite`, `typescript`, `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@vitest/coverage-v8`, `eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `prettier`.
- **Desktop:** `@tauri-apps/cli`, `@tauri-apps/api`.

Anything outside this list needs a one-paragraph proposal in the PR description: why now, alternatives, offline behavior, footprint. Don't add it silently — but don't ask for permission to add a small utility that's clearly aligned with the principles above.

## Math Correctness

- Every mathematical claim traces to a lesson objective, definition, prior example, or cited assumption.
- LaTeX must render through KaTeX without error.
- Worked examples show every algebraic step relevant to the learner level; no silent simplification of domain, sign, or limiting behavior.
- Graphs label axes, domain assumptions, and special points; include a text description for screen readers.
- Common-mistake blocks state the misconception, the incorrect step, and the correction.
- Quizzes ship correct answers, plausible distractors, and per-option feedback.

## Accessibility Floor

- Keyboard and pointer both work for every flow (navigation, reader controls, quiz, glossary).
- Focus is always visible (3px ring, 2px offset).
- Correctness is communicated by icon + label + border, never color alone.
- Skip links land at lesson content and at the next section.
- Tab order matches reading order.
- Calm mode passes WCAG AA contrast.

## Content Authoring Rules

- IDs are required on `Course`, `Module`, `Lesson`, and every `Block`. Use kebab-case, stable across edits.
- Every lesson runs through `validateContent` before rendering. Add a paired invalid fixture under `src/content/fixtures/invalid/` for any new validation rule.
- Prefer the action micro-flow: **Observe → Predict → Calculate → Compare → Answer → Summarize**. Pause prompts go *before* the quiz, not after the common-mistake block.
- Reference glossary terms via `RichTextSegment.kind: "term"`; don't redefine inline.
- One graph minimum per lesson; ≥2 worked examples; ≥2 common-mistake blocks; ≥3 quiz items.

## Testing Rules

- Schema or validator changes ship paired valid + invalid fixtures and parametrized tests.
- Block renderer changes ship a test that mounts the affected block in jsdom.
- Quiz logic changes ship scoring + feedback + retry tests.
- Desktop command changes ship a mocked-invoke test or a documented manual smoke path.
- Coverage thresholds: 80% statements/branches in `src/content/` and `src/rendering/blocks/`. Land thresholds together with the content they cover, not before.

## What Done Means

- The behavior lands in the correct layer (content vs. rendering vs. app shell vs. desktop).
- `npm run typecheck && npm run lint && npm test && npm run build` are all green.
- Both Polished and Calm modes pass the manual smoke checklist in `docs/ui-system.md`.
- Docs are updated: `docs/roadmap.md` (status), `docs/content-schema.md` (if schema moved), `docs/ui-system.md` (if a surface changed).
- The change works fully offline.
- Known follow-up is listed in the PR description.

## Agent Workflow

1. **Before editing:** read the relevant doc, pick the matching `.agents/skills/*`, state the files you expect to touch.
2. **During editing:** keep changes scoped; prefer extracting a primitive over copy-paste; don't move unrelated files.
3. **Before finishing:** run typecheck + lint + tests + build; summarize changed files; flag what wasn't tested; suggest the next concrete task.

## Local Skills

- `studybook-architect` (owns the content schema + pedagogy)
- `math-rendering-reviewer`
- `desktop-app-engineer`
- `frontend-visual-system-designer`
- `design-token-architect`
- `neurodivergent-learning-accessibility-reviewer`
- `motivation-ux-reviewer` (new — owns Polished-mode polish + "progress always visible")
- `learner-journey-reviewer` (replaces ux-quality-reviewer)
- `frontend-regression-visual-qa`
- `test-and-regression-reviewer`
- `math-rendering-reviewer`

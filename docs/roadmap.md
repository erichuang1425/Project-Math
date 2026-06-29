# Roadmap

Project Math is evolving into a polished MOOC-style local studybook: a calm shell, structured math content, deterministic rendering, and visible learner progress.

## Current Direction

- **Product:** local-first Calculus I learning app.
- **Structure:** Course -> Module -> Lesson -> Section -> Block.
- **Reader:** LaTeX, deterministic graphs, worked examples, common mistakes, quizzes, glossary popovers, and exportable summaries.
- **Modes:** Polished by default, Calm as a first-class low-sensory option.
- **Runtime:** fully offline at use time.

## Shipped

### Foundations

- Course schema v2 with modules, lessons, sections, glossary terms, prerequisites, and validation.
- App shell with dashboard, course detail, lesson reader, hash routing, continue card, progress surfaces, and reader controls.
- Design tokens and primitives for Polished and Calm modes.
- Static web build and Tauri desktop shell.

### Calculus I Content

The current course has three modules and 12 authored lessons:

- **Foundations:** functions, limits, one-sided limits, and infinite limits.
- **Derivatives from First Principles:** derivative as a limit, derivative at a point, constant function derivative, and differentiability vs. continuity.
- **Differentiation Rules:** power, sum/difference, product, quotient, and chain rules.

Lessons include structured objectives, graphs, worked examples, common mistakes, quizzes, summary material, glossary terms, and revision prompts.

### Reader and Accessibility

- KaTeX-backed inline and display math.
- Deterministic SVG graph blocks with axis labels and descriptions.
- Glossary popovers anchored to term segments.
- Active section tracking and visible "you are here" state.
- Worked-example step rails with action cues and final-answer bands.
- Quiz correctness communicated through icon, label, and border.
- Reader controls for font, size, line spacing, and Calm mode.

### Engineering Hygiene

- ESLint, Prettier, Vitest, jsdom, React Testing Library, and coverage gates.
- GitHub Actions for install, lint, format check, typecheck, tests, and build on `main` and `work/**`.
- Per-directory coverage thresholds for content validation and block renderers.

## Next

1. **Calculus I capstone:** add the tangent-line equation lesson that ties the differentiation rules back to first-principles derivative meaning.
2. **Desktop state tools:** add import/export flows for learner state with safe file handling.
3. **Desktop polish:** finish app icons, restored window state, recent courses, and dynamic window titles.
4. **Public presentation:** add screenshots, a short demo URL, and release notes as the public build stabilizes.
5. **Course expansion:** continue Calculus I beyond differentiation rules.

## Known Risks

- Polished mode can become too visually busy; Calm mode must remain a true peer, not a fallback.
- Schema changes can break saved progress unless migrations preserve stable IDs.
- More content increases the need for validation, focused tests, and math review.

## Done Means

Each shipped slice should keep:

- Offline behavior intact.
- Course content schema-validated.
- Math rendered without KaTeX errors.
- Keyboard and pointer flows working.
- Typecheck, lint, tests, and build green.

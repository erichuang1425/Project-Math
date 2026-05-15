# Roadmap

Project-Math is being re-thought from a single-fixture studybook into a polished MOOC-style learner app. This roadmap supersedes earlier phases; legacy phases are archived in the project history.

## Direction

A warm, polished, motivating shell for low-motivation learners (inspired by Brilliant) with a first-class **Calm mode** for low-sensory and neurodivergent learners. Content is organized as **Course → Module → Lesson → Block** and validated deterministically. Fully offline.

## Phase 0 — Reset the Rules

Status: in progress.

- Rewrite `AGENTS.md` to match the new direction (approved dep list, dual-mode design contract, MOOC content model, three concise principles). Done.
- Update `docs/roadmap.md` (this file). Done.
- Update `docs/ui-system.md` to describe Polished + Calm modes side by side.
- Update `docs/content-schema.md` to describe `Course → Module → Lesson → Block`.

What done means: any new agent reading these docs gets an unambiguous picture of the product and the rules.

## Phase 1 — Design System v2 (Polished + Calm)

Goal: a real token system and primitive library so every surface composes from the same parts.

- `src/design/tokens.css` with `:root[data-mode="polished"]` and `:root[data-mode="calm"]` themes.
- `src/design/primitives/`: `Button`, `Card`, `Pill`, `ProgressRing`, `ProgressBar`, `Stat`, `Dialog`, `Icon`.
- `src/design/illustrations/`: deterministic inline SVG motifs per course.
- `<MotionGate>` helper around `prefers-reduced-motion`.
- Strip color literals from `src/rendering/lesson.module.css`; switch `.readerPane` `max-width` to scale with text size.

What done means: every existing rendered surface still works; both modes render distinctly; reduced-motion disables transitions.

## Phase 2 — Content Schema v2 (MOOC Hierarchy)

Goal: a clean, validated `Course → Module → Lesson → Block` model.

- Move `src/studybook/` → `src/content/`. Rename `Studybook` → `Course`.
- New shapes: `Course`, `Module`, `Lesson`, `Block` (with required IDs), `Glossary`, `RichTextSegment.kind:"term"` activated.
- New `validateContent`, split into `validators/{course,module,lesson,block,glossary,prerequisites,objectives}.ts`. Paired invalid fixtures.
- One-time migration: legacy fixture re-emerged as `src/content/fixtures/courses/calculus-i.course.json`.
- `LearnerStateRepository` keyed by `courseId`; Tauri commands renamed.

What done means: validator rejects every invalid fixture and accepts the migrated course; render tests pass.

## Phase 3 — App Shell v2 (MOOC Navigation)

Goal: a real shell with Courses dashboard, Course detail, and Lesson reader.

- Decompose 760-line `App.tsx` into `Shell.tsx`, `Router.tsx`, `views/{CoursesDashboard,CourseDetail,Reader}View.tsx`, `components/{CourseCard,ContinueCard,LessonListItem,Breadcrumb,ShortcutsDialog}.tsx`.
- Hash-based routing with `routeFromHash` / `routeToHash`.
- "Continue where you left off" card; daily-progress chip; per-course progress rings.
- Keyboard shortcuts: `?` shortcut dialog, `g h` / `g c` / `g l` jumps.

What done means: dashboard → course → lesson navigation works; deep-link reload restores location; tab order matches reading order.

## Phase 4 — Content Depth (Calculus I Starter)

Goal: one real course with three modules and ten-plus lessons.

- **Module A — Foundations:** functions refresher, limits intuitively, one-sided & infinite limits.
- **Module B — Derivatives from First Principles:** derivative as a limit, derivative at a point, differentiability vs continuity, constant function derivative.
- **Module C — Differentiation Rules:** power, sum/difference, product, quotient, chain, tangent line equation (capstone).
- Glossary populated; `term` segments used throughout block text.

What done means: validator passes for the full course; every lesson mounts cleanly in jsdom; lesson summary export round-trips.

## Phase 5 — Reader Polish & Accessibility

- `vitest.config.ts` → jsdom; `@testing-library/react` adopted in the heaviest tests.
- IntersectionObserver-driven active-section indicator.
- Fix `ReaderControls.tsx` aria-labelledby conflation.
- Worked-example step rail, action-cue chips, final-answer band.
- Quiz: "Press Enter to submit" affordance; correctness via icon + label + border.
- Glossary popover from `term` segments (`<dialog>`).

What done means: reader feels finished in both modes; axe-style landmark checks pass in tests.

## Phase 6 — Desktop Polish (Tauri)

- Native menu (File / View / Help) with reader-setting shortcuts.
- New commands: `open_course_dialog`, `export_learner_state`, `import_learner_state`, with safe-slug validation.
- App icon set; window restores last position; title shows `Course — Lesson`.
- Recent courses (last 5).

What done means: open invalid file surfaces validator errors; export/import round-trips state; window restore works.

## Phase 7 — Engineering Hygiene & Agent Skills

- ESLint + Prettier; scripts `lint`, `format`, `format:check`.
- GitHub Actions: typecheck → lint → test → build.
- `@vitest/coverage-v8` thresholds: 80% in `src/content/` and `src/rendering/blocks/`.
- Agent skills: retire `ux-quality-reviewer` → relaunch as `learner-journey-reviewer`; add `motivation-ux-reviewer`; sharpen `studybook-architect` ↔ `test-and-regression-reviewer` boundary; give every skill a fixed output template.

What done means: CI green from a clean clone; agent skills don't overlap.

## Known Risks

- Polished mode risks crossing the autism-aware bar — Calm mode stays a first-class peer.
- Schema migration breaks persisted learner state — a one-shot migrator maps `studybookId` → `courseId`.
- Coverage thresholds will fail until Phase 4 content lands — keep them together in one PR.

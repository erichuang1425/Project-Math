# Roadmap

Project-Math is being re-thought from a single-fixture studybook into a polished MOOC-style learner app. This roadmap supersedes earlier phases; legacy phases are archived in the project history.

## Direction

A warm, polished, motivating shell for low-motivation learners (inspired by Brilliant) with a first-class **Calm mode** for low-sensory and neurodivergent learners. Content is organized as **Course → Module → Lesson → Block** and validated deterministically. Fully offline.

## Phase 0 — Reset the Rules

Status: done.

- Rewrote `AGENTS.md` for the new direction (approved dep list, dual-mode design contract, MOOC content model, three concise principles).
- `docs/roadmap.md`, `docs/ui-system.md`, `docs/content-schema.md` updated to the v2 model.

What done means: any new agent reading these docs gets an unambiguous picture of the product and the rules.

## Phase 1 — Design System v2 (Polished + Calm)

Status: done.

- `src/design/tokens.css` ships `:root[data-mode="polished"]` and `:root[data-mode="calm"]` themes.
- `src/design/primitives/` ships `Button`, `Card`, `Pill`, `ProgressRing`, `ProgressBar`, `Stat`, `Dialog`, `Icon`.
- `src/design/illustrations/` ships deterministic inline SVG motifs per course.
- `<MotionGate>` wraps `prefers-reduced-motion`.
- `src/rendering/lesson.module.css` is token-driven; `.readerPane` `max-width` scales with text size.

What done means: every rendered surface composes from the same parts; both modes render distinctly; reduced-motion disables transitions.

## Phase 2 — Content Schema v2 (MOOC Hierarchy)

Status: done.

- `src/studybook/` migrated to `src/content/`; `Studybook` renamed `Course`.
- `Course`, `Module`, `Lesson`, `Block`, `Glossary` shapes carry required IDs; `RichTextSegment.kind:"term"` active.
- `validateContent` covers course / module / lesson / block / glossary / prerequisites / objectives, with paired invalid fixtures.
- Legacy fixture re-emerged as `src/content/fixtures/courses/calculus-i.course.json`.
- `LearnerStateRepository` keyed by `courseId`; Tauri commands renamed.

What done means: validator rejects every invalid fixture and accepts the migrated course; render tests pass.

## Phase 3 — App Shell v2 (MOOC Navigation)

Status: done.

- `App.tsx` decomposed into `Shell.tsx`, `Router.ts`, `views/{CoursesDashboard,CourseDetail,Reader}View.tsx`, `components/{CourseCard,ContinueCard,LessonListItem,Breadcrumb,ShortcutsDialog}.tsx`.
- Hash-based routing with `routeFromHash` / `routeToHash`.
- "Continue where you left off" card; daily-progress chip; per-course progress rings.
- Keyboard shortcuts: `?` shortcut dialog, `g h` / `g c` / `g l` jumps.

What done means: dashboard → course → lesson navigation works; deep-link reload restores location; tab order matches reading order.

## Phase 4 — Content Depth (Calculus I Starter)

Status: ~33%. Two modules, four lessons of the targeted three modules / 10+ lessons.

Shipped:

- **Module A — Foundations:** `functions-refresher` with full block set (title, concept, latex, intuition, graph, worked example, common mistake, two quizzes, summary, revision layer), six new glossary terms (`function`, `input`, `output`, `domain`, `range`, `function-notation`), and the first live `term` segments in lesson body text.
- **Module B — Derivatives from First Principles:** `derivative-as-a-limit`, `derivative-at-a-point`, `constant-function-derivative` with full block sets and authored graph samples. `derivative-as-a-limit` now lists `functions-refresher` as a prerequisite, exercising the validator's cross-module prerequisite path on real content.

Open:

- **Module A — Foundations:** limits intuitively, one-sided & infinite limits.
- **Module B — Derivatives from First Principles:** add differentiability vs continuity.
- **Module C — Differentiation Rules:** power, sum/difference, product, quotient, chain, tangent line equation (capstone).
- Glossary populated; `term` segments used throughout block text. (Started: `functions-refresher` uses term segments; remaining lessons still author `term` segments lesson-by-lesson.)

What done means: validator passes for the full course; every lesson mounts cleanly in jsdom; lesson summary export round-trips.

## Phase 5 — Reader Polish & Accessibility

Status: partial.

Shipped:

- `vitest.config.ts` → jsdom; `@testing-library/react` adopted in the heaviest tests.
- Lesson-graph blocks land with title-specific focusable SVGs and annotation details.
- Quiz status text is explicit for unselected / ready-to-check / correct / review states.
- Glossary popover anchored to `term` segments: non-modal `<dialog>` with viewport-edge flipping, focus return on every close path (ESC, X button, outside click, scroll), Calm-mode parity (no animation, no shadow), and full test coverage across `RichText`, `GlossaryPopover`, `GlossaryContext`, the `popoverPosition` helper, and the shared `Dialog` primitive.
- `ReaderControls.tsx` aria-labelledby conflation fixed: the disclosure `<summary>` carries a stable `aria-label="Reader controls"` so its accessible name no longer mutates with each live-status update, the panel no longer borrows the trigger's heading id as its label, and the intro copy is now `aria-describedby`'d onto the inner `<fieldset>` that actually groups the controls. Regression tests in `ReaderControls.test.tsx` guard the stable label, the absence of `aria-labelledby="reader-controls-heading"`, and the fieldset description wiring.
- IntersectionObserver-driven active-section indicator extracted into `useActiveSection` (`src/rendering/useActiveSection.ts`): first section active on mount, topmost intersecting section wins on scroll, `initialSectionId` deep-links resume by scrolling and marking that section active, observer disconnects on unmount. Side-nav `aria-current="step"` flips with the observer, the active entry now carries a visible "You are here" pill, and a visually-hidden `aria-live="polite"` region in the path nav announces `"Now reading step N of M: <title>"` on every subsequent change (initial mount stays silent so screen readers don't double-announce the lesson heading). Covered by `src/rendering/__tests__/useActiveSection.test.tsx` (9 hook-level cases) and `src/rendering/__tests__/LessonView.activeSection.test.tsx` (4 integration cases) using a mock IntersectionObserver.
- Worked-example step rail + action-cue chips + final-answer band. `WorkedStep` gained optional `actionCue` (short verb-like cue, ≤32 chars) and `WorkedExampleBlock` gained optional `finalAnswer: { latex; summary? }`. The renderer surfaces `actionCue` as a small chip on every step pill (`aria-hidden`, so the pill's accessible name stays the label) and as a labelled "Action" chip inside the active step panel. The `finalAnswer` band renders as an `aside` with `aria-label="Final answer"`, a correct-color border-left, a prominent KaTeX block, and an optional summary line — distinct from `interpretation`, which stays a prose sentence about meaning. Validator now rejects an actionCue that is not a non-empty string or exceeds 32 chars, a non-object finalAnswer, a finalAnswer.latex that fails KaTeX, and a non-string finalAnswer.summary. All 5 worked examples in `calculus-i.course.json` and the minimal-course fixture exercise the new fields end-to-end.
- Quiz: form-wrapped "Press Enter to submit" affordance + correctness via icon + label + border. Each question now lives inside a `<form>` whose `onKeyDown` intercepts Enter (no shift/ctrl/meta/alt) and calls `onSubmit` only when there is a valid pending answer — Enter from a focused option button no longer reselects, and Enter from the short-answer input no longer triggers a stray native submit. The Check-answer button became `type="submit"` with `aria-keyshortcuts="Enter"`, and a visible `Press ⌨ Enter to submit` hint (sub-muted, with a `<kbd>` glyph) shows next to it while the answer is pending and disappears on submit. Correctness signals now ship all three required cues: lucide `Check` / `AlertCircle` icons sit inside the "Correct answer" / "Your answer" option pills and inside the feedback panel, paired with the existing bold "Correct." / "Review." labels and the correct-/incorrect-color border-left. Tests cover Enter-submits from option focus across siblings, Enter no-op before any answer, modifier-Enter no-op, Enter from the short-answer input, hint visibility transitions, and feedback/option icons in both correct and review states.

What done means: reader feels finished in both modes; axe-style landmark checks pass in tests.

## Phase 6 — Desktop Polish (Tauri)

Status: partial.

Shipped:

- Native menu events wired through `src/app/tauriMenu.ts` (toggle mode / low-glare, set text size / line spacing / font, open shortcuts, go to dashboard, export summary).

Open:

- File / View / Help menu actually emitted from the Rust side with reader-setting shortcuts.
- New commands: `open_course_dialog`, `export_learner_state`, `import_learner_state`, with safe-slug validation.
- App icon set; window restores last position; title shows `Course — Lesson`.
- Recent courses (last 5).

What done means: opening an invalid file surfaces validator errors; export/import round-trips state; window restore works.

## Phase 7 — Engineering Hygiene & Agent Skills

Status: done.

Shipped:

- ESLint + Prettier; scripts `lint`, `format`, `format:check`.
- GitHub Actions: typecheck → lint → test → build, runs on `main` and `claude/**`.
- `@vitest/coverage-v8` wired with a 60% global floor across lines / statements / branches / functions.
- **Skill retire and relaunch.** Deleted `.agents/skills/ux-quality-reviewer/`. Added `.agents/skills/learner-journey-reviewer/` (pacing and cohesion across Course → Module → Lesson → Block, "what comes next" framing) and `.agents/skills/motivation-ux-reviewer/` (motivation cues for low-motivation and neurodivergent learners, Calm-mode parity). Each carries an explicit "Out of Scope" section pointing at the neighbouring skills.
- **Sharpened `studybook-architect` ↔ `test-and-regression-reviewer` boundary.** Both skills now carry an "Out of Scope" section: `studybook-architect` recommends tests but hands them off; `test-and-regression-reviewer` recommends fixture-shape changes back instead of redesigning the schema.
- **Fixed Output Template across every skill.** Every `SKILL.md` ends with the same sections: Files touched · Risks / non-obvious interactions · Tests added or run · Remaining work · What done means recap.
- **Per-directory coverage thresholds.** `vitest.config.ts` enforces 80% lines / statements / branches / functions on `src/content/**` and `src/rendering/blocks/**`, with the 60% global floor unchanged elsewhere.
- **Coverage gaps closed.** Direct unit tests for `courseHelpers.ts` (every exported helper, including edge cases for `neighborLessons`, `isLessonBlocked`, and empty-module courses) plus `isBlockOfType`. Eleven new invalid-fixture variants in `validateContent.test.ts` exercising LaTeX `display` typing, rich-text segment kinds, term-id kebab-case, quiz kinds, short-answer feedback, graph series kinds (points / line / unknown), function-sample length, annotation uniqueness, duplicate block ids, and revision layer shape. Direct render tests per block view in `src/rendering/blocks/__tests__/`: every optional branch (kicker / subtitle / objectives, keyIdeas, takeaway, caption, annotations, checkPrompt, given, interpretation) plus interactive flows (worked-example step navigation and tab jumps; quiz unselected / selected / correct / incorrect / retry / hint / saved-attempt singular and plural; short-answer whitespace gating). Coverage now sits at `src/content/**` 90.76 / 80.67 / 100 / 90.76 and `src/rendering/blocks/**` 99.77 / 98.37 / 100 / 99.77.

What done means: CI green from a clean clone with the new per-directory thresholds; ten skills with no overlap and identical output templates.

## Known Risks

- Polished mode risks crossing the autism-aware bar — Calm mode stays a first-class peer.
- Schema migration breaks persisted learner state — a one-shot migrator maps `studybookId` → `courseId`.
- Tightening coverage on `src/rendering/blocks/` before block tests land would red-CI the repo — land thresholds and per-block tests in the same PR.

## Queue

Next vertical slices, smallest first. Each row is intended as a single PR.

1. Phase 4 — Author `term` segments across the remaining authored lessons (`derivative-as-a-limit`, `derivative-at-a-point`, `constant-function-derivative`).
2. Phase 4 — Module A: limits intuitively, one-sided & infinite limits.
3. Phase 4 — Module B: differentiability vs continuity.
4. Phase 4 — Module C: power, sum/difference, product, quotient, chain, tangent-line capstone.
5. Phase 6 — Rust-side File / View / Help menu emission with reader-setting shortcuts.
6. Phase 6 — `open_course_dialog`, `export_learner_state`, `import_learner_state` with safe-slug validation.
7. Phase 6 — App icon set, window restore, dynamic title (`Course — Lesson`), recent courses (last 5).

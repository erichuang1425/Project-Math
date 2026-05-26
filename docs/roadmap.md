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

Status: ~80%. Three modules, ten lessons of the targeted three modules / 10+ lessons.

Shipped:

- **Module A — Foundations:** `functions-refresher` with full block set (title, concept, latex, intuition, graph, worked example, common mistake, two quizzes, summary, revision layer), six new glossary terms (`function`, `input`, `output`, `domain`, `range`, `function-notation`), and the first live `term` segments in lesson body text.
- **Module A — Foundations:** `limits-intuitively` with full block set (title, concept, latex, two intuition blocks, two graphs, two worked examples with `actionCue` chips and `finalAnswer` bands, two common mistakes, three-question quiz, summary, revision layer). The two worked examples cover a linear limit and a removable-discontinuity limit (`(x^2 − 4)/(x − 2)` at `x = 2`), establishing that a limit can exist where the function is undefined. `limits-intuitively` requires `functions-refresher`, and `derivative-as-a-limit` now requires `["functions-refresher", "limits-intuitively"]`, so the first-principles definition rests on an authored intuitive notion of a limit instead of an unsupported reference.
- **Module A — Foundations:** `one-sided-and-infinite-limits` with full block set (title, concept, latex, two intuition blocks, two graphs, two worked examples with `actionCue` chips and `finalAnswer` bands, two common mistakes, three-question quiz, summary, revision layer). The two worked examples cover the sign function `x/|x|` at `x = 0` (one-sided limits exist but disagree, so the two-sided limit does not exist) and `1/x^2` at `x = 0` (both sides head to `+∞`, recorded as an infinite limit). Four new glossary terms ship: `one-sided-limit`, `infinite-limit`, `vertical-asymptote`, `jump-discontinuity`. The lesson requires `["functions-refresher", "limits-intuitively"]` and sits as a Foundations sibling of `limits-intuitively`, so the existing `functions-refresher → limits-intuitively → derivative-as-a-limit` path stays unblocked.
- **Module B — Derivatives from First Principles:** `derivative-as-a-limit`, `derivative-at-a-point`, `constant-function-derivative` with full block sets and authored graph samples.
- **Module B — Derivatives from First Principles:** `differentiability-vs-continuity` with full block set (title, concept, latex, three intuition blocks, two graphs, two worked examples with `actionCue` chips and `finalAnswer` bands, one common mistake, three-question quiz, summary, revision layer). The two worked examples first confirm `f(x) = |x|` is continuous at `x = 0` via one-sided limits, then test `f'(0)` by computing the left and right difference quotients (`-1` and `+1`) and recording that the two-sided limit does not exist. The lesson requires `["one-sided-and-infinite-limits", "derivative-as-a-limit"]` and reuses existing glossary entries (`continuity`, `differentiability`, `difference-quotient`, `function`, `output`, `limit`, `one-sided-limit`) — no new terms — so a continuous-but-not-differentiable case lands without expanding the vocabulary surface.
- **Glossary `term` segments authored across every existing lesson.** All authored lessons surface live `term` segments in concept / intuition / summary block prose. Regression test `authors term segments in every lesson, including the first-principles trio` in `src/content/__tests__/calculusI.test.ts` walks every lesson, asserts every lesson carries at least one `term` segment, and pins per-lesson minimums for `limits-intuitively`, `one-sided-and-infinite-limits`, the first-principles trio, and `differentiability-vs-continuity` so the wiring cannot silently revert to plain text.
- **Module C — Differentiation Rules:** `power-rule` with full block set (title, concept, latex, two intuition blocks, two graphs, four worked examples with `actionCue` chips and `finalAnswer` bands, two common mistakes, three-question quiz, summary, revision layer). The first worked example derives `d/dx(x^2) = 2x` from first principles (expand, cancel, factor, limit). The second derives `d/dx(x^3) = 3x^2` the same way, revealing the n · x^(n−1) pattern. The third and fourth apply the shortcut to `x^5` and `x^1`. Three new glossary terms ship: `power-rule`, `exponent`, `polynomial`. The lesson requires `["derivative-as-a-limit"]`, connecting back to Module B. The `differentiation-rules` module is introduced with the power rule as its first lesson.

- **Module C — Differentiation Rules:** `sum-difference-rule` with full block set (title, concept, latex, two intuition blocks, two graphs, four worked examples with `actionCue` chips and `finalAnswer` bands, two common mistakes, three-question quiz, summary, revision layer). The first worked example applies the constant multiple rule to `5x³`. The second derives the sum rule from the limit definition in six steps (define, substitute, regroup, split, limit law, recognise). The third and fourth apply the sum/difference/constant-multiple rules to polynomials (`x³ − x²` and `3x⁴ + 2x³ − x`). Two new glossary terms ship: `sum-rule`, `constant-multiple-rule`. The lesson requires `["power-rule"]`, extending the Module C chain.

- **Module C — Differentiation Rules:** `product-rule` with full block set (title, concept, two intuition blocks, two graphs, three worked examples with `actionCue` chips and `finalAnswer` bands plus a first-principles derivation worked example, two common mistakes, three-question quiz, summary, revision layer). The derivation adds and subtracts `f(x+h)·g(x)` in the difference quotient to separate the two rates of change in five steps. The three application examples cover `x²(3x + 1)`, `(x² + 1)(x³ − x)` (with expand-first verification), and `(2x + 3)(x² − 5)`. The expanding-rectangle intuition block gives a geometric interpretation. One new glossary term ships: `product-rule`. The lesson requires `["sum-difference-rule"]`, extending the Module C chain.

Open:

- **Module C — Differentiation Rules:** quotient, chain, tangent line equation (capstone).

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

1. ~~Phase 4 — Module C kickoff: introduce the `differentiation-rules` module and author the power rule lesson.~~ Done.
2. ~~Phase 4 — Module C: sum/difference rule lesson.~~ Done.
3. ~~Phase 4 — Module C: product rule lesson.~~ Done.
4. Phase 4 — Module C: quotient rule lesson.
5. Phase 4 — Module C: chain rule lesson.
6. Phase 4 — Module C: tangent-line equation capstone (uses every rule above; ties back to the first-principles definition of the derivative).
7. Phase 6 — accelerators on the Rust-side reader submenu items (text size, line spacing, font). Note: the File / View / Help menu is already built and `menu:*` events already emit from `src-tauri/src/lib.rs:96-201`; only the submenu accelerators are missing.
8. Phase 6 — `open_course_dialog`, `export_learner_state`, `import_learner_state` with safe-slug validation.
9. Phase 6 — App icon set, window restore, dynamic title (`Course — Lesson`), recent courses (last 5).

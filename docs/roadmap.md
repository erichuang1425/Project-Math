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

Status: ~25%. One module, three lessons of the targeted three modules / 10+ lessons.

Shipped:

- **Module B — Derivatives from First Principles:** `derivative-as-a-limit`, `derivative-at-a-point`, `constant-function-derivative` with full block sets and authored graph samples.

Open:

- **Module A — Foundations:** functions refresher, limits intuitively, one-sided & infinite limits.
- **Module B — Derivatives from First Principles:** add differentiability vs continuity.
- **Module C — Differentiation Rules:** power, sum/difference, product, quotient, chain, tangent line equation (capstone).
- Glossary populated; `term` segments used throughout block text.

What done means: validator passes for the full course; every lesson mounts cleanly in jsdom; lesson summary export round-trips.

## Phase 5 — Reader Polish & Accessibility

Status: partial.

Shipped:

- `vitest.config.ts` → jsdom; `@testing-library/react` adopted in the heaviest tests.
- Lesson-graph blocks land with title-specific focusable SVGs and annotation details.
- Quiz status text is explicit for unselected / ready-to-check / correct / review states.

Open:

- Fix `ReaderControls.tsx` aria-labelledby conflation.
- IntersectionObserver-driven active-section indicator.
- Worked-example step rail, action-cue chips, final-answer band.
- Quiz: "Press Enter to submit" affordance; correctness via icon + label + border.
- Glossary popover from `term` segments (`<dialog>`).

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

Status: in progress (next slice).

Shipped:

- ESLint + Prettier; scripts `lint`, `format`, `format:check`.
- GitHub Actions: typecheck → lint → test → build, runs on `main` and `claude/**`.
- `@vitest/coverage-v8` wired with a 60% global floor across lines / statements / branches / functions.
- **Skill retire and relaunch.** Deleted `.agents/skills/ux-quality-reviewer/`. Added `.agents/skills/learner-journey-reviewer/` (pacing and cohesion across Course → Module → Lesson → Block, "what comes next" framing) and `.agents/skills/motivation-ux-reviewer/` (motivation cues for low-motivation and neurodivergent learners, Calm-mode parity). Each carries an explicit "Out of Scope" section pointing at the neighbouring skills.
- **Sharpened `studybook-architect` ↔ `test-and-regression-reviewer` boundary.** Both skills now carry an "Out of Scope" section: `studybook-architect` recommends tests but hands them off; `test-and-regression-reviewer` recommends fixture-shape changes back instead of redesigning the schema.
- **Fixed Output Template across every skill.** Every `SKILL.md` ends with the same sections: Files touched · Risks / non-obvious interactions · Tests added or run · Remaining work · What done means recap.

Open (next slice):

1. **Per-directory coverage thresholds.** Add 80% gates in `vitest.config.ts` for `src/content/**` and `src/rendering/blocks/**`, keep the 60% global floor for the rest.
2. **Close the coverage gaps to clear those gates.**
   - `src/content/courseHelpers.ts`: direct unit tests for the progress / continue-lesson / lesson-look-up helpers (currently only exercised transitively).
   - `src/content/validateContent.ts`: invalid-fixture variants for any uncovered validator branches (run coverage first, then patch the uncovered branches).
   - `src/rendering/blocks/`: direct render tests per block view (`QuizBlockView` retry / correct / incorrect, `WorkedExampleBlockView` final-answer band, `GraphBlockView` annotations, `CommonMistakeBlockView`, `IntuitionBlockView`, `LatexBlockView`, `TitleBlockView`, `SummaryBlockView`, `ConceptBlockView`). Tests should mount the view directly with a deterministic block fixture, not go through the whole lesson.

What done means: CI green from a clean clone with the new per-directory thresholds; ten skills with no overlap and identical output templates.

## Known Risks

- Polished mode risks crossing the autism-aware bar — Calm mode stays a first-class peer.
- Schema migration breaks persisted learner state — a one-shot migrator maps `studybookId` → `courseId`.
- Tightening coverage on `src/rendering/blocks/` before block tests land would red-CI the repo — land thresholds and per-block tests in the same PR.

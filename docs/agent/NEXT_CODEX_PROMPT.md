# Next Codex Prompt

## Previous Prompt

```txt
Use AGENTS.md and the relevant Project Math skills.

Review the dashboard-first app-shell slice, then implement only the next narrow revision needed from that review.

Current state:
- The app remains a local-first deterministic React/Vite/Tauri studybook.
- Lesson content still flows through studybook JSON -> validation -> reusable block renderer.
- No new runtime dependencies, graphing libraries, fonts, UI frameworks, AI, sync, accounts, telemetry, database, PDF, or document dependencies were added.
- The only bundled studybook/course is the validated `Derivatives from First Principles` studybook.
- The app now opens to a dashboard-first shell.
- The dashboard presents Project Math identity, local-first/offline status, the existing studybook as the first course, completed-lessons progress, a lesson sequence, selected/current/completed/not-started text labels, and material summaries derived from existing in-app lesson resources.
- Selecting a lesson on the dashboard sets the local app-shell selection, and the primary action opens the existing reader experience for that lesson.
- The reader view keeps the existing lesson workspace, sidebar lesson progress, collapsible reader controls, sticky lesson path, graph/quiz/export behavior, and includes a keyboard/pointer accessible `Back to dashboard` route.
- "Course" still means a dashboard presentation of the existing studybook. "Materials" still means existing in-app lesson resources: objectives, sections, graph blocks, worked examples, common mistakes, quizzes, summaries, and export actions.
- The untracked `External material/` PDFs were intentionally not ingested or modeled.

Important workflow rule:
Do not create or update docs/agent/CODEX_PROMPT_QUEUE.md.
Keep the durable fresh-thread prompt in docs/agent/NEXT_CODEX_PROMPT.md.

Before editing:
1. Inspect the repo with literal-path handling.
2. Load AGENTS.md and the relevant local skills:
   - frontend-visual-system-designer
   - neurodivergent-learning-accessibility-reviewer
   - ux-quality-reviewer
   - design-token-architect if CSS variables or state tokens change
   - studybook-architect if lesson content or renderer contracts change
   - math-rendering-reviewer if graph/math content changes
   - test-and-regression-reviewer
   - frontend-regression-visual-qa
3. Read:
   - docs/agent/PROJECT_STATE.md
   - docs/agent/NEXT_CODEX_PROMPT.md
   - docs/architecture.md
   - docs/learning-design.md
   - docs/ui-system.md
   - docs/roadmap.md
   - docs/testing-strategy.md
   - src/app/App.tsx
   - src/app/App.module.css
   - src/app/App.test.tsx
   - src/app/ReaderControls.tsx
   - src/rendering/LessonView.tsx
   - src/rendering/lesson.module.css
   - src/rendering/sampleContentRenderable.test.tsx if reader integration expectations change
4. Summarize the review target or newest user feedback and propose a concise plan with exact files to change before editing.

Scope:
1. If the user gives concrete dashboard/navigation/layout/accessibility feedback, revise only the affected app shell, focused tests, CSS, and durable docs.
2. If no concrete feedback is given, run visual QA of the dashboard and reader at narrow and wide desktop sizes and fix only clear regressions such as overflow, overlap, clipped controls, unclear state text, or poor focus order.
3. Do not add a `Course` schema, `Material` schema, PDF ingestion, new content files, new curriculum lessons, routing dependency, runtime dependency, font package, UI framework, graphing library, database, sync, AI, accounts, telemetry, document dependency, or PDF dependency.
4. Preserve structured studybook content and stable IDs. If a schema/content edit seems necessary, stop and document the blocker instead of broadening the slice.

Done criteria:
1. Dashboard and reader navigation remain predictable and keyboard/pointer accessible.
2. State is explicit in text and not color-only.
3. Dashboard and reader layouts work at narrow and wide desktop sizes without overflow, overlap, or clipped controls.
4. Existing lesson reader, `LessonView`, `BlockRenderer`, quiz behavior, graph rendering, export behavior, and reader controls remain deterministic and offline.
5. Tests cover changed behavior at the lowest useful layer.
6. Run npm.cmd run typecheck, npm.cmd test, npm.cmd run build, and git diff --check, or document exact blockers.
7. Run or document the local preview smoke path at http://127.0.0.1:4173.
8. Update docs/agent/NEXT_CODEX_PROMPT.md with this previous prompt and the exact next fresh-thread prompt.
```

## Next Prompt

```txt
Use AGENTS.md and the relevant Project Math skills.

Implement the Phase 7 — Engineering Hygiene & Agent Skills slice as described in docs/roadmap.md. Land it in one PR so coverage thresholds and the tests that satisfy them go in together.

Current state:
- The app remains a local-first deterministic React/Vite/Tauri studybook.
- Content is the v2 Course → Module → Lesson → Block model under `src/content/`, with one bundled course `calculus-i` (one module, three lessons).
- The app shell is decomposed into Shell + Router + views/components; hash routing works.
- ESLint, Prettier, and a CI workflow (typecheck → lint → test → build) are in place.
- Vitest runs in jsdom with `@vitest/coverage-v8` at a 60% global floor on lines / statements / branches / functions.
- Existing skills under `.agents/skills/` are: design-token-architect, desktop-app-engineer, frontend-regression-visual-qa, frontend-visual-system-designer, math-rendering-reviewer, neurodivergent-learning-accessibility-reviewer, studybook-architect, test-and-regression-reviewer, ux-quality-reviewer.

Important workflow rule:
Do not create or update docs/agent/CODEX_PROMPT_QUEUE.md.
Keep the durable fresh-thread prompt in docs/agent/NEXT_CODEX_PROMPT.md.

Before editing:
1. Inspect the repo with literal-path handling.
2. Load AGENTS.md and the relevant local skills:
   - test-and-regression-reviewer
   - studybook-architect (for any fixture used in block tests)
   - frontend-regression-visual-qa (for block render tests)
   - math-rendering-reviewer (if a block test touches LaTeX/graph output)
3. Read:
   - docs/agent/PROJECT_STATE.md
   - docs/agent/NEXT_CODEX_PROMPT.md
   - docs/architecture.md
   - docs/content-schema.md
   - docs/testing-strategy.md
   - docs/roadmap.md (Phase 7 in particular)
   - vitest.config.ts
   - src/content/courseHelpers.ts
   - src/content/validateContent.ts
   - src/content/__tests__/*.ts
   - src/rendering/blocks/*.tsx
   - src/rendering/sampleContentRenderable.test.tsx
   - every `.agents/skills/*/SKILL.md`
4. Run `npm run test:coverage` once to capture the current per-file coverage baseline before adding tests. Note which lines/branches in `src/content/courseHelpers.ts`, `src/content/validateContent.ts`, and `src/rendering/blocks/*` are uncovered.
5. Propose a concise plan with exact files to change before editing.

Scope (Phase 7 only — do not broaden):

A. Per-directory coverage thresholds.
1. Edit `vitest.config.ts` so coverage thresholds use per-path overrides:
   - `src/content/**`: 80 / 80 / 80 / 80
   - `src/rendering/blocks/**`: 80 / 80 / 80 / 80
   - Default (everything else under `src/**`): keep at 60 / 60 / 60 / 60.
2. Use whatever per-path mechanism Vitest 2.x supports (`thresholds["src/content/**"]` keys). If the version in this repo does not support that, document the blocker in the PR and ship per-file `coverage` ignore or a top-level `perFile` threshold instead — do not weaken the global floor.

B. Tests to close the new gates.
3. Add `src/content/__tests__/courseHelpers.test.ts` covering every exported helper in `src/content/courseHelpers.ts` (progress, continue-lesson lookup, lesson-by-id, etc.) with deterministic fixtures.
4. Extend or split `src/content/__tests__/validateContent.test.ts` so every branch flagged uncovered by coverage gets a paired invalid fixture failing for ONE primary reason. Do not soften error messages.
5. Add `src/rendering/blocks/__tests__/*.test.tsx` files — one per block view — mounting the view directly with a minimal `Block` fixture. Cover the previously uncovered branches: `QuizBlockView` (retry, correct, incorrect, ready-to-check, unselected), `WorkedExampleBlockView` (final-answer band on/off), `GraphBlockView` (annotations on/off), and one happy-path test for each of `CommonMistakeBlockView`, `IntuitionBlockView`, `LatexBlockView`, `TitleBlockView`, `SummaryBlockView`, `ConceptBlockView`.
6. Do not touch `sampleContentRenderable.test.tsx` other than to delete duplicates if a per-block test fully supersedes them.

C. Skill retire / relaunch.
7. Delete `.agents/skills/ux-quality-reviewer/` (the entire directory).
8. Add `.agents/skills/learner-journey-reviewer/SKILL.md`. Scope: learner pacing and cohesion across Course → Module → Lesson → Block; "what comes next" framing; motivation arc. Explicit Out of Scope: visual polish (handled by frontend-visual-system-designer).
9. Add `.agents/skills/motivation-ux-reviewer/SKILL.md`. Scope: motivation cues for low-motivation and neurodivergent learners — progress feedback, partway-through framing, calm encouragement vs. urgency, Calm-mode parity. Explicit Out of Scope: cognitive accessibility audits (handled by neurodivergent-learning-accessibility-reviewer).
10. Add an "Out of Scope" section to `.agents/skills/studybook-architect/SKILL.md` ("does not write the tests, recommends them") and `.agents/skills/test-and-regression-reviewer/SKILL.md` ("does not redesign schemas, recommends fixture-shape changes back").
11. Standardize every `SKILL.md` to end with the same fixed Output Template section:
    - Files touched
    - Risks / non-obvious interactions
    - Tests added or run
    - Remaining work
    - What done means recap

D. Docs.
12. Update `docs/roadmap.md` Phase 7 status from "in progress (next slice)" to "done" once everything above lands.
13. Update `docs/agent/PROJECT_STATE.md`: current slice, next task, decisions reflecting the new thresholds and skill set.
14. Rotate `docs/agent/NEXT_CODEX_PROMPT.md`: move this prompt into "Previous Prompt"; the new "Next Prompt" should plan the first Phase 4 content slice (Module A — Foundations, lesson 1: functions refresher).

Out of scope (defer):
- Adding `Module A` content lessons.
- Phase 5 reader polish items (aria-labelledby fix, IntersectionObserver active section, glossary popover).
- Phase 6 Tauri commands (`open_course_dialog`, export/import, window restore, recent courses).
- Any runtime dependency, font, UI framework, graphing library, database, sync, AI, accounts, telemetry, document, or PDF dependency.

Done criteria:
1. `npm run test:coverage` is green with 80/80/80/80 enforced on `src/content/**` and `src/rendering/blocks/**`, and 60/60/60/60 on the rest.
2. Every block view has a direct render test in `src/rendering/blocks/__tests__/`.
3. `courseHelpers` has a dedicated test file, and every branch in `validateContent.ts` is covered.
4. `.agents/skills/` lists nine skills: design-token-architect, desktop-app-engineer, frontend-regression-visual-qa, frontend-visual-system-designer, learner-journey-reviewer, math-rendering-reviewer, motivation-ux-reviewer, neurodivergent-learning-accessibility-reviewer, studybook-architect, test-and-regression-reviewer — and `ux-quality-reviewer` is removed. (Yes, that is ten counting the two new + eight retained minus one retired; confirm the final count and update AGENTS.md if it names skills.)
5. Every `SKILL.md` ends with the same five-section Output Template.
6. `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm run test`, `npm run build`, and `git diff --check` all pass (or exact blockers are documented).
7. `docs/roadmap.md` Phase 7 is marked done; `docs/agent/PROJECT_STATE.md` is current; `docs/agent/NEXT_CODEX_PROMPT.md` rotated.
```

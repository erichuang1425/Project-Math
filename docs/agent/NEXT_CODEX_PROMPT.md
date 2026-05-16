# Next Codex Prompt

## Previous Prompt

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

## Next Prompt

```txt
Use AGENTS.md and the relevant Project Math skills.

Implement the next Phase 4 — Content Depth slice: author Module A lesson 2, `limits-intuitively`, as the second foundations lesson. Land it in one PR with content, docs, and the prerequisite wiring it enables.

Current state:
- The app remains a local-first deterministic React/Vite/Tauri studybook.
- Content is the v2 Course → Module → Lesson → Block model under `src/content/`, with one bundled course `calculus-i`.
- Calculus I now has two modules: `foundations` (1 lesson, `functions-refresher`) and `first-principles` (3 lessons). Four lessons total.
- `functions-refresher` is authored in the approved autism-aware style: title → concept → latex → intuition → graph → intuition (compare) → worked example → common mistake → intuition (pause) → quiz (multipleChoice) → quiz (shortAnswer) → summary, plus a revision layer.
- `derivative-as-a-limit.prerequisiteLessonIds` lists `["functions-refresher"]` — the first real cross-module prerequisite edge.
- Glossary now includes `function`, `input`, `output`, `domain`, `range`, `function-notation` alongside the original derivatives terms. `term` segments are used live in `functions-refresher` body text.
- ESLint, Prettier, CI, jsdom Vitest, and 80% per-directory coverage gates on `src/content/**` and `src/rendering/blocks/**` are in place. 60% global floor everywhere else.

Important workflow rule:
Do not create or update docs/agent/CODEX_PROMPT_QUEUE.md.
Keep the durable fresh-thread prompt in docs/agent/NEXT_CODEX_PROMPT.md.

Before editing:
1. Inspect the repo with literal-path handling.
2. Load AGENTS.md and the relevant local skills:
   - studybook-architect
   - learner-journey-reviewer
   - motivation-ux-reviewer
   - neurodivergent-learning-accessibility-reviewer
   - math-rendering-reviewer
   - test-and-regression-reviewer
3. Read:
   - docs/agent/PROJECT_STATE.md
   - docs/agent/NEXT_CODEX_PROMPT.md
   - docs/learning-design.md (autism-aware micro-flow)
   - docs/content-schema.md (sections-with-blocks shape)
   - docs/roadmap.md (Phase 4 in particular)
   - src/content/schema.ts
   - src/content/validateContent.ts
   - src/content/fixtures/courses/calculus-i.course.json (note `functions-refresher` as the structural reference)
   - src/content/__tests__/calculusI.test.ts
4. Propose a concise plan with exact files to change before editing.

Scope (Phase 4, Module A lesson 2 only — do not broaden):

A. Lesson content — `src/content/fixtures/courses/calculus-i.course.json`.
1. Append a second lesson `limits-intuitively` to the existing `foundations` module, after `functions-refresher`. Keep `functions-refresher` unchanged.
2. Mirror the `functions-refresher` block ordering and autism-aware micro-flow (Observe → Predict → Calculate → Compare → Answer → Summarize):
   - Section 1 "Observe and predict": title, concept (uses `term` segments for `limit`, `function`, `input`, `output`), latex (display) showing `lim_{x→a} f(x)`, intuition, graph showing a function approaching a value at an input not in the rule (a deterministic samples array, axes, ticks, two annotated points before and after the target input).
   - Section 2 "Read and compare": worked example computing a limit by table of values for `f(x) = (x^2 - 1)/(x - 1)` near `x = 1`, common mistake (substituting the undefined input directly), intuition (pause prompt), quiz multipleChoice (which value is the limit), quiz shortAnswer (state the limit value), summary, revision layer.
3. Use only existing block types and the existing `limit` glossary term plus any of the new `function*` terms. Do not add glossary entries unless a new term is referenced in body text by a `term` segment; if you add one, mirror the structure of `function-notation`.
4. Stable kebab-case IDs everywhere. Keep `prerequisiteLessonIds: ["functions-refresher"]` on `limits-intuitively`.
5. After authoring, update `derivative-as-a-limit.prerequisiteLessonIds` to `["functions-refresher", "limits-intuitively"]`.

B. Tests.
6. Update `src/content/__tests__/calculusI.test.ts` so the lesson-order assertion lists five lessons in the new order, the total-lesson assertion is `5`, and the prerequisite assertion on `derivative-as-a-limit` lists both prerequisites.
7. Do not add new block-view test files for a content-only slice. If coverage on `src/content/**` drops below 80% because of newly exercised validator branches, add the minimum invalid fixture (single primary failure reason) to `validateContent.test.ts` to close the branch.

C. Docs.
8. `docs/roadmap.md` Phase 4: bump shipped count and move `limits intuitively` from Open to Shipped.
9. `docs/agent/PROJECT_STATE.md`: update Current Slice and Next Task (Module A lesson 3, `one-sided-and-infinite-limits`).
10. Rotate `docs/agent/NEXT_CODEX_PROMPT.md`: move this prompt into "Previous Prompt"; the new "Next Prompt" should plan Module A lesson 3 with the same structural rules.

Out of scope (defer):
- Module A lesson 3 (one-sided and infinite limits).
- Module B `differentiability-vs-continuity` lesson.
- Module C lessons.
- Reader polish (Phase 5).
- Tauri commands (Phase 6).
- Any new block type, runtime dependency, schema field, font, UI framework, graphing library, database, sync, AI, accounts, telemetry, document, or PDF dependency.

Done criteria:
1. `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm run test`, `npm run test:coverage`, `npm run build`, and `git diff --check` all pass (or exact blockers are documented).
2. `calculus-i` has five lessons across two modules; the validator accepts the course; `derivative-as-a-limit` requires both foundations lessons.
3. `limits-intuitively` mounts cleanly in `sampleContentRenderable.test.tsx` (and any per-block tests still pass without changes).
4. `docs/roadmap.md`, `docs/agent/PROJECT_STATE.md`, and `docs/agent/NEXT_CODEX_PROMPT.md` are in sync with the code.
```

# Next Codex Prompt

## Previous Prompt

```txt
Use AGENTS.md and the relevant Project Math skills.

Implement the next Phase 4 — Content Depth slice: author Module B lesson 4,
`differentiability-vs-continuity`, as the closing Module B lesson. Land it in
one PR with content, docs, and the prerequisite wiring it requires.

Current state:
- The app remains a local-first deterministic React/Vite/Tauri studybook.
- Content is the v2 Course → Module → Lesson → Block model under `src/content/`, with one bundled course `calculus-i`.
- Calculus I has two modules: `foundations` (3 lessons: `functions-refresher`, `limits-intuitively`, `one-sided-and-infinite-limits`) and `first-principles` (3 lessons: `derivative-as-a-limit`, `derivative-at-a-point`, `constant-function-derivative`). Six lessons total.
- The autism-aware lesson micro-flow (Observe → Predict → Calculate → Compare → Answer → Summarize) is the approved default style.
- `actionCue` chips and `finalAnswer` bands ship on every worked example.
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
   - src/content/fixtures/courses/calculus-i.course.json (note `constant-function-derivative` as the structural reference)
   - src/content/__tests__/calculusI.test.ts
4. Propose a concise plan with exact files to change before editing.

Scope (Phase 4, Module B lesson 4 only — do not broaden):

A. Lesson content — `src/content/fixtures/courses/calculus-i.course.json`.
1. Append a fourth lesson `differentiability-vs-continuity` to the existing
   `first-principles` module, after `constant-function-derivative`. Keep every
   existing lesson unchanged.
2. Mirror the established two-section autism-aware ordering:
   - Section 1 "Observe Two Demands": title, concept (uses `term` segments for
     `function`, `continuity`, `limit`, `output`, `differentiability`,
     `difference-quotient`), latex (display) showing the continuity definition
     `lim_{x→a} f(x) = f(a)`, intuition (predict), graph of `y = |x|` with the
     corner annotated and two secant lines (slopes `-1` and `+1`), intuition
     (compare graph to demands).
   - Section 2 "Test the Corner": worked example confirming `f(x) = |x|` is
     continuous at `x = 0` (using one-sided limits), worked example computing
     left and right difference quotients `|h|/h` and recording the limit DNE,
     comparison graph of `y = x^2` vs `y = |x|`, common mistake (assuming
     continuous implies differentiable), intuition (pause), quiz
     (multipleChoice on implication direction, multipleChoice on right-side
     quotient, shortAnswer "is f differentiable at 0?"), summary, revision
     layer.
3. Do not add glossary entries. Reuse existing terms `continuity`,
   `differentiability`, `difference-quotient`, `function`, `output`, `limit`,
   `one-sided-limit`.
4. Stable kebab-case IDs everywhere. Set
   `prerequisiteLessonIds: ["one-sided-and-infinite-limits", "derivative-as-a-limit"]`
   on `differentiability-vs-continuity`.

B. Tests.
5. Update `src/content/__tests__/calculusI.test.ts` so:
   - the lesson-order assertion lists seven lessons in the new order,
   - the total-lesson assertion is `7`,
   - a new assertion pins the new lesson's prerequisite array, and
   - the term-segment-counts assertion pins
     `counts.get("differentiability-vs-continuity") >= 5`.
6. Update `src/export/lessonSummaryExport.test.ts` so `eachLesson(course)`
   length goes from 6 to 7.
7. Do not add new block-view test files for a content-only slice. If coverage
   on `src/content/**` drops below 80% because of newly exercised validator
   branches, add the minimum invalid fixture (single primary failure reason)
   to `validateContent.test.ts` to close the branch.

C. Docs.
8. `docs/roadmap.md` Phase 4: bump shipped count and move
   `differentiability-vs-continuity` from Open to Shipped. Remove the now-done
   queue entry; renumber the queue.
9. `docs/agent/PROJECT_STATE.md`: update Current Slice and Next Task (Module C
   kickoff — `power-rule`).
10. Rotate `docs/agent/NEXT_CODEX_PROMPT.md`: move this prompt into "Previous
    Prompt"; the new "Next Prompt" should plan the Module C `power-rule`
    lesson under a new `differentiation-rules` module.

Out of scope (defer):
- Module C lessons.
- Reader polish (Phase 5).
- Tauri commands (Phase 6).
- Any new block type, runtime dependency, schema field, font, UI framework,
  graphing library, database, sync, AI, accounts, telemetry, document, or PDF
  dependency.

Done criteria:
1. `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm run test`,
   `npm run test:coverage`, `npm run build`, and `git diff --check` all pass
   (or exact blockers are documented).
2. `calculus-i` has seven lessons across two modules; the validator accepts
   the course; `differentiability-vs-continuity` requires both
   `one-sided-and-infinite-limits` and `derivative-as-a-limit`.
3. `differentiability-vs-continuity` mounts cleanly when reached through
   `LessonView` (no schema-mounting regression in
   `sampleContentRenderable.test.tsx`).
4. `docs/roadmap.md`, `docs/agent/PROJECT_STATE.md`, and
   `docs/agent/NEXT_CODEX_PROMPT.md` are in sync with the code.
```

## Next Prompt

```txt
Use AGENTS.md and the relevant Project Math skills.

Implement the next Phase 4 — Content Depth slice: introduce a new
`differentiation-rules` module under `calculus-i` and author its first
lesson, `power-rule`. Land it in one PR with the new module, the lesson, the
docs rotation, and the test updates.

Current state:
- The app remains a local-first deterministic React/Vite/Tauri studybook.
- Content is the v2 Course → Module → Lesson → Block model under
  `src/content/`, with one bundled course `calculus-i`.
- Calculus I has two modules: `foundations` (3 lessons: `functions-refresher`,
  `limits-intuitively`, `one-sided-and-infinite-limits`) and
  `first-principles` (4 lessons: `derivative-as-a-limit`,
  `derivative-at-a-point`, `constant-function-derivative`,
  `differentiability-vs-continuity`). Seven lessons total.
- Glossary covers the foundations vocabulary plus
  `continuity`/`differentiability`/`constant-function`/`one-sided-limit` etc.
  Adding `differentiation-rules`-flavoured terms (e.g. `power-rule`,
  `coefficient`) is allowed only if a `term` segment in body text references
  the entry.
- The autism-aware lesson micro-flow (Observe → Predict → Calculate → Compare
  → Answer → Summarize) is the default style. `actionCue` chips and
  `finalAnswer` bands ship on every worked example.
- ESLint, Prettier, CI, jsdom Vitest, and 80% per-directory coverage gates on
  `src/content/**` and `src/rendering/blocks/**` are in place. 60% global
  floor everywhere else.

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
   - src/content/fixtures/courses/calculus-i.course.json (note
     `differentiability-vs-continuity` as the most recent structural
     reference)
   - src/content/__tests__/calculusI.test.ts
4. Propose a concise plan with exact files to change before editing.

Scope (Phase 4, Module C kickoff only — do not broaden):

A. Module + lesson — `src/content/fixtures/courses/calculus-i.course.json`.
1. Append a third module `differentiation-rules` after the existing
   `first-principles` module. Keep the existing modules unchanged.
   - `id: "differentiation-rules"`, autism-aware title and summary.
2. Author `power-rule` as the module's first lesson, mirroring the two-section
   autism-aware ordering:
   - Section 1 "Observe and predict the pattern": title, concept (rule
     statement: for positive integer `n`, `(d/dx)x^n = n·x^(n-1)`), latex
     (display) for the rule, two intuition blocks (predict the exponent and
     coefficient pattern from `x^2` and `x^3`), a graph that overlays a small
     family of `x^n` curves with annotation of where each tangent slope grows.
   - Section 2 "Derive and apply": two worked examples deriving the rule from
     first principles for `x^2` and `x^3` (use `actionCue` chips and a
     `finalAnswer` band), an intuition block that generalises to `x^n`, one
     common mistake (e.g. dropping the exponent vs the coefficient or losing
     `n-1`), a three-question quiz (one multiple-choice on the exponent
     pattern, one multiple-choice on a small numeric derivative, one short
     answer on `(d/dx) x^5`), a summary block, and a revision layer.
3. Stable kebab-case IDs everywhere. Set
   `prerequisiteLessonIds: ["derivative-as-a-limit"]` on `power-rule`
   (optionally also `"derivative-at-a-point"`).
4. Add glossary entries ONLY if a new `term` segment in body text requires
   them. If you add `power-rule` or `coefficient` glossary entries, mirror the
   structure of existing entries and ensure each entry is referenced live.

B. Tests.
5. Update `src/content/__tests__/calculusI.test.ts` so:
   - the lesson-order assertion lists eight lessons in the new order,
   - the total-lesson assertion is `8`,
   - a new assertion pins the `power-rule` prerequisite array, and
   - the term-segment-counts assertion pins
     `counts.get("power-rule") >= 4`.
6. Update `src/export/lessonSummaryExport.test.ts` so `eachLesson(course)`
   length goes from 7 to 8.
7. Do not add new block-view test files for a content-only slice. If coverage
   on `src/content/**` drops below 80% because of newly exercised validator
   branches, add the minimum invalid fixture (single primary failure reason)
   to `validateContent.test.ts` to close the branch.

C. Docs.
8. `docs/roadmap.md` Phase 4: bump shipped count, add the
   `differentiation-rules` module and `power-rule` lesson under Shipped,
   remove the now-done queue entry, and renumber the queue.
9. `docs/agent/PROJECT_STATE.md`: update Current Slice and Next Task (next
   Module C lesson — `sum-and-difference-rule`).
10. Rotate `docs/agent/NEXT_CODEX_PROMPT.md`: move this prompt into "Previous
    Prompt"; the new "Next Prompt" should plan the
    `sum-and-difference-rule` lesson.

Out of scope (defer):
- Later Module C lessons (sum/difference, product, quotient, chain,
  tangent-line capstone).
- Reader polish (Phase 5).
- Tauri commands (Phase 6).
- Any new block type, runtime dependency, schema field, font, UI framework,
  graphing library, database, sync, AI, accounts, telemetry, document, or PDF
  dependency.

Done criteria:
1. `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm run test`,
   `npm run test:coverage`, `npm run build`, and `git diff --check` all pass
   (or exact blockers are documented).
2. `calculus-i` has eight lessons across three modules; the validator accepts
   the course; `power-rule` requires at least `derivative-as-a-limit`.
3. `power-rule` mounts cleanly when reached through `LessonView` (no
   schema-mounting regression in `sampleContentRenderable.test.tsx`).
4. `docs/roadmap.md`, `docs/agent/PROJECT_STATE.md`, and
   `docs/agent/NEXT_CODEX_PROMPT.md` are in sync with the code.
```

# Next Codex Prompt

## Previous Prompt

```txt
Use AGENTS.md and the relevant Project Math skills.

Implement the next Phase 4 — Content Depth slice: author Module C lesson 5,
`chain-rule`, as the fifth lesson in the `differentiation-rules` module. Land
it in one PR with the lesson, glossary entries, docs rotation, and test updates.

Current state:
- The app remains a local-first deterministic React/Vite/Tauri studybook.
- Content is the v2 Course → Module → Lesson → Block model under `src/content/`,
  with one bundled course `calculus-i`.
- Calculus I has three modules: `foundations` (3 lessons), `first-principles`
  (4 lessons), and `differentiation-rules` (4 lessons: `power-rule`,
  `sum-difference-rule`, `product-rule`, `quotient-rule`). Eleven lessons total.
- The autism-aware lesson micro-flow (Observe → Predict → Calculate → Compare →
  Answer → Summarize) is the default style. `actionCue` chips and `finalAnswer`
  bands ship on every worked example.
- ESLint, Prettier, CI, jsdom Vitest, and 80% per-directory coverage gates on
  `src/content/**` and `src/rendering/blocks/**` are in place. 60% global floor
  everywhere else.

Scope (Phase 4, chain-rule lesson only — do not broaden):

A. Lesson content — `src/content/fixtures/courses/calculus-i.course.json`.
1. Append `chain-rule` to `differentiation-rules`, after `quotient-rule`.
2. Five sections: intro (title, concept, two intuitions), derive (derivation
   worked example, latex formula, two graphs), apply (three application worked
   examples), mistakes (two common mistakes), practice (quiz, summary).
3. Derivation derives d/dx[f(g(x))] = f′(g(x))·g′(x) from the limit
   definition via Δu substitution.
4. Three application examples: (x²+1)⁵, √(3x+2), 1/(x²+1) with
   quotient-rule verification.
5. Two glossary terms: `chain-rule`, `composite-function`.
6. `prerequisiteLessonIds: ["quotient-rule"]`.

B. Tests — update lesson count to 12, add prerequisite and module-placement
   assertions, pin term-segment count ≥ 5.

C. Docs — update roadmap, PROJECT_STATE, and NEXT_CODEX_PROMPT.
```

## Next Prompt

```txt
Use AGENTS.md and the relevant Project Math skills.

Implement the next Phase 4 — Content Depth slice: author Module C capstone
lesson, `tangent-line-equation`, as the sixth and final lesson in the
`differentiation-rules` module. Land it in one PR with the lesson, any needed
glossary entries, docs rotation, and test updates.

Current state:
- The app remains a local-first deterministic React/Vite/Tauri studybook.
- Content is the v2 Course → Module → Lesson → Block model under `src/content/`,
  with one bundled course `calculus-i`.
- Calculus I has three modules: `foundations` (3 lessons), `first-principles`
  (4 lessons), and `differentiation-rules` (5 lessons: `power-rule`,
  `sum-difference-rule`, `product-rule`, `quotient-rule`, `chain-rule`). Twelve
  lessons total.
- Glossary includes all differentiation-rule terms plus `composite-function`.
- The autism-aware lesson micro-flow (Observe → Predict → Calculate → Compare →
  Answer → Summarize) is the default style. `actionCue` chips and `finalAnswer`
  bands ship on every worked example.
- ESLint, Prettier, CI, jsdom Vitest, and 80% per-directory coverage gates on
  `src/content/**` and `src/rendering/blocks/**` are in place. 60% global floor
  everywhere else.

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
   - src/content/fixtures/courses/calculus-i.course.json (note `chain-rule`
     as the most recent structural reference)
   - src/content/__tests__/calculusI.test.ts
4. Propose a concise plan with exact files to change before editing.

Scope (Phase 4, tangent-line-equation capstone only — do not broaden):

A. Lesson content — `src/content/fixtures/courses/calculus-i.course.json`.
1. Append `tangent-line-equation` to `differentiation-rules`, after `chain-rule`.
2. The capstone ties together every differentiation rule from Module C: power,
   sum/difference, product, quotient, and chain rules.
3. Structure: title, concept (tangent line at a point: y − f(a) = f′(a)(x − a)),
   intuition blocks, a graph showing a curve and its tangent, worked examples
   using different rules to find tangent lines (at least three, each using a
   different rule combination), common mistakes, quiz, summary, revision layer.
4. `prerequisiteLessonIds: ["chain-rule"]`.
5. Add glossary entries ONLY if new `term` segments reference them. Reuse
   `tangent-line`, `derivative`, `slope`, and existing rule terms.

B. Tests — update lesson count to 13, add prerequisite and module-placement
   assertions, pin term-segment count ≥ 5.

C. Docs — update roadmap (mark chain-rule done, move tangent-line-equation from
   Open to Shipped, Phase 4 complete), PROJECT_STATE, and NEXT_CODEX_PROMPT
   (next prompt should target Phase 6 or remaining Phase 5 work).

Out of scope (defer):
- Reader polish (Phase 5 remaining items).
- Tauri commands (Phase 6).
- Any new block type, runtime dependency, schema field, font, UI framework,
  graphing library, database, sync, AI, accounts, telemetry, document, or PDF
  dependency.

Done criteria:
1. `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm run test`,
   `npm run test:coverage`, `npm run build`, and `git diff --check` all pass
   (or exact blockers are documented).
2. `calculus-i` has thirteen lessons across three modules; the validator accepts
   the course; `tangent-line-equation` requires `chain-rule`.
3. `tangent-line-equation` mounts cleanly when reached through `LessonView` (no
   schema-mounting regression in `sampleContentRenderable.test.tsx`).
4. `docs/roadmap.md`, `docs/agent/PROJECT_STATE.md`, and
   `docs/agent/NEXT_CODEX_PROMPT.md` are in sync with the code.
```

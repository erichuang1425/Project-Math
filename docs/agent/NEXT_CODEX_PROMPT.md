# Next Codex Prompt

## Previous Prompt

```txt
Use AGENTS.md and the relevant skills.

Implement the NEXT vertical slice only:

"Add copy-to-clipboard support for deterministic lesson summary markdown."

This is an implementation slice. Keep it to the smallest safe export-delivery improvement now that deterministic markdown export already exists.

Important workflow rule:
We are no longer maintaining a reusable prompt queue.
Do not create or update docs/agent/CODEX_PROMPT_QUEUE.md.
Keep the durable next-prompt file:
- docs/agent/NEXT_CODEX_PROMPT.md

Before editing:
1. Inspect the repo.
2. Load AGENTS.md and the relevant skills.
3. Read:
   - docs/agent/PROJECT_STATE.md
   - docs/agent/NEXT_CODEX_PROMPT.md
   - docs/agent/VERTICAL_SLICE_PROTOCOL.md
   - docs/architecture.md
   - docs/content-schema.md
   - docs/roadmap.md
   - docs/testing-strategy.md
   - src/export/lessonSummaryExport.ts
   - src/export/lessonSummaryExport.test.ts
   - src/rendering/LessonView.tsx
   - src/rendering/sampleContentRenderable.test.tsx
4. Propose a concise plan.
5. Identify the files you will create/change.

Scope:
1. Keep the existing deterministic lesson summary data and markdown generator.
2. Add a small copy-to-clipboard action for the generated markdown near the existing "Download summary" action.
3. Use browser/Tauri web APIs only; do not add dependencies.
4. Add clear success and failure UI states that do not interrupt the learner.
5. Add focused tests for the export action state and existing markdown behavior.
6. Preserve the Tauri shell as a thin desktop layer unless a blocker is documented before any fallback.
7. Update docs/agent/NEXT_CODEX_PROMPT.md with this previous prompt and the exact next fresh-thread prompt.

Do not add:
- document or PDF dependencies
- native save dialogs
- database, sync, AI, analytics, telemetry, account, or UI-framework dependencies
- Rust/Tauri export logic
- server calls or network-dependent clipboard behavior

Done criteria:
1. A learner can copy the same deterministic markdown currently used for download.
2. Copy success and failure states are visible and accessible.
3. Existing download behavior still works.
4. Tests cover the new copy behavior and relevant export rendering.
5. The app typechecks, tests pass, and the build either passes or any blocker is documented.
6. docs/agent/NEXT_CODEX_PROMPT.md contains this previous prompt and the exact next fresh-thread prompt.
```

## Next Prompt

```txt
Use AGENTS.md and the relevant skills.

Implement the NEXT vertical slice only:

"Add the next deterministic lesson for the derivatives topic now that graph curve rendering exists."

This is an implementation slice. Keep it to one new structured lesson and the smallest supporting tests/docs updates. Do not overbuild the curriculum system.

Important workflow rule:
We are no longer maintaining a reusable prompt queue.
Do not create or update docs/agent/CODEX_PROMPT_QUEUE.md.
Keep the durable next-prompt file:
- docs/agent/NEXT_CODEX_PROMPT.md

Before editing:
1. Inspect the repo.
2. Load AGENTS.md and the relevant skills.
3. Read:
   - docs/agent/PROJECT_STATE.md
   - docs/agent/NEXT_CODEX_PROMPT.md
   - docs/agent/VERTICAL_SLICE_PROTOCOL.md
   - docs/architecture.md
   - docs/content-schema.md
   - docs/learning-design.md
   - docs/roadmap.md
   - docs/testing-strategy.md
   - src/studybook/fixtures/derivatives-first-principles.studybook.json
   - src/studybook/schema.ts
   - src/studybook/validateStudybook.ts
   - src/studybook/validateStudybook.test.ts
   - src/rendering/BlockRenderer.tsx
   - src/rendering/LessonView.tsx
   - src/rendering/sampleContentRenderable.test.tsx
4. Propose a concise plan.
5. Identify the files you will create/change.

Scope:
1. Add exactly one next lesson to the existing derivatives studybook JSON.
2. Keep the lesson as structured studybook data rendered through the existing reusable block renderer.
3. Use the existing block vocabulary; do not add a schema type unless a blocker is documented first.
4. Include objectives, sections, LaTeX, at least one worked example, at least one common mistake, at least one quiz, and a summary block.
5. Use the existing GraphSpec path only if the lesson needs a graph; do not add graphing libraries or expression evaluation.
6. Update validation and rendering tests for the new lesson using stable IDs.
7. Preserve learner state and export behavior without adding storage or export dependencies.
8. Update docs/agent/NEXT_CODEX_PROMPT.md with this previous prompt and the exact next fresh-thread prompt.

Do not add:
- graphing libraries
- document or PDF dependencies
- native save dialogs
- database, sync, AI, analytics, telemetry, account, or UI-framework dependencies
- Rust/Tauri lesson logic
- server calls or network-dependent behavior
- arbitrary React pages, markdown blobs, or JSX-only lesson content

Done criteria:
1. The new lesson validates through the existing studybook schema.
2. The new lesson renders through the reusable lesson/block path with correct LaTeX, examples, mistake review, quiz, and summary content.
3. Tests cover the new lesson validation and rendering behavior.
4. The app typechecks, tests pass, and the build either passes or any blocker is documented.
5. docs/agent/NEXT_CODEX_PROMPT.md contains this previous prompt and the exact next fresh-thread prompt.
```

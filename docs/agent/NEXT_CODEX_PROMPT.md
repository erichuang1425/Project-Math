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
```

## Next Prompt

```txt
Use AGENTS.md and the relevant Project Math skills.

Implement the next narrow slice of improvements from the learner journey and motivation review.

Current state:
- The app is a local-first deterministic React/Vite/Tauri studybook with 9 authored lessons.
- Content flows through studybook JSON -> validation -> reusable block renderer.
- The studybook `Derivatives from First Principles` now contains 9 deterministic lessons:
  derivative-as-a-limit, derivative-at-a-point, constant-function-derivative,
  power-rule-for-derivatives, sum-and-constant-multiple-rule, product-rule,
  quotient-rule, chain-rule, tangent-line-equation.
- Phase 5 interactive features are live:
  - IntersectionObserver active-section highlighting in the sticky path rail (aria-current="step").
  - Worked-example step rail: progressive step disclosure with numbered pill tabs, Previous/Next nav.
  - Glossary <dialog> with native focus trap: term buttons open a modal with the glossary definition and optional LaTeX formula; Escape or backdrop click closes it.
- Phase 6 Tauri additions:
  - Two new Rust commands: `export_markdown_file` (writes to app data exports dir), `app_version`.
  - Native menus (File: Export Lesson Summary, Close; Edit: standard; View: Return to Dashboard, Fullscreen).
  - Menu events emit `menu:go-to-dashboard` and `menu:export-summary` to the frontend (not yet wired).
- Phase 7 agent skills updated:
  - `learner-journey-reviewer` replaces `ux-quality-reviewer` for end-to-end flow reviews.
  - `motivation-ux-reviewer` added for intrinsic motivation and learner confidence reviews.
  - `neurodivergent-learning-accessibility-reviewer` sharpened for step rail, glossary dialog, and active section.
- All 48 tests pass. Typecheck and build are clean.

Important workflow rule:
Do not create or update docs/agent/CODEX_PROMPT_QUEUE.md.
Keep the durable fresh-thread prompt in docs/agent/NEXT_CODEX_PROMPT.md.

Before editing:
1. Inspect the repo with literal-path handling.
2. Load AGENTS.md and the relevant local skills:
   - learner-journey-reviewer (use instead of ux-quality-reviewer)
   - motivation-ux-reviewer
   - neurodivergent-learning-accessibility-reviewer
   - frontend-visual-system-designer if visual or CSS changes are needed
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
   - src/rendering/LessonView.tsx
   - src/rendering/lesson.module.css
   - src/rendering/GlossaryContext.tsx
   - src/rendering/RichText.tsx
   - src/rendering/blocks/WorkedExampleBlockView.tsx
4. Summarize the learner journey review and propose a concise plan with exact files to change.

Scope:
1. Wire the `menu:export-summary` frontend event to trigger the Download summary action (requires the frontend to listen for Tauri menu events where Tauri is available).
2. Wire `menu:go-to-dashboard` to navigate back to the dashboard.
3. Add graph specs for the 6 new lessons (power-rule, sum-rule, product-rule, quotient-rule, chain-rule, tangent-line) — currently these lessons are valid but their graph blocks need authored `spec.series[].samples`.
4. Run the learner-journey-reviewer checklist against the step rail and glossary dialog and address any concrete gaps.
5. Do not add new dependencies, routing, accounts, telemetry, AI, PDF, sync, or cloud features.

Done criteria:
1. Tauri menu events are wired to the correct frontend actions.
2. All 6 new lesson graph blocks have authored sampled series.
3. The learner-journey-reviewer checklist passes for the step rail, glossary, and active section.
4. All tests still pass.
5. Typecheck and build are clean.
6. docs/agent/PROJECT_STATE.md and docs/roadmap.md reflect the new state.
7. Update docs/agent/NEXT_CODEX_PROMPT.md with this previous prompt and the next fresh-thread prompt.
```

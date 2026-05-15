# Next Codex Prompt

## Previous Prompt

```txt
Use AGENTS.md and the relevant Project Math skills.

Implement only the next narrow dashboard-first app-shell slice.

Current state:
- The app remains a local-first deterministic React/Vite/Tauri studybook.
- Lesson content still flows through studybook JSON -> validation -> reusable block renderer.
- No new runtime dependencies, graphing libraries, fonts, UI frameworks, AI, sync, accounts, telemetry, database, PDF, or document dependencies were added.
- The only bundled studybook/course for this slice is the validated `Derivatives from First Principles` studybook.
- The current app opens directly into the study workspace with a sidebar lesson list, local progress, collapsible reader controls, the active lesson reader, and a sticky lesson path rail.
- The study workspace now includes:
  - sidebar studybook summary and lesson progress
  - keyboard skip link to lesson content
  - collapsible local reader controls
  - responsive wide lesson reader
  - sticky wide-screen lesson path rail
  - block role labels for concept, action cue, graph, worked example, common mistake, practice, and summary
  - block role labels are now propagated to lesson opening and equation blocks too
  - focusable title-specific SVG graphs with text annotation details
  - explicit quiz status text for unselected, ready-to-check, correct, and review states
  - reader-scoped semantic tokens for accent, focus, selected, warning, correct, incorrect, and disabled states, including low-glare variants
- There is an untracked `External material/` folder with PDFs, but this dashboard slice must not ingest or model those PDFs.
- For this slice, "course" means a dashboard presentation of the existing studybook, and "materials" means existing in-app lesson resources: objectives, lesson sections, graph blocks, worked examples, common mistakes, quizzes, summaries, and export actions.

Newest user feedback:
- The app needs a dashboard for accessing and navigating courses, lessons, and materials.
- Critically and carefully design the navigation, layout, and visual hierarchy.

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
4. Summarize the newest user feedback and propose a concise plan with exact files to change before editing.

Scope:
1. Build a dashboard-first first screen over the existing validated studybook, treating `Derivatives from First Principles` as the first course.
2. Selecting a lesson from the dashboard opens the existing reader experience for that lesson.
3. Provide a clear route from the reader back to the dashboard.
4. Keep the lesson reader, `LessonView`, `BlockRenderer`, quiz behavior, graph rendering, export behavior, and reader controls deterministic and offline.
5. Do not add a `Course` schema, `Material` schema, PDF ingestion, new content files, new curriculum lessons, routing dependency, runtime dependency, font package, UI framework, graphing library, database, sync, AI, accounts, telemetry, document dependency, or PDF dependency.
6. Preserve structured studybook content and stable IDs. If a schema/content edit seems necessary, stop and document the blocker instead of broadening the slice.

Implementation direction:
1. Keep this in the React app shell layer. A small local app-shell state such as `dashboard` versus `reader` and `selectedLessonId` is enough; do not add a router dependency.
2. The dashboard should show:
   - Project Math identity and local-first/offline status.
   - A course card or course panel for the existing studybook.
   - Overall progress: completed lessons out of total lessons.
   - A lesson sequence with selected/current/completed/not-started text labels.
   - Material entry points derived from existing lesson data: objectives, sections, graph/worked-example/common-mistake/quiz counts where practical, and summary/export availability.
   - A primary action to continue or open the selected lesson.
3. The reader view should keep the existing lesson experience and reader controls, but include dashboard navigation that is keyboard and pointer accessible.
4. Do not treat the PDFs in `External material/` as app materials in this slice. Mention in docs/final response that PDF material ingestion is intentionally deferred.

Design requirements:
1. Dashboard first screen must feel like a quiet, focused desktop studybook workspace, not a marketing landing page or generic admin dashboard.
2. Use strong information hierarchy for course access, lesson sequence, progress, and material entry points.
3. Keep navigation predictable: the learner should know where they are, what is selected, what is complete, and how to enter or return from a lesson.
4. Use visible focus states and text labels in addition to color for selected, current, completed, unavailable, and disabled states.
5. Keep text, controls, progress labels, and material labels from overflowing or overlapping at narrow and wide desktop sizes.
6. Reuse existing CSS modules and semantic app/reader tokens where practical. Add only small local CSS variables if they clarify repeated dashboard roles.
7. Avoid decorative backgrounds, large hero layouts, nested cards, surprise motion, urgency cues, and visual decoration that competes with math content.

Expected touch points:
- Likely app shell and focused tests: `src/app/App.tsx`, `src/app/App.module.css`, `src/app/App.test.tsx`.
- Only touch `src/rendering/LessonView.tsx` or `src/rendering/lesson.module.css` if the reader needs a minimal dashboard-return affordance that cannot be cleanly owned by `App.tsx`.
- Update `docs/agent/PROJECT_STATE.md`, `docs/roadmap.md`, and `docs/agent/NEXT_CODEX_PROMPT.md` only if the implementation changes durable state or handoff instructions.
- Do not touch studybook fixture content, schema, graph contracts, storage repositories, Tauri/Rust, export internals, or the untracked PDF files unless a concrete blocker is documented first.

Done criteria:
1. The app opens to a dashboard first.
2. The dashboard gives access to the existing studybook/course, lesson sequence, progress, and in-app material entry points without adding schema or content infrastructure.
3. Selecting a lesson opens the reader, and the reader has a clear dashboard-return path.
4. Keyboard and pointer paths work for dashboard navigation, lesson selection, reader controls, graphs, quizzes, and export actions.
5. State is explicit in text and not color-only.
6. Dashboard and reader layouts work at narrow and wide desktop sizes without overflow, overlap, or clipped controls.
7. Tests cover dashboard-first rendering, course/progress text, lesson selection into the reader, material entry labels, keyboard-accessible navigation expectations where practical, and unchanged validation/error behavior.
8. Run npm.cmd run typecheck, npm.cmd test, npm.cmd run build, and git diff --check, or document exact blockers.
9. Run or document the local preview smoke path at http://127.0.0.1:4173.
10. Update docs/agent/NEXT_CODEX_PROMPT.md with this previous prompt and the exact next fresh-thread prompt.
```

## Next Prompt

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

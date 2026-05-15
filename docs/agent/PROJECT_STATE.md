# Project State

Last updated: 2026-05-15

## Current Slice

The current slice adds a dashboard-first app shell for the existing validated studybook after the user asked for clearer access to courses, lessons, and materials. The work stays in the React app-shell and CSS module layer; it does not add schemas, lesson content, PDF ingestion, routing, dependencies, storage changes, or Tauri/Rust behavior.

## Current App Shape

- Desktop shell: Tauri, used only for native window and local JSON state commands.
- Frontend: React, TypeScript, Vite.
- Lesson content: deterministic studybook JSON validated before rendering.
- Math: KaTeX.
- Graphs: `GraphSpec` data rendered by the in-repo React SVG `GraphView`.
- Function graph series: optional authored `samples` render as deterministic SVG polylines.
- Storage: local JSON through repository interfaces.
- Export: deterministic lesson summary markdown is generated from validated lesson content and learner state, then delivered through browser download or clipboard APIs.
- Reader controls: collapsible local React controls plus browser-local persistence for reader display settings; no Tauri/Rust preference logic.
- Dashboard: first screen presents Project Math identity, local-first/offline status, the bundled `Derivatives from First Principles` course, overall lesson progress, selected/current/completed/not-started lesson labels, and material summaries derived from existing lesson objectives, sections, graph blocks, worked examples, common mistakes, quizzes, summary blocks, and export actions.
- Study workspace: opened from the dashboard, with a dashboard-return button, sidebar lesson progress, keyboard skip link, sticky wide-screen lesson path, block role labels for every current block family, focusable title-specific SVG graphs, graph annotation details, explicit quiz status text, and reader-scoped semantic state tokens for low-glare mode.

## Known Graph Requirements

1. `secant-slope-graph`: implemented with authored samples for `y = x^2`, the points `(1, 1)` and `(2, 4)`, the secant line through them, labeled axes, ticks, and the base point annotation at `x = 1`.
2. `tangent-at-two-graph`: implemented with authored samples for `y = x^2`, the fixed point `(2, 4)`, nearby point `(3, 9)`, the secant line for `h = 1`, the tangent line with slope `4`, labeled axes, ticks, and point annotations.
3. `constant-function-graph`: implemented with authored samples for `y = 7`, two same-height comparison points, a horizontal secant line, labeled axes, ticks, and a same-output annotation.

## Current Decisions

- Use the internal deterministic SVG renderer path. Do not add a graphing library yet. Function expressions are display labels only; the renderer does not evaluate expression strings.
- Keep export delivery in the web app layer for now. Do not add document/PDF dependencies, native save dialogs, or Rust/Tauri export logic until concrete requirements justify them.
- Treat the autism-aware lesson language and reader-control standard as approved for deterministic derivatives lesson increments. Keep it adjustable when the user gives concrete review feedback.
- Treat "course" in the current UI as an app-shell presentation of the existing validated studybook, not a new content schema. Treat "materials" as existing in-app lesson resources only. The untracked `External material/` PDFs are intentionally not modeled or ingested.

## Next Task

Review the dashboard-first navigation and visual hierarchy in the running app, then address concrete accessibility, layout, or interaction feedback before continuing curriculum production or adding any material-ingestion infrastructure.

## Workflow Notes

- Do not create or update `docs/agent/CODEX_PROMPT_QUEUE.md`.
- Keep the durable fresh-thread prompt in `docs/agent/NEXT_CODEX_PROMPT.md`.
- Preserve structured studybook content and stable IDs.
- Do not add graphing, document, PDF, AI, database, sync, or UI framework dependencies without explicit approval.

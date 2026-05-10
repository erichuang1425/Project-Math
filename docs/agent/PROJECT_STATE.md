# Project State

Last updated: 2026-05-10

## Current Slice

Deterministic lesson summary markdown can be downloaded or copied to the clipboard from the lesson footer. Copy delivery uses the browser clipboard API from the TypeScript UI/export layer and keeps the Tauri shell thin.

## Current App Shape

- Desktop shell: Tauri, used only for native window and local JSON state commands.
- Frontend: React, TypeScript, Vite.
- Lesson content: deterministic studybook JSON validated before rendering.
- Math: KaTeX.
- Graphs: `GraphSpec` data rendered by the in-repo React SVG `GraphView`.
- Function graph series: optional authored `samples` render as deterministic SVG polylines.
- Storage: local JSON through repository interfaces.
- Export: deterministic lesson summary markdown is generated from validated lesson content and learner state, then delivered through browser download or clipboard APIs.

## Known Graph Requirements

1. `secant-slope-graph`: implemented with authored samples for `y = x^2`, the points `(1, 1)` and `(2, 4)`, the secant line through them, labeled axes, ticks, and the base point annotation at `x = 1`.
2. `tangent-at-two-graph`: implemented with authored samples for `y = x^2`, the fixed point `(2, 4)`, nearby point `(3, 9)`, the secant line for `h = 1`, the tangent line with slope `4`, labeled axes, ticks, and point annotations.

## Current Decisions

- Use the internal deterministic SVG renderer path. Do not add a graphing library yet. Function expressions are display labels only; the renderer does not evaluate expression strings.
- Keep export delivery in the web app layer for now. Do not add document/PDF dependencies, native save dialogs, or Rust/Tauri export logic until concrete requirements justify them.

## Next Task

Add the next deterministic lesson for the derivatives topic now that graph curve rendering exists.

## Workflow Notes

- Do not create or update `docs/agent/CODEX_PROMPT_QUEUE.md`.
- Keep the durable fresh-thread prompt in `docs/agent/NEXT_CODEX_PROMPT.md`.
- Preserve structured studybook content and stable IDs.
- Do not add graphing, document, PDF, AI, database, sync, or UI framework dependencies without explicit approval.

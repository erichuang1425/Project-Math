# Project State

Last updated: 2026-05-26

## Current Slice

The current slice is the next **Phase 4 — Content Depth** increment: authoring **Module C lesson 5 (`chain-rule`)** as the fifth lesson in the `differentiation-rules` module. The slice adds one lesson after `quotient-rule` (title → concept → intuition × 2 → derivation worked example → latex → graph × 2 → application worked example × 3 → common mistake × 2 → quiz → summary, plus a revision layer). The derivation separates the outer and inner rates of change by multiplying and dividing by Δu in five steps. The three application examples cover (x²+1)⁵ via power-composition, √(3x+2) via fractional-exponent composition, and 1/(x²+1) via negative-exponent composition with quotient-rule verification. The lesson is wired with `prerequisiteLessonIds: ["quotient-rule"]`, extending the Module C chain. Two new glossary terms ship: `chain-rule` and `composite-function`. The slice is content + docs only — no schema change, no block-type change, no new dependency, no Phase 5/6 work.

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
- Dashboard: first screen presents Project Math identity, local-first/offline status, the bundled `Calculus I` course, overall lesson progress, selected/current/completed/not-started lesson labels, and material summaries derived from existing lesson objectives, sections, graph blocks, worked examples, common mistakes, quizzes, summary blocks, and export actions.
- Study workspace: opened from the dashboard, with a dashboard-return button, sidebar lesson progress, keyboard skip link, sticky wide-screen lesson path, block role labels for every current block family, focusable title-specific SVG graphs, graph annotation details, explicit quiz status text, glossary popovers anchored to `term` segments, worked-example step rail with `actionCue` chips and `finalAnswer` bands, and reader-scoped semantic state tokens for low-glare mode.

## Known Graph Requirements

1. `secant-slope-graph`: implemented with authored samples for `y = x^2`, the points `(1, 1)` and `(2, 4)`, the secant line through them, labeled axes, ticks, and the base point annotation at `x = 1`.
2. `tangent-at-two-graph`: implemented with authored samples for `y = x^2`, the fixed point `(2, 4)`, nearby point `(3, 9)`, the secant line for `h = 1`, the tangent line with slope `4`, labeled axes, ticks, and point annotations.
3. `constant-function-graph`: implemented with authored samples for `y = 7`, two same-height comparison points, a horizontal secant line, labeled axes, ticks, and a same-output annotation.
4. `absolute-value-corner-graph`: implemented with authored samples for `y = |x|`, the corner point `(0, 0)`, two secant lines through `(-1, 1)→(0, 0)` and `(0, 0)→(1, 1)` showing slopes `-1` and `+1`, labeled axes, ticks, and the corner annotation.
5. `smooth-vs-cornered-graph`: implemented with authored samples for both `y = x^2` and `y = |x|`, the shared origin point, labeled axes, ticks, and one contrast annotation.

6. `chain-sqrt-graph`: implemented with authored samples for `y = √(x² + 1)` and its derivative `y = x/√(x² + 1)`, the minimum point `(0, 1)`, labeled axes, ticks, and a chain-rule annotation at the minimum.
7. `chain-recip-graph`: implemented with authored samples for `y = 1/(x² + 1)` and its derivative `y = −2x/(x² + 1)²`, the maximum point `(0, 1)`, labeled axes, ticks, and a chain-rule annotation at the maximum.

## Current Decisions

- Use the internal deterministic SVG renderer path. Do not add a graphing library yet. Function expressions are display labels only; the renderer does not evaluate expression strings.
- Keep export delivery in the web app layer for now. Do not add document/PDF dependencies, native save dialogs, or Rust/Tauri export logic until concrete requirements justify them.
- Treat the autism-aware lesson language and reader-control standard as approved for deterministic derivatives lesson increments. Keep it adjustable when the user gives concrete review feedback.
- Treat "course" in the current UI as an app-shell presentation of the existing validated `calculus-i` course, not a new content schema. Treat "materials" as existing in-app lesson resources only. The untracked `External material/` PDFs are intentionally not modeled or ingested.
- Prerequisite edges stay sparse: declare only what a lesson directly depends on. `differentiability-vs-continuity` ties to `one-sided-and-infinite-limits` (one-sided limit reasoning) and `derivative-as-a-limit` (difference quotient), and to nothing else.

## Next Task

The next slice is **Phase 4 — Module C capstone (`tangent-line-equation`)**: author the tangent-line equation capstone lesson as the closing lesson of the `differentiation-rules` module. The lesson should use every differentiation rule from Module C (power, sum/difference, product, quotient, chain) to find tangent lines at given points. The lesson declares `prerequisiteLessonIds: ["chain-rule"]` and ties back to the first-principles definition of the derivative via the tangent-line concept from Module B.

## Workflow Notes

- Do not create or update `docs/agent/CODEX_PROMPT_QUEUE.md`.
- Keep the durable fresh-thread prompt in `docs/agent/NEXT_CODEX_PROMPT.md`.
- Preserve structured studybook content and stable IDs.
- Do not add graphing, document, PDF, AI, database, sync, or UI framework dependencies without explicit approval.

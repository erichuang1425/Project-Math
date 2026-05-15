# Project State

Last updated: 2026-05-15

## Current Slice

Phase 4–7 work completed in one session:

- **Phase 4**: 6 new deterministic lessons authored (power-rule-for-derivatives, sum-and-constant-multiple-rule, product-rule, quotient-rule, chain-rule, tangent-line-equation), bringing the studybook to 9 total lessons. All 48 tests pass.
- **Phase 5**: IntersectionObserver active-section rail, worked-example step rail (progressive disclosure), and glossary `<dialog>` with native focus trap.
- **Phase 6**: Tauri native menus (File / Edit / View), two new Rust commands (`export_markdown_file`, `app_version`). Menu events emit to frontend; frontend wiring is deferred.
- **Phase 7**: `learner-journey-reviewer` and `motivation-ux-reviewer` skills created. `ux-quality-reviewer` superseded. `neurodivergent-learning-accessibility-reviewer` sharpened for new interactive components.

## Current App Shape

- Desktop shell: Tauri, used only for native window, local JSON state commands, and native menus.
- Frontend: React, TypeScript, Vite.
- Lesson content: deterministic studybook JSON (9 lessons) validated before rendering.
- Math: KaTeX.
- Graphs: `GraphSpec` data rendered by the in-repo React SVG `GraphView`. The 3 original lessons have authored samples; the 6 new lessons have graph block stubs that need authored samples.
- Function graph series: optional authored `samples` render as deterministic SVG polylines.
- Storage: local JSON through repository interfaces.
- Export: deterministic lesson summary markdown generated from validated lesson content and learner state; clipboard and download delivery. `export_markdown_file` Tauri command available but not yet wired to the frontend.
- Reader controls: collapsible local React controls plus browser-local persistence.
- Dashboard: first screen presents Project Math identity, 9-lesson progress, lesson sequence, and material summaries.
- Study workspace: sticky section path rail with IntersectionObserver active-section highlight; worked-example step rail with numbered tabs and Previous/Next; glossary `<dialog>` opened by term links; export controls.

## Known Graph Requirements

1. `secant-slope-graph`: y = x^2, secant through (1,1) and (2,4), labeled axes, ticks, base point annotation at x = 1.
2. `tangent-at-two-graph`: y = x^2, fixed point (2,4), nearby (3,9), secant h=1, tangent slope 4, annotations.
3. `constant-function-graph`: y = 7, two same-height points, horizontal secant, labeled axes, same-output annotation.
4–9. Graph blocks for the 6 new lessons (power-rule through tangent-line) have graph block stubs; samples need to be authored.

## Current Decisions

- Use the internal deterministic SVG renderer path. Do not add a graphing library yet.
- Keep export delivery in the web app layer for now. The `export_markdown_file` Tauri command is ready; native save dialog is deferred.
- Treat the autism-aware lesson language and reader-control standard as approved for deterministic derivatives lesson increments.
- Treat "course" in the current UI as an app-shell presentation of the existing validated studybook, not a new content schema.
- App icon: existing Tauri placeholder icons are in place. Custom icon deferred (no image tools in this environment).

## Next Task

1. Author sampled series for the 6 new lesson graph blocks (power-rule through tangent-line).
2. Wire `menu:export-summary` and `menu:go-to-dashboard` frontend event listeners for the Tauri menu (requires `@tauri-apps/api/event` or `__TAURI__.event`).
3. Run the learner-journey-reviewer checklist against the step rail and glossary dialog.

## Workflow Notes

- Do not create or update `docs/agent/CODEX_PROMPT_QUEUE.md`.
- Keep the durable fresh-thread prompt in `docs/agent/NEXT_CODEX_PROMPT.md`.
- Preserve structured studybook content and stable IDs.
- Do not add graphing, document, PDF, AI, database, sync, or UI framework dependencies without explicit approval.
- Use `learner-journey-reviewer` and `motivation-ux-reviewer` for UX reviews. `ux-quality-reviewer` is superseded.

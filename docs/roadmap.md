# Roadmap

## Phase 0: Repository Instructions and Planning

Status: complete when the requested docs and local skills exist.

What done means:

- `AGENTS.md`, `README.md`, and planning docs exist.
- Local skills exist for studybook architecture, math rendering, desktop engineering, UX quality, and testing.
- Future implementation tasks have concrete done criteria.

## Phase 1: Scaffold the Desktop App

Goal: Create the minimal Tauri, React, TypeScript, and Vite app shell.

Current status: React, TypeScript, Vite, the first lesson frontend, and a thin Tauri desktop shell are in place. Packaging and installer polish are not in scope yet.

Tasks:

- Initialize the app scaffold.
- Add lint, format, typecheck, and test commands.
- Create the basic app shell with library and lesson reader placeholders.
- Confirm the app starts as a desktop app.

What done means:

- The app opens in a Tauri window.
- `npm` or chosen package scripts can run dev, build, typecheck, and test.
- No lesson content is hard-coded as arbitrary React pages.
- README setup instructions match the actual commands.

## Phase 2: Add Studybook Schema and Validation

Goal: Implement the deterministic content model.

Current status: complete for the first vertical slice. The validator covers the bundled derivatives lesson plus invalid unknown block, duplicate id, invalid LaTeX, invalid graph axis, and invalid quiz-answer cases.

Tasks:

- Add TypeScript schema types.
- Add runtime validation.
- Add valid and invalid fixtures.
- Add unit tests for schema validation.

What done means:

- Valid fixtures pass.
- Invalid fixtures fail with useful errors.
- Duplicate IDs, unknown block types, invalid quiz answers, missing graph labels, and invalid LaTeX are covered.
- The renderer receives only validated content.

## Phase 3: Build the Reusable Block Renderer

Goal: Render core MVP blocks from structured data.

Current status: complete for the first vertical slice. The renderer covers title, concept, intuition, LaTeX, graph, worked example, common mistake, quiz, and summary blocks.

Tasks:

- Implement paragraph and rich text rendering.
- Implement inline and display math rendering with KaTeX.
- Implement callout, worked example, common mistake, quiz, summary, and graph placeholder blocks.
- Add component tests for renderer dispatch and key states.

What done means:

- Each MVP block type renders from schema data.
- Invalid LaTeX has a controlled fallback.
- Quiz selected and submitted states work.
- Graph blocks render title, description, axes, and placeholder or simple visual.

## Phase 4: Author the First Lesson

Goal: Add the first deterministic lesson for "Derivatives from First Principles".

Current status: complete through the second deterministic lesson-content slice. The first lesson includes the first-principles definition, secant graph spec, worked examples for f(x) = x^2 and f(x) = 3x - 5, common mistakes, quizzes, and revision summary. The second lesson adds a point-derivative study flow for f'(2) on f(x) = x^2 with a fixed-input definition, tangent graph spec, worked example, common mistake, quiz, and revision summary.

Tasks:

- Create the studybook JSON fixture.
- Include objectives, sections, LaTeX definitions, worked examples, common mistakes, graph specs, quizzes, and revision layer.
- Validate the content in tests.

What done means:

- The lesson passes schema validation.
- Every LaTeX expression renders in tests or validation.
- Worked examples show algebraic steps.
- Quiz feedback maps to concepts and common mistakes.

## Phase 5: Local Learner State

Goal: Persist basic progress and quiz attempts locally.

Current status: complete for the first learner-state vertical slice. The app now tracks lesson opened/completed status and quiz attempt history behind repository interfaces, stores JSON through thin Tauri commands in desktop mode, and falls back to localStorage for web/dev runs.

Tasks:

- Define learner state types. Completed.
- Implement JSON-backed storage through repository interfaces. Completed.
- Track lesson progress and quiz attempts. Completed.
- Add unit tests with storage test doubles. Completed.

What done means:

- Learner state persists across app restarts.
- React components do not depend directly on file paths.
- Storage can later move to SQLite behind the same interface.
- Corrupt or missing state has a clear recovery path.

## Phase 6: Export MVP

Goal: Export a useful lesson summary.

Current status: complete through the clipboard delivery slice. The app now prepares markdown from validated lesson content and matching learner state, including objectives, key definitions, worked examples, common mistakes, lesson progress, and saved quiz results. Export uses built-in browser download and clipboard behavior without adding PDF, document, native save-dialog, or export dependencies.

Tasks:

- Define export data shape. Completed.
- Generate lesson summary data from structured content. Completed.
- Add a simple text or markdown export path. Completed.
- Add copy-to-clipboard delivery for markdown summary. Completed.
- Add tests for export output. Completed.

What done means:

- Export includes title, objectives, key definitions, worked examples, common mistakes, and quiz results if available.
- Export is deterministic.
- No heavy PDF or document dependency is added without approval.

## Phase 7: Graph Renderer Decision

Goal: Decide whether the internal graph renderer is enough or a library is justified.

Current status: decision documented in `docs/architecture/graph-rendering-options.md`. The internal deterministic SVG renderer now supports explicit sampled points for function series and renders the two known graph requirements without adding a graphing library.

Tasks:

- List required graph interactions for the first two topics. Completed.
- Compare at least three options, including no new library. Completed.
- Evaluate maintenance, offline support, accessibility, bundle size, and rendering quality. Completed.

What done means:

- Decision is documented in `docs/architecture.md` or a future ADR. Completed.
- Any new dependency is approved before installation. No dependency is approved or needed yet.
- Existing `GraphSpec` content remains stable. Completed for the decision slice.

## Next Three Implementation Tasks

1. Add the next deterministic lesson for the derivatives topic now that graph curve rendering exists.
2. Revisit export delivery for native save location handling or print styling after concrete requirements are chosen.
3. Add a focused desktop smoke path for export actions once the Tauri clipboard/download behavior needs native verification.

## Recommended First Vertical Slice

Load one local studybook JSON file, validate it, render one lesson with text, LaTeX, a worked example, a graph placeholder, one common mistake, and one quiz, then run it offline in the Tauri desktop shell.

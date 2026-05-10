# Architecture

## Architectural Intent

The app should be a local-first desktop studybook runtime. Content is data. Rendering is reusable. Storage is behind interfaces. Desktop integration is thin and explicit.

## Proposed Layers

1. **Desktop shell**
   - Tauri owns the native window, file access boundaries, and future export integrations.
   - The Tauri layer should not contain learning-domain logic.

2. **Web app shell**
   - React and Vite render the main application.
   - App shell owns navigation, layout, theme, and high-level state.

3. **Studybook domain**
   - TypeScript types for studybooks, lessons, sections, and blocks.
   - Schema validation for content files.
   - Pure helpers for block traversal, quiz scoring, progress, and export preparation.

4. **Block renderer**
   - Reusable React components map schema block types to UI.
   - Blocks must not fetch remote data.
   - Blocks receive validated data and render deterministic UI.

5. **Math and graph services**
   - KaTeX handles LaTeX rendering.
   - Graphs start with an internal `GraphSpec` abstraction and a simple renderer.
   - Add a graph library only after comparing requirements, maintenance, bundle impact, and offline behavior.

6. **Local storage**
   - MVP uses JSON files for bundled studybook content and local learner state.
   - Define storage interfaces so SQLite can be introduced without rewriting UI components.

## Content Flow

```text
studybook JSON -> schema validation -> normalized domain model -> block renderer -> UI
```

Invalid content should produce a clear validation error view. The lesson view should not attempt to recover from unknown block shapes.

## Proposed Future Source Layout

When app implementation begins, use this shape unless a better Tauri scaffold requires a small adjustment:

```text
src/
  app/
    App.tsx
    routes.ts
  studybook/
    schema.ts
    validateStudybook.ts
    fixtures/
  rendering/
    BlockRenderer.tsx
    blocks/
  math/
    MathInline.tsx
    MathBlock.tsx
  graphs/
    graphSpec.ts
    GraphView.tsx
  storage/
    StudybookRepository.ts
    LearnerStateRepository.ts
  export/
    exportLessonSummary.ts
src-tauri/
  tauri.conf.json
  src/
```

## Dependency Policy

Pre-approved direction:

- Tauri, React, TypeScript, Vite.
- KaTeX for math rendering.
- Vitest for unit tests if the Vite scaffold does not choose another test runner.
- React Testing Library for component tests if React component tests are added.
- Playwright or a Tauri-compatible smoke path for desktop smoke tests.

Ask before adding:

- Any graphing library.
- Any diagramming library.
- Any editor framework.
- Any database package.
- Any AI SDK or model runtime.
- Any analytics, telemetry, account, or sync dependency.
- Any UI framework beyond the chosen styling approach.

Dependency proposals must include:

- Why the dependency is needed now.
- Alternatives considered.
- Offline behavior.
- Long-term maintenance risk.
- Bundle and desktop footprint impact.

## Storage Direction

MVP storage should be simple:

- Bundled studybook content: JSON files versioned with the app.
- Learner state: local JSON for progress, quiz attempts, and revision flags.

Design interfaces around intent:

- `loadStudybook(id)`
- `listStudybooks()`
- `saveLearnerState(state)`
- `loadLearnerState(studybookId)`

Do not bind React components directly to file paths or a future database.

Current learner-state slice:

- `src/storage/learnerState.ts` defines versioned learner progress and quiz-attempt data.
- `src/storage/LearnerStateRepository.ts` defines repository interfaces plus a Tauri-backed JSON adapter and a browser localStorage fallback for web/dev runs.
- The Tauri shell exposes only `load_learner_state` and `save_learner_state`; it resolves the app data directory and transports JSON strings without learning-domain logic.
- React components receive repository-loaded state and callbacks. They do not know where state files live.
- SQLite remains a future backing store option behind the same repository interface; no database dependency is used in the MVP slice.

## Export Direction

Start with deterministic export data:

- Lesson title and objectives.
- Key definitions.
- Worked examples.
- Common mistakes.
- Quiz results if learner state is available.

Actual export formats can come later. Do not add PDF or document dependencies until export requirements are specific.

## Future AI Boundary

AI-assisted generation should produce or revise structured studybook data. AI should not bypass schema validation, math review, tests, or block rendering.

## What Done Means

Architecture work is done when:

- New code fits one of the documented layers.
- Content still flows through validation before rendering.
- Runtime dependencies were approved when required.
- Storage and rendering remain offline-capable.
- Tests cover any new domain behavior.

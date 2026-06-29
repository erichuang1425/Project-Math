# Architecture

## Architectural Intent

Project Math is a local-first studybook runtime. Content is data, rendering is reusable, storage is behind interfaces, and desktop integration stays thin and explicit.

## Layers

1. **Desktop shell**
   - Tauri owns the native window, file access boundaries, and future export integrations.
   - The Tauri layer does not contain learning-domain logic.

2. **Web app shell**
   - React and Vite render the main application.
   - The app shell owns navigation, layout, display mode, and high-level state.

3. **Studybook domain**
   - TypeScript types define courses, modules, lessons, sections, and blocks.
   - Schema validation protects content files before rendering.
   - Pure helpers cover traversal, quiz scoring, progress, and export preparation.

4. **Block renderer**
   - Reusable React components map schema block types to UI.
   - Blocks do not fetch remote data.
   - Blocks receive validated data and render deterministic UI.

5. **Math and graph services**
   - KaTeX handles LaTeX rendering.
   - Graphs use an internal deterministic SVG renderer.
   - Function series carry authored sample points; expression strings are display labels only.

6. **Local storage**
   - Bundled course content is JSON.
   - Learner state is local JSON on desktop and `localStorage` in browser/dev runs.
   - Repository interfaces keep UI components independent from file paths.

7. **Static web hosting**
   - The Vite frontend can be built and hosted as static files.
   - The hosted build is not the native desktop product and does not include Tauri file-backed learner-state JSON.
   - Browser progress remains local to that browser profile.

## Content Flow

```text
course JSON -> schema validation -> domain model -> block renderer -> UI
```

Invalid content should produce a clear validation error view. The lesson view should not attempt to recover from unknown block shapes.

## Source Layout

```text
src/
  app/          App shell, routing, views, reader controls
  content/      Course schema, validation, quiz scoring, fixtures
  design/       Tokens, primitives, illustrations
  export/       Lesson summary export helpers
  graphs/       Deterministic SVG graph renderer
  math/         KaTeX rendering helpers
  rendering/    Lesson and block renderers
  storage/      Learner-state repositories
src-tauri/      Native desktop shell and Tauri configuration
docs/           Product, architecture, schema, UI, and testing docs
public/         Static hosting assets
```

## Dependency Policy

Pre-approved direction:

- Tauri, React, TypeScript, Vite.
- KaTeX for math rendering.
- Vitest and React Testing Library for tests.
- Internal SVG graph rendering until a clear graphing-library need appears.

Require an explicit proposal before adding:

- Graphing or diagramming libraries.
- Editor frameworks.
- Database packages.
- Model runtimes or runtime generation SDKs.
- Analytics, telemetry, account, or sync dependencies.
- UI frameworks beyond CSS Modules and local primitives.

Dependency proposals should cover why the dependency is needed now, alternatives considered, offline behavior, maintenance risk, and bundle/desktop footprint.

## Storage Direction

Current learner-state slice:

- `src/storage/learnerState.ts` defines versioned learner progress and quiz-attempt data.
- `src/storage/LearnerStateRepository.ts` defines repository interfaces plus a Tauri-backed JSON adapter and a browser localStorage fallback.
- The Tauri shell exposes `load_learner_state` and `save_learner_state`; it resolves the app data directory and transports JSON strings without learning-domain logic.
- React components receive repository-loaded state and callbacks.

SQLite remains a future backing-store option behind the same repository interface; no database dependency is used today.

## Export Direction

Exports start with deterministic lesson summary data:

- Lesson title and objectives.
- Key definitions.
- Worked examples.
- Common mistakes.
- Quiz results when learner state is available.

Additional export formats should wait until requirements are specific.

## Authoring Boundary

Future authoring tools may produce or revise structured studybook data. They should not bypass schema validation, math review, tests, or block rendering.

## What Done Means

Architecture work is done when:

- New code fits one of the documented layers.
- Content still flows through validation before rendering.
- Runtime dependencies were approved when required.
- Storage and rendering remain offline-capable.
- Tests cover any new domain behavior.

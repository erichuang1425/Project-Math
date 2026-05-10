# Math Learning Desktop App

A local-first desktop studybook for math and technical subjects.

The app is intended to feel like an interactive studybook, not a generic notes app. Lessons are structured content rendered through reusable blocks for LaTeX, graphs, diagrams, worked examples, common mistakes, quizzes, revision layers, and export.

The first MVP topic is **Derivatives from First Principles**.

## Current Status

The first vertical slice is implemented as a local React, TypeScript, Vite frontend:

- Versioned studybook schema and runtime validation.
- Deterministic "Derivatives from First Principles" lesson data.
- Reusable block renderer for title, concept, intuition, LaTeX, graph, worked example, common mistake, quiz, and summary blocks.
- KaTeX-backed inline and display math.
- Local learner state for lesson progress and quiz attempts behind repository interfaces.
- Minimal schema and renderer-safe content tests.

The Tauri desktop shell now wraps the existing Vite frontend. The native layer is intentionally thin: it owns the desktop window, loads the deterministic frontend bundle, and reads/writes learner-state JSON in the app data directory. Studybook validation, quiz scoring, progress updates, and rendering remain in TypeScript.

## Product Principles

- Lessons are structured data, not arbitrary React pages.
- Rendering is handled by reusable block components.
- Content must be deterministic and usable offline.
- Math correctness matters more than visual novelty.
- The architecture should support future AI-assisted lesson generation without requiring AI for the MVP.

## Intended Stack

- Tauri desktop shell.
- React, TypeScript, and Vite frontend.
- KaTeX for LaTeX rendering.
- Local JSON content and learner state for MVP.
- Storage interfaces designed so SQLite can be added later.
- Focused tests for schema, rendering, and desktop smoke behavior.

## Repository Map

- `AGENTS.md`: rules for future coding agents.
- `docs/product-brief.md`: product scope, audience, and MVP boundaries.
- `docs/architecture.md`: technical architecture and dependency rules.
- `docs/learning-design.md`: lesson model and instructional quality rules.
- `docs/content-schema.md`: deterministic studybook schema.
- `docs/ui-system.md`: UI principles and reusable surfaces.
- `docs/testing-strategy.md`: testing layers and acceptance rules.
- `docs/roadmap.md`: ordered implementation plan.
- `.agents/skills/`: local role-specific instructions for future agents.

## First Vertical Slice

The first useful slice loads one local studybook JSON file for "Derivatives from First Principles", validates it, and renders a lesson with text, LaTeX, a worked example, a graph placeholder, a common mistake, and one quiz in the Vite frontend. Wrapping this frontend in Tauri is the next desktop integration task.

## Development Notes

Do not add runtime dependencies without checking `AGENTS.md` and `docs/architecture.md`. In particular, do not add a graphing library, editor framework, database, AI SDK, sync layer, analytics package, or UI framework without explicit approval.

Every implementation task must define "what done means" and include verification.

## Development Commands

On Windows PowerShell, use `npm.cmd` if script execution policy blocks the npm shim:

- `npm.cmd install`
- `npm.cmd run dev`
- `npm.cmd run typecheck`
- `npm.cmd test`
- `npm.cmd run build`
- `npm.cmd run desktop:dev`
- `npm.cmd run desktop:build`

If the global npm cache is blocked by local permissions, keep cache writes inside the ignored workspace folder:

```powershell
npm.cmd install --cache .\.npm-cache
```

## Desktop Smoke Path

Run the desktop app:

```powershell
npm.cmd run desktop:dev
```

Manual smoke steps:

1. Confirm the Project Math desktop window opens.
2. Confirm the studybook library sidebar is visible.
3. Confirm the first lesson renders.
4. Confirm KaTeX equations render, including the first-principles derivative definition.
5. Answer the visible quiz and confirm deterministic feedback appears.
6. Close and reopen the app, then confirm the quiz shows the saved attempt count.
7. Mark the lesson complete, close and reopen the app, and confirm the completed state remains.
8. Disable network access or leave the machine offline and repeat the launch; the bundled lesson and learner state should still load because content and state are local.

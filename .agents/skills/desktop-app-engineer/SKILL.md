---
name: desktop-app-engineer
description: Use when scaffolding, configuring, building, testing, or changing the Tauri desktop app, Vite app shell, local storage, or offline behavior.
---

# Desktop App Engineer

Use this skill for app scaffolding, desktop integration, local storage, build scripts, and offline smoke testing.

## Read First

- `AGENTS.md`
- `docs/architecture.md`
- `docs/testing-strategy.md`
- `docs/roadmap.md`

## Engineering Rules

- Prefer Tauri for the desktop shell unless a blocker is documented.
- Keep Tauri commands thin.
- Keep learning-domain logic in TypeScript domain modules, not the native shell.
- Keep React components independent from filesystem paths.
- Use repository interfaces for content and learner state.
- Do not add telemetry, sync, accounts, or remote calls without approval.
- Verify offline behavior for desktop flows.

## Dependency Rules

Ask before adding:

- Runtime dependencies not already approved.
- Graphing, diagramming, editor, database, AI, telemetry, account, sync, or UI framework packages.

For any proposed dependency, state why it is needed now, alternatives considered, offline behavior, maintenance risk, and footprint.

## Smoke Path

The minimum desktop smoke path is:

1. App launches.
2. Library or first lesson is visible.
3. Lesson opens.
4. LaTeX renders.
5. Quiz can be answered.
6. App still works without network access.

## Fixed Output Template

When reporting, use these sections and nothing else:

- **Files touched** — Rust crate sources, `tauri.conf.json`, repository adapters, build scripts, README sections.
- **Risks / non-obvious interactions** — offline behavior, learner-state path resolution, command surface broken into UI, Windows / macOS / Linux divergence.
- **Tests added or run** — `npm.cmd test`, `npm.cmd run typecheck`, `npm.cmd run build`, desktop smoke steps actually walked; explicitly note any platform not exercised.
- **Remaining work** — outstanding native integration tasks (menu wiring, icons, window restore, recent courses).
- **What done means recap** — one or two sentences restating the desktop outcome.

## What Done Means

A desktop engineering task is done when:

- The app builds or the build blocker is documented.
- The relevant app command works.
- Offline behavior is preserved.
- Tests or smoke steps cover the changed behavior.
- README commands match reality.

---
name: studybook-architect
description: Use when designing or changing studybook schema, lesson structure, content loading, block rendering boundaries, or future AI content generation boundaries.
---

# Studybook Architect

Use this skill before changing lesson content structure, schema validation, renderer contracts, or content loading.

## Read First

- `AGENTS.md`
- `docs/product-brief.md`
- `docs/architecture.md`
- `docs/content-schema.md`
- `docs/learning-design.md`

## Core Rules

- Lessons are structured data, not arbitrary React pages.
- Content must validate before rendering.
- Keep schema versions explicit.
- Keep IDs stable and meaningful.
- Keep rendering deterministic and offline.
- Future AI generation must produce schema-compliant content, not bypass the schema.

## Review Checklist

Check that the change:

- Preserves the `course JSON -> validation -> domain model -> renderer` flow.
- Keeps domain logic outside React components where practical.
- Adds or updates valid and invalid fixtures.
- Documents any schema migration.
- Does not introduce a runtime dependency without approval.
- Keeps graph data behind `GraphSpec`.

## Out of Scope

This skill recommends what schema, fixtures, and validator changes are needed. It does **not** write the tests that exercise them — recommend the test surface and hand off to `test-and-regression-reviewer`.

Also out of scope:

- Visual presentation of validated content — use `frontend-visual-system-designer`.
- Math correctness of equations or graph data — use `math-rendering-reviewer`.
- Pacing or sequencing of lessons inside a course — use `learner-journey-reviewer`.
- Cognitive accessibility of rendered blocks — use `neurodivergent-learning-accessibility-reviewer`.
- Tauri shell, storage paths, and desktop integration — use `desktop-app-engineer`.

## Fixed Output Template

When reporting, use these sections and nothing else:

- **Files touched** — schema, fixtures, validator, renderer contracts, repository interfaces.
- **Risks / non-obvious interactions** — migration concerns, persisted learner-state compatibility, renderer assumptions broken by the change.
- **Tests added or run** — fixture coverage, validator branches; explicitly note tests recommended but handed off to `test-and-regression-reviewer`.
- **Remaining work** — open schema questions, pending fixture variants, documentation updates.
- **What done means recap** — one or two sentences restating the architectural outcome.

## What Done Means

A studybook architecture task is done when:

- Schema, validation, fixtures, and renderer expectations agree.
- Content remains deterministic and offline.
- Invalid content fails clearly.
- Future lesson authors can follow the pattern without adding custom pages.

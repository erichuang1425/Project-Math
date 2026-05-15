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

- Preserves the `studybook JSON -> validation -> domain model -> renderer` flow.
- Keeps domain logic outside React components where practical.
- Adds or updates valid and invalid fixtures.
- Documents any schema migration.
- Does not introduce a runtime dependency without approval.
- Keeps graph data behind `GraphSpec`.

## Output Format

When reviewing or implementing, report:

- Schema or content files touched.
- Renderer contracts affected.
- Validation rules added or changed.
- Tests added or still needed.
- Migration or compatibility concerns.

## What Done Means

A studybook architecture task is done when:

- Schema, validation, fixtures, and renderer expectations agree.
- Content remains deterministic and offline.
- Invalid content fails clearly.
- Future lesson authors can follow the pattern without adding custom pages.

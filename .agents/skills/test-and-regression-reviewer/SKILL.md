---
name: test-and-regression-reviewer
description: Use when adding tests, reviewing coverage, fixing regressions, changing schema validation, renderer behavior, quiz logic, storage, or desktop smoke tests.
---

# Test and Regression Reviewer

Use this skill to keep changes covered at the lowest useful test layer.

## Read First

- `docs/testing-strategy.md`
- `docs/content-schema.md`
- `docs/roadmap.md`

## Coverage Rules

- Schema changes need valid and invalid fixtures.
- Renderer changes need component coverage for affected block types.
- Math rendering changes need valid and invalid LaTeX coverage.
- Quiz logic needs scoring, feedback, retry, and state tests.
- Storage changes need missing, corrupt, read, and write cases.
- Desktop changes need a smoke path.

## Regression Rules

- Every fixed bug gets a regression test.
- Invalid fixtures should fail for one primary reason.
- Tests should use stable IDs and deterministic data.
- Do not rely on network access.

## Out of Scope

This skill writes and reviews tests. It does **not** redesign schemas or fixture shapes — if a test surface requires the underlying schema or fixture to change, recommend the change back to `studybook-architect` and stop.

Also out of scope:

- Visual regression and viewport / keyboard checks for frontend slices — use `frontend-regression-visual-qa`.
- Math content correctness review beyond rendering tests — use `math-rendering-reviewer`.
- Cognitive accessibility checks — use `neurodivergent-learning-accessibility-reviewer`.
- Tauri build and desktop smoke configuration — use `desktop-app-engineer`.

## Fixed Output Template

When reporting, use these sections and nothing else:

- **Files touched** — test files, fixtures, and config touched (e.g. `vitest.config.ts` thresholds).
- **Risks / non-obvious interactions** — flaky surfaces, shared fixture coupling, coverage thresholds at risk after the change.
- **Tests added or run** — explicit list of test names plus commands actually executed (`npm.cmd test`, `npm.cmd run typecheck`); name any test skipped and the exact reason.
- **Remaining work** — uncovered branches, regression tests still owed, schema-shape changes recommended back to `studybook-architect`.
- **What done means recap** — one or two sentences restating what is and is not verified.

## What Done Means

A test or regression task is done when:

- The changed behavior has automated coverage where practical.
- The most relevant test command has been run.
- Remaining risk is documented.
- The final response clearly says what was and was not verified.

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

## Review Output

Report:

- Tests added.
- Tests run.
- Important behavior not covered.
- Recommended next regression test.
- Any skipped test and exact reason.

## What Done Means

A test or regression task is done when:

- The changed behavior has automated coverage where practical.
- The most relevant test command has been run.
- Remaining risk is documented.
- The final response clearly says what was and was not verified.
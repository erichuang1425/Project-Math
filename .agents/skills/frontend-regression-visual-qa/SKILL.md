---
name: frontend-regression-visual-qa
description: "Use after Project Math frontend visual, layout, reader-control, graph, math-rendering, quiz-state, focus-state, or low-glare changes to run visual regression QA, responsive checks, keyboard checks, and documented smoke verification."
---

# Frontend Regression Visual QA

Use this skill to verify that a frontend change did not damage the study experience.

## Read First

- `AGENTS.md`
- `docs/ui-system.md`
- `docs/testing-strategy.md`
- `docs/roadmap.md`

## QA Workflow

- Inspect the diff first and focus on changed surfaces.
- Check narrow and wide desktop layouts for overflow, overlap, clipped controls, and unstable graph or math dimensions.
- Check keyboard focus order and visible focus states for lesson navigation, reader controls, quizzes, export controls, and summary actions.
- Check selected, submitted, correct, incorrect, disabled, loading, empty, and error states when the changed surface can affect them.
- Check low-glare mode and reader typography settings when reader surfaces or CSS variables changed.
- Use local preview and browser screenshots when available; if browser tooling is blocked, record the exact blocker.

## Verification Rules

- Do not claim a browser or desktop smoke check passed unless it actually ran.
- Keep app tests proportional to the change. For docs-only skill edits, app tests are not required.
- For frontend code or CSS changes, prefer `npm.cmd run typecheck`, `npm.cmd test`, `npm.cmd run build`, and `git diff --check`.
- For local preview smoke, prefer the documented repo fallback: `npm.cmd run preview -- --port 4173` plus a probe to `http://127.0.0.1:4173`.
- Do not add visual regression dependencies without explicit approval.

## Fixed Output Template

When reporting, use these sections and nothing else:

- **Files touched** — diffs inspected, screenshots produced, smoke scripts run.
- **Risks / non-obvious interactions** — viewport-specific layout shifts, focus order regressions, Polished / Calm parity gaps, low-glare interactions.
- **Tests added or run** — exact commands executed (`npm.cmd run typecheck`, `npm.cmd test`, `npm.cmd run build`, `npm.cmd run preview -- --port 4173`, `git diff --check`); name any browser or desktop smoke skipped and the exact blocker.
- **Remaining work** — visual surfaces or states still unchecked.
- **What done means recap** — one or two sentences restating the QA outcome.

## What Done Means

A visual QA task is done when the changed study flow has been checked at the relevant sizes and states, automated checks have run where appropriate, and any skipped browser, desktop, or manual verification is documented precisely.

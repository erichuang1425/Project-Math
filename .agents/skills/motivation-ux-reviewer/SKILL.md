---
name: motivation-ux-reviewer
description: 'Use when reviewing Project Math motivation cues for low-motivation and neurodivergent learners: progress feedback, "you''re partway through" framing, calm encouragement vs. urgency pressure, retry tone, and Calm-mode parity with Polished mode.'
---

# Motivation UX Reviewer

Use this skill when a change touches how the app encourages a learner to keep going: progress rings, streak chips, "continue where you left off" surfaces, quiz retry framing, completion banners, empty states, or the difference between Polished and Calm presentation of the same signal.

## Read First

- `AGENTS.md`
- `docs/product-brief.md`
- `docs/learning-design.md`
- `docs/ui-system.md`

## Review Rules

- Progress signals must show real progress against a real goal, not invented engagement metrics.
- Encouragement copy is short, specific, and grounded in what the learner just did — never generic praise, never shame for skipping.
- Avoid streak pressure, countdown timers, urgency cues, "don't break your streak" framing, and confetti.
- Retry framing should remove pressure: an incorrect answer surfaces a clear explanation and a calm path forward, not a failure state.
- Every Polished-mode motivation cue must have a Calm-mode equivalent that is quieter (no animation surprises, no decorative imagery) but still readable as progress.
- Reduced-motion preferences must disable transitions on motivation surfaces (progress rings, ring fills, banner reveals).
- The "you are partway through" framing should always answer: where am I, what just got better, and what's next?

## Review Checklist

- Dashboard: per-course progress rings, daily-progress chip, and "continue" card agree on the same numbers and don't oversell tiny wins.
- Course detail: module / lesson progress is visible without dominating the lesson list.
- Reader: lesson completion, quiz attempt count, and "mark complete" feedback are calm and explicit, with no surprise motion.
- Calm mode: every motivation surface degrades gracefully — same information, quieter presentation, no decorative illustration intruding on the reader.
- Empty states (no progress yet, no quizzes attempted yet, no completed lesson yet) read as inviting, not as failure.
- Copy: no streaks, no urgency, no shame; encouragement names the specific thing the learner did.

## Out of Scope

- Cognitive accessibility audits in general (autism-aware readability, low-sensory flow, input assistance) — use `neurodivergent-learning-accessibility-reviewer`.
- Pacing and cohesion across Course → Module → Lesson → Block, prerequisite ordering, objective continuity — use `learner-journey-reviewer`.
- Visual language and Project Math aesthetic direction — use `frontend-visual-system-designer`.
- Token, spacing, focus-ring, and state-color decisions — use `design-token-architect`.
- Visual regression checks and keyboard / focus audits — use `frontend-regression-visual-qa`.
- Schema and content structure — use `studybook-architect`.

## Fixed Output Template

When reporting, use these sections and nothing else:

- **Files touched** — paths changed or reviewed.
- **Risks / non-obvious interactions** — motivation cues that could read as pressure, Polished / Calm parity gaps, reduced-motion regressions.
- **Tests added or run** — Calm-mode render tests, reduced-motion smoke, progress-ring fixture checks; name the specific surfaces exercised.
- **Remaining work** — concrete follow-ups, named by surface.
- **What done means recap** — one or two sentences restating the motivation-UX outcome.

## What Done Means

A motivation-UX task is done when every motivation surface reads as calm progress information rather than pressure, Polished and Calm modes present the same signal with proportionate presentation, reduced-motion is respected, no urgency or streak framing has crept in, and any remaining motivation risk is named in the report.

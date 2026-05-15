---
name: motivation-ux-reviewer
description: "Use when reviewing whether Project Math supports intrinsic motivation — competence, autonomy, and relatedness — without performative rewards, urgency cues, or discouragement patterns that undermine learner confidence or sustained engagement."
---

# Motivation UX Reviewer

Use this skill when a UI or content change may affect learner confidence, willingness to persist through difficulty, sense of progress, or feeling of control.

## Read First

- `AGENTS.md`
- `docs/product-brief.md`
- `docs/learning-design.md`
- `docs/ui-system.md`

## Related Skills

- Use `neurodivergent-learning-accessibility-reviewer` for autism-aware predictability and sensory concerns.
- Use `learner-journey-reviewer` for flow continuity and end-to-end navigation.

## Core Motivation Framework

### Competence

The learner should feel capable of making progress, not overwhelmed or shamed.

- Equations are introduced with plain-language context, not dropped cold.
- Worked examples show enough steps that the learner can follow the algebra.
- Common mistakes normalize errors as typical learning patterns, not failures.
- Quiz feedback gives a reason for the correct answer, not just "Wrong."
- The step rail lets the learner pace themselves through examples.
- Hint text (if shown) guides without mocking.

### Autonomy

The learner should feel in control of their own pace and path.

- No timers, streaks, or urgency labels.
- "Mark lesson complete" is a voluntary action, not auto-triggered.
- The glossary opens on demand; it does not interrupt reading flow.
- Reader controls (font size, spacing, low-glare) are available without quitting the lesson.
- Section navigation allows jumping back to re-read without penalty.
- Retry on a wrong quiz answer is immediate, low-friction, and non-punishing.

### Relatedness

The learner should feel the content matters, not that they are grinding abstract exercises.

- Worked examples connect the algebraic steps to a geometric or real-world interpretation where possible.
- Intuition blocks explain why a concept matters before requiring the learner to use it.
- Common mistake blocks treat misconceptions as understandable — not as stupidity.
- Lesson summaries confirm what the learner has covered, closing the loop.

## Anti-Patterns to Flag

- Confetti, animated trophies, streak counters, or gamification points.
- "Incorrect" labels in red without explanation of what was wrong.
- Walls of LaTeX without a plain-language anchor in the same block.
- Auto-scrolling, auto-advancing, or any animation the learner didn't trigger.
- Progress labels that count only completion, not partial progress (reading without answering).
- Empty states that look like app failures rather than expected starting points.
- Buttons labeled "Check" or "Submit" with no visible instructions on how to form an answer.

## Review Output

When reviewing, report:

- Motivation dimension affected (competence, autonomy, or relatedness).
- Specific block, component, or state that may undermine motivation.
- Concrete revision recommendation.
- Whether the risk is high (confident, anxious learners may disengage) or low (minor friction).

## What Done Means

A motivation-UX task is done when the reviewed surface treats the learner as a capable adult making a voluntary effort to understand mathematics — not as a player to retain or a student to grade.

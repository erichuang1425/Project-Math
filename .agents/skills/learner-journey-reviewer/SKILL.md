---
name: learner-journey-reviewer
description: "Use when reviewing learner pacing and cohesion across Project Math's Course → Module → Lesson → Block hierarchy, the \"what comes next\" framing, prerequisite ordering, objective continuity, and the overall motivation arc of a course."
---

# Learner Journey Reviewer

Use this skill when a slice changes the shape of a learner's path through the material: lesson ordering inside a module, module ordering inside a course, what a lesson promises in its objectives versus what its blocks actually deliver, or how the app frames "where you are" and "what comes next".

## Read First

- `AGENTS.md`
- `docs/product-brief.md`
- `docs/learning-design.md`
- `docs/content-schema.md`
- `docs/roadmap.md`

## Review Rules

- Each lesson's stated objectives must be reachable from the blocks the lesson actually contains.
- Prerequisites should be satisfied by an earlier lesson in the same course; a learner walking the course in order should never hit a forward reference.
- New ideas appear in the block that introduces them, not as background assumed by the next lesson.
- "Continue where you left off", lesson list ordering, breadcrumb labels, and inter-lesson links should agree on the same next step.
- Module boundaries should mark a real shift in topic, not a page break.
- The course should answer "why am I doing this lesson now?" before introducing new mechanics.

## Review Checklist

- Module-level: each module's lessons build on each other and end on a usable result (a definition, a rule, a worked example a learner could re-derive).
- Lesson-level: title, objectives, opening concept, and summary block agree on the same idea.
- Block-level: each block earns its place — title, concept, intuition, LaTeX, worked example, common mistake, graph, quiz, summary appear in an order that mirrors how a learner would actually approach the idea.
- Cross-lesson: terms introduced in one lesson are reused with the same notation and meaning in later lessons; glossary entries match.
- Navigation framing: dashboard, course detail, and reader views all surface a coherent "you are here / next up" cue.

## Out of Scope

- Visual polish, typography, hover/focus styling, and Project Math aesthetic direction — use `frontend-visual-system-designer`.
- Token, spacing, focus-ring, and state-color decisions — use `design-token-architect`.
- Cognitive-accessibility audits (autism-aware readability, low-sensory flow, input assistance) — use `neurodivergent-learning-accessibility-reviewer`.
- Motivation cues, encouragement framing, Calm-mode parity for low-motivation learners — use `motivation-ux-reviewer`.
- Math correctness of equations, graphs, or quiz feedback — use `math-rendering-reviewer`.
- Schema shape and validator rules — use `studybook-architect`.

## Fixed Output Template

When reporting, use these sections and nothing else:

- **Files touched** — paths changed or reviewed, grouped by area.
- **Risks / non-obvious interactions** — sequencing risks, prerequisite gaps, navigation framing that disagrees across views.
- **Tests added or run** — content-validation, fixture, or render tests exercised; explicit list of which lessons / modules were walked end-to-end.
- **Remaining work** — concrete follow-ups, named by lesson or block.
- **What done means recap** — one or two sentences restating the journey-level outcome.

## What Done Means

A learner-journey task is done when a learner walking the course in order encounters each idea after its prerequisites, each lesson's objectives match its blocks and summary, "what comes next" reads the same in every surface, and any remaining sequencing risk is named in the report.

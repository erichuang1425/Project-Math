# Product Brief

## Product

Project Math is a local-first desktop learning app for math and technical subjects. It combines the clarity of a structured textbook with the feedback and progress cues of an interactive study environment.

## Vision

Build a low-friction app where a learner can open a topic, read structured explanations, inspect LaTeX and graphs, step through worked examples, practice with quizzes, review common mistakes, and export useful notes.

The first version is deterministic: content is authored as structured files, validated locally, and rendered without network access. Future authoring tools may help create or revise course data, but lessons still pass through the same schema, review, and tests before they reach learners.

## First Course

**Calculus I** starts with functions and limits, builds the derivative from first principles, and then introduces the standard differentiation rules.

## Target Users

- Students learning calculus for the first time.
- Self-directed learners revising technical subjects.
- Content authors who need a reliable schema for math lessons.

## MVP Outcomes

A learner should be able to:

- Open the app offline.
- Select a course and resume the next lesson.
- Read explanations with correct LaTeX.
- Follow worked examples step by step.
- Inspect graphs tied to lesson data.
- Answer quizzes and receive deterministic feedback.
- Review common mistakes.
- Export a lesson summary.

## Non-Goals for MVP

- User accounts.
- Cloud sync.
- Remote runtime content generation.
- Arbitrary lesson pages written directly in React.
- A full symbolic algebra engine.
- A full graphing calculator.
- Collaborative editing.
- Marketplace or content distribution.

## Product Constraints

- Must work offline.
- Must use structured content.
- Must validate content before rendering.
- Must keep math content auditable.
- Must keep the app responsive on normal laptops.
- Must preserve deterministic rendering for the same content and learner state.

## Success Criteria

- A deterministic content file can represent a full lesson without JSX.
- The renderer can display every supported block type.
- Invalid content fails clearly before it reaches the main lesson view.
- New lessons can be added by editing structured content and tests, not by building one-off pages.

## What Done Means

Product scope work is done when:

- The MVP learner flow is documented in `docs/roadmap.md`.
- The studybook schema supports the lesson requirements.
- UI and testing docs describe how the MVP is verified.
- Any added scope has a matching non-goal decision or roadmap item.

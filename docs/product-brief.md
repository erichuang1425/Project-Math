# Product Brief

## Product

**Math Learning Desktop App** is a local-first desktop learning app for math and technical subjects. It should combine the clarity of a well-structured textbook with the interactivity of a study environment.

## Vision

Build a low-friction app where a learner can open a topic, read structured explanations, inspect LaTeX and graphs, step through worked examples, practice with quizzes, review common mistakes, and export useful notes.

The app should feel agent-native in the long term: content can eventually be generated, reviewed, revised, and extended by agents. The first version must remain deterministic: content is authored as structured files, validated locally, and rendered without network access.

## First MVP Topic

**Derivatives from First Principles**

The MVP should teach:

- The derivative as a limit of average rates of change.
- The difference quotient.
- Why the limit is needed.
- How to compute simple derivatives from first principles.
- How the graph connects secant slopes to tangent slope.
- Common mistakes such as canceling incorrectly, substituting too early, and ignoring the limit.

## Target Users

- Students learning calculus for the first time.
- Self-directed learners revising technical subjects.
- Future content authors who need a reliable schema for math lessons.

## MVP Outcomes

A learner should be able to:

- Open the app offline.
- Select the first lesson.
- Read explanations with correct LaTeX.
- Follow at least one worked first-principles derivative.
- Inspect at least one graph or graph placeholder tied to lesson data.
- Answer a quiz and receive deterministic feedback.
- Review common mistakes.
- Export a simple lesson summary or notes document.

## Non-Goals for MVP

- User accounts.
- Cloud sync.
- Remote AI calls.
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
- Must be maintainable by future coding agents using repository docs.

## Success Criteria

- A deterministic content file can represent the first lesson without JSX.
- The renderer can display every MVP block type.
- Invalid content fails clearly before it reaches the main lesson view.
- A future agent can add a second lesson by editing structured content and tests, not by building a one-off page.

## What Done Means

Product scope work is done when:

- The MVP learner flow is documented in `docs/roadmap.md`.
- The studybook schema supports the lesson requirements.
- UI and testing docs describe how the MVP will be verified.
- Any added scope has a matching non-goal decision or roadmap item.

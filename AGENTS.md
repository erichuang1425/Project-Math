# Math Learning Desktop App Agent Guide

This repository is for a serious long-term desktop application, not a demo. Treat every change as part of a maintainable local-first studybook platform.

## Product Direction

- Build a low-friction desktop learning app for math and technical subjects.
- The first MVP topic is "Derivatives from First Principles".
- The app should feel like an agent-native interactive studybook: structured lessons, LaTeX, graphs, diagrams, worked examples, common mistakes, quizzes, revision layers, and export.
- Do not generate arbitrary React pages as lesson content.
- Use a structured studybook schema and render it through reusable block renderer components.
- The app must be usable offline.
- AI-assisted lesson generation is future-facing. The first version must use deterministic content files and deterministic validation.

## Preferred Stack

- Desktop shell: Tauri, unless a concrete blocker is documented.
- Frontend: React, TypeScript, Vite.
- Styling: Tailwind or CSS modules. Choose only after checking which gives the cleaner local implementation.
- Math rendering: KaTeX.
- Graphs: start behind a small graphing abstraction. Do not add a graphing library until the first graph requirements are known and alternatives are compared.
- Storage: local JSON for MVP, with interfaces shaped so SQLite can replace or back it later.
- Tests: unit tests for schema, parser, and rendering logic; component tests where useful; smoke tests for desktop behavior.

## Repository Shape

Expected planning docs:

- `docs/product-brief.md`: product scope and MVP boundaries.
- `docs/architecture.md`: technical architecture and dependency rules.
- `docs/learning-design.md`: instructional structure and correctness rules.
- `docs/content-schema.md`: versioned studybook schema.
- `docs/ui-system.md`: reusable UI rules and quality bar.
- `docs/testing-strategy.md`: required test layers and regression policy.
- `docs/roadmap.md`: implementation sequence with done criteria.

Expected local skills:

- `.agents/skills/studybook-architect/SKILL.md`
- `.agents/skills/math-rendering-reviewer/SKILL.md`
- `.agents/skills/desktop-app-engineer/SKILL.md`
- `.agents/skills/learner-journey-reviewer/SKILL.md` — end-to-end learning flow (replaces `ux-quality-reviewer`)
- `.agents/skills/motivation-ux-reviewer/SKILL.md` — intrinsic motivation and learner confidence
- `.agents/skills/neurodivergent-learning-accessibility-reviewer/SKILL.md`
- `.agents/skills/test-and-regression-reviewer/SKILL.md`
- `.agents/skills/ux-quality-reviewer/SKILL.md` — superseded; kept for reference only

## Implementation Rules

1. Read the relevant docs before making changes.
2. Keep content as structured data. Do not encode lessons as bespoke pages, markdown blobs, or JSX-only content.
3. Keep domain logic outside React components when practical.
4. Prefer small files with clear ownership over broad utility files.
5. Add schema validation before adding content that depends on the schema.
6. Use stable IDs for lessons, sections, blocks, examples, quizzes, and glossary terms.
7. Keep renderers deterministic. A given content file should render the same lesson offline without network access.
8. Do not introduce telemetry, cloud sync, accounts, or remote AI calls without explicit approval.

## Dependency Policy

Ask before adding a dependency when it is:

- A runtime dependency.
- A graphing, diagramming, editor, database, AI, sync, analytics, or UI framework dependency.
- Larger than a narrow utility.
- A replacement for a dependency already chosen in the docs.

You may add a development dependency without asking only when all of these are true:

- It is already named in the docs or common to the chosen stack.
- It is needed for tests, linting, formatting, or build tooling.
- It does not change runtime behavior.

When proposing a dependency, include:

- Why it is needed now.
- What alternatives were considered.
- Offline behavior.
- Maintenance risk.
- Bundle or desktop footprint impact.

## Math Correctness Rules

- Every mathematical claim must be traceable to a lesson objective, definition, example, or cited assumption in the content.
- LaTeX must compile in KaTeX before content is accepted.
- Worked examples must show enough algebraic steps for the intended learner level.
- Graphs must label axes, domain assumptions, units when relevant, and special points.
- Do not silently simplify away domain restrictions, undefined points, limiting behavior, or sign assumptions.
- Common mistakes must state the misconception, the incorrect step, and the correction.
- Quizzes must include the correct answer, plausible distractors, and feedback for each option.

## UI Quality Rules

- Build the actual study experience first, not a marketing landing page.
- Keep the desktop app quiet, readable, and task-focused.
- Use reusable layout, navigation, lesson, block, math, graph, quiz, and review components.
- Avoid decorative UI that competes with math content.
- Text must not overflow controls or overlap on small windows.
- Keyboard and pointer use should both work for core lesson navigation and quizzes.
- UI states must cover loading, empty, invalid content, focused, selected, submitted, correct, incorrect, and disabled states where applicable.

## Testing Rules

- Schema and parser changes require unit tests with valid and invalid fixtures.
- Block renderer changes require tests for the affected block types.
- Math renderer changes require tests for display math, inline math, invalid LaTeX, and fallback behavior.
- Quiz changes require tests for scoring, feedback, retry rules, and state persistence if persistence is involved.
- Desktop integration changes require a smoke test or documented manual smoke path.
- Do not mark work complete if tests were skipped without saying exactly why.

## What Done Means

Every implementation task must state its done criteria before or during the change. A task is done only when:

- The behavior is implemented in the correct layer.
- Relevant docs or schema examples are updated.
- Tests are added or updated for the changed behavior.
- The app or affected package builds, or any build blocker is documented.
- The change works offline.
- New dependencies, if any, were approved under the dependency policy.
- Known follow-up work is listed in `docs/roadmap.md` or the final response.

## Agent Workflow

Before editing:

- Inspect the current repository state.
- Read the relevant docs.
- Identify which local skill applies.
- State the files you expect to touch.

During editing:

- Keep changes scoped.
- Prefer deterministic fixtures and examples.
- Do not move unrelated files.
- Do not overwrite user changes.

Before finishing:

- Run the most relevant verification available.
- Summarize changed files.
- Say what was not tested.
- Give the next concrete task.

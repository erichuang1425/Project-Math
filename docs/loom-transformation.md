# Loom Transformation — Read + Fill Active Recall

## Why

[loom-notes](https://github.com/Polaris-Aeterna/loom-notes) is a method (and a
XeLaTeX class + Claude skill) for study notes a learner both **reads** (clean
statements, intuition) and **fills** (blanks, proof skeletons, "your turn"
computations). Retention comes from active recall, not re-reading. Project-Math
already leans the same way — the Observe → Predict → Calculate → Compare → Answer
→ Summarize micro-flow, common-mistake blocks, quizzes — but it had no device for
the core Loom move: _read-mostly prose with the high-value clauses blanked out_.

This document is the plan for bringing Loom's pedagogy into the app. Loom typesets
LaTeX; Project-Math is a deterministic, offline JSON + KaTeX studybook, so we keep
Loom's **method** and map its **grammar** onto the block schema rather than
shipping LaTeX.

## Principles carried over from Loom

- **The source is the answer key; the notes are the scaffold.** Answers travel
  with the content so the learner can self-check.
- **~70% read / 30% fill.** Blank the operative term, formula, constraint, or
  punchline — never so much that the sentence stops reading.
- **Find the spine.** Reorganize a topic around its one organizing idea.
- **Honesty / attribution.** When a passage tracks a copyrighted source, say so
  (`fillIn.source`).

## Grammar mapping (Loom device → Project-Math)

| Loom device                      | Project-Math equivalent           | Status   |
| -------------------------------- | --------------------------------- | -------- |
| `\fillin{…}` blank a clause      | `fillIn` block, `blank` run       | shipped  |
| read-only statement / `strand`   | `concept` / `intuition` / `latex` | existing |
| `example` (worked instance)      | `workedExample`                   | existing |
| `proof` + `\TODO{step}` skeleton | derivation-skeleton block         | planned  |
| `yourturn` + `\workspace`        | `yourTurn` block                  | planned  |
| `\warmth{0..5}` self-assessment  | `warmth` self-check (persisted)   | planned  |
| `\recall{…}` margin prompt       | `revision.recallPrompts` / blank  | partial  |
| source attribution               | `fillIn.source`                   | shipped  |

## Phases

### Phase 1 — `fillIn` block (shipped)

The signature Loom primitive. A `fillIn` block holds a `runs` stream that
interleaves `text` (read) with `blank` (recall) runs; each blank carries the
`answer` (RichText, may be math) and an optional `hint`.

- Schema: `FillInBlock` / `FillInRun` in `src/content/schema.ts`.
- Validation: ≥1 blank, unique kebab-case blank ids, KaTeX-checked answers, no
  whitespace-only text runs (`src/content/validateContent.ts`).
- Renderer: `FillInBlockView` — hidden-by-default blanks, per-blank and global
  reveal, live progress counter, accessible (border + label, never color alone).
- Skill: `.agents/skills/fill-in-notes/` (SKILL + method + block-mapping refs).
- Content: a recall passage in the `derivative-as-a-limit` lesson.

### Phase 2 — `yourTurn` block (planned)

Restage a worked example as a learner-completed exercise: a prompt, optional
given, a hidden model solution, and workspace affordance. Mirrors Loom's
`yourturn` + `\workspace`. Likely reuses `WorkedStep` shape with hidden steps.

### Phase 3 — derivation / proof skeletons (planned)

Extend `workedExample` (or a sibling block) so individual steps can be marked
"fill" — the learner supplies the key move before revealing. Mirrors `\TODO`.

### Phase 4 — warmth + persisted recall (planned)

A per-section `warmth{0..5}` self-assessment and recall prompts, persisted in
learner state (`src/storage/learnerState.ts`) so progress and "try again without
looking" history survive reloads. Mirrors `\warmth` and `\recall`.

### Phase 5 — authoring sweep (planned)

Once the blocks exist, add read + fill passages across the Calculus I course at a
consistent 70/30 ratio, and teach the `fill-in-notes` skill to author them.

## Out of scope

- The XeLaTeX class / PDF output — Project-Math renders in-app via KaTeX.
- Grading or scoring fill-in answers — reveals are self-check, not assessed
  (quizzes remain the graded surface).

## Attribution

The `fill-in-notes` skill and method are adapted from
[Polaris-Aeterna/loom-notes](https://github.com/Polaris-Aeterna/loom-notes)
(MIT License). Project-Math reimplements the pedagogy against its own schema and
renderer; no LaTeX or Loom source files are vendored.

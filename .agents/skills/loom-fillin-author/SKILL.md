---
name: loom-fillin-author
description: Use when authoring or reviewing fill-in (active-recall) blocks — turning expository lesson prose into "notes you both read and fill", with reveal-able blanks and an optional warmth self-check.
---

# Loom Fill-in Author

Use this skill when adding or revising `fillIn` blocks: the active-recall layer
ported from the Loom "fill-in study notes" method. A fill-in block is exposition
the learner **reads**, with the highest-value steps left **blank** for them to
work out and then reveal. It is the in-app, schema-validated equivalent of Loom's
`\fillin`, `\TODO`, and `yourturn` devices — no LaTeX class, just the existing
Course → Module → Lesson → Block model.

## Read First

- `AGENTS.md`
- `docs/loom-active-recall.md` (the method and how it maps to the schema)
- `docs/content-schema.md` (the `fillIn` block contract)
- `docs/learning-design.md`

## The Method

- **Read, then fill.** Keep prose readable end-to-end; blank only the steps worth
  recalling. Target roughly **70% read / 30% fill** — a wall of blanks is not a
  study aid.
- **Blank high-value steps.** Definitions' operative clause, the load-bearing
  algebra step, the result a learner should be able to reproduce. Never blank
  connective tissue ("therefore", "we get").
- **One idea per blank.** A blank holds a single term, clause, or expression the
  learner can commit to before revealing — not a whole derivation.
- **Hints are nudges, not answers.** Use the optional `hint` for a category cue
  ("ratio", "outer × inner"), never a restatement of the answer.
- **Warmth is a checkpoint.** Add `warmthPrompt` where a learner should pause and
  self-rate how settled the idea feels (Loom's `\warmth{0..5}`). It is a
  reflection prompt, not a score that is graded or persisted.

## Authoring Rules

- A `fillIn` block's `prompt` is a mixed stream of `text`, `inlineMath`, `term`,
  and `blank` segments. It **must** contain at least one `blank`.
- Each `blank` carries a non-empty `answer`. Set `isLatex: true` when the answer
  is math — it is then validated through KaTeX like any other expression.
- Reference glossary terms with `term` segments inside the prompt; don't redefine
  inline. The popover works inside fill-in prose exactly as in concept blocks.
- Put the read-only framing (the "warp threads") in `intro`; keep the fillable
  work in `prompt`.
- Prefer placing a fill-in block **after** the worked example it reinforces and
  **before** the quiz, as an active-recall bridge.

## Review Checklist

Check that the change:

- Keeps the block readable if every blank stayed hidden (the prose still teaches).
- Blanks high-value recall targets, not filler — and stays near the 70/30 balance.
- Gives every blank a correct, KaTeX-valid answer (`isLatex` where appropriate).
- Uses hints that cue, not reveal.
- Adds or updates a paired invalid fixture for any new validation behavior.
- Leaves rendering deterministic and offline; warmth state stays ephemeral.

## Out of Scope

This skill owns the pedagogy and authored content of fill-in blocks. It does
**not**:

- Change the schema, validator contract, or renderer boundaries — hand off to
  `studybook-architect`.
- Write the tests that exercise new validation or rendering — hand off to
  `test-and-regression-reviewer`.
- Judge the math correctness of the answers themselves — use
  `math-rendering-reviewer`.
- Tune the block's visual presentation or Calm-mode parity — use
  `frontend-visual-system-designer` and `neurodivergent-learning-accessibility-reviewer`.
- Sequence lessons across a module — use `learner-journey-reviewer`.

## Fixed Output Template

When reporting, use these sections and nothing else:

- **Files touched** — content fixtures, schema/validator/renderer only if handed
  back from another skill.
- **Risks / non-obvious interactions** — gap density, blanked steps that break
  readability, answers that depend on un-taught results.
- **Tests added or run** — fixture coverage and validator branches; note tests
  recommended but handed off to `test-and-regression-reviewer`.
- **Remaining work** — pending blanks, warmth checkpoints, follow-up lessons.
- **What done means recap** — one or two sentences restating the learning outcome.

## What Done Means

A fill-in authoring task is done when:

- The block reads cleanly with blanks hidden and rewards working them out.
- Every blank has a correct, validated answer and an optional cue-level hint.
- Gap density sits near 70% read / 30% fill.
- `npm run typecheck && npm run lint && npm test && npm run build` are green.
- The content works fully offline.

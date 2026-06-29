---
name: fill-in-notes
description: >-
  Author Loom-style "read + fill" study content for Project-Math — lessons a
  learner both READS (clean statements, intuition, worked examples) and FILLS
  (blanks recalled from memory before revealing) so retention comes from active
  recall. In this app the device is the deterministic `fillIn` block, not LaTeX.
  Use when turning a derivation, definition chain, or rule into a recall passage
  with gaps to fill. Triggers: "make fill-in notes", "turn this into notes I can
  fill in", "add a recall passage", "skeleton / guided study notes", "读+填 笔记".
  NOT for a plain summary or content where every detail is spelled out (that
  kills the active layer) — use a concept/summary block for those.
---

# Fill-in notes — the Loom method, adapted for Project-Math

Adapted from the [loom-notes](https://github.com/Polaris-Aeterna/loom-notes)
`fill-in-notes` Claude skill (MIT). Loom typesets `\fillin` blanks in XeLaTeX;
Project-Math is a deterministic, offline JSON + KaTeX studybook. This skill keeps
Loom's **pedagogy** (read + fill, ~70% read / 30% fill, the source is the answer
key) and maps its **grammar** onto the existing block schema.

## Read first

- `AGENTS.md` — block model, math correctness, accessibility floor.
- `docs/learning-design.md` — the Observe → Predict → Calculate → Compare →
  Answer → Summarize micro-flow and the read + fill model.
- `docs/content-schema.md` — the `fillIn` block contract.
- `.agents/skills/studybook-architect/SKILL.md` — schema/validation boundaries.

## Pipeline

1. **Find the spine.** Name the ONE organizing idea of the source (a definition
   chain, a single rule the rest orbits) and reorganize around it. Do not
   transcribe section by section.
2. **Draft the read layer** with existing blocks: `concept`, `intuition`,
   `latex`, `graph`, `workedExample` — state results in full so the notes are
   readable on their own.
3. **Engineer the gaps (~70% read / 30% fill).** Add a `fillIn` block whose
   `runs` interleave prose (`text`) with `blank` runs. Blank the high-value
   _thinking_ moves — the formula, the constraint, the limit step — never so much
   that the sentence stops being readable.
4. **Place the recall before the check.** A `fillIn` pause goes _before_ the
   quiz, in the Calculate/Compare zone — consistent with the "pause prompt before
   the quiz" rule in `AGENTS.md`.
5. **Validate + verify.** `validateContent` must pass; run
   `npm run typecheck && npm run lint && npm test && npm run build`. Mount the
   block in jsdom to confirm reveal/hide and the progress counter.

## The Loom grammar → Project-Math mapping

| Loom device                   | role                         | Project-Math equivalent                                                                    |
| ----------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------ |
| `strand` (one-line thesis)    | the big idea, read-only      | `intuition.takeaway` or a `concept` lead                                                   |
| `definition` / `theorem` knot | state it (read)              | `concept` / `latex` block                                                                  |
| `\fillin{…}`                  | blank a key clause           | `fillIn` block → `blank` run with `answer`                                                 |
| `proof` + `\TODO{step}`       | skeleton to complete         | `workedExample` with a later `fillIn` recall (full proof-skeleton block is a future phase) |
| `example` (weld knot)         | worked instance              | `workedExample` block                                                                      |
| `yourturn` + `\workspace`     | the active zone              | `fillIn` today; a dedicated `yourTurn` block is a planned phase                            |
| `\warmth{0..5}`               | self-assessment              | planned `warmth` self-check (future phase)                                                 |
| `\recall{question}`           | parked recall prompt         | `fillIn` blank or `revision.recallPrompts`                                                 |
| source attribution            | honesty about copied results | `fillIn.source` field                                                                      |

Detail: `reference/loom-method.md` (pedagogy) and `reference/block-mapping.md`
(field-by-field authoring of the `fillIn` block).

## Authoring rules for `fillIn`

- Every `blank` needs a stable kebab-case `id` and an `answer` (RichText, may be
  `inlineMath`). Add a `hint` for the harder blanks — it shows as the placeholder
  and on hover before reveal.
- At least one `blank` per block (a block with no blanks is just prose — use
  `concept` instead). The validator enforces this.
- Do not blank so much that the read layer breaks. Keep whole clauses readable;
  blank the operative term, formula, or constraint.
- Text runs may not be whitespace-only (the validator trims and rejects them);
  rely on the blank's own spacing.
- When the passage closely tracks a copyrighted source, set `source` and prefer
  an original example over a verbatim restatement.

## What done means

- The `fillIn` block validates and renders; blanks reveal/hide and the progress
  counter updates.
- The read layer stands on its own; the fill layer adds recall, not confusion.
- Math renders in KaTeX; correctness cues never rely on color alone.
- `npm run typecheck && npm run lint && npm test && npm run build` are green.
- `docs/content-schema.md` stays in sync with `src/content/schema.ts`.

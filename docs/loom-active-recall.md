# Loom Active-Recall Layer

This document records a deliberate transformation of Project-Math: adopting the
pedagogy of [**Loom**](https://github.com/Polaris-Aeterna/loom-notes) —
"fill-in study notes" — as a first-class, schema-validated layer of the learning
app.

## Where this came from

Loom is an XeLaTeX document class plus a Claude skill for building **fill-in
study notes**: documents you both _read_ and _fill_. Exposition flows readably,
but the highest-value reasoning steps are left blank for the learner to work out.
Its devices are `\fillin` (blank a term or clause), `\TODO{step}` (a proof gap),
the `yourturn` environment (a restaged exercise), and `\warmth{0..5}` (a
self-assessment gauge). It frames a page as cloth on a loom — **warp threads**
(the foundational ideas), **knots** (theorems and definitions), and **loose
threads** (open questions) — and targets roughly **70% read / 30% fill**.

Project-Math is a different artifact: a local-first, deterministic MOOC-style app
where lessons are structured JSON (Course → Module → Lesson → **Block**),
validated before rendering, with one renderer per block type. We can't drop a
LaTeX class into it. What we _can_ adopt is the method.

## The mapping

| Loom device           | Project-Math equivalent                                             |
| --------------------- | ------------------------------------------------------------------- |
| `\fillin` / `\TODO`   | a `blank` segment inside a `fillIn` block — hidden, revealed on tap |
| `yourturn`            | the `fillIn` block itself: read the framing, then work the blanks   |
| read-only exposition  | `intro` segments (the "warp threads") and non-blank prompt prose    |
| `\warmth{0..5}`       | `warmthPrompt` → an interactive 0–5 gauge (ephemeral reader state)  |
| `\keyword` / glossary | existing `term` segments + course glossary popover                  |
| 70% read / 30% fill   | an authoring rule enforced by review, not a wall of blanks          |

The block contract lives in `docs/content-schema.md`; the authoring discipline
lives in the `loom-fillin-author` skill (`.agents/skills/loom-fillin-author/`).

## Why a new block type (not a new app mode)

- It stays inside the one invariant that makes this codebase maintainable by
  agents: **content is structured data, validated before rendering.** A fill-in
  block validates like any other — at least one blank, KaTeX-checked answers.
- It composes with everything already built: glossary terms, Calm/Polished
  modes, the section rail, the reader controls, exports.
- It is deterministic and fully offline. Revealing a blank is local UI state; no
  network, no AI at runtime.

## What shipped in the first slice

- **`fillIn` block type** — `FillInBlock` + `FillInSegment` in
  `src/content/schema.ts`, added to the `Block` union.
- **Validation** — `validateFillIn` in `src/content/validateContent.ts`
  (≥1 blank, non-empty/KaTeX-valid answers, optional string `warmthPrompt`),
  with paired invalid-fixture tests.
- **Renderer** — `src/rendering/blocks/FillInBlockView.tsx`: reveal-on-tap blanks
  (icon + label + border, never color alone), an ephemeral 0–5 warmth gauge,
  glossary terms inside prompt prose. Wired into `BlockRenderer`.
- **Content** — a fill-in block in the minimal-course validator fixture and a
  real one in the Calculus I **chain-rule** lesson ("Weave the chain rule
  yourself").
- **Skill** — `loom-fillin-author`, the authoring discipline for fill-in blocks.

## Plan / roadmap

Tracked as **Phase 8 — Loom Active-Recall Layer** in `docs/roadmap.md`. Ordered
next steps:

1. **Persist warmth.** Lift the warmth gauge into learner state (keyed by
   `courseId` + `lessonId` + `blockId`) so a learner's self-assessment survives
   reload — mirrors how quiz attempts persist today. Needs a storage shape +
   Tauri command, so it is its own slice.
2. **Surface fill-in work in exports.** Include each fill-in prompt (with answers)
   in the lesson summary export, so a learner can study offline.
3. **Loose threads.** Add an optional margin "loose thread" affordance (open
   questions tied to a lesson) — Loom's selvage-edge `\loose{…}`.
4. **Author more fill-in blocks.** Add one to each Module C lesson as the
   active-recall bridge between the worked example and the quiz.
5. **Revision integration.** Let `RevisionLayer` reference fill-in blocks the way
   it references quizzes and mistakes today.

## Authoring rules (summary)

- Keep the prose teaching even with every blank hidden.
- Blank high-value recall targets; aim for ~70% read / 30% fill.
- One idea per blank; hints cue a category, never restate the answer.
- Use `isLatex: true` for math answers so they validate through KaTeX.
- Place a fill-in block after the worked example it reinforces, before the quiz.

See the `loom-fillin-author` skill for the full checklist and output template.

## Attribution

The method and vocabulary are adapted from Loom
(`Polaris-Aeterna/loom-notes`, MIT). We reimplement the _pedagogy_ in our own
schema and renderer; no Loom source is vendored.

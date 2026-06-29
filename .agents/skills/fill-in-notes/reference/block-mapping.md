# Authoring the `fillIn` block

Field-by-field reference for the Loom "read + fill" device in Project-Math.
Authoritative types live in `src/content/schema.ts`; validation in
`src/content/validateContent.ts`.

## Shape

```ts
type FillInBlock = {
  type: "fillIn";
  id: string; // kebab-case, unique in the lesson
  objectiveIds?: string[]; // cross-reference Lesson.objectives[].id
  estimatedMinutes?: number;
  title: string;
  intro?: RichTextSegment[]; // optional read-only framing line
  runs: FillInRun[]; // prose + blanks, in order
  source?: string; // attribution when the passage tracks a source
};

type FillInRun =
  | { kind: "text"; segments: RichTextSegment[] }
  | { kind: "blank"; id: string; answer: RichTextSegment[]; hint?: string };
```

`RichTextSegment` is the shared `{ kind: "text" | "inlineMath" | "term" }` union,
so blanks can hold math (`inlineMath`) and prose can link glossary `term`s.

## Rules the validator enforces

- `title` is a non-empty string; `runs` is a non-empty array.
- At least one `blank` run exists (otherwise it is just prose — use `concept`).
- Each `blank` has a kebab-case `id`, unique within the block, and a valid
  `answer` (RichText; any `inlineMath` must render in KaTeX).
- `hint` and `source`, when present, are strings.
- Text segments may **not** be whitespace-only — the validator trims and rejects
  them. Do not insert a `{ "kind": "text", "value": " " }` spacer between a term
  and a blank; the blank carries its own margin.

## Worked authoring example

```json
{
  "type": "fillIn",
  "id": "first-principles-recall",
  "objectiveIds": ["derivative-as-a-limit-obj-2"],
  "title": "Recall: from average slope to derivative",
  "intro": [{ "kind": "text", "value": "Rebuild the chain from memory, then reveal." }],
  "runs": [
    { "kind": "text", "segments": [{ "kind": "text", "value": "The average slope is the " }] },
    {
      "kind": "blank",
      "id": "recall-difference-quotient",
      "answer": [{ "kind": "inlineMath", "latex": "\\frac{f(x+h)-f(x)}{h}" }],
      "hint": "f(x+h) - f(x) over h"
    },
    { "kind": "text", "segments": [{ "kind": "text", "value": ", valid only while " }] },
    {
      "kind": "blank",
      "id": "recall-h-nonzero",
      "answer": [{ "kind": "inlineMath", "latex": "h \\ne 0" }]
    },
    { "kind": "text", "segments": [{ "kind": "text", "value": "." }] }
  ]
}
```

## Rendering behavior (`FillInBlockView`)

- Blanks start hidden; the learner recalls, then clicks to reveal (click again to
  hide). State is per-render — this is self-check, not a graded quiz.
- A "Reveal all / Hide all" control toggles every blank.
- A live "N of M blanks revealed" counter gives visible progress.
- Hints show as the placeholder and on hover before reveal. Reveal state changes
  border style (dashed → solid) and label, never color alone.

## Pitfalls (Project-Math edition)

- **Whitespace-only text run** → validation error. Let the blank's margin space it.
- **Bad KaTeX in an answer** → validation error; test the LaTeX renders.
- **Too many blanks** breaks the read layer. Keep ~70% readable.
- **Blank ids must be stable** — progress/export reference them; don't reuse the
  array index.
- **Place the recall before the quiz**, not after the common-mistake block (see
  `AGENTS.md` pause-prompt rule).

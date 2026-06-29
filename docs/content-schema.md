# Content Schema

## Goal

The content schema is the contract between authored learning material and the app. It must be deterministic, versioned, testable, and suitable for future AI-assisted authoring. Lessons are never bespoke React components.

## Format

Course files are JSON, validated at load by `validateContent`. TypeScript types in `src/content/schema.ts` mirror the JSON shape one-for-one.

## Hierarchy

`Course → Module → Lesson → Block` (with `Glossary` at the course level).

## Top-Level Course

```ts
type Course = {
  schemaVersion: "2.0";
  id: string;
  slug: string;
  title: string;
  subject: "math" | "technical";
  level: "intro" | "core" | "stretch";
  summary: string;
  illustrationId: string;
  prerequisites: string[];
  modules: Module[];
  glossary: GlossaryTerm[];
};
```

## Module

```ts
type Module = {
  id: string;
  title: string;
  summary: string;
  lessons: Lesson[];
};
```

## Lesson

```ts
type Lesson = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  objectives: LessonObjective[];
  prerequisiteLessonIds: string[];
  estimatedMinutes: number;
  difficulty: "intro" | "core" | "stretch";
  sections: LessonSection[];
  revision?: RevisionLayer;
};

type LessonSection = {
  id: string;
  title: string;
  blocks: Block[];
};

type LessonObjective = {
  id: string;
  text: string;
};
```

Blocks live inside `Lesson.sections[].blocks`, not directly on the lesson. The reader uses section titles as in-lesson landmarks; `courseHelpers.lessonBlocks(lesson)` flattens sections when callers need a flat block list.

## Block

```ts
type Block =
  | TitleBlock
  | ConceptBlock
  | IntuitionBlock
  | LatexBlock
  | WorkedExampleBlock
  | GraphBlock
  | CommonMistakeBlock
  | FillInBlock
  | QuizBlock
  | SummaryBlock;
```

Every block has `id` (required) and optional `objectiveIds?: string[]` cross-referencing `Lesson.objectives[].id`, plus optional `estimatedMinutes?: number`.

### Rich Text Segment

```ts
type RichTextSegment =
  | { kind: "text"; value: string }
  | { kind: "inlineMath"; latex: string }
  | { kind: "term"; termId: string; label: string };
```

`term` segments resolve against the course `glossary` and open a popover in the reader. Every `termId` must match a `GlossaryTerm.id`.

### Concept, Intuition, LaTeX, Worked Example, Graph, Common Mistake, Quiz, Summary, Title

Block payloads are unchanged from schemaVersion 1.0 except for the universal `id` + optional `objectiveIds` + optional `estimatedMinutes` additions. See `src/content/schema.ts` for the authoritative source.

### Fill-In Block (`fillIn`)

The Loom-inspired "read + fill" device. The body is a stream of `runs` —
prose the learner reads interleaved with blanks the learner recalls before
revealing. The answer travels with the content, so the source stays the answer
key and the rendered notes are the scaffold. See
`.agents/skills/fill-in-notes/` for the authoring method.

```ts
type FillInBlock = {
  type: "fillIn";
  id: string;
  objectiveIds?: string[];
  estimatedMinutes?: number;
  title: string;
  intro?: RichTextSegment[]; // optional read-only framing
  runs: FillInRun[]; // prose + blanks, in order
  source?: string; // attribution when the passage tracks a source
};

type FillInRun =
  | { kind: "text"; segments: RichTextSegment[] }
  | { kind: "blank"; id: string; answer: RichTextSegment[]; hint?: string };
```

Validation requires a non-empty `title`, a non-empty `runs` array, at least one
`blank` run, kebab-case blank `id`s unique within the block, and `answer`
RichText whose `inlineMath` renders in KaTeX. Text segments may not be
whitespace-only.

`WorkedExampleBlock` also accepts two reader-polish fields:

- `steps[i].actionCue` — optional short verb-like cue (≤32 chars) shown as a chip on the step pill and inside the active step panel. Use it to label what the step _does_ ("Substitute", "Expand", "Cancel", "Take limit").
- `finalAnswer` — optional `{ latex: string; summary?: string }`. Renders as a distinct "Final answer" band below the steps, separate from `interpretation` (which stays a prose sentence about meaning).

## Glossary

```ts
type GlossaryTerm = {
  id: string;
  term: string;
  definition: string;
  aliases?: string[];
  latex?: string;
};
```

Lives at the course level. The reader resolves `term` segments by `id` and shows the definition (and optional rendered LaTeX) in a `<dialog>` popover.

## ID Rules

- IDs are lowercase kebab-case.
- IDs are unique within their parent collection.
- IDs are stable across edits (progress, exports, and annotations reference them).
- Never use array index as identity.

## Validation Rules

`validateContent` rejects:

- Unknown `schemaVersion` (only `"2.0"` is accepted).
- Unknown block type.
- A `fillIn` block with no `blank` run, an unknown run kind, or duplicate blank ids.
- Empty `objectives`, `blocks`, or `modules`.
- Empty or duplicate IDs at any level.
- LaTeX fields that fail KaTeX rendering.
- Quizzes whose `correctOptionId` doesn't match an option, or whose questions miss per-option feedback.
- Graphs without axis labels or with non-finite samples.
- `term` segments whose `termId` is not in the course glossary.
- `prerequisiteLessonIds` that point outside the course or form a cycle.
- `objectiveIds` on a block that don't match the lesson's `objectives[].id`.

Every validation rule has a paired invalid fixture under `src/content/fixtures/invalid/`.

## Minimal Example

```json
{
  "schemaVersion": "2.0",
  "id": "calculus-i",
  "slug": "calculus-i",
  "title": "Calculus I",
  "subject": "math",
  "level": "intro",
  "summary": "Foundations through derivatives and differentiation rules.",
  "illustrationId": "tangent-curve",
  "prerequisites": ["algebra", "functions"],
  "modules": [
    {
      "id": "foundations",
      "title": "Foundations",
      "summary": "Functions, graphs, and limits.",
      "lessons": [
        {
          "id": "derivative-definition",
          "slug": "derivative-definition",
          "title": "Derivative as a limit",
          "summary": "Build the derivative from slopes between two points.",
          "objectives": [{ "id": "obj-define", "text": "State the derivative as a limit" }],
          "prerequisiteLessonIds": [],
          "estimatedMinutes": 24,
          "difficulty": "intro",
          "sections": [
            {
              "id": "definition",
              "title": "Definition",
              "blocks": [
                {
                  "type": "latex",
                  "id": "derivative-definition-formula",
                  "objectiveIds": ["obj-define"],
                  "latex": "f'(x)=\\lim_{h\\to 0}\\frac{f(x+h)-f(x)}{h}",
                  "caption": "Derivative from first principles",
                  "display": true
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "glossary": [
    {
      "id": "derivative",
      "term": "derivative",
      "definition": "Instantaneous rate of change of a function at a point.",
      "aliases": ["instantaneous rate"]
    }
  ]
}
```

## What Done Means

Schema work is done when:

- TypeScript types and `validateContent` agree.
- Valid and invalid fixtures exist for every rule.
- Tests cover every accepted and rejected shape.
- Renderer tests mount each affected block type in jsdom.
- Existing content files are migrated or fail with a clear error.
- `docs/content-schema.md` (this file) stays in sync with `src/content/schema.ts`.

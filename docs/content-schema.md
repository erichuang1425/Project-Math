# Content Schema

## Goal

The studybook schema is the contract between authored lesson content and the app. It must be deterministic, versioned, testable, and suitable for future AI-assisted generation.

Do not represent lessons as arbitrary React components.

## Format

Use JSON for MVP content files. TypeScript types should mirror the JSON schema. Runtime validation must happen before rendering.

## Top-Level Studybook

```ts
type Studybook = {
  schemaVersion: "1.0";
  id: string;
  title: string;
  subject: "math" | "technical";
  topic: string;
  summary: string;
  prerequisites: string[];
  lessons: Lesson[];
  glossary?: GlossaryEntry[];
};
```

## Lesson

```ts
type Lesson = {
  id: string;
  title: string;
  summary: string;
  objectives: string[];
  estimatedMinutes?: number;
  sections: LessonSection[];
  revision?: RevisionLayer;
};
```

## Section

```ts
type LessonSection = {
  id: string;
  title: string;
  blocks: StudyBlock[];
};
```

## Blocks

```ts
type StudyBlock =
  | TitleBlock
  | ConceptBlock
  | IntuitionBlock
  | LatexBlock
  | WorkedExampleBlock
  | GraphBlock
  | CommonMistakeBlock
  | QuizBlock
  | SummaryBlock;
```

### Title Block

```ts
type TitleBlock = {
  type: "title";
  id: string;
  kicker?: string;
  title: string;
  subtitle?: string;
  objectives?: RichTextSegment[][];
};
```

### Rich Text Segment

```ts
type RichTextSegment =
  | { kind: "text"; value: string }
  | { kind: "inlineMath"; latex: string }
  | { kind: "term"; termId: string; label: string };
```

### Concept Block

```ts
type ConceptBlock = {
  type: "concept";
  id: string;
  title: string;
  body: RichTextSegment[];
  keyIdeas?: RichTextSegment[][];
};
```

### Intuition Block

```ts
type IntuitionBlock = {
  type: "intuition";
  id: string;
  title: string;
  body: RichTextSegment[];
  takeaway?: RichTextSegment[];
};
```

### LaTeX Block

```ts
type LatexBlock = {
  type: "latex";
  id: string;
  latex: string;
  caption?: string;
  display?: boolean;
};
```

### Worked Example Block

```ts
type WorkedExampleBlock = {
  type: "workedExample";
  id: string;
  title: string;
  goal: string;
  given?: string;
  steps: WorkedStep[];
  interpretation?: string;
};

type WorkedStep = {
  id: string;
  label: string;
  explanation: string;
  latex?: string;
};
```

### Graph Block

```ts
type GraphBlock = {
  type: "graph";
  id: string;
  title: string;
  description: string;
  spec: GraphSpec;
};

type GraphSpec = {
  xAxis: AxisSpec;
  yAxis: AxisSpec;
  series: GraphSeries[];
  annotations?: GraphAnnotation[];
};

type AxisSpec = {
  label: string;
  min: number;
  max: number;
  ticks?: number[];
};

type GraphSeries =
  | {
      kind: "function";
      id: string;
      label: string;
      expression: string;
      domain?: [number, number];
      samples?: Array<[number, number]>;
    }
  | { kind: "points"; id: string; label: string; points: Array<[number, number]> }
  | { kind: "line"; id: string; label: string; through: [[number, number], [number, number]] };

type GraphAnnotation = {
  id: string;
  label: string;
  point?: [number, number];
  text?: string;
};
```

`expression` is display data for MVP. Do not evaluate arbitrary expressions without a reviewed parser.

For `function` series, `samples` may provide explicit authored points for deterministic SVG curve rendering. When present, `samples` must contain at least two finite coordinate pairs. The renderer connects those samples with an SVG polyline; it does not compute points from `expression`.

### Common Mistake Block

```ts
type CommonMistakeBlock = {
  type: "commonMistake";
  id: string;
  title: string;
  misconception: string;
  incorrectStep: string;
  whyWrong: string;
  correction: string;
  checkPrompt?: string;
};
```

### Quiz Block

```ts
type QuizBlock = {
  type: "quiz";
  id: string;
  title?: string;
  questions: QuizQuestion[];
};

type QuizQuestion =
  | MultipleChoiceQuestion
  | ShortAnswerQuestion;

type MultipleChoiceQuestion = {
  kind: "multipleChoice";
  id: string;
  prompt: RichTextSegment[];
  options: QuizOption[];
  correctOptionId: string;
  conceptTags: string[];
  hint?: string;
};

type QuizOption = {
  id: string;
  text: RichTextSegment[];
  feedback: string;
};

type ShortAnswerQuestion = {
  kind: "shortAnswer";
  id: string;
  prompt: RichTextSegment[];
  acceptedAnswers: string[];
  feedback: {
    correct: string;
    incorrect: string;
  };
  conceptTags: string[];
  hint?: string;
};
```

### Summary Block

```ts
type SummaryBlock = {
  type: "summary";
  id: string;
  items: RichTextSegment[][];
};
```

## Revision Layer

```ts
type RevisionLayer = {
  keyIdeas: string[];
  recallPrompts: string[];
  mistakeIds: string[];
  quizIds: string[];
};
```

## Glossary

```ts
type GlossaryEntry = {
  id: string;
  term: string;
  definition: string;
  latex?: string;
};
```

## ID Rules

- IDs must be stable and lowercase kebab-case.
- IDs must be unique within their parent collection.
- Block IDs must be stable enough for progress, annotations, and export references.
- Do not use array index as identity.

## Validation Rules

Runtime validation must reject:

- Unknown `schemaVersion`.
- Unknown block type.
- Empty lesson objectives.
- Empty sections.
- Empty block IDs.
- Duplicate IDs within the same parent.
- LaTeX fields that fail KaTeX rendering.
- Quiz questions without correct feedback.
- Multiple-choice questions whose `correctOptionId` does not match an option.
- Graphs without axis labels.
- Function graph samples that are not finite coordinate pairs.

## Minimal Example

```json
{
  "schemaVersion": "1.0",
  "id": "derivatives-first-principles",
  "title": "Derivatives from First Principles",
  "subject": "math",
  "topic": "calculus",
  "summary": "Learn the derivative as a limit of average rates of change.",
  "prerequisites": ["algebra", "functions", "limits"],
  "lessons": [
    {
      "id": "difference-quotient",
      "title": "The Difference Quotient",
      "summary": "Connect average rate of change to the derivative definition.",
      "objectives": ["Explain the difference quotient", "Compute the derivative of x^2 from first principles"],
      "sections": [
        {
          "id": "definition",
          "title": "Definition",
          "blocks": [
            {
              "type": "latex",
              "id": "derivative-definition",
              "latex": "f'(x)=\\lim_{h\\to 0}\\frac{f(x+h)-f(x)}{h}",
              "caption": "Derivative from first principles"
            }
          ]
        }
      ]
    }
  ]
}
```

## What Done Means

Schema work is done when:

- TypeScript types and runtime validation agree.
- Valid and invalid fixtures exist.
- Unit tests cover required and rejected shapes.
- Renderer tests cover every block type affected by the change.
- Existing content files are migrated or fail with a clear error.

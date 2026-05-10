import type { GraphSpec } from "../graphs/graphSpec";

export type SchemaVersion = "1.0";
export type StudybookSubject = "math" | "technical";

export type Studybook = {
  schemaVersion: SchemaVersion;
  id: string;
  title: string;
  subject: StudybookSubject;
  topic: string;
  summary: string;
  prerequisites: string[];
  lessons: Lesson[];
  glossary?: GlossaryEntry[];
};

export type Lesson = {
  id: string;
  title: string;
  summary: string;
  objectives: string[];
  estimatedMinutes?: number;
  sections: LessonSection[];
  revision?: RevisionLayer;
};

export type LessonSection = {
  id: string;
  title: string;
  blocks: StudyBlock[];
};

export type RichTextSegment =
  | { kind: "text"; value: string }
  | { kind: "inlineMath"; latex: string }
  | { kind: "term"; termId: string; label: string };

export type StudyBlock =
  | TitleBlock
  | ConceptBlock
  | IntuitionBlock
  | LatexBlock
  | GraphBlock
  | WorkedExampleBlock
  | CommonMistakeBlock
  | QuizBlock
  | SummaryBlock;

export type TitleBlock = {
  type: "title";
  id: string;
  kicker?: string;
  title: string;
  subtitle?: string;
  objectives?: RichTextSegment[][];
};

export type ConceptBlock = {
  type: "concept";
  id: string;
  title: string;
  body: RichTextSegment[];
  keyIdeas?: RichTextSegment[][];
};

export type IntuitionBlock = {
  type: "intuition";
  id: string;
  title: string;
  body: RichTextSegment[];
  takeaway?: RichTextSegment[];
};

export type LatexBlock = {
  type: "latex";
  id: string;
  latex: string;
  caption?: string;
  display?: boolean;
};

export type GraphBlock = {
  type: "graph";
  id: string;
  title: string;
  description: string;
  spec: GraphSpec;
};

export type WorkedExampleBlock = {
  type: "workedExample";
  id: string;
  title: string;
  goal: string;
  given?: string;
  steps: WorkedStep[];
  interpretation?: string;
};

export type WorkedStep = {
  id: string;
  label: string;
  explanation: string;
  latex?: string;
};

export type CommonMistakeBlock = {
  type: "commonMistake";
  id: string;
  title: string;
  misconception: string;
  incorrectStep: string;
  whyWrong: string;
  correction: string;
  checkPrompt?: string;
};

export type QuizBlock = {
  type: "quiz";
  id: string;
  title?: string;
  questions: QuizQuestion[];
};

export type QuizQuestion = MultipleChoiceQuestion | ShortAnswerQuestion;

export type MultipleChoiceQuestion = {
  kind: "multipleChoice";
  id: string;
  prompt: RichTextSegment[];
  options: QuizOption[];
  correctOptionId: string;
  conceptTags: string[];
  hint?: string;
};

export type QuizOption = {
  id: string;
  text: RichTextSegment[];
  feedback: string;
};

export type ShortAnswerQuestion = {
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

export type SummaryBlock = {
  type: "summary";
  id: string;
  items: RichTextSegment[][];
};

export type RevisionLayer = {
  keyIdeas: string[];
  recallPrompts: string[];
  mistakeIds: string[];
  quizIds: string[];
};

export type GlossaryEntry = {
  id: string;
  term: string;
  definition: string;
  latex?: string;
};

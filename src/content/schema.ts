import type { GraphSpec } from "../graphs/graphSpec";

/**
 * Content schema v2.
 *
 * Course → Module → Lesson → Block, with a course-level Glossary.
 * Every Course, Module, Lesson, and Block has a required stable kebab-case id.
 * Blocks may cross-reference Lesson.objectives via objectiveIds.
 * RichText `term` segments reference Course.glossary entries by id.
 */

export type ContentSchemaVersion = "2.0";
export type ContentSubject = "math" | "technical";
export type ContentLevel = "intro" | "core" | "stretch";

export interface Course {
  schemaVersion: ContentSchemaVersion;
  id: string;
  slug: string;
  title: string;
  subject: ContentSubject;
  level: ContentLevel;
  summary: string;
  illustrationId?: string;
  prerequisites: string[];
  modules: Module[];
  glossary: GlossaryTerm[];
}

export interface Module {
  id: string;
  title: string;
  summary: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  slug: string;
  title: string;
  summary: string;
  objectives: LessonObjective[];
  prerequisiteLessonIds: string[];
  estimatedMinutes: number;
  difficulty: ContentLevel;
  sections: LessonSection[];
  revision?: RevisionLayer;
}

export interface LessonSection {
  id: string;
  title: string;
  blocks: Block[];
}

export interface LessonObjective {
  id: string;
  text: string;
}

export type RichTextSegment =
  | { kind: "text"; value: string }
  | { kind: "inlineMath"; latex: string }
  | { kind: "term"; termId: string; label: string };

export type Block =
  | TitleBlock
  | ConceptBlock
  | IntuitionBlock
  | LatexBlock
  | GraphBlock
  | WorkedExampleBlock
  | CommonMistakeBlock
  | QuizBlock
  | SummaryBlock;

export interface BlockBase {
  id: string;
  objectiveIds?: string[];
  estimatedMinutes?: number;
}

export interface TitleBlock extends BlockBase {
  type: "title";
  kicker?: string;
  title: string;
  subtitle?: string;
  objectives?: RichTextSegment[][];
}

export interface ConceptBlock extends BlockBase {
  type: "concept";
  title: string;
  body: RichTextSegment[];
  keyIdeas?: RichTextSegment[][];
}

export interface IntuitionBlock extends BlockBase {
  type: "intuition";
  title: string;
  body: RichTextSegment[];
  takeaway?: RichTextSegment[];
}

export interface LatexBlock extends BlockBase {
  type: "latex";
  latex: string;
  caption?: string;
  display?: boolean;
}

export interface GraphBlock extends BlockBase {
  type: "graph";
  title: string;
  description: string;
  spec: GraphSpec;
}

export interface WorkedExampleBlock extends BlockBase {
  type: "workedExample";
  title: string;
  goal: string;
  given?: string;
  steps: WorkedStep[];
  interpretation?: string;
}

export interface WorkedStep {
  id: string;
  label: string;
  explanation: string;
  latex?: string;
}

export interface CommonMistakeBlock extends BlockBase {
  type: "commonMistake";
  title: string;
  misconception: string;
  incorrectStep: string;
  whyWrong: string;
  correction: string;
  checkPrompt?: string;
}

export interface QuizBlock extends BlockBase {
  type: "quiz";
  title?: string;
  questions: QuizQuestion[];
}

export type QuizQuestion = MultipleChoiceQuestion | ShortAnswerQuestion;

export interface MultipleChoiceQuestion {
  kind: "multipleChoice";
  id: string;
  prompt: RichTextSegment[];
  options: QuizOption[];
  correctOptionId: string;
  conceptTags: string[];
  hint?: string;
}

export interface QuizOption {
  id: string;
  text: RichTextSegment[];
  feedback: string;
}

export interface ShortAnswerQuestion {
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
}

export interface SummaryBlock extends BlockBase {
  type: "summary";
  items: RichTextSegment[][];
}

export interface RevisionLayer {
  keyIdeas: string[];
  recallPrompts: string[];
  mistakeIds: string[];
  quizIds: string[];
}

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  aliases?: string[];
  latex?: string;
}

/**
 * Locator helper for validation messages.
 */
export interface ContentPath {
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  blockId?: string;
  step?: string;
}

/**
 * Tiny derived helpers used by both the renderer and validator.
 */
export function isBlockOfType<T extends Block["type"]>(
  block: Block,
  type: T
): block is Extract<Block, { type: T }> {
  return block.type === type;
}

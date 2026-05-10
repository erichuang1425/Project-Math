import { getQuizAttempts, type LearnerState } from "../storage/learnerState";
import type {
  CommonMistakeBlock,
  LatexBlock,
  Lesson,
  QuizBlock,
  QuizQuestion,
  RichTextSegment,
  StudyBlock,
  Studybook,
  WorkedExampleBlock,
  WorkedStep
} from "../studybook/schema";

export type LessonSummaryExport = {
  studybookId: string;
  lessonId: string;
  studybookTitle: string;
  lessonTitle: string;
  lessonSummary: string;
  progress: LessonSummaryProgress;
  objectives: string[];
  keyDefinitions: LessonSummaryDefinition[];
  workedExamples: LessonSummaryWorkedExample[];
  commonMistakes: LessonSummaryCommonMistake[];
  quizResults: LessonSummaryQuizResult[];
};

export type LessonSummaryProgress = {
  status: "unavailable" | "not-started" | "in-progress" | "completed";
  label: string;
};

export type LessonSummaryDefinition =
  | {
      kind: "formula";
      id: string;
      title: string;
      latex: string;
    }
  | {
      kind: "glossary";
      id: string;
      term: string;
      definition: string;
      latex?: string;
    };

export type LessonSummaryWorkedExample = {
  id: string;
  title: string;
  goal: string;
  given?: string;
  steps: WorkedStep[];
  interpretation?: string;
};

export type LessonSummaryCommonMistake = {
  id: string;
  title: string;
  misconception: string;
  incorrectStep: string;
  whyWrong: string;
  correction: string;
  checkPrompt?: string;
};

export type LessonSummaryQuizResult = {
  quizBlockId: string;
  quizTitle: string;
  questionId: string;
  prompt: string;
  attemptCount: number;
  latestAnswer: string;
  latestIsCorrect: boolean;
};

export function buildLessonSummaryExport(
  studybook: Studybook,
  lesson: Lesson,
  learnerState?: LearnerState
): LessonSummaryExport {
  const matchingLearnerState =
    learnerState?.studybookId === studybook.id ? learnerState : undefined;
  const blocks = getLessonBlocks(lesson);

  return {
    studybookId: studybook.id,
    lessonId: lesson.id,
    studybookTitle: studybook.title,
    lessonTitle: lesson.title,
    lessonSummary: lesson.summary,
    progress: buildProgressSummary(lesson, matchingLearnerState),
    objectives: [...lesson.objectives],
    keyDefinitions: [
      ...blocks.filter(isLatexBlock).map(buildFormulaDefinition),
      ...(studybook.glossary ?? []).map((entry) => ({
        kind: "glossary" as const,
        id: entry.id,
        term: entry.term,
        definition: entry.definition,
        latex: entry.latex
      }))
    ],
    workedExamples: blocks.filter(isWorkedExampleBlock).map((block) => ({
      id: block.id,
      title: block.title,
      goal: block.goal,
      given: block.given,
      steps: block.steps.map((step) => ({ ...step })),
      interpretation: block.interpretation
    })),
    commonMistakes: blocks.filter(isCommonMistakeBlock).map((block) => ({
      id: block.id,
      title: block.title,
      misconception: block.misconception,
      incorrectStep: block.incorrectStep,
      whyWrong: block.whyWrong,
      correction: block.correction,
      checkPrompt: block.checkPrompt
    })),
    quizResults: buildQuizResults(lesson, blocks, matchingLearnerState)
  };
}

export function renderLessonSummaryMarkdown(summary: LessonSummaryExport): string {
  const lines: string[] = [];

  lines.push(`# ${summary.lessonTitle}`);
  lines.push("");
  lines.push(`Studybook: ${summary.studybookTitle}`);
  lines.push(`Progress: ${summary.progress.label}`);
  lines.push("");
  lines.push(summary.lessonSummary);
  lines.push("");

  lines.push("## Objectives");
  appendList(lines, summary.objectives);
  lines.push("");

  lines.push("## Key Definitions");
  if (summary.keyDefinitions.length === 0) {
    lines.push("No key definitions found.");
  } else {
    summary.keyDefinitions.forEach((definition) => {
      if (definition.kind === "formula") {
        lines.push(`- ${definition.title}: $${definition.latex}$`);
        return;
      }

      const latex = definition.latex ? ` ($${definition.latex}$)` : "";
      lines.push(`- ${definition.term}${latex}: ${definition.definition}`);
    });
  }
  lines.push("");

  lines.push("## Worked Examples");
  if (summary.workedExamples.length === 0) {
    lines.push("No worked examples found.");
  } else {
    summary.workedExamples.forEach((example) => {
      lines.push(`### ${example.title}`);
      lines.push("");
      lines.push(`Goal: ${example.goal}`);
      if (example.given) {
        lines.push(`Given: ${example.given}`);
      }
      lines.push("");
      example.steps.forEach((step, index) => {
        lines.push(`${index + 1}. ${step.label} - ${step.explanation}`);
        if (step.latex) {
          lines.push(`   $${step.latex}$`);
        }
      });
      if (example.interpretation) {
        lines.push("");
        lines.push(`Interpretation: ${example.interpretation}`);
      }
      lines.push("");
    });
  }

  lines.push("## Common Mistakes");
  if (summary.commonMistakes.length === 0) {
    lines.push("No common mistakes found.");
  } else {
    summary.commonMistakes.forEach((mistake) => {
      lines.push(`### ${mistake.title}`);
      lines.push("");
      lines.push(`- Misconception: ${mistake.misconception}`);
      lines.push(`- Incorrect step: ${mistake.incorrectStep}`);
      lines.push(`- Why it is wrong: ${mistake.whyWrong}`);
      lines.push(`- Correction: ${mistake.correction}`);
      if (mistake.checkPrompt) {
        lines.push(`- Check: ${mistake.checkPrompt}`);
      }
      lines.push("");
    });
  }

  lines.push("## Quiz Results");
  if (summary.quizResults.length === 0) {
    lines.push("No saved quiz results.");
  } else {
    summary.quizResults.forEach((result) => {
      lines.push(`- ${result.quizTitle}: ${result.prompt}`);
      lines.push(`  Attempts: ${result.attemptCount}`);
      lines.push(`  Latest result: ${result.latestIsCorrect ? "Correct" : "Review"}`);
      lines.push(`  Latest answer: ${result.latestAnswer}`);
    });
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

export function lessonSummaryExportFileName(summary: LessonSummaryExport): string {
  return `${summary.studybookId}-${summary.lessonId}-summary.md`;
}

function appendList(lines: string[], items: string[]) {
  if (items.length === 0) {
    lines.push("No items found.");
    return;
  }

  items.forEach((item) => lines.push(`- ${item}`));
}

function getLessonBlocks(lesson: Lesson): StudyBlock[] {
  return lesson.sections.flatMap((section) => section.blocks);
}

function buildProgressSummary(
  lesson: Lesson,
  learnerState: LearnerState | undefined
): LessonSummaryProgress {
  if (!learnerState) {
    return {
      status: "unavailable",
      label: "No learner state available"
    };
  }

  const progress = learnerState.lessons[lesson.id];
  if (!progress) {
    return {
      status: "not-started",
      label: "Not started"
    };
  }

  return {
    status: progress.status,
    label: progress.status === "completed" ? "Completed" : "In progress"
  };
}

function buildFormulaDefinition(block: LatexBlock): LessonSummaryDefinition {
  return {
    kind: "formula",
    id: block.id,
    title: block.caption ?? block.id,
    latex: block.latex
  };
}

function buildQuizResults(
  lesson: Lesson,
  blocks: StudyBlock[],
  learnerState: LearnerState | undefined
): LessonSummaryQuizResult[] {
  if (!learnerState) {
    return [];
  }

  return blocks.filter(isQuizBlock).flatMap((block) =>
    block.questions.flatMap((question) => {
      const attempts = getQuizAttempts(learnerState, lesson.id, block.id, question.id);
      if (attempts.length === 0) {
        return [];
      }

      const latestAttempt = attempts[attempts.length - 1];
      return [
        {
          quizBlockId: block.id,
          quizTitle: block.title ?? "Quiz",
          questionId: question.id,
          prompt: renderRichTextAsPlainText(question.prompt),
          attemptCount: attempts.length,
          latestAnswer: describeQuizAnswer(question, latestAttempt.answer),
          latestIsCorrect: latestAttempt.isCorrect
        }
      ];
    })
  );
}

function describeQuizAnswer(question: QuizQuestion, answer: string): string {
  if (question.kind === "multipleChoice") {
    const option = question.options.find((item) => item.id === answer);
    return option ? renderRichTextAsPlainText(option.text) : answer;
  }

  return answer.trim().length > 0 ? answer : "(blank)";
}

function renderRichTextAsPlainText(segments: RichTextSegment[]): string {
  return segments
    .map((segment) => {
      switch (segment.kind) {
        case "text":
          return segment.value;
        case "inlineMath":
          return `$${segment.latex}$`;
        case "term":
          return segment.label;
      }
    })
    .join("")
    .trim();
}

function isLatexBlock(block: StudyBlock): block is LatexBlock {
  return block.type === "latex";
}

function isWorkedExampleBlock(block: StudyBlock): block is WorkedExampleBlock {
  return block.type === "workedExample";
}

function isCommonMistakeBlock(block: StudyBlock): block is CommonMistakeBlock {
  return block.type === "commonMistake";
}

function isQuizBlock(block: StudyBlock): block is QuizBlock {
  return block.type === "quiz";
}

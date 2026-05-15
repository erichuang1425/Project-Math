import { describe, expect, it } from "vitest";
import {
  createEmptyLearnerState,
  markLessonCompleted,
  recordQuizAttempt
} from "../storage/learnerState";
import sourceStudybook from "../studybook/fixtures/derivatives-first-principles.studybook.json";
import { validateStudybook } from "../studybook/validateStudybook";
import {
  buildLessonSummaryExport,
  lessonSummaryExportFileName,
  renderLessonSummaryMarkdown
} from "./lessonSummaryExport";

function getValidatedLesson(lessonId = "derivative-as-a-limit") {
  const result = validateStudybook(sourceStudybook);

  if (!result.ok) {
    throw new Error(result.errors.map((error) => error.message).join(", "));
  }

  const lesson = result.studybook.lessons.find(
    (candidate) => candidate.id === lessonId
  );

  if (!lesson) {
    throw new Error(`Missing lesson ${lessonId}`);
  }

  return {
    studybook: result.studybook,
    lesson
  };
}

describe("lesson summary export", () => {
  it("builds deterministic export data from structured content and learner state", () => {
    const { studybook, lesson } = getValidatedLesson();
    const firstAttempt = recordQuizAttempt(
      markLessonCompleted(
        createEmptyLearnerState(studybook.id),
        lesson.id,
        "2026-05-09T12:10:00.000Z"
      ),
      {
        lessonId: lesson.id,
        quizBlockId: "first-principles-check",
        questionId: "valid-cancellation-step",
        answer: "substitute-zero-first",
        isCorrect: false,
        submittedAt: "2026-05-09T12:03:00.000Z"
      }
    );
    const state = recordQuizAttempt(firstAttempt, {
      lessonId: lesson.id,
      quizBlockId: "first-principles-check",
      questionId: "valid-cancellation-step",
      answer: "factor-before-limit",
      isCorrect: true,
      submittedAt: "2026-05-09T12:05:00.000Z"
    });

    const summary = buildLessonSummaryExport(studybook, lesson, state);

    expect(summary).toMatchObject({
      studybookId: "derivatives-first-principles",
      lessonId: "derivative-as-a-limit",
      lessonTitle: "Derivative as a Limit",
      progress: {
        status: "completed",
        label: "Completed"
      }
    });
    expect(summary.objectives).toHaveLength(5);
    expect(summary.keyDefinitions.map((definition) => definition.id)).toEqual([
      "first-principles-definition",
      "derivative",
      "difference-quotient",
      "secant-line"
    ]);
    expect(summary.workedExamples.map((example) => example.id)).toEqual([
      "derivative-of-x-squared",
      "derivative-of-linear-function"
    ]);
    expect(summary.commonMistakes.map((mistake) => mistake.id)).toEqual([
      "forget-parentheses-around-linear-function",
      "substitute-h-too-early"
    ]);
    expect(summary.quizResults).toEqual([
      {
        quizBlockId: "first-principles-check",
        quizTitle: "Check: safe limit step",
        questionId: "valid-cancellation-step",
        prompt:
          "What must happen before you evaluate the limit for $\\frac{(x+h)^2-x^2}{h}$?",
        attemptCount: 2,
        latestAnswer:
          "Factor the numerator as $h(2x+h)$, cancel h while $h\\ne 0$, then take the limit.",
        latestIsCorrect: true
      }
    ]);
  });

  it("renders stable markdown without generated timestamps", () => {
    const { studybook, lesson } = getValidatedLesson();
    const state = recordQuizAttempt(
      markLessonCompleted(
        createEmptyLearnerState(studybook.id),
        lesson.id,
        "2026-05-09T12:10:00.000Z"
      ),
      {
        lessonId: lesson.id,
        quizBlockId: "linear-function-check",
        questionId: "slope-of-linear-function",
        answer: "3",
        isCorrect: true,
        submittedAt: "2026-05-09T12:12:00.000Z"
      }
    );
    const summary = buildLessonSummaryExport(studybook, lesson, state);
    const markdown = renderLessonSummaryMarkdown(summary);

    expect(markdown).toContain("# Derivative as a Limit");
    expect(markdown).toContain("Progress: Completed");
    expect(markdown).toContain("## Key Definitions");
    expect(markdown).toContain(
      "- Formal rule. Compare f(x+h) to f(x), divide by the nonzero gap h, then let h approach 0.: $f'(x)=\\lim_{h\\to 0}\\frac{f(x+h)-f(x)}{h}$"
    );
    expect(markdown).toContain("### Derivative of f(x) = x^2");
    expect(markdown).toContain("## Quiz Results");
    expect(markdown).toContain("Latest result: Correct");
    expect(markdown).toContain("Latest answer: 3");
    expect(markdown).not.toMatch(/\d{4}-\d{2}-\d{2}T/);
    expect(renderLessonSummaryMarkdown(summary)).toBe(markdown);
  });

  it("omits quiz results when matching learner state is unavailable", () => {
    const { studybook, lesson } = getValidatedLesson();
    const otherState = recordQuizAttempt(createEmptyLearnerState("other-studybook"), {
      lessonId: lesson.id,
      quizBlockId: "first-principles-check",
      questionId: "valid-cancellation-step",
      answer: "factor-before-limit",
      isCorrect: true,
      submittedAt: "2026-05-09T12:05:00.000Z"
    });

    const summary = buildLessonSummaryExport(studybook, lesson, otherState);
    const markdown = renderLessonSummaryMarkdown(summary);

    expect(summary.progress).toEqual({
      status: "unavailable",
      label: "No learner state available"
    });
    expect(summary.quizResults).toEqual([]);
    expect(markdown).toContain("No saved quiz results.");
    expect(lessonSummaryExportFileName(summary)).toBe(
      "derivatives-first-principles-derivative-as-a-limit-summary.md"
    );
  });

  it("exports the constant-function lesson with deterministic quiz results", () => {
    const { studybook, lesson } = getValidatedLesson("constant-function-derivative");
    const state = recordQuizAttempt(
      markLessonCompleted(
        createEmptyLearnerState(studybook.id),
        lesson.id,
        "2026-05-14T09:20:00.000Z"
      ),
      {
        lessonId: lesson.id,
        quizBlockId: "constant-function-check",
        questionId: "constant-derivative-value",
        answer: "0",
        isCorrect: true,
        submittedAt: "2026-05-14T09:25:00.000Z"
      }
    );

    const summary = buildLessonSummaryExport(studybook, lesson, state);
    const markdown = renderLessonSummaryMarkdown(summary);

    expect(summary).toMatchObject({
      lessonId: "constant-function-derivative",
      lessonTitle: "Constant Function Derivative",
      progress: {
        status: "completed",
        label: "Completed"
      }
    });
    expect(summary.keyDefinitions.map((definition) => definition.id)).toEqual([
      "constant-first-principles-definition",
      "derivative",
      "difference-quotient",
      "secant-line"
    ]);
    expect(summary.workedExamples.map((example) => example.id)).toEqual([
      "derivative-of-constant-function"
    ]);
    expect(summary.commonMistakes.map((mistake) => mistake.id)).toEqual([
      "treating-constant-as-slope"
    ]);
    expect(summary.quizResults).toEqual([
      {
        quizBlockId: "constant-function-check",
        quizTitle: "Check: constant function",
        questionId: "constant-derivative-value",
        prompt: "For $f(x)=7$, what is $f'(x)$?",
        attemptCount: 1,
        latestAnswer: "0",
        latestIsCorrect: true
      }
    ]);
    expect(markdown).toContain("# Constant Function Derivative");
    expect(markdown).toContain("### Derivative of f(x) = 7");
    expect(markdown).toContain("Latest answer: 0");
    expect(lessonSummaryExportFileName(summary)).toBe(
      "derivatives-first-principles-constant-function-derivative-summary.md"
    );
  });
});

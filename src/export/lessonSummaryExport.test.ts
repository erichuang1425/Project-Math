import { describe, expect, it } from "vitest";
import courseJson from "../content/fixtures/courses/calculus-i.course.json";
import { eachLesson, findLesson, validateContent } from "../content";
import {
  createEmptyLearnerState,
  markLessonCompleted,
  recordQuizAttempt
} from "../storage/learnerState";
import {
  buildLessonSummaryExport,
  lessonSummaryExportFileName,
  renderLessonSummaryMarkdown
} from "./lessonSummaryExport";

function getValidatedLesson(lessonId = "derivative-as-a-limit") {
  const result = validateContent(courseJson);
  if (!result.ok) {
    throw new Error(result.errors.map((error) => `${error.path}: ${error.message}`).join("\n"));
  }
  const location = findLesson(result.course, lessonId);
  if (!location) {
    throw new Error(`Missing lesson ${lessonId}`);
  }
  return { course: result.course, lesson: location.lesson };
}

describe("lesson summary export", () => {
  it("builds deterministic export data from structured content and learner state", () => {
    const { course, lesson } = getValidatedLesson();
    const firstAttempt = recordQuizAttempt(
      markLessonCompleted(
        createEmptyLearnerState(course.id),
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

    const summary = buildLessonSummaryExport(course, lesson, state);

    expect(summary).toMatchObject({
      courseId: "calculus-i",
      lessonId: "derivative-as-a-limit",
      lessonTitle: "Derivative as a Limit",
      courseTitle: "Calculus I",
      progress: {
        status: "completed",
        label: "Completed"
      }
    });
    expect(summary.objectives).toHaveLength(5);
    expect(
      summary.keyDefinitions.find((definition) => definition.id === "derivative")
    ).toBeDefined();
    expect(summary.workedExamples.map((example) => example.id)).toEqual([
      "derivative-of-x-squared",
      "derivative-of-linear-function"
    ]);
    expect(summary.commonMistakes.map((mistake) => mistake.id)).toEqual([
      "forget-parentheses-around-linear-function",
      "substitute-h-too-early"
    ]);
    expect(summary.quizResults[0]).toMatchObject({
      quizBlockId: "first-principles-check",
      questionId: "valid-cancellation-step",
      attemptCount: 2,
      latestIsCorrect: true
    });
  });

  it("renders stable markdown without generated timestamps", () => {
    const { course, lesson } = getValidatedLesson();
    const state = recordQuizAttempt(
      markLessonCompleted(
        createEmptyLearnerState(course.id),
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
    const summary = buildLessonSummaryExport(course, lesson, state);
    const markdown = renderLessonSummaryMarkdown(summary);

    expect(markdown).toContain("# Derivative as a Limit");
    expect(markdown).toContain("Course: Calculus I");
    expect(markdown).toContain("Progress: Completed");
    expect(markdown).toContain("## Key Definitions");
    expect(markdown).toContain("### Derivative of f(x) = x^2");
    expect(markdown).toContain("## Quiz Results");
    expect(markdown).toContain("Latest result: Correct");
    expect(markdown).toContain("Latest answer: 3");
    expect(markdown).not.toMatch(/\d{4}-\d{2}-\d{2}T/);
    expect(renderLessonSummaryMarkdown(summary)).toBe(markdown);
  });

  it("omits quiz results when matching learner state is unavailable", () => {
    const { course, lesson } = getValidatedLesson();
    const otherState = recordQuizAttempt(createEmptyLearnerState("other-course"), {
      lessonId: lesson.id,
      quizBlockId: "first-principles-check",
      questionId: "valid-cancellation-step",
      answer: "factor-before-limit",
      isCorrect: true,
      submittedAt: "2026-05-09T12:05:00.000Z"
    });

    const summary = buildLessonSummaryExport(course, lesson, otherState);
    const markdown = renderLessonSummaryMarkdown(summary);

    expect(summary.progress).toEqual({
      status: "unavailable",
      label: "No learner state available"
    });
    expect(summary.quizResults).toEqual([]);
    expect(markdown).toContain("No saved quiz results.");
    expect(lessonSummaryExportFileName(summary)).toBe(
      "calculus-i-derivative-as-a-limit-summary.md"
    );
  });

  it("exports the constant-function lesson with deterministic quiz results", () => {
    const { course, lesson } = getValidatedLesson("constant-function-derivative");
    const state = recordQuizAttempt(
      markLessonCompleted(
        createEmptyLearnerState(course.id),
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

    const summary = buildLessonSummaryExport(course, lesson, state);
    const markdown = renderLessonSummaryMarkdown(summary);

    expect(summary).toMatchObject({
      lessonId: "constant-function-derivative",
      lessonTitle: "Constant Function Derivative",
      progress: { status: "completed", label: "Completed" }
    });
    expect(summary.workedExamples.map((example) => example.id)).toEqual([
      "derivative-of-constant-function"
    ]);
    expect(summary.commonMistakes.map((mistake) => mistake.id)).toEqual([
      "treating-constant-as-slope"
    ]);
    expect(summary.quizResults[0]).toMatchObject({
      quizBlockId: "constant-function-check",
      questionId: "constant-derivative-value",
      latestAnswer: "0",
      latestIsCorrect: true
    });
    expect(markdown).toContain("# Constant Function Derivative");
    expect(markdown).toContain("Latest answer: 0");
    expect(lessonSummaryExportFileName(summary)).toBe(
      "calculus-i-constant-function-derivative-summary.md"
    );
  });

  it("includes every migrated lesson via eachLesson", () => {
    const result = validateContent(courseJson);
    if (!result.ok) throw new Error("Course should validate.");
    expect(eachLesson(result.course)).toHaveLength(11);
  });
});

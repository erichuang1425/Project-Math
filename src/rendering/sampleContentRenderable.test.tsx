import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import sourceStudybook from "../studybook/fixtures/derivatives-first-principles.studybook.json";
import { validateStudybook } from "../studybook";
import {
  createEmptyLearnerState,
  markLessonCompleted,
  recordQuizAttempt
} from "../storage/learnerState";
import { LessonView } from "./LessonView";

describe("sample lesson rendering", () => {
  it("renders the validated derivatives lesson without custom page content", () => {
    const result = validateStudybook(sourceStudybook);

    if (!result.ok) {
      throw new Error(result.errors.map((error) => error.message).join(", "));
    }

    const html = renderToStaticMarkup(
      <LessonView studybook={result.studybook} lesson={result.studybook.lessons[0]} />
    );

    expect(html).toContain("Derivatives from First Principles");
    expect(html).toContain("Derivative from first principles");
    expect(html).toContain("Substituting h = 0 too early");
    expect(html).toContain("Derivative of f(x) = 3x - 5");
    expect(html).toContain("Linear function check");
    expect(html).toContain("Short answer");
    expect(html).toContain("Check answer");
    expect(html).toContain("Download summary");
    expect(html).toContain("katex");
    expect(html).not.toContain("Unknown content block");
    expect(html).not.toContain("Invalid display math");
  });

  it("renders the point-derivative lesson through the reusable lesson view", () => {
    const result = validateStudybook(sourceStudybook);

    if (!result.ok) {
      throw new Error(result.errors.map((error) => error.message).join(", "));
    }

    const lesson = result.studybook.lessons.find(
      (candidate) => candidate.id === "derivative-at-a-point"
    );

    if (!lesson) {
      throw new Error("Expected the derivative-at-a-point lesson.");
    }

    const html = renderToStaticMarkup(
      <LessonView studybook={result.studybook} lesson={lesson} />
    );

    expect(html).toContain("Derivative at a Point");
    expect(html).toContain("Derivative value at a fixed input");
    expect(html).toContain("Tangent slope at x = 2");
    expect(html).toContain("Derivative of f(x) = x^2 at x = 2");
    expect(html).toContain("Mixing the fixed input with the variable input");
    expect(html).toContain("Point derivative check");
    expect(html).toContain("Short answer");
    expect(html).toContain("katex");
    expect(html).not.toContain("Unknown content block");
    expect(html).not.toContain("Invalid display math");
  });

  it("renders saved lesson progress and quiz attempt counts from learner state", () => {
    const result = validateStudybook(sourceStudybook);

    if (!result.ok) {
      throw new Error(result.errors.map((error) => error.message).join(", "));
    }

    const lesson = result.studybook.lessons[0];
    const state = recordQuizAttempt(
      markLessonCompleted(
        createEmptyLearnerState(result.studybook.id),
        lesson.id,
        "2026-05-09T12:10:00.000Z"
      ),
      {
        lessonId: lesson.id,
        quizBlockId: "first-principles-check",
        questionId: "valid-cancellation-step",
        answer: "factor-before-limit",
        isCorrect: true,
        submittedAt: "2026-05-09T12:04:00.000Z"
      }
    );

    const html = renderToStaticMarkup(
      <LessonView
        studybook={result.studybook}
        lesson={lesson}
        learnerState={state}
      />
    );

    expect(html).toContain("Completed");
    expect(html).toContain("This lesson is saved as complete.");
    expect(html).toContain("1 saved attempt");
  });
});

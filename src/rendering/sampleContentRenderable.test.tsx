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
    expect(html).toContain("Lesson path");
    expect(html).toContain("Step 1");
    expect(html).toContain("Observe Two-Point Slope");
    expect(html).toContain("study blocks");
    expect(html).toContain("Lesson opening");
    expect(html).toContain("Concept");
    expect(html).toContain("Equation");
    expect(html).toContain("Practice");
    expect(html).toContain("Formal rule. Compare");
    expect(html).toContain("Secant line approaching tangent slope");
    expect(html).toContain("Notice the two marked points first");
    expect(html).toContain("Compare: graph to quotient");
    expect(html).toContain("Read the graph in this order");
    expect(html).toContain("Graph details");
    expect(html).toContain('aria-label="Graph: Secant line approaching tangent slope"');
    expect(html).toContain('data-series-id="x-squared"');
    expect(html).toContain('data-series-id="secant-points"');
    expect(html).toContain('data-series-id="secant-line"');
    expect(html).toContain("<polyline");
    expect(html).toContain("Substituting h = 0 too early");
    expect(html).toContain("Derivative of f(x) = 3x - 5");
    expect(html).toContain("Pause: predict the safe step");
    expect(html).toContain("Check: linear function");
    expect(html).toContain("Short answer");
    expect(html).toContain("No answer selected yet.");
    expect(html).toContain("Check answer");
    expect(html).toContain("Copy summary");
    expect(html).toContain("Download summary");
    expect(html).toContain('aria-live="polite"');
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
    expect(html).toContain("Step 1");
    expect(html).toContain("Observe One Fixed Input");
    expect(html).toContain("Point form. The input a is fixed");
    expect(html).toContain("Tangent slope at x = 2");
    expect(html).toContain("Notice the fixed point");
    expect(html).toContain("Compare: graph to fixed input");
    expect(html).toContain("The fixed point stays at");
    expect(html).toContain('data-series-id="point-x-squared"');
    expect(html).toContain('data-series-id="point-derivative-points"');
    expect(html).toContain('data-series-id="secant-line-h-one"');
    expect(html).toContain('data-series-id="tangent-line-at-two"');
    expect(html).toContain("<polyline");
    expect(html).toContain("Derivative of f(x) = x^2 at x = 2");
    expect(html).toContain("Mixing the fixed input with the variable input");
    expect(html).toContain("Pause: compare the inputs");
    expect(html).toContain("Check: fixed input");
    expect(html).toContain("Short answer");
    expect(html).toContain("katex");
    expect(html).not.toContain("Unknown content block");
    expect(html).not.toContain("Invalid display math");
  });

  it("renders the constant-function derivative lesson through the reusable lesson view", () => {
    const result = validateStudybook(sourceStudybook);

    if (!result.ok) {
      throw new Error(result.errors.map((error) => error.message).join(", "));
    }

    const lesson = result.studybook.lessons.find(
      (candidate) => candidate.id === "constant-function-derivative"
    );

    if (!lesson) {
      throw new Error("Expected the constant-function derivative lesson.");
    }

    const html = renderToStaticMarkup(
      <LessonView studybook={result.studybook} lesson={lesson} />
    );

    expect(html).toContain("Constant Function Derivative");
    expect(html).toContain("Lesson 3 of 3");
    expect(html).toContain("Step 1");
    expect(html).toContain("Observe No Output Change");
    expect(html).toContain("Constant-function setup");
    expect(html).toContain("Flat function has zero slope");
    expect(html).toContain("Notice the two marked points first");
    expect(html).toContain("Compare: graph to numerator");
    expect(html).toContain("Read the graph in this order");
    expect(html).toContain('data-series-id="constant-seven"');
    expect(html).toContain('data-series-id="constant-comparison-points"');
    expect(html).toContain('data-series-id="constant-secant-line"');
    expect(html).toContain("<polyline");
    expect(html).toContain("Derivative of f(x) = 7");
    expect(html).toContain("Treating the constant output as the slope");
    expect(html).toContain("Pause: compare output values");
    expect(html).toContain("Check: constant function");
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

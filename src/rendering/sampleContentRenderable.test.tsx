import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import courseJson from "../content/fixtures/courses/calculus-i.course.json";
import { eachLesson, findLesson, totalLessons, validateContent } from "../content";
import {
  createEmptyLearnerState,
  markLessonCompleted,
  recordQuizAttempt
} from "../storage/learnerState";
import { LessonView } from "./LessonView";

function validatedCourse() {
  const result = validateContent(courseJson);
  if (!result.ok) {
    throw new Error(result.errors.map((error) => `${error.path}: ${error.message}`).join("\n"));
  }
  return result.course;
}

describe("course lesson rendering", () => {
  it("renders the first migrated lesson with section navigation", () => {
    const course = validatedCourse();
    const lessons = eachLesson(course);
    const first = lessons[0];

    const html = renderToStaticMarkup(
      <LessonView
        course={course}
        module={first.module}
        lesson={first.lesson}
        lessonNumber={first.globalLessonIndex + 1}
        totalLessons={totalLessons(course)}
      />
    );

    expect(html).toContain(first.lesson.title);
    expect(html).toContain("Lesson path");
    expect(html).toContain("Step 1");
    expect(html).toContain("study blocks");
  });

  it("uses learner state to mark completed lessons", () => {
    const course = validatedCourse();
    const location = findLesson(course, "derivative-at-a-point");
    if (!location) throw new Error("Expected derivative-at-a-point lesson.");
    const learnerState = markLessonCompleted(
      createEmptyLearnerState("calculus-i"),
      "derivative-at-a-point",
      "2026-05-15T10:00:00.000Z"
    );

    const html = renderToStaticMarkup(
      <LessonView
        course={course}
        module={location.module}
        lesson={location.lesson}
        lessonNumber={location.globalLessonIndex + 1}
        totalLessons={totalLessons(course)}
        learnerState={learnerState}
      />
    );

    expect(html).toContain("Completed");
  });

  it("records quiz attempt context without throwing", () => {
    const course = validatedCourse();
    const location = findLesson(course, "derivative-as-a-limit");
    if (!location) throw new Error("Expected derivative-as-a-limit lesson.");
    const learnerState = recordQuizAttempt(createEmptyLearnerState("calculus-i"), {
      lessonId: location.lesson.id,
      quizBlockId: "any-quiz",
      questionId: "any-question",
      answer: "demo",
      isCorrect: true,
      submittedAt: "2026-05-15T10:00:00.000Z"
    });

    expect(learnerState.quizAttempts).toBeDefined();
  });
});

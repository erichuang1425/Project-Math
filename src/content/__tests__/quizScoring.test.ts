import { describe, expect, it } from "vitest";
import courseJson from "../fixtures/courses/calculus-i.course.json";
import type { QuizQuestion } from "../schema";
import { validateContent } from "../validateContent";
import { evaluateQuizAnswer } from "../quizScoring";

function getQuestion(questionId: string): QuizQuestion {
  const result = validateContent(courseJson);
  if (!result.ok) {
    throw new Error(result.errors.map((e) => `${e.path}: ${e.message}`).join("\n"));
  }
  const allQuestions = result.course.modules
    .flatMap((mod) => mod.lessons)
    .flatMap((lesson) => lesson.sections.flatMap((section) => section.blocks))
    .filter((block) => block.type === "quiz")
    .flatMap((block) => (block.type === "quiz" ? block.questions : []));
  const question = allQuestions.find((q) => q.id === questionId);
  if (!question) throw new Error(`Missing question ${questionId}`);
  return question;
}

describe("evaluateQuizAnswer", () => {
  it("scores a correct multiple-choice answer with deterministic feedback", () => {
    const question = getQuestion("valid-cancellation-step");
    expect(evaluateQuizAnswer(question, "factor-before-limit")).toEqual({
      isCorrect: true,
      feedback: "Correct. This removes division by h before h approaches 0."
    });
  });

  it("scores an incorrect multiple-choice answer with the selected feedback", () => {
    const question = getQuestion("valid-cancellation-step");
    expect(evaluateQuizAnswer(question, "substitute-zero-first")).toEqual({
      isCorrect: false,
      feedback: "Review the mistake block. Substituting h = 0 first creates division by zero."
    });
  });

  it("scores short answers after whitespace and case normalization", () => {
    const question = getQuestion("slope-of-linear-function");
    expect(evaluateQuizAnswer(question, "  F'(X)=3  ")).toMatchObject({ isCorrect: true });
    expect(evaluateQuizAnswer(question, "2x")).toMatchObject({ isCorrect: false });
  });

  it("scores the constant-function derivative check deterministically", () => {
    const mc = getQuestion("constant-output-change-question");
    const sa = getQuestion("constant-derivative-value");
    expect(evaluateQuizAnswer(mc, "zero-output-change")).toMatchObject({ isCorrect: true });
    expect(evaluateQuizAnswer(mc, "copy-output-value")).toMatchObject({ isCorrect: false });
    expect(evaluateQuizAnswer(sa, "0")).toMatchObject({ isCorrect: true });
    expect(evaluateQuizAnswer(sa, "7")).toMatchObject({ isCorrect: false });
  });
});

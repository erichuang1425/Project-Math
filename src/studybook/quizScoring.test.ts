import { describe, expect, it } from "vitest";
import sourceStudybook from "./fixtures/derivatives-first-principles.studybook.json";
import { evaluateQuizAnswer } from "./quizScoring";
import type { QuizQuestion } from "./schema";
import { validateStudybook } from "./validateStudybook";

function getQuestion(questionId: string): QuizQuestion {
  const result = validateStudybook(sourceStudybook);

  if (!result.ok) {
    throw new Error(result.errors.map((error) => error.message).join(", "));
  }

  const quizBlocks = result.studybook.lessons
    .flatMap((lesson) => lesson.sections)
    .flatMap((section) => section.blocks)
    .filter((block) => block.type === "quiz");
  const question = quizBlocks
    .flatMap((block) => block.questions)
    .find((item) => item.id === questionId);

  if (!question) {
    throw new Error(`Missing question ${questionId}`);
  }

  return question;
}

describe("evaluateQuizAnswer", () => {
  it("scores a correct multiple-choice answer with deterministic feedback", () => {
    const question = getQuestion("valid-cancellation-step");

    const result = evaluateQuizAnswer(question, "factor-before-limit");

    expect(result).toEqual({
      isCorrect: true,
      feedback: "Correct. This removes division by h before h approaches 0."
    });
  });

  it("scores an incorrect multiple-choice answer with the selected feedback", () => {
    const question = getQuestion("valid-cancellation-step");

    const result = evaluateQuizAnswer(question, "substitute-zero-first");

    expect(result).toEqual({
      isCorrect: false,
      feedback:
        "Review the mistake block. Substituting h = 0 first creates division by zero."
    });
  });

  it("scores short answers after whitespace and case normalization", () => {
    const question = getQuestion("slope-of-linear-function");

    expect(evaluateQuizAnswer(question, "  F'(X)=3  ")).toMatchObject({
      isCorrect: true
    });
    expect(evaluateQuizAnswer(question, "2x")).toMatchObject({
      isCorrect: false,
      feedback:
        "Review the parentheses mistake. After distributing the subtraction, the quotient becomes 3h/h while h is nonzero, so the limit is 3."
    });
  });

  it("scores the constant-function derivative check deterministically", () => {
    const multipleChoice = getQuestion("constant-output-change-question");
    const shortAnswer = getQuestion("constant-derivative-value");

    expect(evaluateQuizAnswer(multipleChoice, "zero-output-change")).toEqual({
      isCorrect: true,
      feedback: "Correct. The output does not change, so the numerator is 0."
    });
    expect(evaluateQuizAnswer(multipleChoice, "copy-output-value")).toEqual({
      isCorrect: false,
      feedback:
        "Review the mistake block. The output value is 7, but the output change is 0."
    });
    expect(evaluateQuizAnswer(shortAnswer, "  F'(X)=0  ")).toMatchObject({
      isCorrect: true,
      feedback:
        "Correct. The quotient simplifies to 0 before the limit is evaluated."
    });
    expect(evaluateQuizAnswer(shortAnswer, "7")).toMatchObject({
      isCorrect: false,
      feedback:
        "Review the numerator. A constant function has output change 0, so the derivative is 0."
    });
  });
});

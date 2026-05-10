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

  const quizBlocks = result.studybook.lessons[0].sections
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
      feedback:
        "Correct. The cancellation happens before evaluating the limit, while h still represents a nonzero gap."
    });
  });

  it("scores an incorrect multiple-choice answer with the selected feedback", () => {
    const question = getQuestion("valid-cancellation-step");

    const result = evaluateQuizAnswer(question, "substitute-zero-first");

    expect(result).toEqual({
      isCorrect: false,
      feedback:
        "Not yet. That creates division by zero before the algebra removes the denominator."
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
        "Review the substitution carefully. After distributing the subtraction, the quotient becomes 3h/h while h is nonzero, so the limit is 3."
    });
  });
});

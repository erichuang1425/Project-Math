import type { MultipleChoiceQuestion, QuizQuestion, ShortAnswerQuestion } from "./schema";

export type QuizEvaluation = {
  isCorrect: boolean;
  feedback: string;
};

export function evaluateQuizAnswer(question: QuizQuestion, answer: string): QuizEvaluation {
  switch (question.kind) {
    case "multipleChoice":
      return evaluateMultipleChoiceAnswer(question, answer);
    case "shortAnswer":
      return evaluateShortAnswer(question, answer);
  }
}

export function normalizeShortAnswer(answer: string) {
  return answer.trim().toLowerCase().replace(/\s+/g, " ");
}

function evaluateMultipleChoiceAnswer(
  question: MultipleChoiceQuestion,
  answer: string
): QuizEvaluation {
  const selectedOption = question.options.find((option) => option.id === answer);
  if (!selectedOption) {
    return { isCorrect: false, feedback: "Choose an answer before checking." };
  }
  return {
    isCorrect: answer === question.correctOptionId,
    feedback: selectedOption.feedback
  };
}

function evaluateShortAnswer(question: ShortAnswerQuestion, answer: string): QuizEvaluation {
  const normalizedAnswer = normalizeShortAnswer(answer);
  const acceptedAnswers = question.acceptedAnswers.map(normalizeShortAnswer);
  const isCorrect = acceptedAnswers.includes(normalizedAnswer);
  return {
    isCorrect,
    feedback: isCorrect ? question.feedback.correct : question.feedback.incorrect
  };
}

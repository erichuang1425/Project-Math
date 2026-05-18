import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuizBlockView, type QuizAttemptSubmission } from "../QuizBlockView";
import type { QuizBlock } from "../../../content/schema";

afterEach(() => cleanup());

function multipleChoiceBlock(): QuizBlock {
  return {
    type: "quiz",
    id: "quiz",
    title: "Check",
    questions: [
      {
        kind: "multipleChoice",
        id: "q1",
        prompt: [{ kind: "text", value: "What is f'(x) for f(x) = x^2?" }],
        options: [
          { id: "a", text: [{ kind: "text", value: "2x" }], feedback: "Correct." },
          { id: "b", text: [{ kind: "text", value: "x^2" }], feedback: "That is f, not f'." }
        ],
        correctOptionId: "a",
        conceptTags: ["derivative"],
        hint: "Use the power rule."
      }
    ]
  };
}

function shortAnswerBlock(): QuizBlock {
  return {
    type: "quiz",
    id: "quiz-sa",
    questions: [
      {
        kind: "shortAnswer",
        id: "q1",
        prompt: [{ kind: "text", value: "Name the operation." }],
        acceptedAnswers: ["derivative"],
        feedback: {
          correct: "Yes, that is the derivative.",
          incorrect: "Reread the definition."
        },
        conceptTags: ["derivative"]
      }
    ]
  };
}

describe("QuizBlockView (multipleChoice)", () => {
  it("shows the unselected status and a disabled submit when no option is selected", () => {
    render(<QuizBlockView block={multipleChoiceBlock()} lessonId="lesson-a" />);

    expect(screen.getByText("No answer selected yet.")).toBeInTheDocument();
    expect(screen.getByTestId("quiz-submit-q1")).toBeDisabled();
    expect(screen.queryByTestId("quiz-submit-hint-q1")).not.toBeInTheDocument();
    expect(screen.getByText("Use the power rule.")).toBeInTheDocument();
  });

  it("enables submit once an option is selected and shows the correct-status text", async () => {
    const user = userEvent.setup();
    const onQuizAttempt = vi.fn();
    render(
      <QuizBlockView
        block={multipleChoiceBlock()}
        lessonId="lesson-a"
        onQuizAttempt={onQuizAttempt}
      />
    );

    await user.click(screen.getByTestId("quiz-option-q1-a"));
    expect(screen.getByText(/Answer selected/)).toBeInTheDocument();

    const submit = screen.getByTestId("quiz-submit-q1");
    expect(submit).toBeEnabled();
    expect(submit).toHaveAttribute("type", "submit");
    expect(submit).toHaveAttribute("aria-keyshortcuts", "Enter");
    expect(screen.getByTestId("quiz-submit-hint-q1")).toBeInTheDocument();

    await user.click(submit);

    expect(onQuizAttempt).toHaveBeenCalledTimes(1);
    expect(onQuizAttempt.mock.calls[0][0]).toMatchObject<QuizAttemptSubmission>({
      lessonId: "lesson-a",
      quizBlockId: "quiz",
      questionId: "q1",
      answer: "a",
      isCorrect: true
    });
    expect(screen.getByText(/Submitted answer is correct/)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/Correct\./);
    expect(screen.getByText("Correct answer")).toBeInTheDocument();
    expect(screen.queryByText("Use the power rule.")).not.toBeInTheDocument();
    expect(screen.queryByTestId("quiz-submit-hint-q1")).not.toBeInTheDocument();
  });

  it("renders a check icon next to the correct-answer pill and an alert icon on the feedback panel", async () => {
    const user = userEvent.setup();
    render(<QuizBlockView block={multipleChoiceBlock()} lessonId="lesson-a" />);

    await user.click(screen.getByTestId("quiz-option-q1-a"));
    await user.click(screen.getByTestId("quiz-submit-q1"));

    expect(screen.getByTestId("quiz-option-icon-q1-a")).toBeInTheDocument();
    expect(screen.getByTestId("quiz-feedback-icon-correct")).toBeInTheDocument();
    expect(screen.queryByTestId("quiz-feedback-icon-review")).not.toBeInTheDocument();
  });

  it("submits an incorrect answer, shows review status, and resets on Try again", async () => {
    const user = userEvent.setup();
    const onQuizAttempt = vi.fn();
    render(
      <QuizBlockView
        block={multipleChoiceBlock()}
        lessonId="lesson-a"
        onQuizAttempt={onQuizAttempt}
      />
    );

    await user.click(screen.getByTestId("quiz-option-q1-b"));
    await user.click(screen.getByTestId("quiz-submit-q1"));

    expect(onQuizAttempt.mock.calls[0][0].isCorrect).toBe(false);
    expect(screen.getByText(/Submitted answer needs review/)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/Review\./);
    expect(screen.getByText("Your answer")).toBeInTheDocument();
    expect(screen.getByText("Correct answer")).toBeInTheDocument();
    expect(screen.getByTestId("quiz-option-icon-q1-a")).toBeInTheDocument();
    expect(screen.getByTestId("quiz-option-icon-q1-b")).toBeInTheDocument();
    expect(screen.getByTestId("quiz-feedback-icon-review")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.getByText("No answer selected yet.")).toBeInTheDocument();
    expect(screen.getByTestId("quiz-submit-q1")).toBeDisabled();
    expect(screen.queryByTestId("quiz-submit-hint-q1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("quiz-feedback-icon-correct")).not.toBeInTheDocument();
    expect(screen.queryByTestId("quiz-feedback-icon-review")).not.toBeInTheDocument();
  });

  it("submits the selected option on Enter even when focus is on a different option", async () => {
    const user = userEvent.setup();
    const onQuizAttempt = vi.fn();
    render(
      <QuizBlockView
        block={multipleChoiceBlock()}
        lessonId="lesson-a"
        onQuizAttempt={onQuizAttempt}
      />
    );

    await user.click(screen.getByTestId("quiz-option-q1-a"));
    screen.getByTestId("quiz-option-q1-b").focus();
    await user.keyboard("{Enter}");

    expect(onQuizAttempt).toHaveBeenCalledTimes(1);
    expect(onQuizAttempt.mock.calls[0][0]).toMatchObject({
      questionId: "q1",
      answer: "a",
      isCorrect: true
    });
    expect(screen.getByText(/Submitted answer is correct/)).toBeInTheDocument();
  });

  it("does not record an attempt when Enter is pressed before any option is selected", async () => {
    const user = userEvent.setup();
    const onQuizAttempt = vi.fn();
    render(
      <QuizBlockView
        block={multipleChoiceBlock()}
        lessonId="lesson-a"
        onQuizAttempt={onQuizAttempt}
      />
    );

    const option = screen.getByTestId("quiz-option-q1-a");
    option.focus();
    await user.keyboard("{Enter}");

    expect(onQuizAttempt).not.toHaveBeenCalled();
  });

  it("ignores Enter+modifier combos so global shortcuts are not hijacked", async () => {
    const user = userEvent.setup();
    const onQuizAttempt = vi.fn();
    render(
      <QuizBlockView
        block={multipleChoiceBlock()}
        lessonId="lesson-a"
        onQuizAttempt={onQuizAttempt}
      />
    );

    const option = screen.getByTestId("quiz-option-q1-a");
    await user.click(option);
    option.focus();
    await user.keyboard("{Shift>}{Enter}{/Shift}");

    expect(onQuizAttempt).not.toHaveBeenCalled();
  });

  it("renders saved attempts using singular and plural copy", () => {
    const { rerender } = render(
      <QuizBlockView
        block={multipleChoiceBlock()}
        lessonId="lesson-a"
        attemptCountsByQuestionId={{ q1: 1 }}
      />
    );
    expect(screen.getByText("1 saved attempt")).toBeInTheDocument();

    rerender(
      <QuizBlockView
        block={multipleChoiceBlock()}
        lessonId="lesson-a"
        attemptCountsByQuestionId={{ q1: 3 }}
      />
    );
    expect(screen.getByText("3 saved attempts")).toBeInTheDocument();
  });

  it("omits the attempt count when zero", () => {
    render(<QuizBlockView block={multipleChoiceBlock()} lessonId="lesson-a" />);
    expect(screen.queryByText(/saved attempt/)).not.toBeInTheDocument();
  });

  it("falls back to a default title when the block has no title", () => {
    const block = { ...multipleChoiceBlock(), title: undefined };
    render(<QuizBlockView block={block} lessonId="lesson-a" />);
    expect(screen.getByRole("heading", { name: "Quiz" })).toBeInTheDocument();
  });
});

describe("QuizBlockView (shortAnswer)", () => {
  it("treats whitespace-only answers as empty for submit gating", async () => {
    const user = userEvent.setup();
    render(<QuizBlockView block={shortAnswerBlock()} lessonId="lesson-b" />);

    const input = screen.getByRole("textbox", { name: "Short answer" });
    await user.type(input, "   ");
    expect(screen.getByTestId("quiz-submit-q1")).toBeDisabled();
    expect(screen.queryByTestId("quiz-submit-hint-q1")).not.toBeInTheDocument();
  });

  it("submits a correct typed answer and renders correct feedback", async () => {
    const user = userEvent.setup();
    const onQuizAttempt = vi.fn();
    render(
      <QuizBlockView block={shortAnswerBlock()} lessonId="lesson-b" onQuizAttempt={onQuizAttempt} />
    );

    await user.type(screen.getByRole("textbox", { name: "Short answer" }), "derivative");
    expect(screen.getByTestId("quiz-submit-hint-q1")).toBeInTheDocument();
    await user.click(screen.getByTestId("quiz-submit-q1"));

    expect(onQuizAttempt.mock.calls[0][0].isCorrect).toBe(true);
    expect(screen.getByText(/Yes, that is the derivative/)).toBeInTheDocument();
    expect(screen.getByText(/Submitted answer is correct/)).toBeInTheDocument();
    expect(screen.getByTestId("quiz-feedback-icon-correct")).toBeInTheDocument();
  });

  it("submits the typed answer when Enter is pressed inside the input", async () => {
    const user = userEvent.setup();
    const onQuizAttempt = vi.fn();
    render(
      <QuizBlockView block={shortAnswerBlock()} lessonId="lesson-b" onQuizAttempt={onQuizAttempt} />
    );

    await user.type(screen.getByRole("textbox", { name: "Short answer" }), "derivative{Enter}");

    expect(onQuizAttempt).toHaveBeenCalledTimes(1);
    expect(onQuizAttempt.mock.calls[0][0]).toMatchObject({
      questionId: "q1",
      answer: "derivative",
      isCorrect: true
    });
    expect(screen.getByText(/Submitted answer is correct/)).toBeInTheDocument();
  });

  it("does not submit on Enter when the input is empty", async () => {
    const user = userEvent.setup();
    const onQuizAttempt = vi.fn();
    render(
      <QuizBlockView block={shortAnswerBlock()} lessonId="lesson-b" onQuizAttempt={onQuizAttempt} />
    );

    const input = screen.getByRole("textbox", { name: "Short answer" });
    input.focus();
    await user.keyboard("{Enter}");

    expect(onQuizAttempt).not.toHaveBeenCalled();
  });

  it("submits an incorrect typed answer and exposes Try again", async () => {
    const user = userEvent.setup();
    render(<QuizBlockView block={shortAnswerBlock()} lessonId="lesson-b" />);

    await user.type(screen.getByRole("textbox", { name: "Short answer" }), "nope");
    await user.click(screen.getByTestId("quiz-submit-q1"));

    expect(screen.getByText(/Reread the definition/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Short answer" })).toBeDisabled();
    expect(screen.getByTestId("quiz-feedback-icon-review")).toBeInTheDocument();
  });
});

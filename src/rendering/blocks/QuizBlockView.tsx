import { useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { AlertCircle, Check } from "lucide-react";
import type {
  MultipleChoiceQuestion,
  QuizBlock,
  QuizQuestion,
  ShortAnswerQuestion
} from "../../content/schema";
import { evaluateQuizAnswer } from "../../content/quizScoring";
import { Icon } from "../../design/primitives/Icon";
import { RichText } from "../RichText";
import styles from "../lesson.module.css";

type QuizBlockViewProps = {
  block: QuizBlock;
  lessonId: string;
  attemptCountsByQuestionId?: Record<string, number>;
  onQuizAttempt?: (attempt: QuizAttemptSubmission) => void;
};

type AnswerState = Record<string, string>;

export type QuizAttemptSubmission = {
  lessonId: string;
  quizBlockId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
};

export function QuizBlockView({
  block,
  lessonId,
  attemptCountsByQuestionId = {},
  onQuizAttempt
}: QuizBlockViewProps) {
  const [answers, setAnswers] = useState<AnswerState>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  return (
    <section className={`${styles.block} ${styles.quiz}`} aria-labelledby={block.id}>
      <p className={styles.blockTypeLabel}>Practice</p>
      <h3 id={block.id} className={styles.blockTitle}>
        {block.title ?? "Quiz"}
      </h3>
      {block.questions.map((question) => (
        <QuizQuestionView
          key={question.id}
          question={question}
          answer={answers[question.id] ?? ""}
          submitted={submitted[question.id] ?? false}
          savedAttemptCount={attemptCountsByQuestionId[question.id] ?? 0}
          onAnswer={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))}
          onSubmit={() => {
            const answer = answers[question.id] ?? "";
            const evaluation = evaluateQuizAnswer(question, answer);
            setSubmitted((current) => ({ ...current, [question.id]: true }));
            onQuizAttempt?.({
              lessonId,
              quizBlockId: block.id,
              questionId: question.id,
              answer,
              isCorrect: evaluation.isCorrect
            });
          }}
          onRetry={() => {
            setAnswers((current) => ({ ...current, [question.id]: "" }));
            setSubmitted((current) => ({ ...current, [question.id]: false }));
          }}
        />
      ))}
    </section>
  );
}

type QuizQuestionViewProps = {
  question: QuizQuestion;
  answer: string;
  submitted: boolean;
  savedAttemptCount: number;
  onAnswer: (value: string) => void;
  onSubmit: () => void;
  onRetry: () => void;
};

function QuizQuestionView({
  question,
  answer,
  submitted,
  savedAttemptCount,
  onAnswer,
  onSubmit,
  onRetry
}: QuizQuestionViewProps) {
  switch (question.kind) {
    case "multipleChoice":
      return (
        <MultipleChoiceView
          question={question}
          answer={answer}
          submitted={submitted}
          savedAttemptCount={savedAttemptCount}
          onAnswer={onAnswer}
          onSubmit={onSubmit}
          onRetry={onRetry}
        />
      );
    case "shortAnswer":
      return (
        <ShortAnswerView
          question={question}
          answer={answer}
          submitted={submitted}
          savedAttemptCount={savedAttemptCount}
          onAnswer={onAnswer}
          onSubmit={onSubmit}
          onRetry={onRetry}
        />
      );
  }
}

type QuestionInteractionProps<TQuestion extends QuizQuestion> = {
  question: TQuestion;
  answer: string;
  submitted: boolean;
  savedAttemptCount: number;
  onAnswer: (value: string) => void;
  onSubmit: () => void;
  onRetry: () => void;
};

function MultipleChoiceView({
  question,
  answer,
  submitted,
  savedAttemptCount,
  onAnswer,
  onSubmit,
  onRetry
}: QuestionInteractionProps<MultipleChoiceQuestion>) {
  const selectedOption = question.options.find((option) => option.id === answer);
  const evaluation = evaluateQuizAnswer(question, answer);
  const isCorrect = submitted && evaluation.isCorrect;
  const statusId = `${question.id}-status`;
  const statusText = getQuestionStatus(answer, submitted, isCorrect);
  const canSubmit = Boolean(answer) && !submitted;

  return (
    <QuestionForm questionId={question.id} canSubmit={canSubmit} onSubmit={onSubmit}>
      <div className={styles.quizQuestion}>
        <div className={styles.questionHeader}>
          <p>
            <RichText segments={question.prompt} />
          </p>
          <p id={statusId} className={styles.quizInstruction}>
            {statusText}
          </p>
        </div>
        {question.hint && !submitted ? <p className={styles.quizHint}>{question.hint}</p> : null}
        <ul className={styles.optionList}>
          {question.options.map((option) => {
            const isSelected = answer === option.id;
            const optionIsCorrect = submitted && option.id === question.correctOptionId;
            const optionIsIncorrect = submitted && isSelected && !optionIsCorrect;
            const stateLabel =
              submitted && optionIsCorrect
                ? "Correct answer"
                : optionIsIncorrect
                  ? "Your answer"
                  : isSelected
                    ? "Selected"
                    : "";
            const stateIcon = optionIsCorrect ? Check : optionIsIncorrect ? AlertCircle : null;
            const className = [
              styles.optionButton,
              isSelected ? styles.selected : "",
              optionIsCorrect ? styles.correct : "",
              optionIsIncorrect ? styles.incorrect : ""
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <li key={option.id}>
                <button
                  className={className}
                  data-testid={`quiz-option-${question.id}-${option.id}`}
                  type="button"
                  aria-pressed={isSelected}
                  aria-describedby={statusId}
                  onClick={() => onAnswer(option.id)}
                  disabled={submitted}
                >
                  <RichText segments={option.text} />
                  {stateLabel ? (
                    <span className={styles.optionState}>
                      {stateIcon ? (
                        <Icon
                          source={stateIcon}
                          size={14}
                          strokeWidth={2.5}
                          className={styles.optionStateIcon}
                          data-testid={`quiz-option-icon-${question.id}-${option.id}`}
                        />
                      ) : null}
                      {stateLabel}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
        <QuizActions
          questionId={question.id}
          canSubmit={canSubmit}
          submitted={submitted}
          onRetry={onRetry}
        />
        {submitted && selectedOption ? (
          <FeedbackPanel isCorrect={isCorrect}>{evaluation.feedback}</FeedbackPanel>
        ) : null}
        <AttemptCount count={savedAttemptCount} />
      </div>
    </QuestionForm>
  );
}

function ShortAnswerView({
  question,
  answer,
  submitted,
  savedAttemptCount,
  onAnswer,
  onSubmit,
  onRetry
}: QuestionInteractionProps<ShortAnswerQuestion>) {
  const evaluation = evaluateQuizAnswer(question, answer);
  const isCorrect = submitted && evaluation.isCorrect;
  const statusId = `${question.id}-status`;
  const statusText = getQuestionStatus(answer, submitted, isCorrect);
  const canSubmit = Boolean(answer.trim()) && !submitted;

  return (
    <QuestionForm questionId={question.id} canSubmit={canSubmit} onSubmit={onSubmit}>
      <div className={styles.quizQuestion}>
        <div className={styles.questionHeader}>
          <p>
            <RichText segments={question.prompt} />
          </p>
          <p id={statusId} className={styles.quizInstruction}>
            {statusText}
          </p>
        </div>
        {question.hint && !submitted ? <p className={styles.quizHint}>{question.hint}</p> : null}
        <input
          aria-label="Short answer"
          aria-describedby={statusId}
          value={answer}
          onChange={(event) => onAnswer(event.currentTarget.value)}
          disabled={submitted}
        />
        <QuizActions
          questionId={question.id}
          canSubmit={canSubmit}
          submitted={submitted}
          onRetry={onRetry}
        />
        {submitted ? (
          <FeedbackPanel isCorrect={isCorrect}>{evaluation.feedback}</FeedbackPanel>
        ) : null}
        <AttemptCount count={savedAttemptCount} />
      </div>
    </QuestionForm>
  );
}

type QuestionFormProps = {
  questionId: string;
  canSubmit: boolean;
  onSubmit: () => void;
  children: ReactNode;
};

function QuestionForm({ questionId, canSubmit, onSubmit, children }: QuestionFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (canSubmit) {
      onSubmit();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }
    if (!canSubmit) {
      return;
    }
    event.preventDefault();
    onSubmit();
  }

  return (
    <form
      className={styles.quizQuestionForm}
      data-testid={`quiz-form-${questionId}`}
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
    >
      {children}
    </form>
  );
}

type QuizActionsProps = {
  questionId: string;
  canSubmit: boolean;
  submitted: boolean;
  onRetry: () => void;
};

function QuizActions({ questionId, canSubmit, submitted, onRetry }: QuizActionsProps) {
  return (
    <div className={styles.quizActions}>
      <button
        className={styles.primaryButton}
        data-testid={`quiz-submit-${questionId}`}
        type="submit"
        disabled={!canSubmit}
        aria-keyshortcuts={canSubmit ? "Enter" : undefined}
      >
        Check answer
      </button>
      {canSubmit ? (
        <span className={styles.submitHint} data-testid={`quiz-submit-hint-${questionId}`}>
          Press <kbd className={styles.kbd}>Enter</kbd> to submit
        </span>
      ) : null}
      {submitted ? (
        <button className={styles.secondaryButton} type="button" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}

type FeedbackPanelProps = {
  isCorrect: boolean;
  children: ReactNode;
};

function FeedbackPanel({ isCorrect, children }: FeedbackPanelProps) {
  return (
    <p
      className={`${styles.feedback} ${isCorrect ? styles.feedbackCorrect : styles.feedbackReview}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <Icon
        source={isCorrect ? Check : AlertCircle}
        size={18}
        strokeWidth={2.5}
        className={styles.feedbackIcon}
        data-testid={isCorrect ? "quiz-feedback-icon-correct" : "quiz-feedback-icon-review"}
      />
      <strong>{isCorrect ? "Correct. " : "Review. "}</strong>
      {children}
    </p>
  );
}

function getQuestionStatus(answer: string, submitted: boolean, isCorrect: boolean) {
  if (submitted) {
    return isCorrect ? "Submitted answer is correct." : "Submitted answer needs review.";
  }

  return answer ? "Answer selected. Check answer when ready." : "No answer selected yet.";
}

function AttemptCount({ count }: { count: number }) {
  if (count <= 0) {
    return null;
  }

  return (
    <p className={styles.attemptCount}>
      {count === 1 ? "1 saved attempt" : `${count} saved attempts`}
    </p>
  );
}

import { useState } from "react";
import type {
  MultipleChoiceQuestion,
  QuizBlock,
  QuizQuestion,
  ShortAnswerQuestion
} from "../../content/schema";
import { evaluateQuizAnswer } from "../../content/quizScoring";
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

  return (
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
                {stateLabel ? <span className={styles.optionState}>{stateLabel}</span> : null}
              </button>
            </li>
          );
        })}
      </ul>
      <div className={styles.quizActions}>
        <button
          className={styles.primaryButton}
          data-testid={`quiz-submit-${question.id}`}
          type="button"
          onClick={onSubmit}
          disabled={!answer || submitted}
        >
          Check answer
        </button>
        {submitted ? (
          <button className={styles.secondaryButton} type="button" onClick={onRetry}>
            Try again
          </button>
        ) : null}
      </div>
      {submitted && selectedOption ? (
        <p
          className={`${styles.feedback} ${
            isCorrect ? styles.feedbackCorrect : styles.feedbackReview
          }`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <strong>{isCorrect ? "Correct. " : "Review. "}</strong>
          {evaluation.feedback}
        </p>
      ) : null}
      <AttemptCount count={savedAttemptCount} />
    </div>
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

  return (
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
      <div className={styles.quizActions}>
        <button
          className={styles.primaryButton}
          data-testid={`quiz-submit-${question.id}`}
          type="button"
          onClick={onSubmit}
          disabled={!answer.trim() || submitted}
        >
          Check answer
        </button>
        {submitted ? (
          <button className={styles.secondaryButton} type="button" onClick={onRetry}>
            Try again
          </button>
        ) : null}
      </div>
      {submitted ? (
        <p
          className={`${styles.feedback} ${
            isCorrect ? styles.feedbackCorrect : styles.feedbackReview
          }`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <strong>{isCorrect ? "Correct. " : "Review. "}</strong>
          {evaluation.feedback}
        </p>
      ) : null}
      <AttemptCount count={savedAttemptCount} />
    </div>
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

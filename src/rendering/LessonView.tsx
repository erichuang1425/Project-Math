import { useState } from "react";
import {
  copyLessonSummaryMarkdown,
  getLessonSummaryCopyStatusMessage,
  type LessonSummaryCopyStatus
} from "../export/lessonSummaryClipboard";
import {
  buildLessonSummaryExport,
  lessonSummaryExportFileName,
  renderLessonSummaryMarkdown
} from "../export/lessonSummaryExport";
import type { Lesson, Studybook } from "../studybook/schema";
import type { LearnerState } from "../storage/learnerState";
import { BlockRenderer } from "./BlockRenderer";
import type { QuizAttemptSubmission } from "./blocks/QuizBlockView";
import styles from "./lesson.module.css";

type LessonViewProps = {
  studybook: Studybook;
  lesson: Lesson;
  learnerState?: LearnerState;
  onQuizAttempt?: (attempt: QuizAttemptSubmission) => void;
  onCompleteLesson?: () => void;
};

export function LessonView({
  studybook,
  lesson,
  learnerState,
  onQuizAttempt,
  onCompleteLesson
}: LessonViewProps) {
  const lessonProgress = learnerState?.lessons[lesson.id];
  const isCompleted = lessonProgress?.status === "completed";
  const [copyStatus, setCopyStatus] = useState<LessonSummaryCopyStatus>("idle");
  const copyStatusMessage = getLessonSummaryCopyStatusMessage(copyStatus);
  const isCopyingSummary = copyStatus === "copying";

  function buildSummaryMarkdown() {
    const summary = buildLessonSummaryExport(studybook, lesson, learnerState);
    return {
      fileName: lessonSummaryExportFileName(summary),
      markdown: renderLessonSummaryMarkdown(summary)
    };
  }

  async function handleCopySummary() {
    const { markdown } = buildSummaryMarkdown();
    setCopyStatus("copying");

    const result = await copyLessonSummaryMarkdown(markdown);
    setCopyStatus(result.status);
  }

  function handleExportSummary() {
    const { fileName, markdown } = buildSummaryMarkdown();
    downloadTextFile(fileName, markdown);
  }

  return (
    <article className={styles.lesson}>
      <header className={styles.lessonHeader}>
        <h1>{lesson.title}</h1>
        <p>{lesson.summary}</p>
        <div className={styles.metadata} aria-label="Lesson metadata">
          <span className={styles.pill}>{studybook.topic}</span>
          <span className={styles.pill}>{lesson.estimatedMinutes ?? 20} min</span>
          <span className={styles.pill}>
            {isCompleted ? "Completed" : "In progress"}
          </span>
          {studybook.prerequisites.map((item) => (
            <span key={item} className={styles.pill}>
              {item}
            </span>
          ))}
        </div>
      </header>

      {lesson.sections.map((section) => (
        <section key={section.id} className={styles.section} aria-labelledby={section.id}>
          <h2 id={section.id}>{section.title}</h2>
          {section.blocks.map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              lessonId={lesson.id}
              learnerState={learnerState}
              onQuizAttempt={onQuizAttempt}
            />
          ))}
        </section>
      ))}
      <footer className={styles.lessonFooter} aria-label="Lesson progress">
        <p>{isCompleted ? "This lesson is saved as complete." : "Progress is saved locally."}</p>
        <div className={styles.lessonFooterControls}>
          <div className={styles.lessonFooterActions}>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={onCompleteLesson}
              disabled={isCompleted || !onCompleteLesson}
            >
              {isCompleted ? "Lesson complete" : "Mark lesson complete"}
            </button>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={handleCopySummary}
              disabled={isCopyingSummary}
              aria-describedby="summary-copy-status"
            >
              {isCopyingSummary ? "Copying summary" : "Copy summary"}
            </button>
            <button
              className={styles.primaryButton}
              type="button"
              onClick={handleExportSummary}
            >
              Download summary
            </button>
          </div>
          <p
            id="summary-copy-status"
            className={`${styles.copyStatus} ${
              copyStatus === "failed" ? styles.copyStatusError : ""
            }`}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {copyStatusMessage}
          </p>
        </div>
      </footer>
    </article>
  );
}

function downloadTextFile(fileName: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

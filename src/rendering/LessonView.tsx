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
import type { Course, Lesson, Module } from "../content/schema";
import type { LearnerState } from "../storage/learnerState";
import { BlockRenderer } from "./BlockRenderer";
import type { QuizAttemptSubmission } from "./blocks/QuizBlockView";
import styles from "./lesson.module.css";

type LessonViewProps = {
  course: Course;
  module: Module;
  lesson: Lesson;
  lessonNumber: number;
  totalLessons: number;
  learnerState?: LearnerState;
  onQuizAttempt?: (attempt: QuizAttemptSubmission) => void;
  onCompleteLesson?: () => void;
};

export function LessonView({
  course,
  module: lessonModule,
  lesson,
  lessonNumber,
  totalLessons,
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
    const summary = buildLessonSummaryExport(course, lesson, learnerState);
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
        <div className={styles.lessonHeaderText}>
          <p className={styles.lessonEyebrow}>{lessonModule.title}</p>
          <h1>{lesson.title}</h1>
          <p>{lesson.summary}</p>
        </div>
        <div className={styles.lessonStatePanel} aria-label="Current lesson state">
          <span>Status</span>
          <strong>{isCompleted ? "Completed" : "Ready to study"}</strong>
          <span>
            Lesson {lessonNumber} of {totalLessons}
          </span>
        </div>
        <div className={styles.metadata} aria-label="Lesson metadata">
          <span className={styles.pill}>Lesson {lessonNumber}</span>
          <span className={styles.pill}>{course.title}</span>
          <span className={styles.pill}>{lesson.estimatedMinutes} min</span>
          <span className={styles.pill}>{isCompleted ? "Completed" : "In progress"}</span>
          <span className={styles.pill}>{lesson.difficulty}</span>
        </div>
      </header>

      <div className={styles.lessonBody}>
        <nav className={styles.sectionPath} aria-label="Lesson sections">
          <p>Lesson path</p>
          <ol>
            {lesson.sections.map((section, index) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>
                  <span className={styles.pathStep}>Step {index + 1}</span>
                  <span>{section.title}</span>
                  <span>{section.blocks.length} study blocks</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className={styles.sectionStack}>
          {lesson.sections.map((section, index) => (
            <section key={section.id} className={styles.section} aria-labelledby={section.id}>
              <div className={styles.sectionHeader}>
                <p>
                  Step {index + 1} of {lesson.sections.length}
                </p>
                <h2 id={section.id}>{section.title}</h2>
              </div>
              {section.blocks.map((block) => (
                <BlockRenderer
                  key={block.id}
                  block={block}
                  lessonId={lesson.id}
                  course={course}
                  learnerState={learnerState}
                  onQuizAttempt={onQuizAttempt}
                />
              ))}
            </section>
          ))}
        </div>
      </div>
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
            <button className={styles.primaryButton} type="button" onClick={handleExportSummary}>
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

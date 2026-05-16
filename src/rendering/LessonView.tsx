import { useEffect, useState } from "react";
import {
  copyLessonSummaryMarkdown,
  getLessonSummaryCopyStatusMessage,
  type LessonSummaryCopyStatus
} from "../export/lessonSummaryClipboard";
import { buildLessonSummaryFile, downloadTextFile } from "../export/lessonSummaryDownload";
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
  initialSectionId?: string;
  onSectionView?: (sectionId: string) => void;
};

export function LessonView({
  course,
  module: lessonModule,
  lesson,
  lessonNumber,
  totalLessons,
  learnerState,
  onQuizAttempt,
  onCompleteLesson,
  initialSectionId,
  onSectionView
}: LessonViewProps) {
  const lessonProgress = learnerState?.lessons[lesson.id];
  const isCompleted = lessonProgress?.status === "completed";
  const [copyStatus, setCopyStatus] = useState<LessonSummaryCopyStatus>("idle");
  const copyStatusMessage = getLessonSummaryCopyStatusMessage(copyStatus);
  const isCopyingSummary = copyStatus === "copying";
  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    lesson.sections[0]?.id ?? null
  );

  useEffect(() => {
    setActiveSectionId(lesson.sections[0]?.id ?? null);
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return;
    const sectionEls = lesson.sections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sectionEls.length === 0) return;

    if (initialSectionId && initialSectionId !== lesson.sections[0]?.id) {
      const target = sectionEls.find((el) => el.id === initialSectionId);
      if (target) {
        target.scrollIntoView({ block: "start" });
        setActiveSectionId(initialSectionId);
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSectionId(visible[0].target.id);
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 }
    );
    sectionEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [lesson.id, lesson.sections, initialSectionId]);

  useEffect(() => {
    if (!onSectionView || !activeSectionId) return;
    onSectionView(activeSectionId);
  }, [activeSectionId, onSectionView]);

  async function handleCopySummary() {
    const { markdown } = buildLessonSummaryFile(course, lesson, learnerState);
    setCopyStatus("copying");
    const result = await copyLessonSummaryMarkdown(markdown);
    setCopyStatus(result.status);
  }

  function handleExportSummary() {
    const { fileName, markdown } = buildLessonSummaryFile(course, lesson, learnerState);
    downloadTextFile(fileName, markdown);
  }

  return (
    <article className={styles.lesson}>
      <header className={styles.lessonHeader}>
        <p className={styles.lessonStatusLine} aria-label="Current lesson state">
          <span>
            Lesson {lessonNumber} of {totalLessons}
          </span>
          <span aria-hidden="true">·</span>
          <span>{isCompleted ? "Completed" : "Ready to study"}</span>
        </p>
        <h1>{lesson.title}</h1>
        <p className={styles.lessonSummary}>{lesson.summary}</p>
        <div className={styles.metadata} aria-label="Lesson metadata">
          <span className={styles.pill}>{course.title}</span>
          <span className={styles.pill}>{lesson.estimatedMinutes} min</span>
          <span className={styles.pill}>{lesson.difficulty}</span>
        </div>
      </header>

      <div className={styles.lessonBody}>
        <nav className={styles.sectionPath} aria-label="Lesson sections">
          <p>Lesson path</p>
          <ol>
            {lesson.sections.map((section, index) => {
              const isActive = section.id === activeSectionId;
              return (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className={isActive ? styles.sectionPathLinkActive : undefined}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <span className={styles.pathStep}>Step {index + 1}</span>
                    <span>{section.title}</span>
                    <span>{section.blocks.length} study blocks</span>
                  </a>
                </li>
              );
            })}
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

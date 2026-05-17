import { useEffect, useMemo, useRef, useState } from "react";
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
import { useActiveSection } from "./useActiveSection";
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

  const sectionIds = useMemo(() => lesson.sections.map((s) => s.id), [lesson.sections]);
  const activeSectionId = useActiveSection({ sectionIds, initialSectionId });
  const activeSection = lesson.sections.find((s) => s.id === activeSectionId) ?? null;
  const activeSectionIndex = activeSection ? lesson.sections.indexOf(activeSection) : -1;

  const lastAnnouncedRef = useRef<string | null>(null);
  const [announcement, setAnnouncement] = useState<string>("");
  useEffect(() => {
    if (!activeSection) return;
    // Skip the initial mount; let the screen reader announce the heading itself.
    if (lastAnnouncedRef.current === null) {
      lastAnnouncedRef.current = activeSection.id;
      return;
    }
    if (lastAnnouncedRef.current === activeSection.id) return;
    lastAnnouncedRef.current = activeSection.id;
    setAnnouncement(
      `Now reading step ${activeSectionIndex + 1} of ${lesson.sections.length}: ${activeSection.title}`
    );
  }, [activeSection, activeSectionIndex, lesson.sections.length]);

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
                    <span className={styles.pathStep}>
                      Step {index + 1}
                      {isActive ? (
                        <span className={styles.pathStepMarker} aria-hidden="true">
                          You are here
                        </span>
                      ) : null}
                    </span>
                    <span>{section.title}</span>
                    <span>{section.blocks.length} study blocks</span>
                  </a>
                </li>
              );
            })}
          </ol>
          <p
            className={styles.visuallyHidden}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            data-testid="active-section-announcement"
          >
            {announcement}
          </p>
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

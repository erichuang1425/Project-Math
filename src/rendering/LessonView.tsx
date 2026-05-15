import { useEffect, useMemo, useRef, useState } from "react";
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
import type { GlossaryEntry, Lesson, Studybook } from "../studybook/schema";
import type { LearnerState } from "../storage/learnerState";
import { MathBlock } from "../math/MathBlock";
import { BlockRenderer } from "./BlockRenderer";
import { GlossaryContext } from "./GlossaryContext";
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
  const lessonIndex = studybook.lessons.findIndex(
    (candidate) => candidate.id === lesson.id
  );
  const lessonNumber = lessonIndex >= 0 ? lessonIndex + 1 : 1;
  const [copyStatus, setCopyStatus] = useState<LessonSummaryCopyStatus>("idle");
  const copyStatusMessage = getLessonSummaryCopyStatusMessage(copyStatus);
  const isCopyingSummary = copyStatus === "copying";

  // Active section tracking via IntersectionObserver
  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    lesson.sections[0]?.id ?? null
  );
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const article = articleRef.current;
    if (!article || typeof IntersectionObserver === "undefined") return;

    const sectionEls = article.querySelectorAll("section[data-lesson-section]");
    if (sectionEls.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSectionId(entry.target.id || null);
          }
        }
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 }
    );

    sectionEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [lesson.id]);

  // Glossary dialog
  const [activeGlossaryEntry, setActiveGlossaryEntry] = useState<GlossaryEntry | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const glossaryContextValue = useMemo(
    () => ({
      entries: studybook.glossary ?? [],
      openEntry: (termId: string) => {
        const entry = (studybook.glossary ?? []).find((e) => e.id === termId);
        if (entry) setActiveGlossaryEntry(entry);
      }
    }),
    [studybook.glossary]
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (activeGlossaryEntry) {
      dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [activeGlossaryEntry]);

  function handleDialogClose() {
    setActiveGlossaryEntry(null);
  }

  function handleDialogClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === e.currentTarget) {
      e.currentTarget.close();
    }
  }

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
    <GlossaryContext.Provider value={glossaryContextValue}>
      <article ref={articleRef} className={styles.lesson}>
        <header className={styles.lessonHeader}>
          <div className={styles.lessonHeaderText}>
            <p className={styles.lessonEyebrow}>Derivatives from First Principles</p>
            <h1>{lesson.title}</h1>
            <p>{lesson.summary}</p>
          </div>
          <div className={styles.lessonStatePanel} aria-label="Current lesson state">
            <span>Status</span>
            <strong>{isCompleted ? "Completed" : "Ready to study"}</strong>
            <span>
              Lesson {lessonNumber} of {studybook.lessons.length}
            </span>
          </div>
          <div className={styles.metadata} aria-label="Lesson metadata">
            <span className={styles.pill}>Lesson {lessonNumber}</span>
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

        <div className={styles.lessonBody}>
          <nav className={styles.sectionPath} aria-label="Lesson sections">
            <p>Lesson path</p>
            <ol>
              {lesson.sections.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className={
                      activeSectionId === section.id
                        ? styles.activeSectionLink
                        : undefined
                    }
                    aria-current={
                      activeSectionId === section.id ? "step" : undefined
                    }
                  >
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
              <section
                key={section.id}
                id={section.id}
                data-lesson-section
                className={styles.section}
                aria-labelledby={`${section.id}-heading`}
              >
                <div className={styles.sectionHeader}>
                  <p>
                    Step {index + 1} of {lesson.sections.length}
                  </p>
                  <h2 id={`${section.id}-heading`}>{section.title}</h2>
                </div>
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

        <dialog
          ref={dialogRef}
          className={styles.glossaryDialog}
          aria-label={
            activeGlossaryEntry
              ? `Definition: ${activeGlossaryEntry.term}`
              : "Glossary"
          }
          onClose={handleDialogClose}
          onClick={handleDialogClick}
        >
          {activeGlossaryEntry ? (
            <div className={styles.glossaryDialogInner}>
              <div className={styles.glossaryDialogHeader}>
                <strong className={styles.glossaryTerm}>
                  {activeGlossaryEntry.term}
                </strong>
                <button
                  className={styles.glossaryDialogClose}
                  type="button"
                  onClick={() => dialogRef.current?.close()}
                  aria-label="Close definition"
                >
                  ✕
                </button>
              </div>
              <p className={styles.glossaryDefinition}>
                {activeGlossaryEntry.definition}
              </p>
              {activeGlossaryEntry.latex ? (
                <MathBlock latex={activeGlossaryEntry.latex} />
              ) : null}
            </div>
          ) : null}
        </dialog>
      </article>
    </GlossaryContext.Provider>
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

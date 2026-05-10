import { useCallback, useEffect, useMemo, useState } from "react";
import sourceStudybook from "../studybook/fixtures/derivatives-first-principles.studybook.json";
import { validateStudybook } from "../studybook";
import { LessonView } from "../rendering/LessonView";
import { createDefaultLearnerStateRepository } from "../storage/LearnerStateRepository";
import {
  createEmptyLearnerState,
  markLessonCompleted,
  markLessonOpened,
  recordQuizAttempt,
  type LearnerState
} from "../storage/learnerState";
import type { QuizAttemptSubmission } from "../rendering/blocks/QuizBlockView";
import styles from "./App.module.css";

export function App() {
  const result = useMemo(() => validateStudybook(sourceStudybook), []);
  const learnerStateRepository = useMemo(
    () => createDefaultLearnerStateRepository(),
    []
  );
  const [learnerState, setLearnerState] = useState<LearnerState | undefined>();
  const [storageNotice, setStorageNotice] = useState<string | undefined>();
  const [selectedLessonId, setSelectedLessonId] = useState<string | undefined>();
  const studybook = result.ok ? result.studybook : undefined;
  const lesson =
    studybook?.lessons.find((candidate) => candidate.id === selectedLessonId) ??
    studybook?.lessons[0];

  useEffect(() => {
    if (!studybook || !lesson) {
      return;
    }

    const activeStudybook = studybook;
    const activeLesson = lesson;
    let isCurrent = true;

    async function loadLearnerState() {
      try {
        const loaded = await learnerStateRepository.loadLearnerState(
          activeStudybook.id
        );
        const openedState = markLessonOpened(
          loaded.state,
          activeLesson.id,
          new Date().toISOString()
        );

        await learnerStateRepository.saveLearnerState(openedState);

        if (!isCurrent) {
          return;
        }

        setLearnerState(openedState);
        setStorageNotice(
          loaded.status === "recovered-from-corrupt"
            ? "Saved learner state was unreadable, so progress was reset for this studybook."
            : undefined
        );
      } catch {
        if (!isCurrent) {
          return;
        }

        setLearnerState(
          markLessonOpened(
            createEmptyLearnerState(activeStudybook.id),
            activeLesson.id,
            new Date().toISOString()
          )
        );
        setStorageNotice(
          "Learner progress is available for this session, but it could not be saved."
        );
      }
    }

    void loadLearnerState();

    return () => {
      isCurrent = false;
    };
  }, [learnerStateRepository, lesson, studybook]);

  const persistState = useCallback(
    (nextState: LearnerState) => {
      void learnerStateRepository.saveLearnerState(nextState).catch(() => {
        setStorageNotice(
          "Learner progress is available for this session, but it could not be saved."
        );
      });
    },
    [learnerStateRepository]
  );

  const handleQuizAttempt = useCallback(
    (attempt: QuizAttemptSubmission) => {
      if (!studybook) {
        return;
      }

      setLearnerState((current) => {
        const nextState = recordQuizAttempt(
          current ?? createEmptyLearnerState(studybook.id),
          {
            ...attempt,
            submittedAt: new Date().toISOString()
          }
        );
        persistState(nextState);
        return nextState;
      });
    },
    [persistState, studybook]
  );

  const handleCompleteLesson = useCallback(() => {
    if (!studybook || !lesson) {
      return;
    }

    setLearnerState((current) => {
      const nextState = markLessonCompleted(
        current ?? createEmptyLearnerState(studybook.id),
        lesson.id,
        new Date().toISOString()
      );
      persistState(nextState);
      return nextState;
    });
  }, [lesson, persistState, studybook]);

  if (!result.ok) {
    return (
      <main className={styles.content}>
        <section className={styles.errorPanel}>
          <h1>Studybook validation failed</h1>
          <p>The lesson did not pass deterministic validation.</p>
          <ul>
            {result.errors.map((error) => (
              <li key={`${error.path}-${error.message}`}>
                <code>{error.path}</code>: {error.message}
              </li>
            ))}
          </ul>
        </section>
      </main>
    );
  }

  if (!studybook || !lesson) {
    return (
      <main className={styles.content}>
        <section className={styles.errorPanel}>
          <h1>Studybook has no lessons</h1>
          <p>The studybook passed validation but did not provide a lesson to open.</p>
        </section>
      </main>
    );
  }

  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebar} aria-label="Studybook library">
        <p className={styles.brand}>Project Math</p>
        <p className={styles.libraryLabel}>Studybook</p>
        <div className={styles.lessonList}>
          {studybook.lessons.map((candidate, index) => {
            const isSelected = candidate.id === lesson.id;

            return (
              <button
                key={candidate.id}
                className={`${styles.lessonButton} ${
                  isSelected ? styles.lessonButtonActive : ""
                }`}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedLessonId(candidate.id)}
              >
                <span className={styles.lessonNumber}>Lesson {index + 1}</span>
                {candidate.title}
                <span>{candidate.summary}</span>
              </button>
            );
          })}
        </div>
        <p className={styles.progressSummary}>
          {learnerState?.lessons[lesson.id]?.status === "completed"
            ? "Selected lesson complete"
            : "Progress saved locally"}
        </p>
      </aside>
      <main className={styles.content}>
        {storageNotice ? (
          <div className={styles.storageNotice} role="status">
            {storageNotice}
          </div>
        ) : null}
        <LessonView
          studybook={studybook}
          lesson={lesson}
          learnerState={learnerState}
          onQuizAttempt={handleQuizAttempt}
          onCompleteLesson={handleCompleteLesson}
        />
      </main>
    </div>
  );
}

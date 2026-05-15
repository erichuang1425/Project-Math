import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type CSSProperties
} from "react";
import sourceStudybook from "../studybook/fixtures/derivatives-first-principles.studybook.json";
import { validateStudybook } from "../studybook";
import type { Lesson, StudyBlock, Studybook } from "../studybook/schema";
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
import { ReaderControls } from "./ReaderControls";
import {
  createReaderSettingsStyle,
  loadReaderSettings,
  saveReaderSettings,
  type ReaderSettings
} from "./readerSettings";
import styles from "./App.module.css";

export type AppShellNavigationState = {
  view: "dashboard" | "reader";
  selectedLessonId?: string;
};

type AppShellNavigationAction =
  | { type: "select-dashboard-lesson"; lessonId: string }
  | { type: "open-selected-lesson" }
  | { type: "open-reader-lesson"; lessonId: string }
  | { type: "return-dashboard" };

type AppProps = {
  initialNavigation?: AppShellNavigationState;
};

const defaultNavigationState: AppShellNavigationState = {
  view: "dashboard"
};

export function appShellNavigationReducer(
  state: AppShellNavigationState,
  action: AppShellNavigationAction
): AppShellNavigationState {
  switch (action.type) {
    case "select-dashboard-lesson":
      return {
        view: "dashboard",
        selectedLessonId: action.lessonId
      };
    case "open-selected-lesson":
      return {
        ...state,
        view: "reader"
      };
    case "open-reader-lesson":
      return {
        view: "reader",
        selectedLessonId: action.lessonId
      };
    case "return-dashboard":
      return {
        ...state,
        view: "dashboard"
      };
  }
}

export function App({ initialNavigation = defaultNavigationState }: AppProps = {}) {
  const result = useMemo(() => validateStudybook(sourceStudybook), []);
  const learnerStateRepository = useMemo(
    () => createDefaultLearnerStateRepository(),
    []
  );
  const [navigation, dispatchNavigation] = useReducer(
    appShellNavigationReducer,
    initialNavigation
  );
  const [learnerState, setLearnerState] = useState<LearnerState | undefined>();
  const [hasLoadedLearnerState, setHasLoadedLearnerState] = useState(false);
  const [storageNotice, setStorageNotice] = useState<string | undefined>();
  const [readerSettings, setReaderSettings] = useState<ReaderSettings>(() =>
    loadReaderSettings(getBrowserStorage())
  );
  const readerSettingsStyle = useMemo(
    () => createReaderSettingsStyle(readerSettings) as CSSProperties,
    [readerSettings]
  );
  const studybook = result.ok ? result.studybook : undefined;
  const currentLesson = useMemo(
    () => (studybook ? getRecommendedLesson(studybook.lessons, learnerState) : undefined),
    [learnerState, studybook]
  );
  const selectedLesson =
    studybook?.lessons.find(
      (candidate) => candidate.id === navigation.selectedLessonId
    ) ??
    currentLesson ??
    studybook?.lessons[0];
  const completedLessonCount =
    studybook?.lessons.filter(
      (candidate) => learnerState?.lessons[candidate.id]?.status === "completed"
    ).length ?? 0;
  const lessonCompletionPercent = studybook?.lessons.length
    ? Math.round((completedLessonCount / studybook.lessons.length) * 100)
    : 0;

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

  useEffect(() => {
    if (!studybook) {
      return;
    }

    const activeStudybook = studybook;
    let isCurrent = true;
    setHasLoadedLearnerState(false);

    async function loadLearnerState() {
      try {
        const loaded = await learnerStateRepository.loadLearnerState(
          activeStudybook.id
        );

        if (!isCurrent) {
          return;
        }

        setLearnerState(loaded.state);
        setHasLoadedLearnerState(true);
        setStorageNotice(
          loaded.status === "recovered-from-corrupt"
            ? "Saved learner state was unreadable, so progress was reset for this studybook."
            : undefined
        );
      } catch {
        if (!isCurrent) {
          return;
        }

        setLearnerState(createEmptyLearnerState(activeStudybook.id));
        setHasLoadedLearnerState(true);
        setStorageNotice(
          "Learner progress is available for this session, but it could not be saved."
        );
      }
    }

    void loadLearnerState();

    return () => {
      isCurrent = false;
    };
  }, [learnerStateRepository, studybook]);

  useEffect(() => {
    if (
      !studybook ||
      !selectedLesson ||
      navigation.view !== "reader" ||
      !hasLoadedLearnerState
    ) {
      return;
    }

    const openedAt = new Date().toISOString();

    setLearnerState((current) => {
      const nextState = markLessonOpened(
        current ?? createEmptyLearnerState(studybook.id),
        selectedLesson.id,
        openedAt
      );
      persistState(nextState);
      return nextState;
    });
  }, [
    hasLoadedLearnerState,
    navigation.view,
    persistState,
    selectedLesson,
    studybook
  ]);

  const handleOpenSelectedLesson = useCallback(() => {
    if (!selectedLesson) {
      return;
    }

    dispatchNavigation({
      type: "open-reader-lesson",
      lessonId: selectedLesson.id
    });
  }, [selectedLesson]);

  const handleSelectDashboardLesson = useCallback((lessonId: string) => {
    dispatchNavigation({ type: "select-dashboard-lesson", lessonId });
  }, []);

  const handleOpenReaderLesson = useCallback((lessonId: string) => {
    dispatchNavigation({ type: "open-reader-lesson", lessonId });
  }, []);

  const handleReturnDashboard = useCallback(() => {
    dispatchNavigation({ type: "return-dashboard" });
  }, []);

  const handleReaderSettingsChange = useCallback((settings: ReaderSettings) => {
    setReaderSettings(settings);
    saveReaderSettings(settings, getBrowserStorage());
  }, []);

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
    if (!studybook || !selectedLesson) {
      return;
    }

    setLearnerState((current) => {
      const nextState = markLessonCompleted(
        current ?? createEmptyLearnerState(studybook.id),
        selectedLesson.id,
        new Date().toISOString()
      );
      persistState(nextState);
      return nextState;
    });
  }, [persistState, selectedLesson, studybook]);

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

  if (!studybook || !selectedLesson || !currentLesson) {
    return (
      <main className={styles.content}>
        <section className={styles.errorPanel}>
          <h1>Studybook has no lessons</h1>
          <p>The studybook passed validation but did not provide a lesson to open.</p>
        </section>
      </main>
    );
  }

  if (navigation.view === "dashboard") {
    return (
      <div className={styles.dashboardShell}>
        <a className={styles.skipLink} href="#dashboard-course">
          Skip to course dashboard
        </a>
        <CourseDashboard
          studybook={studybook}
          selectedLesson={selectedLesson}
          currentLesson={currentLesson}
          learnerState={learnerState}
          completedLessonCount={completedLessonCount}
          lessonCompletionPercent={lessonCompletionPercent}
          onSelectLesson={handleSelectDashboardLesson}
          onOpenSelectedLesson={handleOpenSelectedLesson}
        />
      </div>
    );
  }

  return (
    <div className={styles.appShell}>
      <a className={styles.skipLink} href="#lesson-content">
        Skip to lesson content
      </a>
      <aside className={styles.sidebar} aria-label="Studybook library">
        <div className={styles.sidebarIntro}>
          <p className={styles.brand}>Project Math</p>
          <p className={styles.libraryLabel}>Studybook</p>
          <h2>{studybook.title}</h2>
          <p>{studybook.summary}</p>
          <div
            className={styles.progressMeter}
            aria-label={`${completedLessonCount} of ${studybook.lessons.length} lessons completed`}
          >
            <span
              className={styles.progressFill}
              style={{ width: `${lessonCompletionPercent}%` }}
            />
          </div>
          <p className={styles.progressSummary}>
            {completedLessonCount} of {studybook.lessons.length} lessons complete.
          </p>
        </div>
        <div className={styles.lessonList}>
          {studybook.lessons.map((candidate, index) => {
            const isSelected = candidate.id === selectedLesson.id;
            const progressLabel = getReaderLessonProgressLabel(
              learnerState?.lessons[candidate.id]?.status,
              isSelected
            );

            return (
              <button
                key={candidate.id}
                className={`${styles.lessonButton} ${
                  isSelected ? styles.lessonButtonActive : ""
                }`}
                type="button"
                aria-pressed={isSelected}
                aria-current={isSelected ? "page" : undefined}
                aria-label={`Open lesson ${index + 1}: ${candidate.title}. ${progressLabel}.`}
                onClick={() => handleOpenReaderLesson(candidate.id)}
              >
                <span className={styles.lessonNumber}>Lesson {index + 1}</span>
                <strong>{candidate.title}</strong>
                <span className={styles.lessonSummary}>{candidate.summary}</span>
                <span className={styles.lessonStatus}>{progressLabel}</span>
              </button>
            );
          })}
        </div>
        <p className={styles.localSaveNote}>Progress is saved locally.</p>
      </aside>
      <main id="lesson-content" className={styles.content} style={readerSettingsStyle}>
        <nav className={styles.readerTopBar} aria-label="Reader navigation">
          <button
            className={styles.dashboardReturnButton}
            type="button"
            onClick={handleReturnDashboard}
          >
            Back to dashboard
          </button>
          <p>
            Reader view: {selectedLesson.title}. Lesson{" "}
            {studybook.lessons.findIndex(
              (candidate) => candidate.id === selectedLesson.id
            ) + 1}{" "}
            of {studybook.lessons.length}.
          </p>
        </nav>
        <ReaderControls
          settings={readerSettings}
          onSettingsChange={handleReaderSettingsChange}
        />
        {storageNotice ? (
          <div className={styles.storageNotice} role="status">
            {storageNotice}
          </div>
        ) : null}
        <LessonView
          studybook={studybook}
          lesson={selectedLesson}
          learnerState={learnerState}
          onQuizAttempt={handleQuizAttempt}
          onCompleteLesson={handleCompleteLesson}
        />
      </main>
    </div>
  );
}

type DashboardProps = {
  studybook: Studybook;
  selectedLesson: Lesson;
  currentLesson: Lesson;
  learnerState?: LearnerState;
  completedLessonCount: number;
  lessonCompletionPercent: number;
  onSelectLesson: (lessonId: string) => void;
  onOpenSelectedLesson: () => void;
};

function CourseDashboard({
  studybook,
  selectedLesson,
  currentLesson,
  learnerState,
  completedLessonCount,
  lessonCompletionPercent,
  onSelectLesson,
  onOpenSelectedLesson
}: DashboardProps) {
  const selectedLessonIndex = studybook.lessons.findIndex(
    (candidate) => candidate.id === selectedLesson.id
  );
  const selectedLessonStateLabel = getDashboardLessonProgressLabel(
    learnerState?.lessons[selectedLesson.id]?.status,
    true,
    currentLesson.id === selectedLesson.id
  );
  const selectedLessonMaterials = getLessonMaterialEntries(selectedLesson);
  const courseMaterialSummary = getCourseMaterialSummary(studybook.lessons);

  return (
    <main
      id="dashboard-course"
      className={styles.dashboard}
      aria-labelledby="dashboard-title"
    >
      <header className={styles.dashboardHeader}>
        <div>
          <p className={styles.brand}>Project Math</p>
          <h1 id="dashboard-title">Study dashboard</h1>
          <p>
            Open the bundled deterministic course, choose a lesson, then enter the
            reader when you are ready to study.
          </p>
        </div>
        <div className={styles.statusStack} aria-label="App status">
          <span>Local-first</span>
          <span>Offline-ready</span>
          <span>Validated studybook content</span>
        </div>
      </header>

      <section className={styles.dashboardOverview} aria-label="Course overview">
        <section className={styles.coursePanel} aria-labelledby="course-title">
          <p className={styles.dashboardLabel}>Course</p>
          <h2 id="course-title">{studybook.title}</h2>
          <p>{studybook.summary}</p>
          <dl className={styles.courseFacts}>
            <div>
              <dt>Topic</dt>
              <dd>{studybook.topic}</dd>
            </div>
            <div>
              <dt>Lessons</dt>
              <dd>{studybook.lessons.length}</dd>
            </div>
            <div>
              <dt>Materials</dt>
              <dd>{courseMaterialSummary}</dd>
            </div>
          </dl>
          <div
            className={styles.progressMeter}
            aria-label={`${completedLessonCount} of ${studybook.lessons.length} lessons completed`}
          >
            <span
              className={styles.progressFill}
              style={{ width: `${lessonCompletionPercent}%` }}
            />
          </div>
          <p className={styles.progressSummary}>
            {completedLessonCount} of {studybook.lessons.length} lessons complete.
          </p>
          <button
            className={styles.dashboardPrimaryButton}
            type="button"
            onClick={onOpenSelectedLesson}
            aria-label={`Open selected lesson: ${selectedLesson.title}. ${selectedLessonStateLabel}.`}
          >
            Open selected lesson
          </button>
        </section>

        <section
          className={styles.materialPanel}
          aria-labelledby="selected-materials-title"
        >
          <p className={styles.dashboardLabel}>Selected lesson materials</p>
          <h2 id="selected-materials-title">{selectedLesson.title}</h2>
          <p className={styles.selectedLessonStatus}>
            Lesson {selectedLessonIndex + 1} of {studybook.lessons.length}:{" "}
            {selectedLessonStateLabel}.
          </p>
          <dl className={styles.materialList}>
            {selectedLessonMaterials.map((entry) => (
              <div key={entry.label}>
                <dt>{entry.label}</dt>
                <dd>
                  <strong>{entry.value}</strong>
                  <span>{entry.detail}</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </section>

      <section
        className={styles.lessonSequencePanel}
        aria-labelledby="lesson-sequence-title"
      >
        <div className={styles.sectionHeading}>
          <p className={styles.dashboardLabel}>Lesson sequence</p>
          <h2 id="lesson-sequence-title">Choose where to study next</h2>
          <p>
            Text labels show selected, current, completed, and not-started states.
          </p>
        </div>
        <ol className={styles.dashboardLessonList}>
          {studybook.lessons.map((candidate, index) => {
            const materialSummary = getLessonMaterialSummary(candidate);
            const isSelected = candidate.id === selectedLesson.id;
            const isCurrent = candidate.id === currentLesson.id;
            const statusLabel = getDashboardLessonProgressLabel(
              learnerState?.lessons[candidate.id]?.status,
              isSelected,
              isCurrent
            );

            return (
              <li key={candidate.id}>
                <button
                  className={classNames(
                    styles.dashboardLessonButton,
                    isSelected && styles.dashboardLessonButtonSelected,
                    isCurrent && styles.dashboardLessonButtonCurrent
                  )}
                  type="button"
                  aria-pressed={isSelected}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`Select lesson ${index + 1}: ${candidate.title}. ${statusLabel}.`}
                  onClick={() => onSelectLesson(candidate.id)}
                >
                  <span className={styles.lessonNumber}>Lesson {index + 1}</span>
                  <strong>{candidate.title}</strong>
                  <span className={styles.lessonSummary}>{candidate.summary}</span>
                  <span className={styles.lessonStatus}>{statusLabel}</span>
                  <span className={styles.materialDigest}>
                    {materialSummary.sections} sections, {materialSummary.graphs}{" "}
                    graphs, {materialSummary.workedExamples} worked examples,{" "}
                    {materialSummary.quizQuestions} practice questions.
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}

function getReaderLessonProgressLabel(
  status: LearnerState["lessons"][string]["status"] | undefined,
  isSelected: boolean
) {
  if (status === "completed") {
    return isSelected ? "Selected, completed" : "Completed";
  }

  if (status === "in-progress") {
    return isSelected ? "Selected, in progress" : "Started";
  }

  return isSelected ? "Selected, not started" : "Not started";
}

export function getDashboardLessonProgressLabel(
  status: LearnerState["lessons"][string]["status"] | undefined,
  isSelected: boolean,
  isCurrent: boolean
) {
  if (status === "completed") {
    return isSelected ? "Selected, completed" : "Completed";
  }

  if (status === "in-progress") {
    return isSelected ? "Selected, current" : "Current";
  }

  if (isCurrent) {
    return isSelected
      ? "Selected, current, not started"
      : "Current, not started";
  }

  return isSelected ? "Selected, not started" : "Not started";
}

type LessonMaterialSummary = {
  objectives: number;
  sections: number;
  graphs: number;
  workedExamples: number;
  commonMistakes: number;
  quizBlocks: number;
  quizQuestions: number;
  summaries: number;
};

function getLessonMaterialSummary(lesson: Lesson): LessonMaterialSummary {
  const blocks = lesson.sections.flatMap((section) => section.blocks);

  return {
    objectives: lesson.objectives.length,
    sections: lesson.sections.length,
    graphs: countBlocksByType(blocks, "graph"),
    workedExamples: countBlocksByType(blocks, "workedExample"),
    commonMistakes: countBlocksByType(blocks, "commonMistake"),
    quizBlocks: countBlocksByType(blocks, "quiz"),
    quizQuestions: countQuizQuestions(blocks),
    summaries: countBlocksByType(blocks, "summary")
  };
}

function getLessonMaterialEntries(lesson: Lesson) {
  const summary = getLessonMaterialSummary(lesson);

  return [
    {
      label: "Objectives",
      value: String(summary.objectives),
      detail: "Learning goals shown at the lesson opening."
    },
    {
      label: "Sections",
      value: String(summary.sections),
      detail: "Ordered steps in the reader path."
    },
    {
      label: "Graphs",
      value: String(summary.graphs),
      detail: "Focusable SVG graphs with text details."
    },
    {
      label: "Worked examples",
      value: String(summary.workedExamples),
      detail: "Step-by-step calculations."
    },
    {
      label: "Common mistakes",
      value: String(summary.commonMistakes),
      detail: "Misconception, correction, and check prompts."
    },
    {
      label: "Practice",
      value: `${summary.quizBlocks} quizzes, ${summary.quizQuestions} questions`,
      detail: "Deterministic quiz feedback in the reader."
    },
    {
      label: "Summary/export",
      value: summary.summaries > 0 ? "Available" : "Export only",
      detail: "Lesson summary and markdown export actions."
    }
  ];
}

function getCourseMaterialSummary(lessons: Lesson[]) {
  const totals = lessons.reduce<LessonMaterialSummary>(
    (current, lesson) => {
      const summary = getLessonMaterialSummary(lesson);

      return {
        objectives: current.objectives + summary.objectives,
        sections: current.sections + summary.sections,
        graphs: current.graphs + summary.graphs,
        workedExamples: current.workedExamples + summary.workedExamples,
        commonMistakes: current.commonMistakes + summary.commonMistakes,
        quizBlocks: current.quizBlocks + summary.quizBlocks,
        quizQuestions: current.quizQuestions + summary.quizQuestions,
        summaries: current.summaries + summary.summaries
      };
    },
    {
      objectives: 0,
      sections: 0,
      graphs: 0,
      workedExamples: 0,
      commonMistakes: 0,
      quizBlocks: 0,
      quizQuestions: 0,
      summaries: 0
    }
  );

  return `${totals.objectives} objectives, ${totals.sections} sections, ${totals.graphs} graphs, ${totals.workedExamples} worked examples, ${totals.commonMistakes} common mistakes, ${totals.quizQuestions} practice questions`;
}

function countBlocksByType(blocks: StudyBlock[], type: StudyBlock["type"]) {
  return blocks.filter((block) => block.type === type).length;
}

function countQuizQuestions(blocks: StudyBlock[]) {
  return blocks.reduce((count, block) => {
    if (block.type !== "quiz") {
      return count;
    }

    return count + block.questions.length;
  }, 0);
}

function getRecommendedLesson(
  lessons: Lesson[],
  state: LearnerState | undefined
) {
  return (
    lessons.find(
      (lesson) => state?.lessons[lesson.id]?.status === "in-progress"
    ) ??
    lessons.find((lesson) => state?.lessons[lesson.id]?.status !== "completed") ??
    lessons[0]
  );
}

function classNames(...names: Array<string | false | undefined>) {
  return names.filter(Boolean).join(" ");
}

function getBrowserStorage() {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

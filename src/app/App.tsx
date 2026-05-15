import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import courseJson from "../content/fixtures/courses/calculus-i.course.json";
import { eachLesson, findLesson, totalLessons, validateContent, type Course } from "../content";
import { createDefaultLearnerStateRepository } from "../storage/LearnerStateRepository";
import {
  createEmptyLearnerState,
  markLessonCompleted,
  markLessonOpened,
  recordQuizAttempt,
  type LearnerState
} from "../storage/learnerState";
import type { QuizAttemptSubmission } from "../rendering/blocks/QuizBlockView";
import { Button } from "../design/primitives";
import {
  applyDisplayMode,
  getInitialDisplayMode,
  persistDisplayMode,
  toggleDisplayMode,
  type DisplayMode
} from "./displayMode";
import { routeFromHash, routeToHash, type Route } from "./Router";
import { Shell } from "./components/Shell";
import { ShortcutsDialog } from "./components/ShortcutsDialog";
import { CoursesDashboardView, type CourseSummary } from "./views/CoursesDashboardView";
import { CourseDetailView } from "./views/CourseDetailView";
import { ReaderView } from "./views/ReaderView";
import {
  createReaderSettingsStyle,
  loadReaderSettings,
  saveReaderSettings,
  type ReaderSettings
} from "./readerSettings";
import appStyles from "./App.module.css";

const ALL_COURSES: Course[] = [];

function loadCourses(): {
  courses: Course[];
  errors: { courseId: string; message: string }[];
} {
  if (ALL_COURSES.length === 0) {
    const result = validateContent(courseJson);
    if (result.ok) {
      ALL_COURSES.push(result.course);
    } else {
      return {
        courses: [],
        errors: result.errors.map((e) => ({
          courseId: "calculus-i",
          message: `${e.path}: ${e.message}`
        }))
      };
    }
  }
  return { courses: ALL_COURSES, errors: [] };
}

function buildSummary(course: Course, learnerState: LearnerState | undefined): CourseSummary {
  const lessons = eachLesson(course);
  const total = lessons.length;
  const completed = lessons.filter(
    ({ lesson }) => learnerState?.lessons[lesson.id]?.status === "completed"
  ).length;

  let continueAt: CourseSummary["continueAt"] = null;
  for (const entry of lessons) {
    const progress = learnerState?.lessons[entry.lesson.id];
    if (progress?.status === "in-progress") {
      continueAt = { module: entry.module, lesson: entry.lesson };
      break;
    }
  }
  if (!continueAt) {
    const firstUnfinished = lessons.find(
      ({ lesson }) => learnerState?.lessons[lesson.id]?.status !== "completed"
    );
    if (firstUnfinished) {
      continueAt = { module: firstUnfinished.module, lesson: firstUnfinished.lesson };
    }
  }

  return { course, completedLessons: completed, totalLessons: total, continueAt };
}

export function App() {
  const { courses, errors } = useMemo(() => loadCourses(), []);
  const primaryCourse = courses[0];
  const learnerStateRepository = useMemo(() => createDefaultLearnerStateRepository(), []);
  const [route, setRoute] = useState<Route>(() =>
    typeof window !== "undefined" ? routeFromHash(window.location.hash) : { kind: "home" }
  );
  const [learnerState, setLearnerState] = useState<LearnerState | undefined>();
  const [hasLoadedLearnerState, setHasLoadedLearnerState] = useState(false);
  const [storageNotice, setStorageNotice] = useState<string | undefined>();
  const [readerSettings, setReaderSettings] = useState<ReaderSettings>(() =>
    loadReaderSettings(typeof window !== "undefined" ? window.localStorage : undefined)
  );
  const readerSettingsStyle = useMemo(
    () => createReaderSettingsStyle(readerSettings) as CSSProperties,
    [readerSettings]
  );
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => getInitialDisplayMode());
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  useEffect(() => {
    applyDisplayMode(displayMode);
  }, [displayMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onHashChange = () => setRoute(routeFromHash(window.location.hash));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = useCallback((next: Route) => {
    if (typeof window !== "undefined") {
      window.location.hash = routeToHash(next).slice(1);
    }
    setRoute(next);
  }, []);

  const persistState = useCallback(
    (nextState: LearnerState) => {
      void learnerStateRepository.saveLearnerState(nextState).catch(() => {
        setStorageNotice("Progress is available for this session but could not be saved.");
      });
    },
    [learnerStateRepository]
  );

  useEffect(() => {
    if (!primaryCourse) return;
    let cancelled = false;
    setHasLoadedLearnerState(false);
    async function load() {
      try {
        const loaded = await learnerStateRepository.loadLearnerState(primaryCourse.id);
        if (cancelled) return;
        setLearnerState(loaded.state);
        setHasLoadedLearnerState(true);
        if (loaded.status === "recovered-from-corrupt") {
          setStorageNotice("Saved progress was unreadable, so it was reset for this course.");
        }
      } catch {
        if (cancelled) return;
        setLearnerState(createEmptyLearnerState(primaryCourse.id));
        setHasLoadedLearnerState(true);
        setStorageNotice("Progress is available for this session but could not be saved.");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [learnerStateRepository, primaryCourse]);

  useEffect(() => {
    if (!primaryCourse || route.kind !== "lesson" || !hasLoadedLearnerState) return;
    const lesson = findLesson(primaryCourse, route.lessonId)?.lesson;
    if (!lesson) return;
    const openedAt = new Date().toISOString();
    setLearnerState((current) => {
      const next = markLessonOpened(
        current ?? createEmptyLearnerState(primaryCourse.id),
        lesson.id,
        openedAt
      );
      persistState(next);
      return next;
    });
  }, [hasLoadedLearnerState, persistState, primaryCourse, route]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement) {
        const tag = event.target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || event.target.isContentEditable) return;
      }
      if (event.key === "?" || (event.key === "/" && event.shiftKey)) {
        event.preventDefault();
        setShortcutsOpen(true);
      } else if (event.key === "Escape" && shortcutsOpen) {
        setShortcutsOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcutsOpen]);

  const handleToggleMode = useCallback(() => {
    setDisplayMode((current) => {
      const next = toggleDisplayMode(current);
      persistDisplayMode(next);
      return next;
    });
  }, []);

  const handleReaderSettingsChange = useCallback((settings: ReaderSettings) => {
    setReaderSettings(settings);
    saveReaderSettings(settings, typeof window !== "undefined" ? window.localStorage : undefined);
  }, []);

  const handleQuizAttempt = useCallback(
    (attempt: QuizAttemptSubmission) => {
      if (!primaryCourse) return;
      setLearnerState((current) => {
        const next = recordQuizAttempt(current ?? createEmptyLearnerState(primaryCourse.id), {
          ...attempt,
          submittedAt: new Date().toISOString()
        });
        persistState(next);
        return next;
      });
    },
    [persistState, primaryCourse]
  );

  const handleCompleteLesson = useCallback(
    (lessonId: string) => {
      if (!primaryCourse) return;
      setLearnerState((current) => {
        const next = markLessonCompleted(
          current ?? createEmptyLearnerState(primaryCourse.id),
          lessonId,
          new Date().toISOString()
        );
        persistState(next);
        return next;
      });
    },
    [persistState, primaryCourse]
  );

  if (errors.length > 0) {
    return (
      <div className={appStyles.errorView} role="alert">
        <h1>Course validation failed.</h1>
        <p>The bundled course could not be loaded. Fix these errors and reload:</p>
        <ul>
          {errors.map((error, idx) => (
            <li key={idx}>
              <code>{error.message}</code>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (!primaryCourse) {
    return (
      <div className={appStyles.errorView}>
        <h1>No courses available.</h1>
      </div>
    );
  }

  const summaries = courses.map((course) =>
    buildSummary(course, course.id === primaryCourse.id ? learnerState : undefined)
  );

  const goHome = () => navigate({ kind: "home" });
  const openCourse = (courseId: string) => navigate({ kind: "course", courseId });
  const openLesson = (courseId: string, lessonId: string) =>
    navigate({ kind: "lesson", courseId, lessonId });

  let body: JSX.Element;
  if (route.kind === "home") {
    body = (
      <CoursesDashboardView
        summaries={summaries}
        learnerState={learnerState}
        onOpenCourse={openCourse}
        onOpenLesson={openLesson}
      />
    );
  } else if (route.kind === "course") {
    const course = courses.find((c) => c.id === route.courseId);
    if (!course) {
      body = <NotFound onGoHome={goHome} />;
    } else {
      body = (
        <CourseDetailView
          course={course}
          learnerState={course.id === primaryCourse.id ? learnerState : undefined}
          onOpenLesson={(lessonId) => openLesson(course.id, lessonId)}
          onGoHome={goHome}
        />
      );
    }
  } else {
    const course = courses.find((c) => c.id === route.courseId);
    const lesson = course ? findLesson(course, route.lessonId)?.lesson : undefined;
    if (!course || !lesson) {
      body = <NotFound onGoHome={goHome} />;
    } else {
      body = (
        <ReaderView
          course={course}
          lesson={lesson}
          learnerState={course.id === primaryCourse.id ? learnerState : undefined}
          readerSettings={readerSettings}
          onReaderSettingsChange={handleReaderSettingsChange}
          onOpenLesson={(lessonId) => openLesson(course.id, lessonId)}
          onOpenCourse={() => openCourse(course.id)}
          onGoHome={goHome}
          onQuizAttempt={handleQuizAttempt}
          onCompleteLesson={() => handleCompleteLesson(lesson.id)}
        />
      );
    }
  }

  void totalLessons;

  return (
    <div style={readerSettingsStyle as CSSProperties}>
      {storageNotice ? (
        <p className={appStyles.storageNotice} role="status" aria-live="polite">
          {storageNotice}{" "}
          <Button variant="ghost" size="sm" onClick={() => setStorageNotice(undefined)}>
            Dismiss
          </Button>
        </p>
      ) : null}
      <Shell
        mode={displayMode}
        onToggleMode={handleToggleMode}
        onOpenShortcuts={() => setShortcutsOpen(true)}
        onGoHome={goHome}
      >
        {body}
      </Shell>
      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}

function NotFound({ onGoHome }: { onGoHome: () => void }) {
  return (
    <div role="alert" style={{ padding: "var(--pm-space-6)" }}>
      <h1>That page isn&apos;t available.</h1>
      <p>Try going back to the courses dashboard.</p>
      <Button onClick={onGoHome}>Go home</Button>
    </div>
  );
}

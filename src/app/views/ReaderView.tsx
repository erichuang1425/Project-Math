import clsx from "clsx";
import { useEffect, useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { Course, Lesson } from "../../content/schema";
import type { LearnerState } from "../../storage/learnerState";
import type { QuizAttemptSubmission } from "../../rendering/blocks/QuizBlockView";
import { eachLesson, findLesson, totalLessons } from "../../content/courseHelpers";
import { LessonView } from "../../rendering/LessonView";
import { ProgressBar } from "../../design/primitives";
import { Breadcrumb } from "../components/Breadcrumb";
import { LessonListItem, type LessonStatus } from "../components/LessonListItem";
import { ReaderControls } from "../ReaderControls";
import type { ReaderSettings } from "../readerSettings";
import styles from "./ReaderView.module.css";

const sidebarCollapsedStorageKey = "project-math:reader-sidebar-collapsed:v1";

function loadSidebarCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(sidebarCollapsedStorageKey) === "1";
  } catch {
    return false;
  }
}

function saveSidebarCollapsed(collapsed: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(sidebarCollapsedStorageKey, collapsed ? "1" : "0");
  } catch {
    // Ignore storage failures; the toggle still works for the session.
  }
}

export interface ReaderViewProps {
  course: Course;
  lesson: Lesson;
  learnerState: LearnerState | undefined;
  readerSettings: ReaderSettings;
  onReaderSettingsChange: (settings: ReaderSettings) => void;
  onOpenLesson: (lessonId: string) => void;
  onOpenCourse: () => void;
  onGoHome: () => void;
  onQuizAttempt?: (attempt: QuizAttemptSubmission) => void;
  onCompleteLesson?: () => void;
  onSectionView?: (sectionId: string) => void;
}

function statusFor(learnerState: LearnerState | undefined, lessonId: string): LessonStatus {
  const progress = learnerState?.lessons[lessonId];
  if (!progress) return "not-started";
  return progress.status === "completed" ? "completed" : "in-progress";
}

export function ReaderView({
  course,
  lesson,
  learnerState,
  readerSettings,
  onReaderSettingsChange,
  onOpenLesson,
  onOpenCourse,
  onGoHome,
  onQuizAttempt,
  onCompleteLesson,
  onSectionView
}: ReaderViewProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => loadSidebarCollapsed());

  useEffect(() => {
    saveSidebarCollapsed(sidebarCollapsed);
  }, [sidebarCollapsed]);

  const location = findLesson(course, lesson.id);
  if (!location) return null;

  const total = totalLessons(course);
  const completed = eachLesson(course).filter(
    ({ lesson: l }) => learnerState?.lessons[l.id]?.status === "completed"
  ).length;

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Courses", onClick: onGoHome },
          { label: course.title, onClick: onOpenCourse },
          { label: location.module.title, onClick: onOpenCourse },
          { label: lesson.title }
        ]}
      />
      <div className={clsx(styles.reader, sidebarCollapsed && styles.readerSidebarCollapsed)}>
        {!sidebarCollapsed && (
          <aside className={styles.sidebar} aria-label="Lesson navigation">
            <div className={styles.sidebarHeader}>
              <p className={styles.sidebarTitle}>{location.module.title}</p>
              <button
                type="button"
                className={styles.sidebarToggle}
                onClick={() => setSidebarCollapsed(true)}
                aria-label="Hide lesson navigation"
                aria-expanded="true"
                title="Hide lesson navigation"
              >
                <PanelLeftClose size={16} aria-hidden="true" />
              </button>
            </div>
            <ProgressBar
              value={completed}
              total={total}
              label={`${completed} of ${total} lessons complete`}
            />
            <ul className={styles.lessonList}>
              {location.module.lessons.map((sibling, index) => (
                <li key={sibling.id}>
                  <LessonListItem
                    lesson={sibling}
                    index={index}
                    status={statusFor(learnerState, sibling.id)}
                    isCurrent={sibling.id === lesson.id}
                    compact
                    onOpen={() => onOpenLesson(sibling.id)}
                  />
                </li>
              ))}
            </ul>
          </aside>
        )}
        <div className={styles.main}>
          {sidebarCollapsed && (
            <button
              type="button"
              className={styles.sidebarShow}
              onClick={() => setSidebarCollapsed(false)}
              aria-label="Show lesson navigation"
              aria-expanded="false"
              title="Show lesson navigation"
            >
              <PanelLeftOpen size={16} aria-hidden="true" />
              <span>Lessons</span>
            </button>
          )}
          <div className={styles.readerControlsBar}>
            <ReaderControls settings={readerSettings} onSettingsChange={onReaderSettingsChange} />
          </div>
          <LessonView
            course={course}
            module={location.module}
            lesson={lesson}
            lessonNumber={location.globalLessonIndex + 1}
            totalLessons={total}
            learnerState={learnerState}
            onQuizAttempt={onQuizAttempt}
            onCompleteLesson={onCompleteLesson}
            initialSectionId={learnerState?.lessons[lesson.id]?.lastSectionId}
            onSectionView={onSectionView}
          />
        </div>
      </div>
    </div>
  );
}

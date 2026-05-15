import type { Course, Lesson } from "../../content/schema";
import type { LearnerState } from "../../storage/learnerState";
import { Pill, ProgressBar } from "../../design/primitives";
import { LessonListItem, type LessonStatus } from "../components/LessonListItem";
import { Breadcrumb } from "../components/Breadcrumb";
import { isLessonBlocked, eachLesson } from "../../content/courseHelpers";
import styles from "./CourseDetailView.module.css";

export interface CourseDetailViewProps {
  course: Course;
  learnerState: LearnerState | undefined;
  onOpenLesson: (lessonId: string) => void;
  onGoHome: () => void;
}

function lessonStatus(
  lesson: Lesson,
  course: Course,
  learnerState: LearnerState | undefined
): LessonStatus {
  const completed = new Set(
    Object.entries(learnerState?.lessons ?? {})
      .filter(([, progress]) => progress.status === "completed")
      .map(([id]) => id)
  );
  if (isLessonBlocked(course, lesson, completed)) {
    return "locked";
  }
  const progress = learnerState?.lessons[lesson.id];
  if (!progress) return "not-started";
  return progress.status === "completed" ? "completed" : "in-progress";
}

export function CourseDetailView({
  course,
  learnerState,
  onOpenLesson,
  onGoHome
}: CourseDetailViewProps) {
  const lessons = eachLesson(course);
  const total = lessons.length;
  const completed = lessons.filter(
    ({ lesson }) => learnerState?.lessons[lesson.id]?.status === "completed"
  ).length;
  const currentLesson = lessons.find(
    ({ lesson }) => learnerState?.lessons[lesson.id]?.status === "in-progress"
  );

  return (
    <div className={styles.detail}>
      <Breadcrumb items={[{ label: "Courses", onClick: onGoHome }, { label: course.title }]} />

      <header className={styles.header}>
        <div>
          <p className={styles.headerEyebrow}>
            {course.subject} · {course.level}
          </p>
          <h1 className={styles.headerTitle}>{course.title}</h1>
          <p className={styles.headerSummary}>{course.summary}</p>
          <div className={styles.headerMeta}>
            <Pill tone="accent">
              {total} lesson{total === 1 ? "" : "s"}
            </Pill>
            {course.prerequisites.map((prereq) => (
              <Pill key={prereq} tone="outline">
                {prereq}
              </Pill>
            ))}
            <Pill tone="info">
              {course.glossary.length} glossary term{course.glossary.length === 1 ? "" : "s"}
            </Pill>
          </div>
        </div>
        <div style={{ minWidth: "200px" }}>
          <ProgressBar value={completed} total={total} />
        </div>
      </header>

      {course.modules.map((module) => (
        <section key={module.id} className={styles.module} aria-labelledby={`${module.id}-heading`}>
          <div className={styles.moduleHeader}>
            <h2 id={`${module.id}-heading`} className={styles.moduleTitle}>
              {module.title}
            </h2>
            <span>
              <Pill>
                {module.lessons.length} lesson{module.lessons.length === 1 ? "" : "s"}
              </Pill>
            </span>
          </div>
          <p className={styles.moduleSummary}>{module.summary}</p>
          <ul className={styles.lessonList}>
            {module.lessons.map((lesson, index) => {
              const globalIndex = lessons.findIndex((entry) => entry.lesson.id === lesson.id);
              const status = lessonStatus(lesson, course, learnerState);
              return (
                <li key={lesson.id}>
                  <LessonListItem
                    lesson={lesson}
                    index={globalIndex >= 0 ? globalIndex : index}
                    status={status}
                    isCurrent={currentLesson?.lesson.id === lesson.id}
                    onOpen={() => onOpenLesson(lesson.id)}
                  />
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

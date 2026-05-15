import type { Course, Lesson } from "../../content/schema";
import type { LearnerState } from "../../storage/learnerState";
import type { QuizAttemptSubmission } from "../../rendering/blocks/QuizBlockView";
import { eachLesson, findLesson, totalLessons } from "../../content/courseHelpers";
import { LessonView } from "../../rendering/LessonView";
import { ProgressBar } from "../../design/primitives";
import { Breadcrumb } from "../components/Breadcrumb";
import { LessonListItem, type LessonStatus } from "../components/LessonListItem";
import styles from "./ReaderView.module.css";

export interface ReaderViewProps {
  course: Course;
  lesson: Lesson;
  learnerState: LearnerState | undefined;
  onOpenLesson: (lessonId: string) => void;
  onOpenCourse: () => void;
  onGoHome: () => void;
  onQuizAttempt?: (attempt: QuizAttemptSubmission) => void;
  onCompleteLesson?: () => void;
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
  onOpenLesson,
  onOpenCourse,
  onGoHome,
  onQuizAttempt,
  onCompleteLesson
}: ReaderViewProps) {
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
      <div className={styles.reader}>
        <aside className={styles.sidebar} aria-label="Lesson navigation">
          <p className={styles.sidebarTitle}>{location.module.title}</p>
          <ProgressBar value={completed} total={total} label={`${completed} of ${total} lessons complete`} />
          <ul className={styles.lessonList}>
            {location.module.lessons.map((sibling, index) => (
              <li key={sibling.id}>
                <LessonListItem
                  lesson={sibling}
                  index={index}
                  status={statusFor(learnerState, sibling.id)}
                  isCurrent={sibling.id === lesson.id}
                  onOpen={() => onOpenLesson(sibling.id)}
                />
              </li>
            ))}
          </ul>
        </aside>
        <div className={styles.main}>
          <LessonView
            course={course}
            module={location.module}
            lesson={lesson}
            lessonNumber={location.globalLessonIndex + 1}
            totalLessons={total}
            learnerState={learnerState}
            onQuizAttempt={onQuizAttempt}
            onCompleteLesson={onCompleteLesson}
          />
        </div>
      </div>
    </div>
  );
}

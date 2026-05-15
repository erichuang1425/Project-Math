import type { Course } from "../../content/schema";
import { Pill, ProgressRing } from "../../design/primitives";
import { getIllustration } from "../../design/illustrations/illustrations";
import styles from "./CourseCard.module.css";

export interface CourseCardProps {
  course: Course;
  completedLessons: number;
  totalLessons: number;
  onOpen: () => void;
}

export function CourseCard({ course, completedLessons, totalLessons, onOpen }: CourseCardProps) {
  const illustration = getIllustration(course.illustrationId);
  return (
    <button
      type="button"
      className={styles.card}
      onClick={onOpen}
      aria-label={`Open ${course.title}`}
    >
      {illustration ? <div className={styles.illustration}>{illustration}</div> : null}
      <div className={styles.body}>
        <div className={styles.headerRow}>
          <h2 className={styles.title}>{course.title}</h2>
          <ProgressRing value={completedLessons} total={totalLessons} size={48} thickness={5} />
        </div>
        <p className={styles.summary}>{course.summary}</p>
        <div className={styles.footer}>
          <div className={styles.tags}>
            <Pill tone="accent">{course.level}</Pill>
            <Pill>
              {totalLessons} lesson{totalLessons === 1 ? "" : "s"}
            </Pill>
          </div>
          <span>
            {course.prerequisites.length > 0
              ? `Needs: ${course.prerequisites.join(", ")}`
              : "No prereqs"}
          </span>
        </div>
      </div>
    </button>
  );
}

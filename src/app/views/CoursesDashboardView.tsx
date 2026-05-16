import type { Course, Lesson, LessonSection, Module } from "../../content/schema";
import type { LearnerState } from "../../storage/learnerState";
import { Stat } from "../../design/primitives";
import { CourseCard } from "../components/CourseCard";
import { ContinueCard } from "../components/ContinueCard";
import styles from "./CoursesDashboardView.module.css";

export interface CourseSummary {
  course: Course;
  completedLessons: number;
  totalLessons: number;
  continueAt: { module: Module; lesson: Lesson; section?: LessonSection } | null;
}

export interface CoursesDashboardViewProps {
  summaries: CourseSummary[];
  learnerState: LearnerState | undefined;
  onOpenCourse: (courseId: string) => void;
  onOpenLesson: (courseId: string, lessonId: string) => void;
}

export function CoursesDashboardView({
  summaries,
  learnerState,
  onOpenCourse,
  onOpenLesson
}: CoursesDashboardViewProps) {
  const totalLessonsAcross = summaries.reduce((sum, s) => sum + s.totalLessons, 0);
  const completedAcross = summaries.reduce((sum, s) => sum + s.completedLessons, 0);
  const totalAttempts = learnerState
    ? Object.values(learnerState.quizAttempts).reduce((sum, list) => sum + list.length, 0)
    : 0;

  const focusSummary = summaries.find((s) => s.continueAt) ?? summaries[0];
  const isFresh = focusSummary ? focusSummary.completedLessons === 0 : false;

  return (
    <div className={styles.dashboard}>
      <section className={styles.hero}>
        <p className={styles.heroEyebrow}>Welcome back</p>
        <h1 className={styles.heroTitle}>What would you like to learn today?</h1>
        <p className={styles.heroLead}>
          Short lessons. Worked examples. Practice that explains itself. Pick up where you left off,
          or browse the catalog below.
        </p>
      </section>

      {focusSummary && focusSummary.continueAt ? (
        <ContinueCard
          course={focusSummary.course}
          module={focusSummary.continueAt.module}
          lesson={focusSummary.continueAt.lesson}
          sectionTitle={focusSummary.continueAt.section?.title}
          isFresh={isFresh}
          onContinue={() =>
            focusSummary.continueAt &&
            onOpenLesson(focusSummary.course.id, focusSummary.continueAt.lesson.id)
          }
          onOpenCourse={() => onOpenCourse(focusSummary.course.id)}
        />
      ) : null}

      <section className={styles.section} aria-label="Your stats">
        <div className={styles.statsRow}>
          <Stat label="Lessons available" value={totalLessonsAcross} />
          <Stat
            label="Lessons completed"
            value={completedAcross}
            hint={
              totalLessonsAcross > 0
                ? `${Math.round((completedAcross / totalLessonsAcross) * 100)}% of catalog`
                : undefined
            }
          />
          <Stat label="Quiz attempts" value={totalAttempts} />
        </div>
      </section>

      <section className={styles.section} aria-label="Course catalog">
        <h2 className={styles.sectionTitle}>Courses</h2>
        <div className={styles.cardGrid}>
          {summaries.map((summary) => (
            <CourseCard
              key={summary.course.id}
              course={summary.course}
              completedLessons={summary.completedLessons}
              totalLessons={summary.totalLessons}
              onOpen={() => onOpenCourse(summary.course.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

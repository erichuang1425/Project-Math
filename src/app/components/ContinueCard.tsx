import { ArrowRight, Sparkles } from "lucide-react";
import type { Course, Lesson, Module } from "../../content/schema";
import { Button } from "../../design/primitives";
import { getIllustration } from "../../design/illustrations/illustrations";
import styles from "./ContinueCard.module.css";

export interface ContinueCardProps {
  course: Course;
  module: Module;
  lesson: Lesson;
  sectionTitle?: string;
  onContinue: () => void;
  onOpenCourse: () => void;
  isFresh: boolean;
}

export function ContinueCard({
  course,
  module: courseModule,
  lesson,
  sectionTitle,
  onContinue,
  onOpenCourse,
  isFresh
}: ContinueCardProps) {
  const illustration = getIllustration(course.illustrationId);
  return (
    <section className={styles.card} aria-label="Continue learning">
      <div>
        <p className={styles.eyebrow}>
          <Sparkles size={12} aria-hidden="true" />{" "}
          {isFresh ? "Start with" : "Pick up where you left off"}
        </p>
        <h2 className={styles.title}>{lesson.title}</h2>
        {sectionTitle && !isFresh ? (
          <p className={styles.resumeLine}>Resume at: {sectionTitle}</p>
        ) : null}
        <p className={styles.summary}>
          {course.title} · {courseModule.title} · {lesson.estimatedMinutes} min
        </p>
        <div className={styles.actions}>
          <Button
            onClick={onContinue}
            trailingIcon={<ArrowRight size={16} aria-hidden="true" />}
            size="lg"
          >
            {isFresh ? "Begin lesson" : "Continue lesson"}
          </Button>
          <Button variant="ghost" onClick={onOpenCourse}>
            View course
          </Button>
        </div>
      </div>
      {illustration ? (
        <div className={styles.illustration} aria-hidden="true">
          {illustration}
        </div>
      ) : null}
    </section>
  );
}

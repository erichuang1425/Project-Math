import clsx from "clsx";
import { Check, Clock, Lock } from "lucide-react";
import type { Lesson } from "../../content/schema";
import styles from "./LessonListItem.module.css";

export type LessonStatus = "not-started" | "in-progress" | "completed" | "locked";

export interface LessonListItemProps {
  lesson: Lesson;
  index: number;
  status: LessonStatus;
  isCurrent?: boolean;
  compact?: boolean;
  onOpen: () => void;
}

const statusLabel: Record<LessonStatus, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  completed: "Completed",
  locked: "Locked"
};

const statusClass: Record<LessonStatus, string> = {
  "not-started": "",
  "in-progress": styles.statusInProgress,
  completed: styles.statusCompleted,
  locked: styles.statusLocked
};

export function LessonListItem({
  lesson,
  index,
  status,
  isCurrent,
  compact,
  onOpen
}: LessonListItemProps) {
  const locked = status === "locked";
  return (
    <button
      type="button"
      className={clsx(styles.item, compact && styles.itemCompact, locked && styles.locked)}
      onClick={locked ? undefined : onOpen}
      disabled={locked}
      aria-current={isCurrent ? "true" : undefined}
    >
      <span
        className={clsx(
          styles.numberDot,
          status === "completed" && styles.numberDotComplete,
          isCurrent && styles.numberDotCurrent
        )}
        aria-hidden="true"
      >
        {status === "completed" ? <Check size={16} /> : locked ? <Lock size={14} /> : index + 1}
      </span>
      <span className={styles.body}>
        <span className={styles.title}>{lesson.title}</span>
        {compact ? null : <span className={styles.summary}>{lesson.summary}</span>}
      </span>
      <span className={styles.meta}>
        <span className={clsx(styles.status, statusClass[status])}>{statusLabel[status]}</span>
        {compact ? null : (
          <span>
            <Clock size={12} aria-hidden="true" /> {lesson.estimatedMinutes} min
          </span>
        )}
      </span>
    </button>
  );
}

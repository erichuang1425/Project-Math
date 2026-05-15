import clsx from "clsx";
import type { ReactNode } from "react";
import styles from "./Pill.module.css";

export type PillTone =
  | "neutral"
  | "accent"
  | "correct"
  | "incorrect"
  | "warning"
  | "info"
  | "outline";

export interface PillProps {
  tone?: PillTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
  ariaLabel?: string;
}

const toneClass: Record<PillTone, string> = {
  neutral: styles.neutral,
  accent: styles.accent,
  correct: styles.correct,
  incorrect: styles.incorrect,
  warning: styles.warning,
  info: styles.info,
  outline: styles.outline
};

export function Pill({ tone = "neutral", icon, children, className, id, ariaLabel }: PillProps) {
  return (
    <span
      id={id}
      aria-label={ariaLabel}
      className={clsx(styles.pill, toneClass[tone], className)}
    >
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}

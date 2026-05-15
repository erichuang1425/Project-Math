import clsx from "clsx";
import type { ReactNode } from "react";
import styles from "./Stat.module.css";

export interface StatProps {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  inline?: boolean;
  className?: string;
}

export function Stat({ label, value, hint, inline, className }: StatProps) {
  return (
    <div className={clsx(styles.stat, inline && styles.inline, className)}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      {hint ? <span className={styles.hint}>{hint}</span> : null}
    </div>
  );
}

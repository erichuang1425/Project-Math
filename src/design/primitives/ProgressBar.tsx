import clsx from "clsx";
import styles from "./ProgressBar.module.css";

export interface ProgressBarProps {
  value: number;
  total: number;
  label?: string;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ value, total, label, showLabel = true, className }: ProgressBarProps) {
  const clampedTotal = Math.max(total, 1);
  const clampedValue = Math.max(0, Math.min(value, clampedTotal));
  const pct = (clampedValue / clampedTotal) * 100;
  const text = label ?? `${clampedValue} of ${clampedTotal} complete`;

  return (
    <div className={clsx(styles.wrapper, className)}>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={clampedTotal}
        aria-valuenow={clampedValue}
        aria-label={text}
        className={styles.track}
      >
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
      {showLabel ? <span className={styles.label}>{text}</span> : null}
    </div>
  );
}

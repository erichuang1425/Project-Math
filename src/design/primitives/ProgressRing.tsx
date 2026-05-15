import clsx from "clsx";
import styles from "./ProgressRing.module.css";

export interface ProgressRingProps {
  value: number;
  total: number;
  size?: number;
  thickness?: number;
  label?: string;
  showLabel?: boolean;
  className?: string;
}

export function ProgressRing({
  value,
  total,
  size = 56,
  thickness = 6,
  label,
  showLabel = true,
  className
}: ProgressRingProps) {
  const clampedTotal = Math.max(total, 1);
  const clampedValue = Math.max(0, Math.min(value, clampedTotal));
  const pct = clampedValue / clampedTotal;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  const displayLabel = label ?? `${Math.round(pct * 100)}%`;
  const ariaLabel = `${clampedValue} of ${clampedTotal} complete`;

  return (
    <span
      className={clsx(styles.ring, className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={ariaLabel}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          className={styles.track}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
        />
        <circle
          className={styles.fill}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {showLabel ? (
        <span className={styles.label} aria-hidden="true">
          {displayLabel}
        </span>
      ) : null}
    </span>
  );
}

import { useState } from "react";
import type { WorkedExampleBlock } from "../../studybook/schema";
import { MathBlock } from "../../math/MathBlock";
import styles from "../lesson.module.css";

type WorkedExampleBlockViewProps = {
  block: WorkedExampleBlock;
};

export function WorkedExampleBlockView({ block }: WorkedExampleBlockViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const step = block.steps[activeIndex];
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === block.steps.length - 1;

  return (
    <section className={`${styles.block} ${styles.workedExample}`} aria-labelledby={block.id}>
      <p className={styles.blockTypeLabel}>Worked example</p>
      <h3 id={block.id} className={styles.blockTitle}>
        {block.title}
      </h3>
      <p>
        <strong>Goal:</strong> {block.goal}
      </p>
      {block.given ? (
        <p>
          <strong>Given:</strong> {block.given}
        </p>
      ) : null}

      <div className={styles.stepRail} role="tablist" aria-label="Example steps">
        {block.steps.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === activeIndex}
            aria-controls={`${block.id}-step-panel`}
            className={`${styles.stepPill} ${i === activeIndex ? styles.stepPillActive : ""}`}
            type="button"
            onClick={() => setActiveIndex(i)}
          >
            <span className={styles.stepPillNumber}>{i + 1}</span>
            <span className={styles.stepPillLabel}>{s.label}</span>
          </button>
        ))}
      </div>

      {step ? (
        <div
          id={`${block.id}-step-panel`}
          role="tabpanel"
          aria-label={`Step ${activeIndex + 1}: ${step.label}`}
          className={styles.stepPanel}
        >
          <p className={styles.stepPanelTitle}>
            <strong>
              Step {activeIndex + 1} of {block.steps.length}:
            </strong>{" "}
            {step.label}
          </p>
          <p>{step.explanation}</p>
          {step.latex ? <MathBlock latex={step.latex} /> : null}
          <div className={styles.stepNavigation}>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
              disabled={isFirst}
              aria-label="Previous step"
            >
              ← Previous
            </button>
            <span className={styles.stepPosition} aria-live="polite" aria-atomic="true">
              {activeIndex + 1} / {block.steps.length}
            </span>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={() => setActiveIndex((i) => Math.min(block.steps.length - 1, i + 1))}
              disabled={isLast}
              aria-label="Next step"
            >
              Next →
            </button>
          </div>
        </div>
      ) : null}

      {block.interpretation ? (
        <p>
          <strong>Interpretation:</strong> {block.interpretation}
        </p>
      ) : null}
    </section>
  );
}

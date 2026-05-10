import type { WorkedExampleBlock } from "../../studybook/schema";
import { MathBlock } from "../../math/MathBlock";
import styles from "../lesson.module.css";

type WorkedExampleBlockViewProps = {
  block: WorkedExampleBlock;
};

export function WorkedExampleBlockView({ block }: WorkedExampleBlockViewProps) {
  return (
    <section className={`${styles.block} ${styles.workedExample}`} aria-labelledby={block.id}>
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
      <ol className={styles.stepList}>
        {block.steps.map((step) => (
          <li key={step.id} className={styles.step}>
            <h4>{step.label}</h4>
            <p>{step.explanation}</p>
            {step.latex ? <MathBlock latex={step.latex} /> : null}
          </li>
        ))}
      </ol>
      {block.interpretation ? (
        <p>
          <strong>Interpretation:</strong> {block.interpretation}
        </p>
      ) : null}
    </section>
  );
}

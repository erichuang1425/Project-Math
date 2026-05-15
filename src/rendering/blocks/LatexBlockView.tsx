import type { LatexBlock } from "../../studybook/schema";
import { MathBlock } from "../../math/MathBlock";
import styles from "../lesson.module.css";

type LatexBlockViewProps = {
  block: LatexBlock;
};

export function LatexBlockView({ block }: LatexBlockViewProps) {
  return (
    <section
      className={`${styles.block} ${styles.mathBlockShell}`}
      aria-label={block.caption ?? "Display math"}
    >
      <p className={styles.blockTypeLabel}>Equation</p>
      <MathBlock latex={block.latex} caption={block.caption} />
    </section>
  );
}

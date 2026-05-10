import type { LatexBlock } from "../../studybook/schema";
import { MathBlock } from "../../math/MathBlock";
import styles from "../lesson.module.css";

type LatexBlockViewProps = {
  block: LatexBlock;
};

export function LatexBlockView({ block }: LatexBlockViewProps) {
  return (
    <section className={styles.block} aria-label={block.caption ?? "Display math"}>
      <MathBlock latex={block.latex} caption={block.caption} />
    </section>
  );
}

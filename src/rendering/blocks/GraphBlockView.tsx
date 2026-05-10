import type { GraphBlock } from "../../studybook/schema";
import { GraphView } from "../../graphs/GraphView";
import styles from "../lesson.module.css";

type GraphBlockViewProps = {
  block: GraphBlock;
};

export function GraphBlockView({ block }: GraphBlockViewProps) {
  const descriptionId = `${block.id}-description`;

  return (
    <section className={`${styles.block} ${styles.graph}`} aria-labelledby={block.id}>
      <h3 id={block.id} className={styles.blockTitle}>
        {block.title}
      </h3>
      <p id={descriptionId}>{block.description}</p>
      <GraphView spec={block.spec} describedBy={descriptionId} />
    </section>
  );
}

import type { GraphBlock } from "../../content/schema";
import { GraphView } from "../../graphs/GraphView";
import styles from "../lesson.module.css";

type GraphBlockViewProps = {
  block: GraphBlock;
};

export function GraphBlockView({ block }: GraphBlockViewProps) {
  const descriptionId = `${block.id}-description`;
  const annotations = block.spec.annotations ?? [];

  return (
    <section className={`${styles.block} ${styles.graph}`} aria-labelledby={block.id}>
      <p className={styles.blockTypeLabel}>Graph</p>
      <h3 id={block.id} className={styles.blockTitle}>
        {block.title}
      </h3>
      <p id={descriptionId}>{block.description}</p>
      <GraphView spec={block.spec} label={block.title} describedBy={descriptionId} />
      {annotations.length > 0 ? (
        <div className={styles.graphDetails} aria-label="Graph details">
          <p>Graph details</p>
          <ul>
            {annotations.map((annotation) => (
              <li key={annotation.id}>
                <strong>{annotation.label}</strong>
                {annotation.text ? `: ${annotation.text}` : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

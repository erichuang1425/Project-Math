import type { IntuitionBlock } from "../../content/schema";
import { RichText } from "../RichText";
import styles from "../lesson.module.css";

type IntuitionBlockViewProps = {
  block: IntuitionBlock;
};

export function IntuitionBlockView({ block }: IntuitionBlockViewProps) {
  return (
    <section className={`${styles.block} ${styles.intuition}`} aria-labelledby={block.id}>
      <p className={styles.blockTypeLabel}>Action cue</p>
      <h3 id={block.id} className={styles.blockTitle}>
        {block.title}
      </h3>
      <p>
        <RichText segments={block.body} />
      </p>
      {block.takeaway ? (
        <p className={styles.takeaway}>
          <RichText segments={block.takeaway} />
        </p>
      ) : null}
    </section>
  );
}

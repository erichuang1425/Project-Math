import type { SummaryBlock } from "../../studybook/schema";
import { RichTextRows } from "../RichText";
import styles from "../lesson.module.css";

type SummaryBlockViewProps = {
  block: SummaryBlock;
};

export function SummaryBlockView({ block }: SummaryBlockViewProps) {
  return (
    <section className={`${styles.block} ${styles.summary}`} aria-labelledby={block.id}>
      <p className={styles.blockTypeLabel}>Summary</p>
      <h3 id={block.id} className={styles.blockTitle}>
        Summary
      </h3>
      <RichTextRows rows={block.items} className={styles.summaryList} />
    </section>
  );
}

import type { ConceptBlock } from "../../content/schema";
import { RichText, RichTextRows } from "../RichText";
import styles from "../lesson.module.css";

type ConceptBlockViewProps = {
  block: ConceptBlock;
};

export function ConceptBlockView({ block }: ConceptBlockViewProps) {
  return (
    <section className={`${styles.block} ${styles.concept}`} aria-labelledby={block.id}>
      <p className={styles.blockTypeLabel}>Concept</p>
      <h3 id={block.id} className={styles.blockTitle}>
        {block.title}
      </h3>
      <p>
        <RichText segments={block.body} />
      </p>
      {block.keyIdeas ? <RichTextRows rows={block.keyIdeas} /> : null}
    </section>
  );
}

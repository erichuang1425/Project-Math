import type { TitleBlock } from "../../content/schema";
import { RichTextRows } from "../RichText";
import styles from "../lesson.module.css";

type TitleBlockViewProps = {
  block: TitleBlock;
};

export function TitleBlockView({ block }: TitleBlockViewProps) {
  return (
    <section className={`${styles.block} ${styles.titleBlock}`} aria-labelledby={block.id}>
      <p className={styles.blockTypeLabel}>Lesson opening</p>
      {block.kicker ? <p className={styles.kicker}>{block.kicker}</p> : null}
      <h3 id={block.id}>{block.title}</h3>
      {block.subtitle ? <p>{block.subtitle}</p> : null}
      {block.objectives ? (
        <RichTextRows rows={block.objectives} className={styles.richList} />
      ) : null}
    </section>
  );
}

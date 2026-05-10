import type { CommonMistakeBlock } from "../../studybook/schema";
import styles from "../lesson.module.css";

type CommonMistakeBlockViewProps = {
  block: CommonMistakeBlock;
};

export function CommonMistakeBlockView({ block }: CommonMistakeBlockViewProps) {
  return (
    <section className={`${styles.block} ${styles.mistake}`} aria-labelledby={block.id}>
      <h3 id={block.id} className={styles.blockTitle}>
        {block.title}
      </h3>
      <div className={styles.mistakeGrid}>
        <div>
          <strong>Misconception</strong>
          {block.misconception}
        </div>
        <div>
          <strong>Incorrect step</strong>
          {block.incorrectStep}
        </div>
        <div>
          <strong>Why it is wrong</strong>
          {block.whyWrong}
        </div>
        <div>
          <strong>Correction</strong>
          {block.correction}
        </div>
        {block.checkPrompt ? (
          <div>
            <strong>Check</strong>
            {block.checkPrompt}
          </div>
        ) : null}
      </div>
    </section>
  );
}

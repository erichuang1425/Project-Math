import { useState } from "react";
import { Eye, EyeOff, Flame } from "lucide-react";
import type { FillInBlock, FillInBlankSegment, FillInSegment } from "../../content/schema";
import { MathInline } from "../../math/MathInline";
import { Icon } from "../../design/primitives/Icon";
import { RichText } from "../RichText";
import styles from "../lesson.module.css";

type FillInBlockViewProps = {
  block: FillInBlock;
};

const WARMTH_LEVELS = [1, 2, 3, 4, 5] as const;

export function FillInBlockView({ block }: FillInBlockViewProps) {
  return (
    <section className={`${styles.block} ${styles.fillIn}`} aria-labelledby={block.id}>
      <p className={styles.blockTypeLabel}>Fill in</p>
      <h3 id={block.id} className={styles.blockTitle}>
        {block.title}
      </h3>
      {block.intro ? (
        <p className={styles.fillInIntro}>
          <RichText segments={block.intro} />
        </p>
      ) : null}
      <p className={styles.fillInPrompt}>
        {block.prompt.map((segment, index) => (
          <FillInSegmentView key={index} segment={segment} />
        ))}
      </p>
      {block.warmthPrompt ? <WarmthGauge prompt={block.warmthPrompt} /> : null}
    </section>
  );
}

function FillInSegmentView({ segment }: { segment: FillInSegment }) {
  if (segment.kind === "blank") {
    return <Blank segment={segment} />;
  }
  return <RichText segments={[segment]} />;
}

function Blank({ segment }: { segment: FillInBlankSegment }) {
  const [revealed, setRevealed] = useState(false);
  const answerText = segment.answer;
  const label = revealed
    ? `Hide answer: ${answerText}`
    : segment.hint
      ? `Reveal answer. Hint: ${segment.hint}`
      : "Reveal answer";

  return (
    <button
      type="button"
      className={`${styles.fillInBlank} ${revealed ? styles.fillInBlankRevealed : ""}`}
      data-revealed={revealed}
      aria-expanded={revealed}
      aria-label={label}
      onClick={() => setRevealed((current) => !current)}
    >
      <Icon source={revealed ? EyeOff : Eye} size={14} />
      {revealed ? (
        <span className={styles.fillInAnswer}>
          {segment.isLatex ? <MathInline latex={answerText} /> : answerText}
        </span>
      ) : (
        <span className={styles.fillInPlaceholder}>{segment.hint ? segment.hint : "fill in"}</span>
      )}
    </button>
  );
}

function WarmthGauge({ prompt }: { prompt: string }) {
  const [warmth, setWarmth] = useState(0);

  return (
    <div className={styles.warmthGauge} role="group" aria-label={prompt}>
      <p className={styles.warmthPrompt}>{prompt}</p>
      <div className={styles.warmthRow}>
        <div className={styles.warmthSquares}>
          {WARMTH_LEVELS.map((level) => {
            const filled = warmth >= level;
            return (
              <button
                key={level}
                type="button"
                className={`${styles.warmthSquare} ${filled ? styles.warmthSquareFilled : ""}`}
                aria-pressed={warmth === level}
                aria-label={`Set warmth to ${level} of 5`}
                onClick={() => setWarmth((current) => (current === level ? 0 : level))}
              >
                <Icon source={Flame} size={16} aria-hidden />
              </button>
            );
          })}
        </div>
        <span className={styles.warmthValue}>Warmth {warmth} of 5</span>
      </div>
    </div>
  );
}

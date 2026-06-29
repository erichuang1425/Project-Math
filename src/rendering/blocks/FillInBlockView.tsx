import { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { FillInBlock, FillInRun } from "../../content/schema";
import { Icon } from "../../design/primitives/Icon";
import { RichText } from "../RichText";
import styles from "../lesson.module.css";

type FillInBlockViewProps = {
  block: FillInBlock;
};

/**
 * Renders a Loom-style "read + fill" passage: prose to read, blanks to recall.
 * Each blank starts hidden so the learner retrieves it from memory, then reveals
 * the answer to self-check. Reveal state is per-render (active recall, not graded).
 */
export function FillInBlockView({ block }: FillInBlockViewProps) {
  const blankIds = useMemo(
    () =>
      block.runs
        .filter((run): run is Extract<FillInRun, { kind: "blank" }> => run.kind === "blank")
        .map((run) => run.id),
    [block.runs]
  );
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const revealedCount = blankIds.filter((id) => revealed[id]).length;
  const allRevealed = blankIds.length > 0 && revealedCount === blankIds.length;

  function toggleBlank(id: string) {
    setRevealed((current) => ({ ...current, [id]: !current[id] }));
  }

  function toggleAll() {
    const next = !allRevealed;
    setRevealed(Object.fromEntries(blankIds.map((id) => [id, next])));
  }

  return (
    <section className={`${styles.block} ${styles.fillIn}`} aria-labelledby={block.id}>
      <div className={styles.fillInHeader}>
        <div>
          <p className={styles.blockTypeLabel}>Read &amp; fill</p>
          <h3 id={block.id} className={styles.blockTitle}>
            {block.title}
          </h3>
        </div>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={toggleAll}
          aria-pressed={allRevealed}
        >
          <Icon source={allRevealed ? EyeOff : Eye} size={16} strokeWidth={2.25} />
          {allRevealed ? "Hide all" : "Reveal all"}
        </button>
      </div>

      {block.intro ? (
        <p className={styles.fillInIntro}>
          <RichText segments={block.intro} />
        </p>
      ) : null}

      <p className={styles.fillInBody}>
        {block.runs.map((run, index) => {
          if (run.kind === "text") {
            return <RichText key={index} segments={run.segments} />;
          }
          const isRevealed = Boolean(revealed[run.id]);
          return (
            <FillInBlank
              key={run.id}
              run={run}
              revealed={isRevealed}
              onToggle={() => toggleBlank(run.id)}
            />
          );
        })}
      </p>

      <p className={styles.fillInProgress} aria-live="polite">
        {revealedCount} of {blankIds.length} {blankIds.length === 1 ? "blank" : "blanks"} revealed
      </p>

      {block.source ? <p className={styles.fillInSource}>Source: {block.source}</p> : null}
    </section>
  );
}

type FillInBlankProps = {
  run: Extract<FillInRun, { kind: "blank" }>;
  revealed: boolean;
  onToggle: () => void;
};

function FillInBlank({ run, revealed, onToggle }: FillInBlankProps) {
  const className = [styles.fillInBlank, revealed ? styles.fillInBlankRevealed : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={className}
      data-testid={`fill-in-blank-${run.id}`}
      aria-expanded={revealed}
      aria-label={
        revealed ? "Answer revealed. Select to hide." : "Blank. Select to reveal the answer."
      }
      title={!revealed && run.hint ? run.hint : undefined}
      onClick={onToggle}
    >
      {revealed ? (
        <RichText segments={run.answer} />
      ) : (
        <span className={styles.fillInBlankPlaceholder} aria-hidden="true">
          {run.hint ? run.hint : "      "}
        </span>
      )}
    </button>
  );
}

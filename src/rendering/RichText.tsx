import { useRef, useState } from "react";
import type { RichTextSegment } from "../content/schema";
import { MathInline } from "../math/MathInline";
import { useGlossaryTerm } from "./GlossaryContext";
import { GlossaryPopover } from "./GlossaryPopover";
import styles from "./lesson.module.css";

type RichTextProps = {
  segments: RichTextSegment[];
};

export function RichText({ segments }: RichTextProps) {
  return (
    <>
      {segments.map((segment, index) => {
        switch (segment.kind) {
          case "text":
            return <span key={index}>{segment.value}</span>;
          case "inlineMath":
            return <MathInline key={index} latex={segment.latex} />;
          case "term":
            return <TermSegment key={index} termId={segment.termId} label={segment.label} />;
        }
      })}
    </>
  );
}

function TermSegment({ termId, label }: { termId: string; label: string }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const term = useGlossaryTerm(termId);

  if (!term) {
    return (
      <span className={styles.term} data-term-id={termId}>
        {label}
      </span>
    );
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.termButton}
        data-term-id={termId}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {label}
      </button>
      <GlossaryPopover
        term={term}
        open={open}
        onClose={() => setOpen(false)}
        triggerRef={triggerRef}
      />
    </>
  );
}

type RichTextRowsProps = {
  rows: RichTextSegment[][];
  className?: string;
};

export function RichTextRows({ rows, className }: RichTextRowsProps) {
  return (
    <ul className={className ?? styles.richList}>
      {rows.map((row, index) => (
        <li key={index}>
          <RichText segments={row} />
        </li>
      ))}
    </ul>
  );
}

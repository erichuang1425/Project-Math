import type { RichTextSegment } from "../studybook/schema";
import { MathInline } from "../math/MathInline";
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
            return (
              <span key={index} className={styles.term} data-term-id={segment.termId}>
                {segment.label}
              </span>
            );
        }
      })}
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

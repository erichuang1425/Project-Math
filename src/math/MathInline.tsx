import { renderLatexToHtml } from "./renderLatex";
import styles from "../rendering/lesson.module.css";

type MathInlineProps = {
  latex: string;
};

export function MathInline({ latex }: MathInlineProps) {
  const result = renderLatexToHtml(latex, false);

  if (!result.ok) {
    return (
      <span className={styles.mathFallback} aria-label="Invalid inline math">
        {latex}
      </span>
    );
  }

  return (
    <span
      className={styles.inlineMath}
      dangerouslySetInnerHTML={{ __html: result.html }}
    />
  );
}

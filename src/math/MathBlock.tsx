import { renderLatexToHtml } from "./renderLatex";
import styles from "../rendering/lesson.module.css";

type MathBlockProps = {
  latex: string;
  caption?: string;
};

export function MathBlock({ latex, caption }: MathBlockProps) {
  const result = renderLatexToHtml(latex, true);

  return (
    <figure className={styles.mathBlock}>
      {result.ok ? (
        <div className={styles.mathScroll} dangerouslySetInnerHTML={{ __html: result.html }} />
      ) : (
        <pre className={styles.mathFallback} aria-label="Invalid display math">
          {latex}
        </pre>
      )}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

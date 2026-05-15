import type { GlossaryTerm } from "../content/schema";
import { Dialog } from "../design/primitives";
import { MathBlock } from "../math/MathBlock";
import styles from "./lesson.module.css";

interface GlossaryPopoverProps {
  term: GlossaryTerm;
  open: boolean;
  onClose: () => void;
}

export function GlossaryPopover({ term, open, onClose }: GlossaryPopoverProps) {
  return (
    <Dialog open={open} title={term.term} onClose={onClose}>
      <p className={styles.glossaryDefinition}>{term.definition}</p>
      {term.latex ? <MathBlock latex={term.latex} /> : null}
      {term.aliases && term.aliases.length > 0 ? (
        <p className={styles.glossaryAliases}>
          Also called: {term.aliases.join(", ")}.
        </p>
      ) : null}
    </Dialog>
  );
}

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { X } from "lucide-react";
import type { GlossaryTerm } from "../content/schema";
import { MathBlock } from "../math/MathBlock";
import { computePopoverPosition } from "./popoverPosition";
import lessonStyles from "./lesson.module.css";
import styles from "./GlossaryPopover.module.css";

interface GlossaryPopoverProps {
  term: GlossaryTerm;
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}

export function GlossaryPopover({ term, open, onClose, triggerRef }: GlossaryPopoverProps) {
  if (!open) return null;
  return <GlossaryPopoverContent term={term} onClose={onClose} triggerRef={triggerRef} />;
}

interface GlossaryPopoverContentProps {
  term: GlossaryTerm;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}

function GlossaryPopoverContent({ term, onClose, triggerRef }: GlossaryPopoverContentProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const handleClose = useCallback(() => {
    onClose();
    triggerRef.current?.focus();
  }, [onClose, triggerRef]);

  useLayoutEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (!el.open) {
      if (typeof el.show === "function") {
        try {
          el.show();
        } catch {
          el.setAttribute("open", "");
        }
      } else {
        el.setAttribute("open", "");
      }
    }
    return () => {
      if (el.open) {
        if (typeof el.close === "function") {
          try {
            el.close();
          } catch {
            el.removeAttribute("open");
          }
        } else {
          el.removeAttribute("open");
        }
      }
    };
  }, []);

  useLayoutEffect(() => {
    const el = dialogRef.current;
    const trigger = triggerRef.current;
    if (!el || !trigger) return;

    const place = () => {
      const triggerRect = trigger.getBoundingClientRect();
      const popoverRect = el.getBoundingClientRect();
      const next = computePopoverPosition(
        { top: triggerRect.top, bottom: triggerRect.bottom, left: triggerRect.left },
        { width: popoverRect.width || 280, height: popoverRect.height || 120 },
        { width: window.innerWidth, height: window.innerHeight }
      );
      setCoords({ top: next.top, left: next.left });
    };

    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [triggerRef]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handleCancel = (event: Event) => {
      event.preventDefault();
      handleClose();
    };
    el.addEventListener("cancel", handleCancel);
    return () => el.removeEventListener("cancel", handleCancel);
  }, [handleClose]);

  useEffect(() => {
    const handlePointer = (event: MouseEvent) => {
      const dialog = dialogRef.current;
      const trigger = triggerRef.current;
      const target = event.target as Node | null;
      if (!target) return;
      if (dialog?.contains(target)) return;
      if (trigger?.contains(target)) return;
      handleClose();
    };
    const handleScroll = () => handleClose();
    document.addEventListener("mousedown", handlePointer);
    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, [handleClose, triggerRef]);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  const inlineStyle = coords ? { top: `${coords.top}px`, left: `${coords.left}px` } : undefined;

  return (
    <dialog
      ref={dialogRef}
      className={styles.popover}
      aria-label={`Definition of ${term.term}`}
      tabIndex={-1}
      style={inlineStyle}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>{term.term}</h2>
        <button
          type="button"
          className={styles.closeButton}
          aria-label="Close definition"
          onClick={handleClose}
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
      <div className={styles.body}>
        <p className={lessonStyles.glossaryDefinition}>{term.definition}</p>
        {term.latex ? <MathBlock latex={term.latex} /> : null}
        {term.aliases && term.aliases.length > 0 ? (
          <p className={lessonStyles.glossaryAliases}>Also called: {term.aliases.join(", ")}.</p>
        ) : null}
      </div>
    </dialog>
  );
}

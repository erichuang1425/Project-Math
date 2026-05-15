import type { ReactNode } from "react";
import { BookOpen, HelpCircle, Sun, Moon } from "lucide-react";
import type { DisplayMode } from "../displayMode";
import styles from "./Shell.module.css";

export interface ShellProps {
  mode: DisplayMode;
  onToggleMode: () => void;
  onOpenShortcuts: () => void;
  onGoHome: () => void;
  children: ReactNode;
}

export function Shell({
  mode,
  onToggleMode,
  onOpenShortcuts,
  onGoHome,
  children
}: ShellProps) {
  return (
    <div className={styles.shell}>
      <a href="#main" className={styles.skipLink}>
        Skip to main content
      </a>
      <header className={styles.topBar} role="banner">
        <button
          type="button"
          className={styles.brand}
          onClick={onGoHome}
          aria-label="Go to courses"
        >
          <span className={styles.brandMark} aria-hidden="true">
            π
          </span>
          <span className={styles.brandName}>
            <strong>Project Math</strong>
            <span className={styles.brandSub}>your offline math studio</span>
          </span>
        </button>
        <div className={styles.topBarActions}>
          <button
            type="button"
            className={styles.modeToggle}
            onClick={onToggleMode}
            aria-pressed={mode === "calm"}
            aria-label={mode === "calm" ? "Switch to polished mode" : "Switch to calm mode"}
          >
            {mode === "calm" ? <Moon size={14} aria-hidden="true" /> : <Sun size={14} aria-hidden="true" />}
            {mode === "calm" ? "Calm mode" : "Polished mode"}
          </button>
          <button
            type="button"
            className={styles.modeToggle}
            onClick={onOpenShortcuts}
            aria-label="Open keyboard shortcuts"
          >
            <HelpCircle size={14} aria-hidden="true" />
            Shortcuts
          </button>
          <span className={styles.mode} aria-hidden="true">
            <BookOpen size={14} />
          </span>
        </div>
      </header>
      <main id="main" className={styles.body} tabIndex={-1}>
        {children}
      </main>
      <footer className={styles.footer}>Project Math · local-first · offline ready</footer>
    </div>
  );
}

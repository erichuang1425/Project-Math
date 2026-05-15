import { Dialog } from "../../design/primitives";

export interface ShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS: Array<{ keys: string; description: string }> = [
  { keys: "?", description: "Open this shortcuts dialog" },
  { keys: "g h", description: "Go to courses dashboard" },
  { keys: "Esc", description: "Close any open dialog" },
  { keys: "Tab", description: "Move through navigation and content" },
  { keys: "Enter / Space", description: "Activate the focused button or link" }
];

export function ShortcutsDialog({ open, onClose }: ShortcutsDialogProps) {
  return (
    <Dialog open={open} title="Keyboard shortcuts" onClose={onClose}>
      <ul
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          listStyle: "none",
          padding: 0,
          margin: 0
        }}
      >
        {SHORTCUTS.map((shortcut) => (
          <li key={shortcut.keys} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <kbd
              style={{
                background: "var(--pm-color-surface-sunken)",
                border: "1px solid var(--pm-color-panel-border)",
                borderRadius: "0.4rem",
                padding: "0.2rem 0.6rem",
                fontFamily: "var(--pm-font-mono)",
                fontSize: "0.85rem",
                minWidth: "5rem",
                textAlign: "center"
              }}
            >
              {shortcut.keys}
            </kbd>
            <span>{shortcut.description}</span>
          </li>
        ))}
      </ul>
    </Dialog>
  );
}

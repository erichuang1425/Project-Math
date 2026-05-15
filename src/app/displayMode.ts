export type DisplayMode = "polished" | "calm";

const STORAGE_KEY = "project-math:display-mode";

export function getInitialDisplayMode(
  storage: Storage | undefined = safeLocalStorage()
): DisplayMode {
  if (!storage) return "polished";
  try {
    const stored = storage.getItem(STORAGE_KEY);
    if (stored === "polished" || stored === "calm") return stored;
  } catch {
    /* ignore */
  }
  return "polished";
}

export function applyDisplayMode(mode: DisplayMode) {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-mode", mode);
  }
}

export function persistDisplayMode(
  mode: DisplayMode,
  storage: Storage | undefined = safeLocalStorage()
) {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}

export function toggleDisplayMode(current: DisplayMode): DisplayMode {
  return current === "polished" ? "calm" : "polished";
}

function safeLocalStorage(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

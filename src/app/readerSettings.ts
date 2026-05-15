export type ReaderFont = "sans" | "serif";
export type ReaderTextSize = "standard" | "large" | "extra-large";
export type ReaderLineSpacing = "standard" | "comfortable" | "wide";

export type ReaderSettings = {
  font: ReaderFont;
  textSize: ReaderTextSize;
  lineSpacing: ReaderLineSpacing;
  lowGlare: boolean;
};

export type ReaderStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

export const readerSettingsStorageKey = "project-math:reader-settings:v1";

export const readerFontOptions: Array<{ value: ReaderFont; label: string }> = [
  { value: "sans", label: "System sans" },
  { value: "serif", label: "System serif" }
];

export const readerTextSizeOptions: Array<{
  value: ReaderTextSize;
  label: string;
}> = [
  { value: "standard", label: "Standard text" },
  { value: "large", label: "Large text" },
  { value: "extra-large", label: "Extra large text" }
];

export const readerLineSpacingOptions: Array<{
  value: ReaderLineSpacing;
  label: string;
}> = [
  { value: "standard", label: "Standard line spacing" },
  { value: "comfortable", label: "Comfortable line spacing" },
  { value: "wide", label: "Wide line spacing" }
];

export const defaultReaderSettings: ReaderSettings = {
  font: "sans",
  textSize: "standard",
  lineSpacing: "standard",
  lowGlare: false
};

export function normalizeReaderSettings(input: unknown): ReaderSettings {
  if (!isRecord(input)) {
    return defaultReaderSettings;
  }

  return {
    font: isReaderFont(input.font) ? input.font : defaultReaderSettings.font,
    textSize: isReaderTextSize(input.textSize)
      ? input.textSize
      : defaultReaderSettings.textSize,
    lineSpacing: isReaderLineSpacing(input.lineSpacing)
      ? input.lineSpacing
      : defaultReaderSettings.lineSpacing,
    lowGlare:
      typeof input.lowGlare === "boolean"
        ? input.lowGlare
        : defaultReaderSettings.lowGlare
  };
}

export function loadReaderSettings(
  storage: ReaderStorage | undefined
): ReaderSettings {
  if (!storage) {
    return defaultReaderSettings;
  }

  try {
    const raw = storage.getItem(readerSettingsStorageKey);
    return raw ? normalizeReaderSettings(JSON.parse(raw)) : defaultReaderSettings;
  } catch {
    return defaultReaderSettings;
  }
}

export function saveReaderSettings(
  settings: ReaderSettings,
  storage: ReaderStorage | undefined
) {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(readerSettingsStorageKey, JSON.stringify(settings));
  } catch {
    // Reader controls remain usable for the current session if storage is blocked.
  }
}

export function createReaderSettingsStyle(
  settings: ReaderSettings
): Record<string, string> {
  const textSize =
    settings.textSize === "extra-large"
      ? "1.2rem"
      : settings.textSize === "large"
        ? "1.1rem"
        : "1rem";
  const lineHeight =
    settings.lineSpacing === "wide"
      ? "2"
      : settings.lineSpacing === "comfortable"
        ? "1.8"
        : "1.65";
  const blockGap =
    settings.lineSpacing === "wide"
      ? "30px"
      : settings.lineSpacing === "comfortable"
        ? "24px"
        : "18px";
  const sectionGap =
    settings.lineSpacing === "wide"
      ? "46px"
      : settings.lineSpacing === "comfortable"
        ? "38px"
        : "30px";
  const fontFamily =
    settings.font === "serif"
      ? 'Georgia, Cambria, "Times New Roman", Times, serif'
      : 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

  return {
    "--reader-font-family": fontFamily,
    "--reader-control-font-family": fontFamily,
    "--reader-font-size": textSize,
    "--reader-line-height": lineHeight,
    "--reader-letter-spacing": "0",
    "--reader-block-gap": blockGap,
    "--reader-section-gap": sectionGap,
    "--reader-pane-bg": settings.lowGlare ? "#efede3" : "#f6f7f3",
    "--reader-surface": settings.lowGlare ? "#f8f4ea" : "#ffffff",
    "--reader-soft-surface": settings.lowGlare ? "#f3efe4" : "#fbfcf8",
    "--reader-subtle-surface": settings.lowGlare ? "#ebe6d8" : "#f1f4ec",
    "--reader-text": settings.lowGlare ? "#24231d" : "#20231f",
    "--reader-muted-text": settings.lowGlare ? "#5c594d" : "#586057",
    "--reader-border": settings.lowGlare ? "#d7d0bd" : "#d9ded3",
    "--reader-strong-border": settings.lowGlare ? "#bfb59e" : "#cbd3c4",
    "--reader-accent": settings.lowGlare ? "#315f64" : "#2f5d62",
    "--reader-accent-text": settings.lowGlare ? "#284c50" : "#244e52",
    "--reader-focus-ring": settings.lowGlare
      ? "rgba(49, 95, 100, 0.3)"
      : "rgba(47, 93, 98, 0.22)",
    "--reader-selected-surface": settings.lowGlare ? "#e3ece9" : "#eef7f5",
    "--reader-warning": settings.lowGlare ? "#7a6728" : "#8a6f1e",
    "--reader-warning-text": settings.lowGlare ? "#4f4117" : "#40350d",
    "--reader-warning-surface": settings.lowGlare ? "#ede4cb" : "#fbfaf1",
    "--reader-correct": settings.lowGlare ? "#506739" : "#506d3b",
    "--reader-correct-surface": settings.lowGlare ? "#e7eddc" : "#f4f9ee",
    "--reader-incorrect": settings.lowGlare ? "#8b392f" : "#9b3a2f",
    "--reader-incorrect-text": settings.lowGlare ? "#713128" : "#7e2f27",
    "--reader-incorrect-surface": settings.lowGlare ? "#f3ded8" : "#fff8f6",
    "--reader-disabled-border": settings.lowGlare ? "#d1c8b5" : "#adb7a9",
    "--reader-disabled-surface": settings.lowGlare ? "#ddd8ca" : "#d9ded3",
    "--reader-disabled-text": settings.lowGlare ? "#625f54" : "#596157"
  };
}

export function getReaderSettingsSummary(settings: ReaderSettings): string {
  return [
    optionLabel(readerFontOptions, settings.font),
    optionLabel(readerTextSizeOptions, settings.textSize),
    optionLabel(readerLineSpacingOptions, settings.lineSpacing),
    settings.lowGlare ? "low-glare on" : "low-glare off"
  ].join(", ");
}

function isReaderFont(value: unknown): value is ReaderFont {
  return value === "sans" || value === "serif";
}

function isReaderTextSize(value: unknown): value is ReaderTextSize {
  return value === "standard" || value === "large" || value === "extra-large";
}

function isReaderLineSpacing(value: unknown): value is ReaderLineSpacing {
  return value === "standard" || value === "comfortable" || value === "wide";
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function optionLabel<TValue extends string>(
  options: Array<{ value: TValue; label: string }>,
  value: TValue
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

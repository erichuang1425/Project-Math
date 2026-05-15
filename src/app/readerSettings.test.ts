import { describe, expect, it } from "vitest";
import {
  createReaderSettingsStyle,
  defaultReaderSettings,
  loadReaderSettings,
  readerSettingsStorageKey,
  saveReaderSettings,
  type ReaderStorage
} from "./readerSettings";

function createMemoryStorage(initialValue?: string): ReaderStorage & {
  values: Map<string, string>;
} {
  const values = new Map<string, string>();
  if (initialValue !== undefined) {
    values.set(readerSettingsStorageKey, initialValue);
  }

  return {
    values,
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    }
  };
}

describe("reader settings", () => {
  it("uses calm defaults when there is no browser storage", () => {
    expect(loadReaderSettings(undefined)).toEqual(defaultReaderSettings);
  });

  it("recovers defaults from invalid stored settings", () => {
    const storage = createMemoryStorage("{not-json");

    expect(loadReaderSettings(storage)).toEqual(defaultReaderSettings);
  });

  it("loads only supported reader settings values", () => {
    const storage = createMemoryStorage(
      JSON.stringify({
        font: "serif",
        textSize: "large",
        lineSpacing: "comfortable",
        lowGlare: true,
        ignored: "value"
      })
    );

    expect(loadReaderSettings(storage)).toEqual({
      font: "serif",
      textSize: "large",
      lineSpacing: "comfortable",
      lowGlare: true
    });
  });

  it("persists reader settings without changing learner state storage", () => {
    const storage = createMemoryStorage();

    saveReaderSettings(
      {
        font: "serif",
        textSize: "large",
        lineSpacing: "comfortable",
        lowGlare: true
      },
      storage
    );

    expect(storage.values.get(readerSettingsStorageKey)).toBe(
      JSON.stringify({
        font: "serif",
        textSize: "large",
        lineSpacing: "comfortable",
        lowGlare: true
      })
    );
  });

  it("maps reader settings to scoped CSS variables", () => {
    const style = createReaderSettingsStyle({
      font: "serif",
      textSize: "extra-large",
      lineSpacing: "wide",
      lowGlare: true
    });

    expect(style["--reader-font-family"]).toContain("Georgia");
    expect(style["--reader-control-font-family"]).toContain("Georgia");
    expect(style["--reader-font-size"]).toBe("1.2rem");
    expect(style["--reader-line-height"]).toBe("2");
    expect(style["--reader-letter-spacing"]).toBe("0");
    expect(style["--reader-pane-bg"]).toBe("#efede3");
    expect(style["--reader-focus-ring"]).toBe("rgba(49, 95, 100, 0.3)");
    expect(style["--reader-warning"]).toBe("#7a6728");
    expect(style["--reader-correct"]).toBe("#506739");
    expect(style["--reader-incorrect"]).toBe("#8b392f");
    expect(style["--reader-selected-surface"]).toBe("#e3ece9");
  });
});

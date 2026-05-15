import type { ReaderSettings } from "./readerSettings";
import {
  readerFontOptions,
  readerLineSpacingOptions,
  readerTextSizeOptions,
  getReaderSettingsSummary
} from "./readerSettings";
import styles from "./App.module.css";

type ReaderControlsProps = {
  settings: ReaderSettings;
  onSettingsChange: (settings: ReaderSettings) => void;
};

export function ReaderControls({
  settings,
  onSettingsChange
}: ReaderControlsProps) {
  const settingsSummary = getReaderSettingsSummary(settings);

  return (
    <details className={styles.readerControls}>
      <summary className={styles.readerControlSummary}>
        <span id="reader-controls-heading">Reader controls</span>
        <span>Reader controls: {settingsSummary}</span>
      </summary>
      <div
        className={styles.readerControlPanel}
        role="group"
        aria-labelledby="reader-controls-heading"
      >
        <p id="reader-controls-description">
          These controls change this reading pane only.
        </p>
        <fieldset className={styles.readerControlFieldset}>
          <legend>Display choices</legend>
          <div className={styles.readerControlGrid}>
            <div className={styles.readerControlItem}>
              <label htmlFor="reader-font">
                Reader font
                <span id="reader-font-help">Uses built-in system fonts only.</span>
              </label>
              <select
                id="reader-font"
                aria-describedby="reader-font-help"
                value={settings.font}
                onChange={(event) =>
                  onSettingsChange({
                    ...settings,
                    font: event.currentTarget.value as ReaderSettings["font"]
                  })
                }
              >
                {readerFontOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.readerControlItem}>
              <label htmlFor="reader-text-size">
                Text size
                <span id="reader-text-size-help">
                  Changes lesson text without changing saved progress.
                </span>
              </label>
              <select
                id="reader-text-size"
                aria-describedby="reader-text-size-help"
                value={settings.textSize}
                onChange={(event) =>
                  onSettingsChange({
                    ...settings,
                    textSize: event.currentTarget
                      .value as ReaderSettings["textSize"]
                  })
                }
              >
                {readerTextSizeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.readerControlItem}>
              <label htmlFor="reader-line-spacing">
                Line spacing
                <span id="reader-line-spacing-help">
                  Adds more space between lesson lines and blocks.
                </span>
              </label>
              <select
                id="reader-line-spacing"
                aria-describedby="reader-line-spacing-help"
                value={settings.lineSpacing}
                onChange={(event) =>
                  onSettingsChange({
                    ...settings,
                    lineSpacing: event.currentTarget
                      .value as ReaderSettings["lineSpacing"]
                  })
                }
              >
                {readerLineSpacingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <label className={styles.readerToggle} htmlFor="reader-low-glare">
              <input
                id="reader-low-glare"
                type="checkbox"
                checked={settings.lowGlare}
                onChange={(event) =>
                  onSettingsChange({
                    ...settings,
                    lowGlare: event.currentTarget.checked
                  })
                }
              />
              <span>Low-glare mode</span>
              <span>Uses muted reading surfaces.</span>
            </label>
          </div>
        </fieldset>
      </div>
    </details>
  );
}

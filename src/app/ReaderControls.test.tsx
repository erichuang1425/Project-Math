import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ReaderControls } from "./ReaderControls";
import { defaultReaderSettings, type ReaderSettings } from "./readerSettings";

describe("ReaderControls", () => {
  it("renders collapsible accessible local reader controls", () => {
    const html = renderToStaticMarkup(
      <ReaderControls settings={defaultReaderSettings} onSettingsChange={() => {}} />
    );

    expect(html).toContain("<details");
    expect(html).toContain("<summary");
    expect(html).toContain("Reader controls");
    expect(html).toContain("Reader font");
    expect(html).toContain("System sans");
    expect(html).toContain("System serif");
    expect(html).toContain("Text size");
    expect(html).toContain("Line spacing");
    expect(html).toContain("Low-glare mode");
    expect(html).toContain("These controls change this reading pane only.");
    expect(html).toContain("Display choices");
    expect(html).toContain('id="reader-font"');
    expect(html).toContain('aria-describedby="reader-font-help"');
    expect(html).toContain("Uses built-in system fonts only.");
    expect(html).not.toContain("<section");
  });

  it("summarizes the active reader settings in the collapsed control", () => {
    const settings: ReaderSettings = {
      font: "serif",
      textSize: "large",
      lineSpacing: "comfortable",
      lowGlare: true
    };

    const html = renderToStaticMarkup(
      <ReaderControls settings={settings} onSettingsChange={() => {}} />
    );

    expect(html).toContain("System serif, Large text, Comfortable line spacing, low-glare on");
  });

  it("separates the heading id from the live status id", () => {
    const html = renderToStaticMarkup(
      <ReaderControls settings={defaultReaderSettings} onSettingsChange={() => {}} />
    );
    expect(html).toContain('id="reader-controls-heading"');
    expect(html).toContain('id="reader-controls-status"');
    expect(html).toContain('aria-live="polite"');
  });

  it("locks the disclosure trigger's accessible name to a stable label", () => {
    const html = renderToStaticMarkup(
      <ReaderControls settings={defaultReaderSettings} onSettingsChange={() => {}} />
    );

    expect(html).toMatch(/<summary[^>]*aria-label="Reader controls"/);
  });

  it("does not borrow the disclosure trigger's heading id as the panel label", () => {
    const html = renderToStaticMarkup(
      <ReaderControls settings={defaultReaderSettings} onSettingsChange={() => {}} />
    );

    expect(html).not.toContain('aria-labelledby="reader-controls-heading"');
  });

  it("describes the controls fieldset with the panel intro copy", () => {
    const html = renderToStaticMarkup(
      <ReaderControls settings={defaultReaderSettings} onSettingsChange={() => {}} />
    );

    expect(html).toMatch(/<fieldset[^>]*aria-describedby="reader-controls-description"/);
    expect(html).toContain('id="reader-controls-description"');
  });
});

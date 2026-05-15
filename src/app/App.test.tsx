import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  App,
  appShellNavigationReducer,
  getDashboardLessonProgressLabel
} from "./App";

describe("App shell", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.doUnmock("../studybook");
    vi.resetModules();
  });

  it("renders the course dashboard as the first screen", () => {
    stubBrowserStorage();

    const html = renderToStaticMarkup(<App />);

    expect(html).toContain("Skip to course dashboard");
    expect(html).toContain('id="dashboard-course"');
    expect(html).toContain("Project Math");
    expect(html).toContain("Study dashboard");
    expect(html).toContain("Local-first");
    expect(html).toContain("Offline-ready");
    expect(html).toContain("Validated studybook content");
    expect(html).toContain("Derivatives from First Principles");
    expect(html).toContain("0 of 3 lessons complete.");
    expect(html).toContain("Open selected lesson");
    expect(html).not.toContain("Reader controls");
    expect(html).not.toContain('id="lesson-content"');
  });

  it("shows lesson sequence state and in-app material labels on the dashboard", () => {
    stubBrowserStorage();

    const html = renderToStaticMarkup(<App />);

    expect(html).toContain("Lesson sequence");
    expect(html).toContain("Choose where to study next");
    expect(html).toContain("Selected, current, not started");
    expect(html).toContain("Not started");
    expect(html).toContain('aria-current="step"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("Selected lesson materials");
    expect(html).toContain("Objectives");
    expect(html).toContain("Sections");
    expect(html).toContain("Graphs");
    expect(html).toContain("Worked examples");
    expect(html).toContain("Common mistakes");
    expect(html).toContain("Practice");
    expect(html).toContain("Summary/export");
    expect(html).toContain("Lesson summary and markdown export actions.");
  });

  it("moves dashboard lesson selection into the reader navigation state", () => {
    const selected = appShellNavigationReducer(
      { view: "dashboard" },
      {
        type: "select-dashboard-lesson",
        lessonId: "derivative-at-a-point"
      }
    );

    expect(selected).toEqual({
      view: "dashboard",
      selectedLessonId: "derivative-at-a-point"
    });

    const reader = appShellNavigationReducer(selected, {
      type: "open-selected-lesson"
    });

    expect(reader).toEqual({
      view: "reader",
      selectedLessonId: "derivative-at-a-point"
    });

    const dashboard = appShellNavigationReducer(reader, {
      type: "return-dashboard"
    });

    expect(dashboard).toEqual({
      view: "dashboard",
      selectedLessonId: "derivative-at-a-point"
    });
  });

  it("renders the selected lesson reader with a dashboard return path", () => {
    stubBrowserStorage();

    const html = renderToStaticMarkup(
      <App
        initialNavigation={{
          view: "reader",
          selectedLessonId: "derivative-at-a-point"
        }}
      />
    );

    expect(html).toContain("Skip to lesson content");
    expect(html).toContain('id="lesson-content"');
    expect(html).toContain("Back to dashboard");
    expect(html).toContain("Reader view: Derivative at a Point.");
    expect(html).toContain("Reader controls");
    expect(html).toContain("Lesson path");
    expect(html).toContain("Derivative at a Point");
    expect(html).not.toContain("Study dashboard");
  });

  it("keeps explicit dashboard progress labels beyond color", () => {
    expect(getDashboardLessonProgressLabel(undefined, true, true)).toBe(
      "Selected, current, not started"
    );
    expect(getDashboardLessonProgressLabel(undefined, false, false)).toBe(
      "Not started"
    );
    expect(getDashboardLessonProgressLabel("in-progress", false, true)).toBe(
      "Current"
    );
    expect(getDashboardLessonProgressLabel("completed", true, false)).toBe(
      "Selected, completed"
    );
  });

  it("keeps validation errors in the app shell error view", async () => {
    vi.resetModules();
    vi.doMock("../studybook", () => ({
      validateStudybook: () => ({
        ok: false,
        errors: [
          {
            path: "lessons[0].sections[0].blocks[0]",
            message: "Unknown content block."
          }
        ]
      })
    }));
    stubBrowserStorage();

    const { App: MockedApp } = await import("./App");
    const html = renderToStaticMarkup(<MockedApp />);

    expect(html).toContain("Studybook validation failed");
    expect(html).toContain("The lesson did not pass deterministic validation.");
    expect(html).toContain("lessons[0].sections[0].blocks[0]");
    expect(html).toContain("Unknown content block.");
  });
});

function stubBrowserStorage() {
  vi.stubGlobal("window", {
    localStorage: {
      getItem: () => null,
      setItem: () => {}
    }
  });
}

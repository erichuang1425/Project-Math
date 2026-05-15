import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

function setHash(value: string) {
  if (typeof window !== "undefined") {
    window.location.hash = value;
  }
}

describe("App shell (v2)", () => {
  beforeEach(() => {
    setHash("");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    setHash("");
  });

  it("renders the courses dashboard at #/", () => {
    setHash("#/");
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain("Project Math");
    expect(html).toContain("Skip to main content");
    expect(html).toContain("What would you like to learn today?");
    expect(html).toContain("Calculus I");
    expect(html).toContain("Courses");
  });

  it("renders the course detail view at #/course/calculus-i", () => {
    setHash("#/course/calculus-i");
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain("Calculus I");
    expect(html).toContain("Derivatives from First Principles");
    expect(html).toContain("Derivative as a Limit");
    expect(html).toContain('aria-label="Breadcrumb"');
  });

  it("renders the lesson reader at #/course/calculus-i/lesson/derivative-as-a-limit", () => {
    setHash("#/course/calculus-i/lesson/derivative-as-a-limit");
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain("Lesson path");
    expect(html).toContain("Derivative as a Limit");
    expect(html).toContain("Step 1");
    expect(html).toContain("Calculus I");
  });

  it("shows a not-found message for unknown course ids", () => {
    setHash("#/course/missing");
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain("That page isn");
  });
});

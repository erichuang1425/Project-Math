import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { LatexBlockView } from "../LatexBlockView";

afterEach(() => cleanup());

describe("LatexBlockView", () => {
  it("uses the caption as the section aria-label when provided", () => {
    render(
      <LatexBlockView
        block={{
          type: "latex",
          id: "l",
          latex: "x^2",
          caption: "Square function",
          display: true
        }}
      />
    );
    expect(screen.getByLabelText("Square function")).toBeInTheDocument();
  });

  it("falls back to a default aria-label when no caption is provided", () => {
    render(
      <LatexBlockView
        block={{
          type: "latex",
          id: "l",
          latex: "x^2"
        }}
      />
    );
    expect(screen.getByLabelText("Display math")).toBeInTheDocument();
  });
});

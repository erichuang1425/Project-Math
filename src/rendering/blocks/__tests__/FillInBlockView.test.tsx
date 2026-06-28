import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { FillInBlockView } from "../FillInBlockView";
import type { FillInBlock } from "../../../content/schema";

afterEach(() => cleanup());

function makeBlock(overrides: Partial<FillInBlock> = {}): FillInBlock {
  return {
    type: "fillIn",
    id: "fill",
    title: "Work it out",
    prompt: [
      { kind: "text", value: "The slope is " },
      { kind: "blank", answer: "2x", hint: "derivative" }
    ],
    ...overrides
  };
}

describe("FillInBlockView", () => {
  it("hides the answer until the blank is revealed", () => {
    render(<FillInBlockView block={makeBlock()} />);

    const blank = screen.getByRole("button", { name: /reveal answer/i });
    expect(blank).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("2x")).not.toBeInTheDocument();
    // The hint shows on the unrevealed placeholder.
    expect(screen.getByText("derivative")).toBeInTheDocument();
  });

  it("reveals and hides the answer when toggled", () => {
    render(<FillInBlockView block={makeBlock()} />);

    const blank = screen.getByRole("button", { name: /reveal answer/i });
    fireEvent.click(blank);

    // The toggle's accessible name stays generic ("Hide answer") so a LaTeX
    // answer is not flattened into the button's name; the answer itself is a
    // sibling element that remains accessible.
    const revealed = screen.getByRole("button", { name: "Hide answer" });
    expect(revealed).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("2x")).toBeInTheDocument();

    fireEvent.click(revealed);
    expect(screen.getByRole("button", { name: /reveal answer/i })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });

  it("renders the intro framing when provided", () => {
    render(
      <FillInBlockView
        block={makeBlock({ intro: [{ kind: "text", value: "Read, then fill." }] })}
      />
    );

    expect(screen.getByText("Read, then fill.")).toBeInTheDocument();
  });

  it("renders a warmth gauge that tracks the selected level", () => {
    render(<FillInBlockView block={makeBlock({ warmthPrompt: "How warm is this?" })} />);

    expect(screen.getByRole("group", { name: "How warm is this?" })).toBeInTheDocument();
    expect(screen.getByText("Warmth 0 of 5")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Set warmth to 3 of 5" }));
    expect(screen.getByText("Warmth 3 of 5")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Set warmth to 3 of 5" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    // Only the selected level reports pressed — lower levels stay unpressed so a
    // screen reader announces a single chosen rating, not three.
    expect(screen.getByRole("button", { name: "Set warmth to 1 of 5" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(screen.getByRole("button", { name: "Set warmth to 2 of 5" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );

    // Clicking the active level clears it back to zero.
    fireEvent.click(screen.getByRole("button", { name: "Set warmth to 3 of 5" }));
    expect(screen.getByText("Warmth 0 of 5")).toBeInTheDocument();
  });

  it("omits the warmth gauge when no prompt is set", () => {
    render(<FillInBlockView block={makeBlock()} />);
    expect(screen.queryByText(/Warmth/)).not.toBeInTheDocument();
  });
});

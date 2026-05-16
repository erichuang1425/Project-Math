import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { CommonMistakeBlockView } from "../CommonMistakeBlockView";

afterEach(() => cleanup());

describe("CommonMistakeBlockView", () => {
  it("renders the four required quadrants plus the optional check prompt", () => {
    render(
      <CommonMistakeBlockView
        block={{
          type: "commonMistake",
          id: "m",
          title: "Forgetting the limit",
          misconception: "Treat h as zero too early.",
          incorrectStep: "Replace h with 0 in the numerator.",
          whyWrong: "0/0 is indeterminate.",
          correction: "Simplify before taking the limit.",
          checkPrompt: "What was your first move?"
        }}
      />
    );

    expect(screen.getByRole("heading", { name: "Forgetting the limit" })).toBeInTheDocument();
    expect(screen.getByText("Treat h as zero too early.")).toBeInTheDocument();
    expect(screen.getByText("Replace h with 0 in the numerator.")).toBeInTheDocument();
    expect(screen.getByText("0/0 is indeterminate.")).toBeInTheDocument();
    expect(screen.getByText("Simplify before taking the limit.")).toBeInTheDocument();
    expect(screen.getByText("Check")).toBeInTheDocument();
    expect(screen.getByText("What was your first move?")).toBeInTheDocument();
  });

  it("omits the check quadrant when no checkPrompt is provided", () => {
    render(
      <CommonMistakeBlockView
        block={{
          type: "commonMistake",
          id: "m",
          title: "Forgetting the limit",
          misconception: "M",
          incorrectStep: "I",
          whyWrong: "W",
          correction: "C"
        }}
      />
    );

    expect(screen.queryByText("Check")).not.toBeInTheDocument();
  });
});

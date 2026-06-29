import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FillInBlock } from "../../../content/schema";
import { FillInBlockView } from "../FillInBlockView";

afterEach(() => cleanup());

const block: FillInBlock = {
  type: "fillIn",
  id: "fill",
  title: "Recall the chain",
  intro: [{ kind: "text", value: "Fill from memory, then reveal." }],
  runs: [
    { kind: "text", segments: [{ kind: "text", value: "The average slope is the " }] },
    {
      kind: "blank",
      id: "blank-quotient",
      answer: [{ kind: "text", value: "difference quotient" }],
      hint: "ratio over h"
    },
    { kind: "text", segments: [{ kind: "text", value: ", valid while " }] },
    { kind: "blank", id: "blank-nonzero", answer: [{ kind: "text", value: "h is not 0" }] },
    { kind: "text", segments: [{ kind: "text", value: "." }] }
  ]
};

describe("FillInBlockView", () => {
  it("renders the title and intro, with blanks hidden by default", () => {
    render(<FillInBlockView block={block} />);

    expect(screen.getByText("Recall the chain")).toBeInTheDocument();
    expect(screen.getByText("Fill from memory, then reveal.")).toBeInTheDocument();
    expect(screen.getByText("0 of 2 blanks revealed")).toBeInTheDocument();

    const blank = screen.getByTestId("fill-in-blank-blank-quotient");
    expect(blank).toHaveAttribute("aria-expanded", "false");
    expect(blank).not.toHaveTextContent("difference quotient");
    // Hint is surfaced as the placeholder when hidden.
    expect(blank).toHaveTextContent("ratio over h");
  });

  it("reveals a single blank on click and updates the progress count", async () => {
    const user = userEvent.setup();
    render(<FillInBlockView block={block} />);

    const blank = screen.getByTestId("fill-in-blank-blank-quotient");
    await user.click(blank);

    expect(blank).toHaveAttribute("aria-expanded", "true");
    expect(blank).toHaveTextContent("difference quotient");
    expect(screen.getByText("1 of 2 blanks revealed")).toBeInTheDocument();

    // Clicking again hides it.
    await user.click(blank);
    expect(blank).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("0 of 2 blanks revealed")).toBeInTheDocument();
  });

  it("reveals and hides every blank via the Reveal all / Hide all control", async () => {
    const user = userEvent.setup();
    render(<FillInBlockView block={block} />);

    await user.click(screen.getByRole("button", { name: /reveal all/i }));
    expect(screen.getByText("2 of 2 blanks revealed")).toBeInTheDocument();
    expect(screen.getByTestId("fill-in-blank-blank-quotient")).toHaveTextContent(
      "difference quotient"
    );
    expect(screen.getByTestId("fill-in-blank-blank-nonzero")).toHaveTextContent("h is not 0");

    await user.click(screen.getByRole("button", { name: /hide all/i }));
    expect(screen.getByText("0 of 2 blanks revealed")).toBeInTheDocument();
  });

  it("renders a source line only when source is provided", () => {
    const { rerender } = render(<FillInBlockView block={block} />);
    expect(screen.queryByText(/^Source:/)).not.toBeInTheDocument();

    rerender(<FillInBlockView block={{ ...block, source: "Spivak, Calculus, ch. 9" }} />);
    expect(screen.getByText("Source: Spivak, Calculus, ch. 9")).toBeInTheDocument();
  });
});

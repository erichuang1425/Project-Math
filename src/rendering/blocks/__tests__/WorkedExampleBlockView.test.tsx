import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WorkedExampleBlockView } from "../WorkedExampleBlockView";

afterEach(() => cleanup());

const threeStepBlock = {
  type: "workedExample" as const,
  id: "w",
  title: "Square function derivative",
  goal: "Use first principles.",
  given: "f(x) = x^2.",
  interpretation: "Slope is 2x.",
  steps: [
    {
      id: "s1",
      label: "Write the definition",
      explanation: "Start with the limit definition.",
      latex: "\\frac{f(x+h)-f(x)}{h}"
    },
    {
      id: "s2",
      label: "Expand the numerator",
      explanation: "Substitute and simplify."
    },
    {
      id: "s3",
      label: "Take the limit",
      explanation: "Send h to zero."
    }
  ]
};

describe("WorkedExampleBlockView", () => {
  it("renders goal, given, interpretation, and the first step active by default", () => {
    render(<WorkedExampleBlockView block={threeStepBlock} />);

    expect(screen.getByText("Goal:")).toBeInTheDocument();
    expect(screen.getByText("Given:")).toBeInTheDocument();
    expect(screen.getByText("Interpretation:")).toBeInTheDocument();
    expect(screen.getByText(/Step 1 of 3/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous step" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next step" })).toBeEnabled();
  });

  it("omits the given and interpretation rows when not provided", () => {
    render(
      <WorkedExampleBlockView
        block={{
          type: "workedExample",
          id: "w2",
          title: "Without optionals",
          goal: "Cover required branches.",
          steps: [{ id: "only", label: "Only step", explanation: "Done." }]
        }}
      />
    );

    expect(screen.queryByText("Given:")).not.toBeInTheDocument();
    expect(screen.queryByText("Interpretation:")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous step" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next step" })).toBeDisabled();
  });

  it("advances and rewinds via Next / Previous, disabling at the ends", async () => {
    const user = userEvent.setup();
    render(<WorkedExampleBlockView block={threeStepBlock} />);

    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByText(/Step 2 of 3/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByText(/Step 3 of 3/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next step" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Previous step" }));
    expect(screen.getByText(/Step 2 of 3/)).toBeInTheDocument();
  });

  it("jumps to a step when its tab is clicked", async () => {
    const user = userEvent.setup();
    render(<WorkedExampleBlockView block={threeStepBlock} />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
    await user.click(tabs[2]);
    expect(screen.getByText(/Step 3 of 3/)).toBeInTheDocument();
  });

  it("renders an action-cue chip on the active step panel when actionCue is set", async () => {
    const user = userEvent.setup();
    const cueBlock = {
      ...threeStepBlock,
      steps: [
        { ...threeStepBlock.steps[0], actionCue: "Define" },
        { ...threeStepBlock.steps[1], actionCue: "Expand" },
        { ...threeStepBlock.steps[2], actionCue: "Conclude" }
      ]
    };
    render(<WorkedExampleBlockView block={cueBlock} />);

    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveTextContent("Action");
    expect(panel).toHaveTextContent("Define");
    expect(screen.getAllByText("Define")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByText(/Step 2 of 3/)).toBeInTheDocument();
    const nextPanel = screen.getByRole("tabpanel");
    expect(nextPanel).toHaveTextContent("Expand");
    expect(nextPanel).not.toHaveTextContent("Define");
  });

  it("renders cues on every step pill, including inactive ones", () => {
    const cueBlock = {
      ...threeStepBlock,
      steps: [
        { ...threeStepBlock.steps[0], actionCue: "Define" },
        { ...threeStepBlock.steps[1], actionCue: "Expand" },
        { ...threeStepBlock.steps[2], actionCue: "Conclude" }
      ]
    };
    render(<WorkedExampleBlockView block={cueBlock} />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveTextContent("Define");
    expect(tabs[1]).toHaveTextContent("Expand");
    expect(tabs[2]).toHaveTextContent("Conclude");
  });

  it("omits the action-cue chip when no actionCue is provided", () => {
    render(<WorkedExampleBlockView block={threeStepBlock} />);
    expect(screen.queryByText("Action")).not.toBeInTheDocument();
  });

  it("renders a final-answer band with latex and summary when finalAnswer is set", () => {
    render(
      <WorkedExampleBlockView
        block={{
          ...threeStepBlock,
          finalAnswer: {
            latex: "f'(x) = 2x",
            summary: "The slope of x^2 is 2x at every input."
          }
        }}
      />
    );
    expect(screen.getByLabelText("Final answer")).toBeInTheDocument();
    expect(screen.getByText("Final answer")).toBeInTheDocument();
    expect(screen.getByText(/The slope of x\^2 is 2x at every input\./)).toBeInTheDocument();
  });

  it("renders the final-answer band without summary when summary is omitted", () => {
    render(
      <WorkedExampleBlockView
        block={{
          ...threeStepBlock,
          finalAnswer: { latex: "f'(x) = 2x" }
        }}
      />
    );
    const band = screen.getByLabelText("Final answer");
    expect(band).toBeInTheDocument();
    expect(band.querySelectorAll("p")).toHaveLength(1);
  });

  it("omits the final-answer band when finalAnswer is not provided", () => {
    render(<WorkedExampleBlockView block={threeStepBlock} />);
    expect(screen.queryByLabelText("Final answer")).not.toBeInTheDocument();
  });
});

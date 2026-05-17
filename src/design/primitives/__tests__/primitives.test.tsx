import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Button } from "../Button";
import { Dialog } from "../Dialog";
import { Pill } from "../Pill";
import { ProgressRing } from "../ProgressRing";
import { ProgressBar } from "../ProgressBar";
import { Stat } from "../Stat";

afterEach(() => cleanup());

describe("Button", () => {
  it("renders as a button element with the given label", () => {
    render(<Button>Continue</Button>);
    const button = screen.getByRole("button", { name: "Continue" });
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe("BUTTON");
  });

  it("supports disabled state", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button", { name: "Disabled" })).toBeDisabled();
  });

  it("renders ghost and subtle variants without crashing", () => {
    render(
      <div>
        <Button variant="ghost">Ghost</Button>
        <Button variant="subtle">Subtle</Button>
      </div>
    );
    expect(screen.getByRole("button", { name: "Ghost" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Subtle" })).toBeInTheDocument();
  });
});

describe("Pill", () => {
  it("renders content with the requested tone", () => {
    render(<Pill tone="correct">Complete</Pill>);
    const pill = screen.getByText("Complete");
    expect(pill).toBeInTheDocument();
  });
});

describe("ProgressRing", () => {
  it("announces value over total via role=img", () => {
    render(<ProgressRing value={2} total={5} />);
    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "2 of 5 complete");
  });

  it("clamps over-target values", () => {
    render(<ProgressRing value={10} total={5} />);
    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "5 of 5 complete");
  });
});

describe("ProgressBar", () => {
  it("exposes a progressbar role with value/max", () => {
    render(<ProgressBar value={3} total={6} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "3");
    expect(bar).toHaveAttribute("aria-valuemax", "6");
  });
});

describe("Stat", () => {
  it("renders label and value", () => {
    render(<Stat label="Streak" value="4 days" />);
    expect(screen.getByText("Streak")).toBeInTheDocument();
    expect(screen.getByText("4 days")).toBeInTheDocument();
  });
});

describe("Dialog", () => {
  it("opens the underlying dialog element when open is true", () => {
    render(
      <Dialog open title="Settings" onClose={() => undefined}>
        <p>Body</p>
      </Dialog>
    );
    const dialog = document.querySelector("dialog");
    expect(dialog?.hasAttribute("open")).toBe(true);
    expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("invokes onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <Dialog open title="Settings" onClose={onClose}>
        <p>Body</p>
      </Dialog>
    );
    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("invokes onClose when the backdrop (dialog element) is clicked", () => {
    const onClose = vi.fn();
    render(
      <Dialog open title="Settings" onClose={onClose}>
        <p>Body</p>
      </Dialog>
    );
    const dialog = document.querySelector("dialog")!;
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("invokes onClose when the dialog cancel (ESC) event fires", () => {
    const onClose = vi.fn();
    render(
      <Dialog open title="Settings" onClose={onClose}>
        <p>Body</p>
      </Dialog>
    );
    const dialog = document.querySelector("dialog")!;
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

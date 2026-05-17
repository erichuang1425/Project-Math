import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { GlossaryTerm, RichTextSegment } from "../../content/schema";
import { GlossaryContext } from "../GlossaryContext";
import { RichText } from "../RichText";

afterEach(() => cleanup());

const baseTerm: GlossaryTerm = {
  id: "function",
  term: "function",
  definition: "A rule that maps each input to exactly one output."
};

const termWithExtras: GlossaryTerm = {
  id: "function-notation",
  term: "function notation",
  definition: "Writing functions using letters and parentheses.",
  aliases: ["f(x) notation"],
  latex: "f(x) = x^2"
};

function renderWithGlossary(segments: RichTextSegment[], glossary: GlossaryTerm[]) {
  return render(
    <GlossaryContext.Provider value={glossary}>
      <RichText segments={segments} />
    </GlossaryContext.Provider>
  );
}

function getTermButton(label = "function") {
  return screen.getByRole("button", { name: label });
}

function getDialog() {
  return document.querySelector("dialog");
}

describe("RichText term segments", () => {
  it("renders a term button with the dialog-popup attributes", () => {
    renderWithGlossary([{ kind: "term", termId: "function", label: "function" }], [baseTerm]);
    const button = getTermButton();
    expect(button).toHaveAttribute("aria-haspopup", "dialog");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("data-term-id", "function");
  });

  it("falls back to a plain span when the glossary has no matching term", () => {
    renderWithGlossary([{ kind: "term", termId: "function", label: "function" }], []);
    expect(screen.queryByRole("button", { name: "function" })).toBeNull();
    const fallback = document.querySelector('[data-term-id="function"]');
    expect(fallback?.tagName).toBe("SPAN");
    expect(fallback?.textContent).toBe("function");
  });

  it("renders text and inline math segments alongside term segments", () => {
    const { container } = renderWithGlossary(
      [
        { kind: "text", value: "A " },
        { kind: "term", termId: "function", label: "function" },
        { kind: "text", value: " maps inputs to outputs." },
        { kind: "inlineMath", latex: "f(x)" }
      ],
      [baseTerm]
    );
    expect(container.textContent).toContain("A ");
    expect(container.textContent).toContain(" maps inputs to outputs.");
    expect(screen.getByRole("button", { name: "function" })).toBeInTheDocument();
    expect(container.querySelector(".katex, [aria-label='Invalid inline math']")).not.toBeNull();
  });
});

describe("GlossaryPopover", () => {
  it("opens the dialog and exposes the definition when the trigger is clicked", () => {
    renderWithGlossary([{ kind: "term", termId: "function", label: "function" }], [baseTerm]);

    const button = getTermButton();
    fireEvent.click(button);

    expect(button).toHaveAttribute("aria-expanded", "true");
    const dialog = getDialog();
    expect(dialog).not.toBeNull();
    expect(dialog?.hasAttribute("open")).toBe(true);
    expect(screen.getByText(baseTerm.definition)).toBeInTheDocument();
  });

  it("renders aliases and LaTeX content when the term provides them", () => {
    renderWithGlossary(
      [{ kind: "term", termId: "function-notation", label: "function notation" }],
      [termWithExtras]
    );

    fireEvent.click(getTermButton("function notation"));

    expect(screen.getByText(/Also called: f\(x\) notation\./)).toBeInTheDocument();
    expect(document.querySelector("figure")).not.toBeNull();
  });

  it("closes when the dialog cancel event fires (ESC) and returns focus to the trigger", () => {
    renderWithGlossary([{ kind: "term", termId: "function", label: "function" }], [baseTerm]);

    const button = getTermButton();
    fireEvent.click(button);
    const dialog = getDialog();
    expect(dialog?.hasAttribute("open")).toBe(true);

    act(() => {
      const event = new Event("cancel", { cancelable: true });
      dialog?.dispatchEvent(event);
    });

    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(button);
  });

  it("closes and returns focus when the X button is clicked", () => {
    renderWithGlossary([{ kind: "term", termId: "function", label: "function" }], [baseTerm]);

    const button = getTermButton();
    fireEvent.click(button);
    fireEvent.click(screen.getByRole("button", { name: "Close definition" }));

    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(button);
  });

  it("closes when a mousedown lands outside the popover and trigger", () => {
    renderWithGlossary([{ kind: "term", termId: "function", label: "function" }], [baseTerm]);

    const button = getTermButton();
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    fireEvent.mouseDown(document.body);

    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(button);
  });

  it("closes on window scroll to avoid drifting from the anchor", () => {
    renderWithGlossary([{ kind: "term", termId: "function", label: "function" }], [baseTerm]);

    const button = getTermButton();
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("toggles closed when the trigger is clicked a second time", () => {
    renderWithGlossary([{ kind: "term", termId: "function", label: "function" }], [baseTerm]);

    const button = getTermButton();
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });
});

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { GlossaryTerm } from "../../content/schema";
import { GlossaryContext, useGlossary, useGlossaryTerm } from "../GlossaryContext";

afterEach(() => cleanup());

const glossary: GlossaryTerm[] = [
  { id: "function", term: "function", definition: "A rule from inputs to outputs." },
  { id: "domain", term: "domain", definition: "The set of allowed inputs." }
];

function GlossaryProbe() {
  const entries = useGlossary();
  return <span data-testid="probe">{entries.map((entry) => entry.id).join(",")}</span>;
}

function TermProbe({ termId }: { termId: string }) {
  const term = useGlossaryTerm(termId);
  return <span data-testid="term">{term ? term.definition : "missing"}</span>;
}

describe("GlossaryContext", () => {
  it("defaults to an empty list outside of a provider", () => {
    render(<GlossaryProbe />);
    expect(screen.getByTestId("probe").textContent).toBe("");
  });

  it("returns the matching term by id from useGlossaryTerm", () => {
    render(
      <GlossaryContext.Provider value={glossary}>
        <TermProbe termId="function" />
      </GlossaryContext.Provider>
    );
    expect(screen.getByTestId("term").textContent).toBe("A rule from inputs to outputs.");
  });

  it("returns undefined from useGlossaryTerm when no term matches", () => {
    render(
      <GlossaryContext.Provider value={glossary}>
        <TermProbe termId="not-a-real-term" />
      </GlossaryContext.Provider>
    );
    expect(screen.getByTestId("term").textContent).toBe("missing");
  });
});

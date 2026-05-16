import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ConceptBlockView } from "../ConceptBlockView";

afterEach(() => cleanup());

describe("ConceptBlockView", () => {
  it("renders body text and key ideas when provided", () => {
    render(
      <ConceptBlockView
        block={{
          type: "concept",
          id: "c",
          title: "Concept title",
          body: [{ kind: "text", value: "Body text." }],
          keyIdeas: [[{ kind: "text", value: "Idea one" }], [{ kind: "text", value: "Idea two" }]]
        }}
      />
    );

    expect(screen.getByRole("heading", { name: "Concept title" })).toBeInTheDocument();
    expect(screen.getByText("Body text.")).toBeInTheDocument();
    expect(screen.getByText("Idea one")).toBeInTheDocument();
    expect(screen.getByText("Idea two")).toBeInTheDocument();
  });

  it("omits the key-ideas list when no keyIdeas are provided", () => {
    render(
      <ConceptBlockView
        block={{
          type: "concept",
          id: "c",
          title: "Concept title",
          body: [{ kind: "text", value: "Only body." }]
        }}
      />
    );

    expect(screen.getByText("Only body.")).toBeInTheDocument();
    expect(screen.queryByText("Idea one")).not.toBeInTheDocument();
  });
});

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { SummaryBlockView } from "../SummaryBlockView";

afterEach(() => cleanup());

describe("SummaryBlockView", () => {
  it("renders the section heading and every summary row", () => {
    render(
      <SummaryBlockView
        block={{
          type: "summary",
          id: "s",
          items: [
            [{ kind: "text", value: "First takeaway." }],
            [{ kind: "text", value: "Second takeaway." }]
          ]
        }}
      />
    );

    expect(screen.getByRole("heading", { name: "Summary" })).toBeInTheDocument();
    expect(screen.getByText("First takeaway.")).toBeInTheDocument();
    expect(screen.getByText("Second takeaway.")).toBeInTheDocument();
  });
});

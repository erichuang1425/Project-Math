import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { IntuitionBlockView } from "../IntuitionBlockView";

afterEach(() => cleanup());

describe("IntuitionBlockView", () => {
  it("renders body and takeaway when both are provided", () => {
    render(
      <IntuitionBlockView
        block={{
          type: "intuition",
          id: "i",
          title: "Picture this",
          body: [{ kind: "text", value: "Imagine a tangent line." }],
          takeaway: [{ kind: "text", value: "Slope is local." }]
        }}
      />
    );

    expect(screen.getByRole("heading", { name: "Picture this" })).toBeInTheDocument();
    expect(screen.getByText("Imagine a tangent line.")).toBeInTheDocument();
    expect(screen.getByText("Slope is local.")).toBeInTheDocument();
  });

  it("omits the takeaway when not provided", () => {
    render(
      <IntuitionBlockView
        block={{
          type: "intuition",
          id: "i",
          title: "Just body",
          body: [{ kind: "text", value: "Body only." }]
        }}
      />
    );

    expect(screen.getByText("Body only.")).toBeInTheDocument();
    expect(screen.queryByText("Slope is local.")).not.toBeInTheDocument();
  });
});

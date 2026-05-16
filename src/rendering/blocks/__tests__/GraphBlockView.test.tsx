import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { GraphBlockView } from "../GraphBlockView";
import type { GraphBlock } from "../../../content/schema";

afterEach(() => cleanup());

const baseSpec: GraphBlock["spec"] = {
  xAxis: { label: "x", min: -2, max: 2 },
  yAxis: { label: "y", min: -1, max: 4 },
  series: [
    {
      kind: "function",
      id: "f",
      label: "f(x) = x^2",
      expression: "x^2",
      domain: [-2, 2],
      samples: [
        [-2, 4],
        [0, 0],
        [2, 4]
      ]
    }
  ]
};

describe("GraphBlockView", () => {
  it("renders annotations when present", () => {
    render(
      <GraphBlockView
        block={{
          type: "graph",
          id: "g",
          title: "Parabola",
          description: "y equals x squared.",
          spec: {
            ...baseSpec,
            annotations: [
              { id: "a1", label: "Vertex", text: "Point at origin." },
              { id: "a2", label: "Symmetry axis" }
            ]
          }
        }}
      />
    );

    expect(screen.getByLabelText("Graph details")).toBeInTheDocument();
    expect(screen.getByText("Vertex")).toBeInTheDocument();
    expect(screen.getByText(/Point at origin/)).toBeInTheDocument();
    expect(screen.getByText("Symmetry axis")).toBeInTheDocument();
  });

  it("omits the details panel when there are no annotations", () => {
    render(
      <GraphBlockView
        block={{
          type: "graph",
          id: "g",
          title: "Parabola",
          description: "y equals x squared.",
          spec: baseSpec
        }}
      />
    );

    expect(screen.queryByLabelText("Graph details")).not.toBeInTheDocument();
    expect(screen.getByText("y equals x squared.")).toBeInTheDocument();
  });
});

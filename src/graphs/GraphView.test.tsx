import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GraphView } from "./GraphView";
import type { GraphSpec } from "./graphSpec";

describe("GraphView", () => {
  it("renders sampled function series as deterministic SVG polylines", () => {
    const spec: GraphSpec = {
      xAxis: {
        label: "input x",
        min: 0,
        max: 2,
        ticks: [0, 1, 2]
      },
      yAxis: {
        label: "output f(x)",
        min: 0,
        max: 4,
        ticks: [0, 1, 4]
      },
      series: [
        {
          kind: "function",
          id: "curve",
          label: "Function",
          expression: "y = x^2",
          samples: [
            [0, 0],
            [1, 1],
            [2, 4]
          ]
        }
      ]
    };

    const html = renderToStaticMarkup(
      <GraphView spec={spec} describedBy="curve-description" />
    );

    expect(html).toContain("<polyline");
    expect(html).toContain('data-series-id="curve"');
    expect(html).toContain('points="48,312 320,246 592,48"');
    expect(html).toContain('clip-path="url(#curve-description-plot-area)"');
    expect(html).toContain("y = x^2");
  });
});

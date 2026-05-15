import type { GraphSpec, GraphSeries } from "./graphSpec";
import styles from "../rendering/lesson.module.css";

type GraphViewProps = {
  spec: GraphSpec;
  label: string;
  describedBy: string;
};

const width = 640;
const height = 360;
const padding = 48;

export function GraphView({ spec, label, describedBy }: GraphViewProps) {
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const xScale = (x: number) =>
    padding + ((x - spec.xAxis.min) / (spec.xAxis.max - spec.xAxis.min)) * chartWidth;
  const yScale = (y: number) =>
    height - padding - ((y - spec.yAxis.min) / (spec.yAxis.max - spec.yAxis.min)) * chartHeight;
  const plotClipId = `${describedBy}-plot-area`;

  return (
    <>
      <svg
        className={styles.graphCanvas}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        tabIndex={0}
        aria-label={`Graph: ${label}`}
        aria-describedby={describedBy}
      >
        <defs>
          <clipPath id={plotClipId}>
            <rect x={padding} y={padding} width={chartWidth} height={chartHeight} />
          </clipPath>
        </defs>

        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#596157"
          strokeWidth="2"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#596157"
          strokeWidth="2"
        />

        {(spec.xAxis.ticks ?? []).map((tick) => (
          <g key={`x-${tick}`}>
            <line
              x1={xScale(tick)}
              y1={height - padding}
              x2={xScale(tick)}
              y2={height - padding + 6}
              stroke="#596157"
            />
            <text x={xScale(tick)} y={height - padding + 22} textAnchor="middle">
              {tick}
            </text>
          </g>
        ))}

        {(spec.yAxis.ticks ?? []).map((tick) => (
          <g key={`y-${tick}`}>
            <line
              x1={padding - 6}
              y1={yScale(tick)}
              x2={padding}
              y2={yScale(tick)}
              stroke="#596157"
            />
            <text x={padding - 12} y={yScale(tick) + 4} textAnchor="end">
              {tick}
            </text>
          </g>
        ))}

        <text x={width / 2} y={height - 8} textAnchor="middle">
          {spec.xAxis.label}
        </text>
        <text
          x={16}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90 16 ${height / 2})`}
        >
          {spec.yAxis.label}
        </text>

        {spec.series.map((series) =>
          renderSeries(series, xScale, yScale, plotClipId)
        )}

        {(spec.annotations ?? []).map((annotation) =>
          annotation.point ? (
            <g key={annotation.id}>
              <circle
                cx={xScale(annotation.point[0])}
                cy={yScale(annotation.point[1])}
                r="5"
                fill="#9b3a2f"
              />
              <text
                x={xScale(annotation.point[0]) + 8}
                y={yScale(annotation.point[1]) - 8}
                fill="#20231f"
              >
                {annotation.label}
              </text>
            </g>
          ) : null
        )}
      </svg>
      <div className={styles.graphLegend} aria-label="Graph series">
        {spec.series.map((series) => (
          <span key={series.id}>
            {series.label}
            {series.kind === "function" ? `: ${series.expression}` : ""}
          </span>
        ))}
      </div>
    </>
  );
}

function renderSeries(
  series: GraphSeries,
  xScale: (x: number) => number,
  yScale: (y: number) => number,
  plotClipId: string
) {
  switch (series.kind) {
    case "line":
      return (
        <line
          key={series.id}
          data-series-id={series.id}
          x1={xScale(series.through[0][0])}
          y1={yScale(series.through[0][1])}
          x2={xScale(series.through[1][0])}
          y2={yScale(series.through[1][1])}
          stroke="#2f5d62"
          strokeWidth="3"
        />
      );
    case "points":
      return (
        <g key={series.id} data-series-id={series.id}>
          {series.points.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={xScale(x)} cy={yScale(y)} r="6" fill="#2f5d62" />
          ))}
        </g>
      );
    case "function": {
      const samplePoints = series.samples
        ?.map(([x, y]) => `${xScale(x)},${yScale(y)}`)
        .join(" ");

      return (
        <g key={series.id}>
          {samplePoints ? (
            <polyline
              data-series-id={series.id}
              points={samplePoints}
              fill="none"
              stroke="#8a6f1e"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              clipPath={`url(#${plotClipId})`}
            />
          ) : null}
          <text x={width - padding} y={padding - 14} textAnchor="end">
            {series.expression}
          </text>
        </g>
      );
    }
  }
}

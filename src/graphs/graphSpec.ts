export type AxisSpec = {
  label: string;
  min: number;
  max: number;
  ticks?: number[];
};

export type FunctionSeries = {
  kind: "function";
  id: string;
  label: string;
  expression: string;
  domain?: [number, number];
  samples?: Array<[number, number]>;
};

export type PointsSeries = {
  kind: "points";
  id: string;
  label: string;
  points: Array<[number, number]>;
};

export type LineSeries = {
  kind: "line";
  id: string;
  label: string;
  through: [[number, number], [number, number]];
};

export type GraphSeries = FunctionSeries | PointsSeries | LineSeries;

export type GraphAnnotation = {
  id: string;
  label: string;
  point?: [number, number];
  text?: string;
};

export type GraphSpec = {
  xAxis: AxisSpec;
  yAxis: AxisSpec;
  series: GraphSeries[];
  annotations?: GraphAnnotation[];
};

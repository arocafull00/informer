export type RiasPdfTextAlign = "left" | "center" | "right";

export type RiasPdfTextField = {
  type: "text";
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  align: RiasPdfTextAlign;
};

export type RiasPdfCheckField = {
  type: "check";
  x: number;
  y: number;
  radius: number;
};

export type RiasPdfPointField = {
  type: "point";
  x: number;
  y: number;
};

export type RiasPdfField =
  | RiasPdfTextField
  | RiasPdfCheckField
  | RiasPdfPointField;

export type RiasPdfFieldMap = {
  pageSize: { width: number; height: number };
  fields: Record<string, RiasPdfField>;
};

export type RiasChartScoreColumn = {
  x: number;
  yMinScore: number;
  yMaxScore: number;
  yAtMin: number;
  yAtMax: number;
};

export type RiasChartPdfFieldMap = {
  pageSize: { width: number; height: number };
  tScoreColumns: Record<string, RiasChartScoreColumn>;
  indexColumns: Record<string, RiasChartScoreColumn>;
  markRadius: number;
};

export function getRiasChartScoreY(
  score: number,
  column: RiasChartScoreColumn,
): number {
  const clamped = Math.min(
    column.yMaxScore,
    Math.max(column.yMinScore, score),
  );
  const ratio =
    (clamped - column.yMinScore) / (column.yMaxScore - column.yMinScore);
  return column.yAtMin + ratio * (column.yAtMax - column.yAtMin);
}

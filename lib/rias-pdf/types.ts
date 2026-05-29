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

export type RiasPdfField = RiasPdfTextField | RiasPdfCheckField;

export type RiasPdfFieldMap = {
  pageSize: { width: number; height: number };
  fields: Record<string, RiasPdfField>;
};

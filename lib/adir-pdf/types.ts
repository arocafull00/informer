export type AdirPdfTextAlign = "left" | "center" | "right";

export type AdirPdfTextField = {
  type: "text";
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  align: AdirPdfTextAlign;
};

export type AdirPdfCheckField = {
  type: "check";
  x: number;
  y: number;
  radius: number;
};

export type AdirPdfField = AdirPdfTextField | AdirPdfCheckField;

export type AdirPdfFieldMap = {
  pageSize: { width: number; height: number };
  fields: Record<string, AdirPdfField>;
};

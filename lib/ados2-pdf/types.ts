import type { Ados2ScoreSummary } from "@/lib/ados2-scoring";
import type { TestType } from "@/lib/types";

export type Ados2PdfTest = "ADOS2_ADULTO" | "ADOS2_NINO";

export type Ados2PdfForm = {
  test: Ados2PdfTest;
  summary: Ados2ScoreSummary;
};

export function isAdos2PdfTest(test: TestType): test is Ados2PdfTest {
  return test === "ADOS2_ADULTO" || test === "ADOS2_NINO";
}

export type Ados2PdfTextAlign = "left" | "center" | "right";

export type Ados2PdfTextField = {
  type: "text";
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  align: Ados2PdfTextAlign;
};

export type Ados2PdfPointField = {
  type: "point";
  x: number;
  y: number;
  fontSize?: number;
  align?: "left" | "center";
};

export type Ados2PdfField = Ados2PdfTextField | Ados2PdfPointField;

export type Ados2PdfFieldMap = {
  pageSize: { width: number; height: number };
  fields: Record<string, Ados2PdfField>;
};

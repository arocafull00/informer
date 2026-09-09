import type {
  CumanesIdentification,
  CumanesLaterality,
} from "@/lib/cumanes-types";

export type TestType = "ADIR" | "ADOS2_ADULTO" | "ADOS2_NINO" | "CUMANES";

export type Question = {
  id: string;
  test: TestType;
  sectionNumber: number;
  section: string;
  code: string;
  question: string;
  answers: Record<string, string>;
};

export type SavedReport = {
  id: string;
  createdAt: string;
  test: TestType;
  groupId?: string;
  answers: Record<string, number>;
  markdown: string;
  patientName?: string;
  patientSex?: string;
  cumanesIdentification?: CumanesIdentification;
  cumanesLaterality?: CumanesLaterality;
};

export type ReportGroup = {
  id: string;
  name: string;
  collapsed: boolean;
};

export type CreateReportInput = {
  test: TestType;
  patientName?: string;
  patientSex?: string;
  cumanesIdentification?: CumanesIdentification;
};

import type {
  CumanesIdentification,
  CumanesLaterality,
} from "@/lib/cumanes-types";
import type { CarasIdentification } from "@/lib/caras-r-types";
import type { StaiIdentification } from "@/lib/stai-types";
import type { RiasPatient, RiasResultsForm } from "@/lib/rias-scoring";

export type TestType =
  | "ADIR"
  | "ADOS2_ADULTO"
  | "ADOS2_NINO"
  | "CUMANES"
  | "CARAS_R"
  | "STAI"
  | "RIAS"
  | "DERS";

export type Question = {
  id: string;
  test: TestType;
  sectionNumber: number;
  section: string;
  code: string;
  question: string;
  answers: Record<string, string>;
  scoring?: "direct" | "reverse";
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
  carasIdentification?: CarasIdentification;
  staiIdentification?: StaiIdentification;
  riasForm?: RiasResultsForm;
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
  carasIdentification?: CarasIdentification;
  staiIdentification?: StaiIdentification;
  riasPatient?: RiasPatient;
};

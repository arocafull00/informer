export type Age = 7 | 8 | 9 | 10 | 11;

export type TestCode =
  | "CA"
  | "CIM"
  | "FF"
  | "FS"
  | "LX-c"
  | "LX-v"
  | "EA"
  | "VP"
  | "MVE"
  | "MVI"
  | "RI"
  | "FE-t"
  | "FE-e";

export type StandardScoreResult = {
  transformation: number;
  decatype: number;
};

export type StandardTestNorms = Record<string, StandardScoreResult>;

export type RangeScoreResult = {
  min: number;
  max: number | null;
  decatype: number;
};

export type RangeTestNorms = RangeScoreResult[];

export type AgeNorms = Partial<
  Record<TestCode, StandardTestNorms | RangeTestNorms>
>;

export type IdnScoreResult = {
  typicalScore: number;
  percentile: number | string;
};

export type IdnAgeNorms = Record<string, IdnScoreResult>;

export type CumanesIdnNorms = Record<Age, IdnAgeNorms>;

export type CumanesNorms = {
  tests: Record<
    TestCode,
    {
      name: string;
      type: "standard" | "range";
    }
  >;
  ages: Record<Age, AgeNorms>;
};

export type CumanesIdentification = {
  examinerName: string;
  center: string;
  course: string;
  evaluationDate: string;
  birthDate: string;
  age: Age | null;
};

export type CumanesLateralityArea = "manual" | "podalic" | "ocular";

export type CumanesLateralityValue =
  | "left-consistent"
  | "left-inconsistent"
  | "ambiguous"
  | "right-inconsistent"
  | "right-consistent";

export type CumanesLaterality = Record<
  CumanesLateralityArea,
  CumanesLateralityValue | ""
>;

export const EMPTY_CUMANES_IDENTIFICATION: CumanesIdentification = {
  examinerName: "",
  center: "",
  course: "",
  evaluationDate: "",
  birthDate: "",
  age: null,
};

export const EMPTY_CUMANES_LATERALITY: CumanesLaterality = {
  manual: "",
  podalic: "",
  ocular: "",
};

export const CUMANES_LATERALITY_AREAS: ReadonlyArray<{
  value: CumanesLateralityArea;
  label: string;
}> = [
  { value: "manual", label: "Manual" },
  { value: "podalic", label: "Podálica" },
  { value: "ocular", label: "Ocular" },
];

export const CUMANES_LATERALITY_OPTIONS: ReadonlyArray<{
  value: CumanesLateralityValue;
  label: string;
}> = [
  { value: "left-consistent", label: "Zurdo consistente" },
  { value: "left-inconsistent", label: "Zurdo inconsistente" },
  { value: "ambiguous", label: "Ambiguo" },
  { value: "right-inconsistent", label: "Diestro inconsistente" },
  { value: "right-consistent", label: "Diestro consistente" },
];

export const CUMANES_AGES: Age[] = [7, 8, 9, 10, 11];

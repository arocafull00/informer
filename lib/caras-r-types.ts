export type CarasAge =
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18;

export type CarasCourse =
  | "1_EPO"
  | "2_EPO"
  | "3_EPO"
  | "4_EPO"
  | "5_EPO"
  | "6_EPO"
  | "1_ESO"
  | "2_ESO"
  | "3_ESO"
  | "4_ESO"
  | "1_2_BACHILLERATO";

export type CarasScoreCode = "A" | "E" | "A_E" | "ICI";

export type CarasNormInterval = {
  min: number;
  max: number;
  percentile: number;
};

export type CarasCourseNorms = {
  ageMin: CarasAge;
  ageMax: CarasAge;
  A: CarasNormInterval[];
  E: CarasNormInterval[];
  A_E: CarasNormInterval[];
  ICI: CarasNormInterval[];
};

export type CarasNorms = {
  _sourceNotes: Array<{
    group: CarasCourse;
    field: CarasScoreCode;
    percentile: number;
    sourceValue: string;
    interpretedAs: string;
  }>;
} & Record<CarasCourse, CarasCourseNorms>;

export type CarasIdentification = {
  age: CarasAge | null;
  course: CarasCourse | "";
};

export const EMPTY_CARAS_IDENTIFICATION: CarasIdentification = {
  age: null,
  course: "",
};

export const CARAS_AGES: CarasAge[] = [
  6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
];

export const CARAS_COURSES: ReadonlyArray<{
  value: CarasCourse;
  label: string;
  ageLabel: string;
}> = [
  { value: "1_EPO", label: "1.º EPO", ageLabel: "6–7 años" },
  { value: "2_EPO", label: "2.º EPO", ageLabel: "7–8 años" },
  { value: "3_EPO", label: "3.º EPO", ageLabel: "8–9 años" },
  { value: "4_EPO", label: "4.º EPO", ageLabel: "9–10 años" },
  { value: "5_EPO", label: "5.º EPO", ageLabel: "10–11 años" },
  { value: "6_EPO", label: "6.º EPO", ageLabel: "11–12 años" },
  { value: "1_ESO", label: "1.º ESO", ageLabel: "12–13 años" },
  { value: "2_ESO", label: "2.º ESO", ageLabel: "13–14 años" },
  { value: "3_ESO", label: "3.º ESO", ageLabel: "14–15 años" },
  { value: "4_ESO", label: "4.º ESO", ageLabel: "15–16 años" },
  {
    value: "1_2_BACHILLERATO",
    label: "1.º–2.º Bachillerato",
    ageLabel: "16–18 años",
  },
];

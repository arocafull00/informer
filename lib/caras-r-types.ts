export type CarasAge = 6 | 7 | 8;

export type CarasCourse = "1_EPO" | "2_EPO";

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
  _notes: string[];
  courses: Record<CarasCourse, CarasCourseNorms>;
};

export type CarasIdentification = {
  age: CarasAge | null;
  course: CarasCourse | "";
};

export const EMPTY_CARAS_IDENTIFICATION: CarasIdentification = {
  age: null,
  course: "",
};

export const CARAS_AGES: CarasAge[] = [6, 7, 8];

export const CARAS_COURSES: ReadonlyArray<{
  value: CarasCourse;
  label: string;
  ageLabel: string;
}> = [
  { value: "1_EPO", label: "1.º EPO", ageLabel: "6–7 años" },
  { value: "2_EPO", label: "2.º EPO", ageLabel: "7–8 años" },
];

export type StaiAgeGroup = "adolescentes" | "adultos";

export type StaiSex = "varones" | "mujeres";

export type StaiScale = "estado" | "rasgo";

export type StaiIdentification = {
  ageGroup: StaiAgeGroup | "";
};

export const EMPTY_STAI_IDENTIFICATION: StaiIdentification = {
  ageGroup: "",
};

export const STAI_AGE_GROUP_OPTIONS: ReadonlyArray<{
  value: StaiAgeGroup;
  label: string;
}> = [
  { value: "adolescentes", label: "Adolescente" },
  { value: "adultos", label: "Adulto" },
];

export type StaiCentilRow = {
  centil: number;
  desde: number;
  hasta: number;
};

export type StaiNorms = Record<
  StaiAgeGroup,
  Record<StaiSex, Record<StaiScale, StaiCentilRow[]>>
>;

export const STAI_ESTADO_REVERSE_CODES = new Set([
  "1",
  "2",
  "5",
  "8",
  "10",
  "11",
  "15",
  "16",
  "19",
  "20",
]);

export const STAI_RASGO_REVERSE_CODES = new Set([
  "21",
  "26",
  "27",
  "30",
  "33",
  "36",
  "39",
]);

export function mapPatientSexToStaiSex(patientSex: string): StaiSex | null {
  if (patientSex === "varon") return "varones";
  if (patientSex === "mujer") return "mujeres";
  return null;
}

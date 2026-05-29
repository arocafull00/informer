export type RiasSubtestKey = "Ad" | "Ca" | "An" | "Fi" | "Mv" | "Mnv";

export type RiasIndexKey = "IV" | "INV" | "IG" | "IM";

export type RiasPatient = {
  name: string;
  evaluationDate: string;
  chronologicalAge: string;
};

export type RiasDirectScores = Record<RiasSubtestKey, number | null>;

export type RiasTScores = Record<RiasSubtestKey, number | null>;

export type RiasTSums = Record<RiasIndexKey, number | null>;

export type RiasIndices = Record<RiasIndexKey, number | null>;

export type RiasIntervals = Record<RiasIndexKey, string> & {
  confidenceLevel: string;
};

export type RiasPercentiles = Record<RiasIndexKey, string>;

export type RiasResultsForm = {
  patient: RiasPatient;
  directScores: RiasDirectScores;
  tScores: RiasTScores;
  tSums: RiasTSums;
  indices: RiasIndices;
  intervals: RiasIntervals;
  percentiles: RiasPercentiles;
};

export const RIAS_WIZARD_STEPS = [
  "Datos del paciente",
  "Puntuación directa",
  "Puntuaciones T",
  "Suma puntuaciones T",
  "Índices del RIAS",
  "Intervalos y percentiles",
] as const;

export const RIAS_SUBTEST_KEYS: RiasSubtestKey[] = [
  "Ad",
  "Ca",
  "An",
  "Fi",
  "Mv",
  "Mnv",
];

export const RIAS_INDEX_KEYS: RiasIndexKey[] = ["IV", "INV", "IG", "IM"];

export const RIAS_SUBTEST_LABELS: Record<RiasSubtestKey, string> = {
  Ad: "Adivinanzas (Ad)",
  Ca: "Categorías (Ca)",
  An: "Analogías verbales (An)",
  Fi: "Figuras incompletas (Fi)",
  Mv: "Memoria verbal (Mv)",
  Mnv: "Memoria no verbal (Mnv)",
};

export const RIAS_INDEX_LABELS: Record<RiasIndexKey, string> = {
  IV: "IV — Índice de inteligencia verbal",
  INV: "INV — Índice de inteligencia no verbal",
  IG: "IG — Índice de inteligencia general",
  IM: "IM — Índice de memoria",
};

export const RIAS_T_SCORE_SECTIONS: {
  title: string;
  keys: RiasSubtestKey[];
}[] = [
  { title: "Verbal", keys: ["Ad", "An"] },
  { title: "No verbal", keys: ["Ca", "Fi"] },
  { title: "Memoria", keys: ["Mv", "Mnv"] },
];

const EMPTY_DIRECT_SCORES = (): RiasDirectScores => ({
  Ad: null,
  Ca: null,
  An: null,
  Fi: null,
  Mv: null,
  Mnv: null,
});

const EMPTY_T_SCORES = (): RiasTScores => ({
  Ad: null,
  Ca: null,
  An: null,
  Fi: null,
  Mv: null,
  Mnv: null,
});

const EMPTY_T_SUMS = (): RiasTSums => ({
  IV: null,
  INV: null,
  IG: null,
  IM: null,
});

const EMPTY_INDICES = (): RiasIndices => ({
  IV: null,
  INV: null,
  IG: null,
  IM: null,
});

const EMPTY_INTERVALS = (): RiasIntervals => ({
  confidenceLevel: "",
  IV: "",
  INV: "",
  IG: "",
  IM: "",
});

const EMPTY_PERCENTILES = (): RiasPercentiles => ({
  IV: "",
  INV: "",
  IG: "",
  IM: "",
});

function sumWhenComplete(values: (number | null)[]): number | null {
  if (values.some((value) => value === null)) return null;
  return values.reduce<number>((acc, value) => acc + (value ?? 0), 0);
}

export function createDefaultRiasResultsForm(): RiasResultsForm {
  return {
    patient: {
      name: "",
      evaluationDate: "",
      chronologicalAge: "",
    },
    directScores: EMPTY_DIRECT_SCORES(),
    tScores: EMPTY_T_SCORES(),
    tSums: EMPTY_T_SUMS(),
    indices: EMPTY_INDICES(),
    intervals: EMPTY_INTERVALS(),
    percentiles: EMPTY_PERCENTILES(),
  };
}

export function computeRiasTSums(tScores: RiasTScores): RiasTSums {
  const IV = sumWhenComplete([tScores.Ad, tScores.An]);
  const INV = sumWhenComplete([tScores.Ca, tScores.Fi]);
  const IM = sumWhenComplete([tScores.Mv, tScores.Mnv]);
  const IG =
    IV !== null && INV !== null ? IV + INV : null;

  return { IV, INV, IG, IM };
}

export function parseRiasScoreInput(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) return null;
  return parsed;
}

function isNonEmpty(value: string): boolean {
  return value.trim() !== "";
}

function isDateComplete(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isRiasPatientComplete(patient: RiasPatient): boolean {
  if (!isNonEmpty(patient.name)) return false;
  if (!isDateComplete(patient.evaluationDate)) return false;
  if (!isNonEmpty(patient.chronologicalAge)) return false;
  return true;
}

export function isRiasDirectScoresComplete(
  directScores: RiasDirectScores,
): boolean {
  return RIAS_SUBTEST_KEYS.every((key) => directScores[key] !== null);
}

export function isRiasTScoresComplete(tScores: RiasTScores): boolean {
  return RIAS_SUBTEST_KEYS.every((key) => tScores[key] !== null);
}

export function isRiasTSumsComplete(tSums: RiasTSums): boolean {
  return RIAS_INDEX_KEYS.every((key) => tSums[key] !== null);
}

export function isRiasIndicesComplete(indices: RiasIndices): boolean {
  return RIAS_INDEX_KEYS.every((key) => indices[key] !== null);
}

export function isRiasIntervalsComplete(intervals: RiasIntervals): boolean {
  if (!isNonEmpty(intervals.confidenceLevel)) return false;
  return RIAS_INDEX_KEYS.every((key) => isNonEmpty(intervals[key]));
}

export function isRiasPercentilesComplete(
  percentiles: RiasPercentiles,
): boolean {
  return RIAS_INDEX_KEYS.every((key) => isNonEmpty(percentiles[key]));
}

export function isRiasResultsFormComplete(form: RiasResultsForm): boolean {
  if (!isRiasPatientComplete(form.patient)) return false;
  if (!isRiasDirectScoresComplete(form.directScores)) return false;
  if (!isRiasTScoresComplete(form.tScores)) return false;
  if (!isRiasTSumsComplete(form.tSums)) return false;
  if (!isRiasIndicesComplete(form.indices)) return false;
  if (!isRiasIntervalsComplete(form.intervals)) return false;
  if (!isRiasPercentilesComplete(form.percentiles)) return false;
  return true;
}

export function isRiasWizardStepComplete(
  step: number,
  form: RiasResultsForm,
): boolean {
  if (step === 0) return isRiasPatientComplete(form.patient);
  if (step === 1) return isRiasDirectScoresComplete(form.directScores);
  if (step === 2) return isRiasTScoresComplete(form.tScores);
  if (step === 3) return isRiasTSumsComplete(form.tSums);
  if (step === 4) return isRiasIndicesComplete(form.indices);
  if (step === 5) {
    if (!isRiasIntervalsComplete(form.intervals)) return false;
    if (!isRiasPercentilesComplete(form.percentiles)) return false;
    return true;
  }
  return false;
}

export function mergeRiasTSums(form: RiasResultsForm): RiasResultsForm {
  return {
    ...form,
    tSums: computeRiasTSums(form.tScores),
  };
}

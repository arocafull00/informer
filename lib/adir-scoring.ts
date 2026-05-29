export type AdirAlgorithm =
  | "conducta_actual_2_3"
  | "conducta_actual_4_9"
  | "conducta_actual_10_plus"
  | "diagnostico_2_3"
  | "diagnostico_4_plus";

export type AdirScoreKey =
  | "A1"
  | "A2"
  | "A3"
  | "A4"
  | "B1"
  | "B2Verbal"
  | "B3Verbal"
  | "B4"
  | "C1"
  | "C2"
  | "C3"
  | "C4";

export type AdirTotalKey =
  | "totalA"
  | "totalBVerbal"
  | "totalBNoVerbal"
  | "totalC"
  | "totalD";

export type AdirSubjectSex = "masculino" | "femenino" | "";

export type AdirSubjectSexOption = {
  value: Exclude<AdirSubjectSex, "">;
  label: string;
};

export const SEX_OPTIONS: AdirSubjectSexOption[] = [
  { value: "masculino", label: "Masculino" },
  { value: "femenino", label: "Femenino" },
];

export type AdirSubject = {
  nameOrId: string;
  birthDate: string;
  chronologicalAge: string;
  sex: AdirSubjectSex;
};

export type AdirInformant = {
  name: string;
  relationshipToSubject: string;
};

export type AdirScores = Record<AdirScoreKey, number | null>;

export type AdirTotals = Record<AdirTotalKey, number | null>;

export type AdirResultsForm = {
  subject: AdirSubject;
  informant: AdirInformant;
  algorithm: AdirAlgorithm;
  scores: AdirScores;
  totals: AdirTotals;
};

export type AdirAlgorithmGroup = "conducta_actual" | "diagnostico";

export type AdirAlgorithmOption = {
  value: AdirAlgorithm;
  group: AdirAlgorithmGroup;
  label: string;
};

export const ADIR_WIZARD_STEPS = [
  "Sujeto",
  "Informante",
  "Algoritmo",
  "Dominio A",
  "Dominio B",
  "Dominio C",
  "Totales",
] as const;

export const ADIR_DOMAIN_SCORE_STEP_OFFSET = 3;

export const ADIR_SCORE_KEYS: AdirScoreKey[] = [
  "A1",
  "A2",
  "A3",
  "A4",
  "B1",
  "B2Verbal",
  "B3Verbal",
  "B4",
  "C1",
  "C2",
  "C3",
  "C4",
];

export const ADIR_SCORE_SECTIONS: {
  title: string;
  keys: AdirScoreKey[];
}[] = [
  { title: "Dominio A", keys: ["A1", "A2", "A3", "A4"] },
  { title: "Dominio B (verbal)", keys: ["B1", "B2Verbal", "B3Verbal", "B4"] },
  { title: "Dominio C", keys: ["C1", "C2", "C3", "C4"] },
];

export const ALGORITHM_OPTIONS: AdirAlgorithmOption[] = [
  {
    value: "conducta_actual_2_3",
    group: "conducta_actual",
    label: "2 años, 0 meses a 3 años, 11 meses",
  },
  {
    value: "conducta_actual_4_9",
    group: "conducta_actual",
    label: "4 años, 0 meses a 9 años, 11 meses",
  },
  {
    value: "conducta_actual_10_plus",
    group: "conducta_actual",
    label: "10 años, 0 meses en adelante",
  },
  {
    value: "diagnostico_2_3",
    group: "diagnostico",
    label: "2 años, 0 meses a 3 años, 11 meses",
  },
  {
    value: "diagnostico_4_plus",
    group: "diagnostico",
    label: "4 años, 0 meses en adelante",
  },
];

const EMPTY_SCORES = (): AdirScores => ({
  A1: null,
  A2: null,
  A3: null,
  A4: null,
  B1: null,
  B2Verbal: null,
  B3Verbal: null,
  B4: null,
  C1: null,
  C2: null,
  C3: null,
  C4: null,
});

const EMPTY_TOTALS = (): AdirTotals => ({
  totalA: null,
  totalBVerbal: null,
  totalBNoVerbal: null,
  totalC: null,
  totalD: null,
});

function sumWhenComplete(values: (number | null)[]): number | null {
  if (values.some((value) => value === null)) return null;
  return values.reduce<number>((acc, value) => acc + (value ?? 0), 0);
}

export function createDefaultAdirResultsForm(): AdirResultsForm {
  return {
    subject: {
      nameOrId: "",
      birthDate: "",
      chronologicalAge: "",
      sex: "",
    },
    informant: {
      name: "",
      relationshipToSubject: "",
    },
    algorithm: "diagnostico_4_plus",
    scores: EMPTY_SCORES(),
    totals: EMPTY_TOTALS(),
  };
}

export function computeAdirTotals(scores: AdirScores): Pick<
  AdirTotals,
  "totalA" | "totalBVerbal" | "totalC"
> {
  return {
    totalA: sumWhenComplete([scores.A1, scores.A2, scores.A3, scores.A4]),
    totalBVerbal: sumWhenComplete([
      scores.B1,
      scores.B2Verbal,
      scores.B3Verbal,
      scores.B4,
    ]),
    totalC: sumWhenComplete([scores.C1, scores.C2, scores.C3, scores.C4]),
  };
}

export function parseAdirScoreInput(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) return null;
  return parsed;
}

function isNonEmpty(value: string): boolean {
  return value.trim() !== "";
}

export function isAdirSubjectComplete(subject: AdirSubject): boolean {
  if (!isNonEmpty(subject.nameOrId)) return false;
  if (!isNonEmpty(subject.birthDate)) return false;
  if (!isNonEmpty(subject.chronologicalAge)) return false;
  if (!isNonEmpty(subject.sex)) return false;
  return true;
}

export function isAdirInformantComplete(informant: AdirInformant): boolean {
  if (!isNonEmpty(informant.name)) return false;
  if (!isNonEmpty(informant.relationshipToSubject)) return false;
  return true;
}

export function isAdirDomainScoresComplete(
  keys: AdirScoreKey[],
  scores: AdirScores
): boolean {
  return keys.every((key) => scores[key] !== null);
}

export function isAdirResultsFormComplete(form: AdirResultsForm): boolean {
  const allScoresFilled = ADIR_SCORE_KEYS.every(
    (key) => form.scores[key] !== null
  );
  if (!allScoresFilled) return false;
  if (form.totals.totalD === null) return false;
  return true;
}

export function isAdirWizardStepComplete(
  step: number,
  form: AdirResultsForm
): boolean {
  if (step === 0) return isAdirSubjectComplete(form.subject);
  if (step === 1) return isAdirInformantComplete(form.informant);
  if (step === 2) return true;

  const domainStepIndex = step - ADIR_DOMAIN_SCORE_STEP_OFFSET;
  if (domainStepIndex >= 0 && domainStepIndex < ADIR_SCORE_SECTIONS.length) {
    const section = ADIR_SCORE_SECTIONS[domainStepIndex];
    if (!section) return false;
    return isAdirDomainScoresComplete(section.keys, form.scores);
  }

  if (step === ADIR_DOMAIN_SCORE_STEP_OFFSET + ADIR_SCORE_SECTIONS.length) {
    return form.totals.totalD !== null;
  }

  return false;
}

export function mergeAdirTotals(form: AdirResultsForm): AdirResultsForm {
  const computed = computeAdirTotals(form.scores);
  return {
    ...form,
    totals: {
      ...form.totals,
      totalA: computed.totalA,
      totalBVerbal: computed.totalBVerbal,
      totalC: computed.totalC,
    },
  };
}

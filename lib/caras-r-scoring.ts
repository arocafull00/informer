import normsJson from "../data/caras_r_percentiles.json" with { type: "json" };
import type {
  CarasAge,
  CarasCourse,
  CarasIdentification,
  CarasNormInterval,
  CarasNorms,
  CarasScoreCode,
} from "@/lib/caras-r-types";

export const carasNorms = normsJson as unknown as CarasNorms;

export const CARAS_INPUT_CODES = ["A", "E"] as const;

export const CARAS_RESULT_ROWS: ReadonlyArray<{
  code: CarasScoreCode;
  label: string;
}> = [
  { code: "A", label: "ACIERTOS" },
  { code: "E", label: "ERRORES" },
  { code: "A_E", label: "NETOS" },
  { code: "ICI", label: "ÍNDICE CONTROL IMPULSIVIDAD" },
];

export type CarasNormStatus =
  | "matched"
  | "age-missing"
  | "course-missing"
  | "age-course-mismatch";

export type CarasResultRow = {
  code: CarasScoreCode;
  label: string;
  directScore: number | null;
  percentile: number | null;
};

export type CarasScoreSummary = {
  netScore: number | null;
  ici: number | null;
  normStatus: CarasNormStatus;
  rows: CarasResultRow[];
};

export function isCarasDirectScoreInRange(score: number): boolean {
  return Number.isInteger(score) && score >= 0 && score <= 60;
}

export function isCarasAgeCompatible(
  course: CarasCourse,
  age: CarasAge
): boolean {
  const norms = carasNorms[course];
  return age >= norms.ageMin && age <= norms.ageMax;
}

export function getCarasNormStatus(
  identification: CarasIdentification
): CarasNormStatus {
  if (identification.age === null) return "age-missing";
  if (!identification.course) return "course-missing";
  return isCarasAgeCompatible(identification.course, identification.age)
    ? "matched"
    : "age-course-mismatch";
}

function findPercentile(
  intervals: CarasNormInterval[],
  score: number
): number | null {
  return (
    intervals.find(({ min, max }) => score >= min && score <= max)
      ?.percentile ?? null
  );
}

export function getCarasPercentile(
  identification: CarasIdentification,
  code: CarasScoreCode,
  score: number | null
): number | null {
  if (
    score === null ||
    getCarasNormStatus(identification) !== "matched" ||
    !identification.course
  ) {
    return null;
  }

  return findPercentile(
    carasNorms[identification.course][code],
    score
  );
}

export function getCarasScoreSummary(
  identification: CarasIdentification,
  answers: Record<string, number>
): CarasScoreSummary {
  const successes = answers.A;
  const errors = answers.E;
  const inputsComplete =
    successes !== undefined &&
    errors !== undefined &&
    isCarasDirectScoreInRange(successes) &&
    isCarasDirectScoreInRange(errors);
  const netScore = inputsComplete ? successes - errors : null;
  const responseCount = inputsComplete ? successes + errors : 0;
  const ici =
    netScore !== null && responseCount > 0
      ? Math.round((netScore / responseCount) * 100)
      : null;
  const scores: Record<CarasScoreCode, number | null> = {
    A:
      successes !== undefined && isCarasDirectScoreInRange(successes)
        ? successes
        : null,
    E:
      errors !== undefined && isCarasDirectScoreInRange(errors) ? errors : null,
    A_E: netScore,
    ICI: ici,
  };

  return {
    netScore,
    ici,
    normStatus: getCarasNormStatus(identification),
    rows: CARAS_RESULT_ROWS.map(({ code, label }) => ({
      code,
      label,
      directScore: scores[code],
      percentile: getCarasPercentile(identification, code, scores[code]),
    })),
  };
}

function formatTableValue(value: number | null): string {
  return value === null ? "—" : String(value);
}

function formatPercentileValue(
  row: CarasResultRow,
  normStatus: CarasNormStatus
): string {
  if (
    normStatus === "matched" &&
    row.directScore !== null &&
    row.percentile === null
  ) {
    return "Sin correspondencia";
  }
  return formatTableValue(row.percentile);
}

export function buildCarasMarkdown(
  identification: CarasIdentification,
  answers: Record<string, number>
): string {
  const summary = getCarasScoreSummary(identification, answers);
  return [
    "| PDPC | PD | PC |",
    "| --- | ---: | ---: |",
    ...summary.rows.map(
      (row) =>
        `| ${row.label} | ${formatTableValue(row.directScore)} | ${formatPercentileValue(row, summary.normStatus)} |`
    ),
  ].join("\n");
}

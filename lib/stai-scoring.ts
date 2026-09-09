import staiQuestions from "@/data/stai.json";
import staiCorrecciones from "@/data/stai-correcciones.json";
import {
  mapPatientSexToStaiSex,
  STAI_ESTADO_REVERSE_CODES,
  STAI_RASGO_REVERSE_CODES,
  type StaiCentilRow,
  type StaiIdentification,
  type StaiNorms,
  type StaiScale,
  type StaiSex,
} from "@/lib/stai-types";

export const staiNorms = staiCorrecciones as StaiNorms;

export type StaiNormStatus =
  | "matched"
  | "age-group-missing"
  | "sex-missing";

export type StaiScaleResult = {
  scale: StaiScale;
  label: string;
  directScore: number | null;
  percentile: number | null;
  complete: boolean;
};

export type StaiScoreSummary = {
  normStatus: StaiNormStatus;
  estado: StaiScaleResult;
  rasgo: StaiScaleResult;
};

const SCALE_LABELS: Record<StaiScale, string> = {
  estado: "Ansiedad - estado",
  rasgo: "Ansiedad - rasgo",
};

type StaiQuestion = {
  id: string;
  sectionNumber: number;
  code: string;
  scoring: "direct" | "reverse";
};

const questions = staiQuestions as StaiQuestion[];

function getStaiNormStatus(
  identification: StaiIdentification,
  patientSex: string
): StaiNormStatus {
  if (!identification.ageGroup) return "age-group-missing";
  if (!mapPatientSexToStaiSex(patientSex)) return "sex-missing";
  return "matched";
}

function isReverseCode(scale: StaiScale, code: string): boolean {
  if (scale === "estado") return STAI_ESTADO_REVERSE_CODES.has(code);
  return STAI_RASGO_REVERSE_CODES.has(code);
}

function scoreItem(raw: number, reverse: boolean): number {
  if (reverse) return 3 - raw;
  return raw;
}

function getScaleQuestions(scale: StaiScale): StaiQuestion[] {
  const sectionNumber = scale === "estado" ? 1 : 2;
  return questions.filter((q) => q.sectionNumber === sectionNumber);
}

function computeDirectScore(
  scale: StaiScale,
  answers: Record<string, number>
): { score: number | null; complete: boolean } {
  const scaleQuestions = getScaleQuestions(scale);
  let sum = 0;

  for (const question of scaleQuestions) {
    const raw = answers[question.id];
    if (raw === undefined) {
      return { score: null, complete: false };
    }
    const reverse = isReverseCode(scale, question.code);
    sum += scoreItem(raw, reverse);
  }

  return { score: sum, complete: true };
}

function findExactPercentile(
  intervals: StaiCentilRow[],
  score: number
): number | null {
  const match = intervals.find(
    ({ desde, hasta }) => score >= desde && score <= hasta
  );
  return match?.centil ?? null;
}

function findNearestPercentile(
  intervals: StaiCentilRow[],
  score: number
): number | null {
  const exact = findExactPercentile(intervals, score);
  if (exact !== null) return exact;

  let bestDistance = Infinity;
  let bestCentil: number | null = null;

  for (const row of intervals) {
    let distance: number;
    if (score < row.desde) {
      distance = row.desde - score;
    } else if (score > row.hasta) {
      distance = score - row.hasta;
    } else {
      distance = 0;
    }

    if (distance < bestDistance) {
      bestDistance = distance;
      bestCentil = row.centil;
      continue;
    }

    if (distance === bestDistance && bestCentil !== null && row.centil > bestCentil) {
      bestCentil = row.centil;
    }
  }

  return bestCentil;
}

function getStaiPercentile(
  identification: StaiIdentification,
  patientSex: string,
  scale: StaiScale,
  score: number | null
): number | null {
  if (score === null) return null;
  if (getStaiNormStatus(identification, patientSex) !== "matched") return null;

  const ageGroup = identification.ageGroup;
  if (!ageGroup) return null;

  const sex = mapPatientSexToStaiSex(patientSex) as StaiSex;
  const intervals = staiNorms[ageGroup][sex][scale];
  return findNearestPercentile(intervals, score);
}

function buildScaleResult(
  scale: StaiScale,
  identification: StaiIdentification,
  patientSex: string,
  answers: Record<string, number>
): StaiScaleResult {
  const { score, complete } = computeDirectScore(scale, answers);

  return {
    scale,
    label: SCALE_LABELS[scale],
    directScore: score,
    percentile: complete
      ? getStaiPercentile(identification, patientSex, scale, score)
      : null,
    complete,
  };
}

export function getStaiScoreSummary(
  identification: StaiIdentification,
  patientSex: string,
  answers: Record<string, number>
): StaiScoreSummary {
  return {
    normStatus: getStaiNormStatus(identification, patientSex),
    estado: buildScaleResult("estado", identification, patientSex, answers),
    rasgo: buildScaleResult("rasgo", identification, patientSex, answers),
  };
}

function formatTableValue(value: number | null): string {
  return value === null ? "—" : String(value);
}

export function buildStaiMarkdown(
  identification: StaiIdentification,
  patientSex: string,
  answers: Record<string, number>
): string {
  const summary = getStaiScoreSummary(identification, patientSex, answers);

  return [
    "| | Ansiedad - estado | Ansiedad - rasgo |",
    "| --- | ---: | ---: |",
    `| PD | ${formatTableValue(summary.estado.directScore)} | ${formatTableValue(summary.rasgo.directScore)} |`,
    `| Pc | ${formatTableValue(summary.estado.percentile)} | ${formatTableValue(summary.rasgo.percentile)} |`,
  ].join("\n");
}

import normsJson from "@/data/cumanes-norms.json";
import idnNormsJson from "@/data/cumanes-idn-norms-7-11.json";
import type {
  Age,
  CumanesIdnNorms,
  CumanesNorms,
  IdnScoreResult,
  RangeTestNorms,
  StandardTestNorms,
  TestCode,
} from "@/lib/cumanes-types";

export const cumanesNorms = normsJson as CumanesNorms;
export const cumanesIdnNorms = idnNormsJson as CumanesIdnNorms;

export const CUMANES_TEST_ORDER: TestCode[] = [
  "CA",
  "CIM",
  "FF",
  "FS",
  "LX-c",
  "LX-v",
  "EA",
  "VP",
  "FE-t",
  "FE-e",
  "MVE",
  "MVI",
  "RI",
];

export const CUMANES_TEST_GROUPS: {
  title: string;
  codes: TestCode[];
}[] = [
  { title: "Lenguaje", codes: ["CA", "CIM", "FF", "FS"] },
  { title: "Leximetría", codes: ["LX-c", "LX-v"] },
  { title: "Escritura", codes: ["EA"] },
  { title: "Visopercepción", codes: ["VP"] },
  { title: "Función ejecutiva", codes: ["FE-t", "FE-e"] },
  { title: "Memoria", codes: ["MVE", "MVI"] },
  { title: "Ritmo", codes: ["RI"] },
];

export const CUMANES_POSITIVE_SUM_CODES: TestCode[] = [
  "CA",
  "CIM",
  "FF",
  "FS",
  "LX-c",
  "EA",
  "VP",
  "MVE",
  "MVI",
  "RI",
];

export const CUMANES_NEGATIVE_SUM_CODES: TestCode[] = ["FE-t", "FE-e"];

export type CumanesDirectScoreLimit = {
  min: number | null;
  max: number | null;
};

export const directScoreLimits: Record<TestCode, CumanesDirectScoreLimit> = {
  CA: { min: 0, max: 10 },
  CIM: { min: 0, max: 20 },
  FF: { min: 0, max: 30 },
  FS: { min: 0, max: 30 },
  "LX-c": { min: 0, max: 8 },
  "LX-v": { min: 0, max: null },
  EA: { min: 0, max: 16 },
  VP: { min: 0, max: 39 },
  MVE: { min: 0, max: 30 },
  MVI: { min: 0, max: 15 },
  RI: { min: 0, max: 20 },
  "FE-t": { min: null, max: null },
  "FE-e": { min: 0, max: 30 },
};

export function isCumanesDirectScoreInRange(
  code: TestCode,
  score: number
): boolean {
  const limits = directScoreLimits[code];
  if (limits.min !== null && score < limits.min) {
    return false;
  }
  if (limits.max !== null && score > limits.max) {
    return false;
  }
  return true;
}

export function formatCumanesDirectScoreLimitsLabel(code: TestCode): string {
  const { min, max } = directScoreLimits[code];
  const parts: string[] = [];
  if (min !== null) {
    parts.push(`Mínimo: ${min}`);
  }
  if (max !== null) {
    parts.push(`Máximo: ${max}`);
  }
  if (parts.length === 0) {
    return "Sin límites";
  }
  return parts.join(". ");
}

const CUMANES_SUM_CODES = [
  ...CUMANES_POSITIVE_SUM_CODES,
  ...CUMANES_NEGATIVE_SUM_CODES,
];

export type CumanesScoreStatus =
  | "matched"
  | "empty"
  | "age-missing"
  | "norm-missing"
  | "score-unmatched";

export type CumanesMappedScore = {
  transformation: number | null;
  decatype: number | null;
  status: CumanesScoreStatus;
};

export type CumanesIndexStatus =
  | "matched"
  | "age-missing"
  | "incomplete"
  | "conversion-missing";

export type CumanesIndexSummary = {
  sum: number | null;
  roundedSum: number | null;
  typicalScore: number | null;
  percentile: number | string | null;
  missingCodes: TestCode[];
  status: CumanesIndexStatus;
};

function lookupBoundedNorm<T>(
  norms: Record<string, T>,
  score: number
): T | null {
  const exact = norms[String(score)];
  if (exact) return exact;

  let lteMatch: T | null = null;
  let lteThreshold = Infinity;
  let gteMatch: T | null = null;
  let gteThreshold = -Infinity;

  for (const [key, result] of Object.entries(norms)) {
    if (key.startsWith("<=")) {
      const threshold = Number(key.slice(2));
      if (score <= threshold && threshold < lteThreshold) {
        lteThreshold = threshold;
        lteMatch = result;
      }
      continue;
    }

    if (key.startsWith(">=")) {
      const threshold = Number(key.slice(2));
      if (score >= threshold && threshold > gteThreshold) {
        gteThreshold = threshold;
        gteMatch = result;
      }
    }
  }

  return lteMatch ?? gteMatch;
}

export function getCumanesScore(
  age: Age | null | undefined,
  code: TestCode,
  directScore: number | undefined
): CumanesMappedScore {
  if (directScore === undefined) {
    return { transformation: null, decatype: null, status: "empty" };
  }

  if (!age) {
    return { transformation: null, decatype: null, status: "age-missing" };
  }

  if (!isCumanesDirectScoreInRange(code, directScore)) {
    return { transformation: null, decatype: null, status: "score-unmatched" };
  }

  const test = cumanesNorms.tests[code];
  const norms = cumanesNorms.ages[age]?.[code];

  if (!norms) {
    return { transformation: null, decatype: null, status: "norm-missing" };
  }

  if (test.type === "range") {
    if (!Array.isArray(norms)) {
      return { transformation: null, decatype: null, status: "norm-missing" };
    }

    const match = (norms as RangeTestNorms).find(
      ({ min, max }) => directScore >= min && (max === null || directScore <= max)
    );

    return match
      ? { transformation: null, decatype: match.decatype, status: "matched" }
      : { transformation: null, decatype: null, status: "score-unmatched" };
  }

  if (Array.isArray(norms)) {
    return { transformation: null, decatype: null, status: "norm-missing" };
  }

  const match = lookupBoundedNorm(norms as StandardTestNorms, directScore);
  return match
    ? { ...match, status: "matched" }
    : { transformation: null, decatype: null, status: "score-unmatched" };
}

export function sumCumanesTransformations(
  transformations: Partial<Record<TestCode, number>>
): Pick<CumanesIndexSummary, "sum" | "missingCodes"> {
  const missingCodes = CUMANES_SUM_CODES.filter(
    (code) => transformations[code] === undefined
  );
  const positiveTotal = CUMANES_POSITIVE_SUM_CODES.reduce(
    (sum, code) => sum + (transformations[code] ?? 0),
    0
  );
  const negativeTotal = CUMANES_NEGATIVE_SUM_CODES.reduce(
    (sum, code) => sum + (transformations[code] ?? 0),
    0
  );
  const hasValues = missingCodes.length < CUMANES_SUM_CODES.length;
  const sum = hasValues
    ? Math.round((positiveTotal - negativeTotal + Number.EPSILON) * 100) / 100
    : null;

  return { sum, missingCodes };
}

export function getCumanesIdnResult(
  age: Age,
  roundedSum: number
): IdnScoreResult | null {
  const norms = cumanesIdnNorms[age];
  return lookupBoundedNorm(norms, roundedSum);
}

export function getCumanesIndexSummary(
  age: Age | null | undefined,
  directScores: Record<string, number>
): CumanesIndexSummary {
  if (!age) {
    return {
      sum: null,
      roundedSum: null,
      typicalScore: null,
      percentile: null,
      missingCodes: [...CUMANES_SUM_CODES],
      status: "age-missing",
    };
  }

  const transformations: Partial<Record<TestCode, number>> = {};
  for (const code of CUMANES_SUM_CODES) {
    const result = getCumanesScore(age, code, directScores[code]);
    if (result.status === "matched" && result.transformation !== null) {
      transformations[code] = result.transformation;
    }
  }

  const { sum, missingCodes } = sumCumanesTransformations(transformations);
  if (missingCodes.length > 0 || sum === null) {
    return {
      sum,
      roundedSum: null,
      typicalScore: null,
      percentile: null,
      missingCodes,
      status: "incomplete",
    };
  }

  const roundedSum = Math.round(sum);
  const idnResult = getCumanesIdnResult(age, roundedSum);
  if (!idnResult) {
    return {
      sum,
      roundedSum,
      typicalScore: null,
      percentile: null,
      missingCodes: [],
      status: "conversion-missing",
    };
  }

  return {
    sum,
    roundedSum,
    typicalScore: idnResult.typicalScore,
    percentile: idnResult.percentile,
    missingCodes: [],
    status: "matched",
  };
}

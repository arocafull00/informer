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

  const match = (norms as StandardTestNorms)[String(directScore)];
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
  const exactMatch = norms[String(roundedSum)];
  if (exactMatch) return exactMatch;

  for (const [key, result] of Object.entries(norms)) {
    if (key.startsWith("<=") && roundedSum <= Number(key.slice(2))) {
      return result;
    }
    if (key.startsWith(">=") && roundedSum >= Number(key.slice(2))) {
      return result;
    }
  }

  return null;
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

import {
  CUMANES_TEST_ORDER,
  cumanesNorms,
  getCumanesIndexSummary,
  getCumanesScore,
} from "@/lib/cumanes-scoring";
import type {
  CumanesIdentification,
  CumanesLaterality,
  TestCode,
} from "@/lib/cumanes-types";
import type { CumanesPdfForm, CumanesPdfTestScore } from "./types";

type BuildCumanesPdfFormInput = {
  patientName: string;
  patientSex: string;
  identification: CumanesIdentification;
  laterality: CumanesLaterality;
  answers: Record<string, number>;
};

export function buildCumanesPdfForm({
  patientName,
  patientSex,
  identification,
  laterality,
  answers,
}: BuildCumanesPdfFormInput): CumanesPdfForm {
  const scores: Partial<Record<TestCode, CumanesPdfTestScore>> = {};

  for (const code of CUMANES_TEST_ORDER) {
    const directScore = answers[code];
    const result = getCumanesScore(identification.age, code, directScore);
    const test = cumanesNorms.tests[code];

    if (directScore === undefined && result.status === "empty") {
      continue;
    }

    scores[code] = {
      directScore: directScore ?? null,
      transformation:
        test.type === "range" || code === "LX-v"
          ? null
          : result.transformation,
      decatype: result.decatype,
    };
  }

  const indexSummary = getCumanesIndexSummary(identification.age, answers);

  return {
    patientName,
    patientSex,
    identification,
    laterality,
    scores,
    sum: indexSummary.sum,
    typicalScore: indexSummary.typicalScore,
    percentile: indexSummary.percentile,
  };
}

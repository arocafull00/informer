import {
  getCarasNormStatus,
  isCarasDirectScoreInRange,
} from "@/lib/caras-r-scoring";
import {
  CUMANES_TEST_ORDER,
  getCumanesIndexSummary,
} from "@/lib/cumanes-scoring";
import { EMPTY_CUMANES_IDENTIFICATION } from "@/lib/cumanes-types";
import { getDersScoreSummary } from "@/lib/ders-scoring";
import { EMPTY_CARAS_IDENTIFICATION } from "@/lib/caras-r-types";
import {
  isRiasResultsFormComplete,
  normalizeRiasResultsForm,
} from "@/lib/rias-scoring";
import { getStaiScoreSummary } from "@/lib/stai-scoring";
import { EMPTY_STAI_IDENTIFICATION } from "@/lib/stai-types";
import { testData } from "@/lib/test-data";
import type { SavedReport, TestType } from "@/lib/types";

export type ReportCompleteness = {
  isComplete: boolean;
  answeredCount: number;
  totalCount: number;
};

function countQuestionnaireProgress(
  test: TestType,
  answers: Record<string, number>
): { answeredCount: number; totalCount: number } {
  const questions = testData[test];
  if (questions.length === 0) {
    return { answeredCount: 0, totalCount: 0 };
  }

  const answeredCount = questions.filter(
    (question) => answers[question.id] !== undefined
  ).length;

  return { answeredCount, totalCount: questions.length };
}

export function getReportCompleteness(
  report: SavedReport
): ReportCompleteness {
  switch (report.test) {
    case "ADIR":
    case "ADOS2_ADULTO":
    case "ADOS2_NINO": {
      const { answeredCount, totalCount } = countQuestionnaireProgress(
        report.test,
        report.answers
      );
      return {
        isComplete: totalCount > 0 && answeredCount === totalCount,
        answeredCount,
        totalCount,
      };
    }
    case "DERS": {
      const summary = getDersScoreSummary(
        report.patientSex ?? "",
        report.answers
      );
      return {
        isComplete: summary.answeredCount === summary.totalItems,
        answeredCount: summary.answeredCount,
        totalCount: summary.totalItems,
      };
    }
    case "STAI": {
      const identification =
        report.staiIdentification ?? EMPTY_STAI_IDENTIFICATION;
      const summary = getStaiScoreSummary(
        identification,
        report.patientSex ?? "",
        report.answers
      );
      const { answeredCount, totalCount } = countQuestionnaireProgress(
        "STAI",
        report.answers
      );
      return {
        isComplete: summary.estado.complete && summary.rasgo.complete,
        answeredCount,
        totalCount,
      };
    }
    case "RIAS": {
      const form = normalizeRiasResultsForm(report.riasForm);
      const isComplete = isRiasResultsFormComplete(form);
      return {
        isComplete,
        answeredCount: isComplete ? 1 : 0,
        totalCount: 1,
      };
    }
    case "CUMANES": {
      const identification =
        report.cumanesIdentification ?? EMPTY_CUMANES_IDENTIFICATION;
      const answeredCount = CUMANES_TEST_ORDER.filter(
        (code) => report.answers[code] !== undefined
      ).length;
      const totalCount = CUMANES_TEST_ORDER.length;
      const indexSummary = getCumanesIndexSummary(
        identification.age,
        report.answers
      );
      return {
        isComplete:
          answeredCount === totalCount && indexSummary.status === "matched",
        answeredCount,
        totalCount,
      };
    }
    case "CARAS_R": {
      const identification =
        report.carasIdentification ?? EMPTY_CARAS_IDENTIFICATION;
      const successes = report.answers.A;
      const errors = report.answers.E;
      const inputsComplete =
        successes !== undefined &&
        errors !== undefined &&
        isCarasDirectScoreInRange(successes) &&
        isCarasDirectScoreInRange(errors);
      const answeredCount =
        (successes !== undefined ? 1 : 0) + (errors !== undefined ? 1 : 0);
      return {
        isComplete:
          inputsComplete && getCarasNormStatus(identification) === "matched",
        answeredCount,
        totalCount: 2,
      };
    }
  }
}

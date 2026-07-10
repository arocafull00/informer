import { capScoreForSum } from "@/lib/score-sum-cap";
import type { Question, TestType } from "@/lib/types";

type ItemRef = {
  sectionNumber: number;
  code: string;
};

type NinoGroupId = "as" | "crr";

type NinoScoringItemDef = {
  itemCode: string;
  groupId: NinoGroupId;
  ref: ItemRef;
};

type AdultGroupId = "communication" | "isr" | "imagination" | "rbs";

type AdultScoringItemDef = {
  itemCode: string;
  groupId: AdultGroupId;
  ref: ItemRef;
};

const ADOS2_NINO_SCORING_ITEMS: NinoScoringItemDef[] = [
  { itemCode: "A-7", groupId: "as", ref: { sectionNumber: 1, code: "7" } },
  { itemCode: "A-8", groupId: "as", ref: { sectionNumber: 1, code: "8" } },
  { itemCode: "A-9", groupId: "as", ref: { sectionNumber: 1, code: "9" } },
  { itemCode: "B-1", groupId: "as", ref: { sectionNumber: 2, code: "1" } },
  { itemCode: "B-2", groupId: "as", ref: { sectionNumber: 2, code: "2" } },
  { itemCode: "B-4", groupId: "as", ref: { sectionNumber: 2, code: "4" } },
  { itemCode: "B-7", groupId: "as", ref: { sectionNumber: 2, code: "7" } },
  { itemCode: "B-9", groupId: "as", ref: { sectionNumber: 2, code: "9" } },
  { itemCode: "B-10", groupId: "as", ref: { sectionNumber: 2, code: "10" } },
  { itemCode: "B-11", groupId: "as", ref: { sectionNumber: 2, code: "11" } },
  { itemCode: "A-4", groupId: "crr", ref: { sectionNumber: 1, code: "4" } },
  { itemCode: "D-1", groupId: "crr", ref: { sectionNumber: 4, code: "1" } },
  { itemCode: "D-2", groupId: "crr", ref: { sectionNumber: 4, code: "2" } },
  { itemCode: "D-4", groupId: "crr", ref: { sectionNumber: 4, code: "4" } },
];

const ADOS2_ADULTO_SCORING_ITEMS: AdultScoringItemDef[] = [
  {
    itemCode: "A-4",
    groupId: "communication",
    ref: { sectionNumber: 1, code: "4" },
  },
  {
    itemCode: "A-8",
    groupId: "communication",
    ref: { sectionNumber: 1, code: "8" },
  },
  {
    itemCode: "A-9",
    groupId: "communication",
    ref: { sectionNumber: 1, code: "9" },
  },
  {
    itemCode: "A-10",
    groupId: "communication",
    ref: { sectionNumber: 1, code: "10" },
  },
  { itemCode: "B-1", groupId: "isr", ref: { sectionNumber: 2, code: "1" } },
  { itemCode: "B-2", groupId: "isr", ref: { sectionNumber: 2, code: "2" } },
  { itemCode: "B-6", groupId: "isr", ref: { sectionNumber: 2, code: "6" } },
  { itemCode: "B-8", groupId: "isr", ref: { sectionNumber: 2, code: "8" } },
  { itemCode: "B-9", groupId: "isr", ref: { sectionNumber: 2, code: "9" } },
  { itemCode: "B-11", groupId: "isr", ref: { sectionNumber: 2, code: "11" } },
  { itemCode: "B-12", groupId: "isr", ref: { sectionNumber: 2, code: "12" } },
  {
    itemCode: "C-1",
    groupId: "imagination",
    ref: { sectionNumber: 3, code: "1" },
  },
  { itemCode: "D-1", groupId: "rbs", ref: { sectionNumber: 4, code: "1" } },
  { itemCode: "D-2", groupId: "rbs", ref: { sectionNumber: 4, code: "2" } },
  { itemCode: "D-4", groupId: "rbs", ref: { sectionNumber: 4, code: "4" } },
  { itemCode: "D-5", groupId: "rbs", ref: { sectionNumber: 4, code: "5" } },
];

const NINO_GROUP_ORDER: NinoGroupId[] = ["as", "crr"];

const ADULT_GROUP_ORDER: AdultGroupId[] = [
  "communication",
  "isr",
  "imagination",
  "rbs",
];

const NINO_GROUP_META: Record<
  NinoGroupId,
  { totalLabel: string; variant: "warm" | "neutral" }
> = {
  as: {
    totalLabel: "TOTAL AS",
    variant: "warm",
  },
  crr: {
    totalLabel: "TOTAL CRR",
    variant: "neutral",
  },
};

const ADULT_GROUP_META: Record<
  AdultGroupId,
  { totalLabel?: string; variant: "warm" | "neutral" }
> = {
  communication: {
    totalLabel: "TOTAL COMUNICACIÓN (C)",
    variant: "warm",
  },
  isr: {
    totalLabel: "TOTAL INTERACCIÓN SOCIAL RECÍPROCA (ISR)",
    variant: "warm",
  },
  imagination: {
    variant: "neutral",
  },
  rbs: {
    totalLabel:
      "TOTAL COMPORTAMIENTOS ESTEREOTIPADOS E INTERESES RESTRINGIDOS",
    variant: "neutral",
  },
};

export type Ados2ScoreRow = {
  itemCode: string;
  score: number | null;
};

export type Ados2ScoreDomainResult = {
  id: string;
  variant: "warm" | "neutral";
  rows: Ados2ScoreRow[];
  total: number | null;
  totalLabel?: string;
};

export type Ados2ScoreSummary = {
  domains: Ados2ScoreDomainResult[];
  communicationTotal: number | null;
  isrTotal: number | null;
  asTotal: number | null;
  crrTotal: number | null;
  cPlusIsr: number | null;
};

export function findQuestion(
  questions: Question[],
  sectionNumber: number,
  code: string
): Question | undefined {
  return questions.find(
    (q) => q.sectionNumber === sectionNumber && q.code === code
  );
}

function sumAnsweredScores(rows: Ados2ScoreRow[]): number | null {
  const answered = rows.filter((r) => r.score !== null);
  if (answered.length === 0) return null;
  return answered.reduce((sum, r) => sum + capScoreForSum(r.score ?? 0), 0);
}

function buildRow(
  itemCode: string,
  ref: ItemRef,
  questions: Question[],
  answers: Record<string, number>,
): Ados2ScoreRow {
  const question = findQuestion(questions, ref.sectionNumber, ref.code);
  if (!question) {
    return { itemCode, score: null };
  }
  const score = answers[question.id];
  return {
    itemCode,
    score: score !== undefined ? score : null,
  };
}

function buildNinoScoreSummary(
  questions: Question[],
  answers: Record<string, number>,
): Ados2ScoreSummary {
  const domains: Ados2ScoreDomainResult[] = NINO_GROUP_ORDER.map((groupId) => {
    const items = ADOS2_NINO_SCORING_ITEMS.filter(
      (item) => item.groupId === groupId,
    );
    const rows = items.map((def) =>
      buildRow(def.itemCode, def.ref, questions, answers),
    );
    const meta = NINO_GROUP_META[groupId];

    return {
      id: groupId,
      variant: meta.variant,
      rows,
      total: sumAnsweredScores(rows),
      totalLabel: meta.totalLabel,
    };
  });

  const as = domains.find((d) => d.id === "as");
  const crr = domains.find((d) => d.id === "crr");
  const asTotal = as?.total ?? null;
  const crrTotal = crr?.total ?? null;

  let cPlusIsr: number | null = null;
  if (asTotal !== null || crrTotal !== null) {
    cPlusIsr = (asTotal ?? 0) + (crrTotal ?? 0);
  }

  return {
    domains,
    communicationTotal: null,
    isrTotal: null,
    asTotal,
    crrTotal,
    cPlusIsr,
  };
}

function buildAdultScoreSummary(
  questions: Question[],
  answers: Record<string, number>,
): Ados2ScoreSummary {
  const domains: Ados2ScoreDomainResult[] = ADULT_GROUP_ORDER.map((groupId) => {
    const items = ADOS2_ADULTO_SCORING_ITEMS.filter(
      (item) => item.groupId === groupId,
    );
    const rows = items.map((def) =>
      buildRow(def.itemCode, def.ref, questions, answers),
    );
    const meta = ADULT_GROUP_META[groupId];

    return {
      id: groupId,
      variant: meta.variant,
      rows,
      total: meta.totalLabel ? sumAnsweredScores(rows) : null,
      totalLabel: meta.totalLabel,
    };
  });

  const communication = domains.find((d) => d.id === "communication");
  const isr = domains.find((d) => d.id === "isr");
  const communicationTotal = communication?.total ?? null;
  const isrTotal = isr?.total ?? null;

  let cPlusIsr: number | null = null;
  if (communicationTotal !== null || isrTotal !== null) {
    cPlusIsr = (communicationTotal ?? 0) + (isrTotal ?? 0);
  }

  return {
    domains,
    communicationTotal,
    isrTotal,
    asTotal: null,
    crrTotal: null,
    cPlusIsr,
  };
}

export function buildAdos2ScoreSummary(
  test: TestType,
  questions: Question[],
  answers: Record<string, number>,
): Ados2ScoreSummary | null {
  if (test !== "ADOS2_ADULTO" && test !== "ADOS2_NINO") return null;

  if (test === "ADOS2_NINO") {
    return buildNinoScoreSummary(questions, answers);
  }

  return buildAdultScoreSummary(questions, answers);
}

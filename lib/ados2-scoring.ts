import type { Question, TestType } from "@/lib/types";

type Ados2ScoringTest = "ADOS2_ADULTO" | "ADOS2_NINO";

type ItemRef = {
  sectionNumber: number;
  code: string;
};

type ScoringItemDef = {
  itemCode: string;
  groupId: "communication" | "isr" | "imagination" | "rbs";
  refs: Record<Ados2ScoringTest, ItemRef>;
};

const ADOS2_SCORING_ITEMS: ScoringItemDef[] = [
  {
    itemCode: "A-4",
    groupId: "communication",
    refs: {
      ADOS2_ADULTO: { sectionNumber: 1, code: "4" },
      ADOS2_NINO: { sectionNumber: 1, code: "4" },
    },
  },
  {
    itemCode: "A-8",
    groupId: "communication",
    refs: {
      ADOS2_ADULTO: { sectionNumber: 1, code: "8" },
      ADOS2_NINO: { sectionNumber: 1, code: "8" },
    },
  },
  {
    itemCode: "A-9",
    groupId: "communication",
    refs: {
      ADOS2_ADULTO: { sectionNumber: 1, code: "9" },
      ADOS2_NINO: { sectionNumber: 1, code: "9" },
    },
  },
  {
    itemCode: "A-10",
    groupId: "communication",
    refs: {
      ADOS2_ADULTO: { sectionNumber: 1, code: "10" },
      ADOS2_NINO: { sectionNumber: 1, code: "10" },
    },
  },
  {
    itemCode: "B-1",
    groupId: "isr",
    refs: {
      ADOS2_ADULTO: { sectionNumber: 2, code: "1" },
      ADOS2_NINO: { sectionNumber: 2, code: "1" },
    },
  },
  {
    itemCode: "B-2",
    groupId: "isr",
    refs: {
      ADOS2_ADULTO: { sectionNumber: 2, code: "2" },
      ADOS2_NINO: { sectionNumber: 2, code: "2" },
    },
  },
  {
    itemCode: "B-6",
    groupId: "isr",
    refs: {
      ADOS2_ADULTO: { sectionNumber: 2, code: "6" },
      ADOS2_NINO: { sectionNumber: 2, code: "5" },
    },
  },
  {
    itemCode: "B-8",
    groupId: "isr",
    refs: {
      ADOS2_ADULTO: { sectionNumber: 2, code: "8" },
      ADOS2_NINO: { sectionNumber: 2, code: "6" },
    },
  },
  {
    itemCode: "B-9",
    groupId: "isr",
    refs: {
      ADOS2_ADULTO: { sectionNumber: 2, code: "9" },
      ADOS2_NINO: { sectionNumber: 2, code: "7" },
    },
  },
  {
    itemCode: "B-11",
    groupId: "isr",
    refs: {
      ADOS2_ADULTO: { sectionNumber: 2, code: "11" },
      ADOS2_NINO: { sectionNumber: 2, code: "9" },
    },
  },
  {
    itemCode: "B-12",
    groupId: "isr",
    refs: {
      ADOS2_ADULTO: { sectionNumber: 2, code: "12" },
      ADOS2_NINO: { sectionNumber: 2, code: "10" },
    },
  },
  {
    itemCode: "C-1",
    groupId: "imagination",
    refs: {
      ADOS2_ADULTO: { sectionNumber: 3, code: "1" },
      ADOS2_NINO: { sectionNumber: 3, code: "1" },
    },
  },
  {
    itemCode: "D-1",
    groupId: "rbs",
    refs: {
      ADOS2_ADULTO: { sectionNumber: 4, code: "1" },
      ADOS2_NINO: { sectionNumber: 4, code: "1" },
    },
  },
  {
    itemCode: "D-2",
    groupId: "rbs",
    refs: {
      ADOS2_ADULTO: { sectionNumber: 4, code: "2" },
      ADOS2_NINO: { sectionNumber: 4, code: "2" },
    },
  },
  {
    itemCode: "D-4",
    groupId: "rbs",
    refs: {
      ADOS2_ADULTO: { sectionNumber: 4, code: "4" },
      ADOS2_NINO: { sectionNumber: 4, code: "4" },
    },
  },
  {
    itemCode: "D-5",
    groupId: "rbs",
    refs: {
      ADOS2_ADULTO: { sectionNumber: 4, code: "5" },
      ADOS2_NINO: { sectionNumber: 4, code: "5" },
    },
  },
];

const GROUP_ORDER = [
  "communication",
  "isr",
  "imagination",
  "rbs",
] as const;

const GROUP_META: Record<
  (typeof GROUP_ORDER)[number],
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
  return answered.reduce((sum, r) => sum + (r.score ?? 0), 0);
}

function buildRow(
  def: ScoringItemDef,
  test: Ados2ScoringTest,
  questions: Question[],
  answers: Record<string, number>
): Ados2ScoreRow {
  const ref = def.refs[test];
  const question = findQuestion(questions, ref.sectionNumber, ref.code);
  if (!question) {
    return { itemCode: def.itemCode, score: null };
  }
  const score = answers[question.id];
  return {
    itemCode: def.itemCode,
    score: score !== undefined ? score : null,
  };
}

export function buildAdos2ScoreSummary(
  test: TestType,
  questions: Question[],
  answers: Record<string, number>
): Ados2ScoreSummary | null {
  if (test !== "ADOS2_ADULTO" && test !== "ADOS2_NINO") return null;

  const domains: Ados2ScoreDomainResult[] = GROUP_ORDER.map((groupId) => {
    const items = ADOS2_SCORING_ITEMS.filter((item) => item.groupId === groupId);
    const rows = items.map((def) => buildRow(def, test, questions, answers));
    const meta = GROUP_META[groupId];
    const total = meta.totalLabel ? sumAnsweredScores(rows) : null;

    return {
      id: groupId,
      variant: meta.variant,
      rows,
      total,
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
    cPlusIsr,
  };
}

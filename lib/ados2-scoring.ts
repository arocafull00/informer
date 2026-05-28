import { ados2SectionLetter } from "@/lib/ados2-labels";
import type { Question, TestType } from "@/lib/types";

type Ados2ScoringTest = "ADOS2_ADULTO" | "ADOS2_NINO";

type Ados2ScoringDomainConfig = {
  id: string;
  title: string;
  sectionNumber: number;
  codes: string[];
  totalLabel?: string;
  variant: "warm" | "neutral";
};

const ADOS2_SCORING_DOMAINS: Record<Ados2ScoringTest, Ados2ScoringDomainConfig[]> = {
  ADOS2_ADULTO: [
    {
      id: "communication",
      title: "Comunicación",
      sectionNumber: 1,
      codes: ["4", "8", "9", "10"],
      totalLabel: "TOTAL COMUNICACIÓN (C)",
      variant: "warm",
    },
    {
      id: "isr",
      title: "Interacción social recíproca",
      sectionNumber: 2,
      codes: ["1", "2", "6", "8", "9", "11", "12"],
      totalLabel: "TOTAL INTERACCIÓN SOCIAL RECÍPROCA (ISR)",
      variant: "warm",
    },
    {
      id: "imagination",
      title: "Imaginación y creatividad",
      sectionNumber: 3,
      codes: ["1"],
      variant: "neutral",
    },
    {
      id: "rbs",
      title: "Comportamientos estereotipados e intereses restringidos",
      sectionNumber: 4,
      codes: ["1", "2", "4", "5"],
      totalLabel:
        "TOTAL COMPORTAMIENTOS ESTEREOTIPADOS E INTERESES RESTRINGIDOS",
      variant: "neutral",
    },
  ],
  ADOS2_NINO: [
    {
      id: "communication",
      title: "Comunicación",
      sectionNumber: 1,
      codes: ["4", "8", "9", "10"],
      totalLabel: "TOTAL COMUNICACIÓN (C)",
      variant: "warm",
    },
    {
      id: "isr",
      title: "Interacción social recíproca",
      sectionNumber: 2,
      codes: ["1", "2", "5", "6", "7", "9", "10"],
      totalLabel: "TOTAL INTERACCIÓN SOCIAL RECÍPROCA (ISR)",
      variant: "warm",
    },
    {
      id: "imagination",
      title: "Imaginación y creatividad",
      sectionNumber: 3,
      codes: ["1"],
      variant: "neutral",
    },
    {
      id: "rbs",
      title: "Comportamientos estereotipados e intereses restringidos",
      sectionNumber: 4,
      codes: ["1", "2", "4", "5"],
      totalLabel:
        "TOTAL COMPORTAMIENTOS ESTEREOTIPADOS E INTERESES RESTRINGIDOS",
      variant: "neutral",
    },
  ],
};

export type Ados2ScoreRow = {
  itemCode: string;
  question: string;
  score: number | null;
};

export type Ados2ScoreDomainResult = {
  id: string;
  title: string;
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

export function ados2ItemCode(
  sectionNumber: number,
  code: string
): string {
  return `${ados2SectionLetter(sectionNumber)}-${code}`;
}

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

function buildDomainRows(
  questions: Question[],
  config: Ados2ScoringDomainConfig,
  answers: Record<string, number>
): Ados2ScoreRow[] {
  return config.codes.map((code) => {
    const question = findQuestion(questions, config.sectionNumber, code);
    if (!question) {
      return {
        itemCode: ados2ItemCode(config.sectionNumber, code),
        question: "",
        score: null,
      };
    }
    const score = answers[question.id];
    return {
      itemCode: ados2ItemCode(config.sectionNumber, code),
      question: question.question,
      score: score !== undefined ? score : null,
    };
  });
}

export function buildAdos2ScoreSummary(
  test: TestType,
  questions: Question[],
  answers: Record<string, number>
): Ados2ScoreSummary | null {
  if (test !== "ADOS2_ADULTO" && test !== "ADOS2_NINO") return null;

  const configs = ADOS2_SCORING_DOMAINS[test];
  const domains: Ados2ScoreDomainResult[] = configs.map((config) => {
    const rows = buildDomainRows(questions, config, answers).filter(
      (r) => r.question !== ""
    );
    const total = config.totalLabel ? sumAnsweredScores(rows) : null;
    return {
      id: config.id,
      title: config.title,
      variant: config.variant,
      rows,
      total,
      totalLabel: config.totalLabel,
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

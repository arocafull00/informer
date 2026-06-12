import {
  ADIR_SCORE_KEYS,
  type AdirScoreKey,
  type AdirScores,
} from "@/lib/adir-scoring";
import { capScoreForSum } from "@/lib/score-sum-cap";

export type AdirDomainScoringContext = {
  chronologicalAge: string;
};

const LANGUAGE_LEVEL_QUESTION_ID = "adir-30";

type DomainQuestionResolver = (
  answers: Record<string, number>,
  context: AdirDomainScoringContext,
) => string[];

const STATIC_DOMAIN_QUESTIONS: Partial<Record<AdirScoreKey, string[]>> = {
  A1: ["adir-50", "adir-51", "adir-57"],
  A3: ["adir-52", "adir-53", "adir-54"],
  A4: ["adir-31", "adir-55", "adir-56", "adir-58", "adir-59"],
  B1: ["adir-42", "adir-43", "adir-44", "adir-45"],
  B2Verbal: ["adir-34", "adir-35"],
  B3Verbal: ["adir-33", "adir-36", "adir-37", "adir-38"],
  B4: ["adir-47", "adir-48", "adir-61"],
  C1: ["adir-67", "adir-68"],
  C4: ["adir-69", "adir-71"],
};

const A2_BASE_QUESTION_IDS = ["adir-49", "adir-62", "adir-63"];
const A2_MAX_QUESTION_IDS = ["adir-64", "adir-65"];
const C3_MAX_QUESTION_IDS = ["adir-77", "adir-78"];

function computeMaxAmongQuestions(
  questionIds: string[],
  answers: Record<string, number>,
): number | null {
  const cappedScores = questionIds
    .map((questionId) => {
      const value = answers[questionId];
      if (value === undefined) return null;
      return capScoreForSum(value);
    })
    .filter((value): value is number => value !== null);

  if (cappedScores.length === 0) return null;

  return Math.max(...cappedScores);
}

function formatMaxAmongQuestionsBreakdown(
  label: string,
  questionIds: string[],
  answers: Record<string, number>,
): string {
  const maxScore = computeMaxAmongQuestions(questionIds, answers);
  if (maxScore === null) return `${label} (—)`;
  return `${label} (${maxScore})`;
}

function resolveA2Questions(): string[] {
  return [...A2_BASE_QUESTION_IDS, ...A2_MAX_QUESTION_IDS];
}

function resolveC3Questions(): string[] {
  return [...C3_MAX_QUESTION_IDS];
}

function computeA2Score(answers: Record<string, number>): number | null {
  const baseTotal = sumAnsweredQuestions(A2_BASE_QUESTION_IDS, answers);
  if (baseTotal === null) return null;

  const maxQuestionScore = computeMaxAmongQuestions(A2_MAX_QUESTION_IDS, answers);
  if (maxQuestionScore === null) return null;

  return baseTotal + maxQuestionScore;
}

function computeC3Score(answers: Record<string, number>): number | null {
  return computeMaxAmongQuestions(C3_MAX_QUESTION_IDS, answers);
}

function resolveC2Questions(answers: Record<string, number>): string[] {
  const questionIds = ["adir-70"];
  const languageLevel = answers[LANGUAGE_LEVEL_QUESTION_ID];

  if (languageLevel === 0) {
    questionIds.push("adir-39");
  }

  return questionIds;
}

const DOMAIN_QUESTION_RESOLVERS: Partial<
  Record<AdirScoreKey, DomainQuestionResolver>
> = {
  A2: () => resolveA2Questions(),
  C2: (answers) => resolveC2Questions(answers),
  C3: () => resolveC3Questions(),
};

const DOMAIN_SCORE_COMPUTERS: Partial<
  Record<AdirScoreKey, (answers: Record<string, number>) => number | null>
> = {
  A2: computeA2Score,
  C3: computeC3Score,
};

export function formatAdirQuestionNumber(questionId: string): string {
  const match = /^adir-(\d+)(?:-(\d+))?$/.exec(questionId);
  if (!match) return questionId;
  if (match[2]) return `${match[1]}.${match[2]}`;
  return match[1];
}

export function resolveAdirDomainQuestionIds(
  key: AdirScoreKey,
  answers: Record<string, number>,
  context: AdirDomainScoringContext,
): string[] {
  const resolver = DOMAIN_QUESTION_RESOLVERS[key];
  if (resolver) return resolver(answers, context);

  return STATIC_DOMAIN_QUESTIONS[key] ?? [];
}

export function formatAdirScoreKeyLabel(key: AdirScoreKey): string {
  return key.replace(/Verbal$/, "");
}

export function formatAdirQuestionBreakdown(
  scoreKey: AdirScoreKey,
  questionIds: string[],
  answers: Record<string, number>,
): string {
  if (scoreKey === "A2") {
    const baseBreakdown = A2_BASE_QUESTION_IDS.map((questionId) => {
      const value = answers[questionId];
      if (value === undefined) {
        return `${formatAdirQuestionNumber(questionId)} (—)`;
      }
      return `${formatAdirQuestionNumber(questionId)} (${capScoreForSum(value)})`;
    }).join(" + ");

    return `${baseBreakdown} + ${formatMaxAmongQuestionsBreakdown("64/65", A2_MAX_QUESTION_IDS, answers)}`;
  }

  if (scoreKey === "C3") {
    return formatMaxAmongQuestionsBreakdown("77/78", C3_MAX_QUESTION_IDS, answers);
  }

  if (questionIds.length === 0) return "";

  return questionIds
    .map((questionId) => {
      const value = answers[questionId];
      if (value === undefined) {
        return `${formatAdirQuestionNumber(questionId)} (—)`;
      }
      return `${formatAdirQuestionNumber(questionId)} (${capScoreForSum(value)})`;
    })
    .join(" + ");
}

function sumAnsweredQuestions(
  questionIds: string[],
  answers: Record<string, number>,
): number | null {
  if (questionIds.length === 0) return null;

  let total = 0;

  for (const questionId of questionIds) {
    const value = answers[questionId];
    if (value === undefined) return null;
    total += capScoreForSum(value);
  }

  return total;
}

export function computeAdirDomainScores(
  answers: Record<string, number>,
  context: AdirDomainScoringContext,
): AdirScores {
  const scores = {} as AdirScores;

  for (const key of ADIR_SCORE_KEYS) {
    const computer = DOMAIN_SCORE_COMPUTERS[key];
    if (computer) {
      scores[key] = computer(answers);
      continue;
    }

    const questionIds = resolveAdirDomainQuestionIds(key, answers, context);
    scores[key] = sumAnsweredQuestions(questionIds, answers);
  }

  return scores;
}

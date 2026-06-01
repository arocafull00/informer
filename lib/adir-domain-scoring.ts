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
  B1: ["adir-42", "adir-43","adir-44", "adir-45"],
  B2Verbal: ["adir-34", "adir-35"],
  B3Verbal: ["adir-33", "adir-36", "adir-37", "adir-38"],
  B4: ["adir-47", "adir-48", "adir-61"],
  C1: ["adir-67", "adir-68"],
  C3: ["adir-77", "adir-78"],
  C4: ["adir-69", "adir-71"],
};

function parseChronologicalAgeYears(chronologicalAge: string): number | null {
  const trimmed = chronologicalAge.trim();
  if (!trimmed) return null;

  const match = /^(\d+)/.exec(trimmed);
  if (!match) return null;

  const years = Number.parseInt(match[1], 10);
  if (Number.isNaN(years)) return null;

  return years;
}

function resolveA2Questions(
  _answers: Record<string, number>,
  context: AdirDomainScoringContext,
): string[] {
  const questionIds = ["adir-49", "adir-62", "adir-63"];
  const ageYears = parseChronologicalAgeYears(context.chronologicalAge);

  if (ageYears !== null && ageYears < 10) {
    questionIds.push("adir-64");
  }

  if (ageYears !== null && ageYears >= 10) {
    questionIds.push("adir-65");
  }

  return questionIds;
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
  A2: resolveA2Questions,
  C2: (answers) => resolveC2Questions(answers),
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
  questionIds: string[],
  answers: Record<string, number>,
): string {
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
    const questionIds = resolveAdirDomainQuestionIds(key, answers, context);
    scores[key] = sumAnsweredQuestions(questionIds, answers);
  }

  return scores;
}

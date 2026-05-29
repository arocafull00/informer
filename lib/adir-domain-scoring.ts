import {
  ADIR_SCORE_KEYS,
  type AdirScoreKey,
  type AdirScores,
} from "@/lib/adir-scoring";

const LANGUAGE_LEVEL_QUESTION_ID = "adir-07";

type DomainQuestionResolver = (
  answers: Record<string, number>,
  context: AdirDomainScoringContext,
) => string[];

type AdirDomainScoringContext = {
  chronologicalAge: string;
};

const STATIC_DOMAIN_QUESTIONS: Partial<Record<AdirScoreKey, string[]>> = {
  A1: ["adir-25", "adir-26", "adir-31"],
  A3: ["adir-27", "adir-28"],
  A4: ["adir-08", "adir-29", "adir-30", "adir-32", "adir-32-2"],
  B1: ["adir-19", "adir-20", "adir-21"],
  B2Verbal: ["adir-11", "adir-12"],
  B3Verbal: ["adir-10", "adir-13", "adir-14", "adir-15"],
  B4: ["adir-23", "adir-24", "adir-34"],
  C1: ["adir-39", "adir-40"],
  C3: ["adir-47", "adir-47-2"],
  C4: ["adir-41", "adir-42"],
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
  const questionIds = ["adir-24", "adir-35", "adir-36"];
  const ageYears = parseChronologicalAgeYears(context.chronologicalAge);

  if (ageYears !== null && ageYears >= 10) {
    questionIds.push("adir-37");
  }

  return questionIds;
}

function resolveC2Questions(answers: Record<string, number>): string[] {
  const questionIds = ["adir-44", "adir-45"];
  const languageLevel = answers[LANGUAGE_LEVEL_QUESTION_ID];

  if (languageLevel === 0) {
    questionIds.push("adir-16");
  }

  return questionIds;
}

const DOMAIN_QUESTION_RESOLVERS: Partial<
  Record<AdirScoreKey, DomainQuestionResolver>
> = {
  A2: resolveA2Questions,
  C2: (answers) => resolveC2Questions(answers),
};

function resolveDomainQuestionIds(
  key: AdirScoreKey,
  answers: Record<string, number>,
  context: AdirDomainScoringContext,
): string[] {
  const resolver = DOMAIN_QUESTION_RESOLVERS[key];
  if (resolver) return resolver(answers, context);

  return STATIC_DOMAIN_QUESTIONS[key] ?? [];
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
    total += value;
  }

  return total;
}

export function computeAdirDomainScores(
  answers: Record<string, number>,
  context: AdirDomainScoringContext,
): AdirScores {
  const scores = {} as AdirScores;

  for (const key of ADIR_SCORE_KEYS) {
    const questionIds = resolveDomainQuestionIds(key, answers, context);
    scores[key] = sumAnsweredQuestions(questionIds, answers);
  }

  return scores;
}

export function getAnswerScores(answers: Record<string, string>): number[] {
  return Object.keys(answers)
    .map(Number)
    .filter((score) => !Number.isNaN(score))
    .sort((a, b) => a - b);
}

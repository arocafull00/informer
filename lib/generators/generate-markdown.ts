import type { Question } from "@/lib/types";

export function generateMarkdown(
  questions: Question[],
  answers: Record<string, number>
): string {
  const sections: Record<string, Question[]> = {};

  questions.forEach((question) => {
    const key = `${question.sectionNumber}. ${question.section}`;
    if (!sections[key]) {
      sections[key] = [];
    }
    sections[key].push(question);
  });

  const lines: string[] = ["**RESUMEN DE LOS ÍTEMS CODIFICADOS**", ""];

  Object.entries(sections).forEach(([, questionsInSection]) => {
    if (questionsInSection.length === 0) return;

    const bullets: string[] = [];

    questionsInSection.forEach((question) => {
      const score = answers[question.id];
      if (score === undefined) return;
      const answerText = question.answers[score.toString()];
      if (!answerText) return;
      bullets.push(`- ${answerText}`);
    });

    if (bullets.length === 0) return;

    const first = questionsInSection[0];
    lines.push(`${first.sectionNumber}. ${first.section}`);
    lines.push("");
    lines.push(...bullets);
    lines.push("");
  });

  return lines.join("\n").trim();
}
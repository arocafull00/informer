import { ados2SectionHeading } from "@/lib/ados2-labels";
import type { Question } from "@/lib/types";

const REPORT_TITLE = "**RESUMEN DE LOS ÍTEMS CODIFICADOS**";

type SectionGroup = {
  sectionNumber: number;
  section: string;
  questions: Question[];
};

function groupBySection(questions: Question[]): SectionGroup[] {
  const map = new Map<string, SectionGroup>();

  questions.forEach((question) => {
    const existing = map.get(question.section);
    if (existing) {
      existing.questions.push(question);
      return;
    }
    map.set(question.section, {
      sectionNumber: question.sectionNumber,
      section: question.section,
      questions: [question],
    });
  });

  return [...map.values()].sort((a, b) => a.sectionNumber - b.sectionNumber);
}

function collectAnswerLines(
  questionsInSection: Question[],
  answers: Record<string, number>,
  bullet: string
): string[] {
  const lines: string[] = [];

  questionsInSection.forEach((question) => {
    const score = answers[question.id];
    if (score === undefined) return;
    const answerText = question.answers[score.toString()];
    if (!answerText) return;
    lines.push(`${bullet} ${answerText}`);
  });

  return lines;
}

function generateAdirMarkdown(
  questions: Question[],
  answers: Record<string, number>
): string {
  const lines: string[] = [REPORT_TITLE, ""];

  groupBySection(questions).forEach(({ section, questions: inSection }) => {
    const bullets = collectAnswerLines(inSection, answers, "*");
    if (bullets.length === 0) return;

    lines.push(section);
    lines.push("");
    lines.push(...bullets);
    lines.push("");
  });

  return lines.join("\n").trim();
}

function generateAdos2Markdown(
  questions: Question[],
  answers: Record<string, number>
): string {
  const lines: string[] = [REPORT_TITLE, ""];

  groupBySection(questions).forEach(
    ({ sectionNumber, section, questions: inSection }) => {
      const bullets = collectAnswerLines(inSection, answers, "-");
      if (bullets.length === 0) return;

      lines.push(`**${ados2SectionHeading(sectionNumber, section)}**`);
      lines.push("");
      lines.push(...bullets);
      lines.push("");
    }
  );

  return lines.join("\n").trim();
}

export function generateMarkdown(
  questions: Question[],
  answers: Record<string, number>
): string {
  if (questions.length === 0) return "";

  const test = questions[0].test;

  if (test === "ADIR") {
    return generateAdirMarkdown(questions, answers);
  }

  if (test === "ADOS2_ADULTO" || test === "ADOS2_NINO") {
    return generateAdos2Markdown(questions, answers);
  }

  return generateAdirMarkdown(questions, answers);
}

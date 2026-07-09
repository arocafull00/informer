import ados2AdultoData from "@/data/ados2-adulto.json";
import ados2NinoData from "@/data/ados2-nino.json";
import { generateMarkdown } from "@/lib/generators/generate-markdown";
import type { Question, TestType } from "@/lib/types";

const adultoQuestions = ados2AdultoData as unknown as Question[];
const ninoQuestions = ados2NinoData as unknown as Question[];

function buildCompleteAnswers(questions: Question[]) {
  const answers: Record<string, number> = {};

  for (const question of questions) {
    const keys = Object.keys(question.answers).map(Number);
    answers[question.id] = keys[Math.floor(Math.random() * keys.length)];
  }

  return answers;
}

export function seedAdos2LocalStorage() {
  const adultoAnswers = buildCompleteAnswers(adultoQuestions);
  const ninoAnswers = buildCompleteAnswers(ninoQuestions);
  const currentReport = {
    state: {
      currentTest: "ADOS2_NINO" satisfies TestType,
      answersByTest: {
        ADIR: {},
        ADOS2_ADULTO: adultoAnswers,
        ADOS2_NINO: ninoAnswers,
      },
      draftTitleByTest: {
        ADIR: undefined,
        ADOS2_ADULTO: "ADOS-2 Adulto · demo",
        ADOS2_NINO: "ADOS-2 Niño · demo",
      },
    },
    version: 1,
  };

  const now = new Date().toISOString();
  const history = {
    state: {
      reports: [
        {
          id: "seed-ados2-adulto",
          createdAt: now,
          test: "ADOS2_ADULTO" satisfies TestType,
          answers: adultoAnswers,
          markdown: generateMarkdown(adultoQuestions, adultoAnswers),
          title: "ADOS-2 Adulto · demo",
        },
        {
          id: "seed-ados2-nino",
          createdAt: now,
          test: "ADOS2_NINO" satisfies TestType,
          answers: ninoAnswers,
          markdown: generateMarkdown(ninoQuestions, ninoAnswers),
          title: "ADOS-2 Niño · demo",
        },
      ],
    },
    version: 0,
  };

  localStorage.setItem("informer-current-report", JSON.stringify(currentReport));
  localStorage.setItem("informer-history", JSON.stringify(history));
}

"use client";

import { useMemo } from "react";
import {
  selectCurrentAnswers,
  useCurrentReportStore,
} from "@/store/use-current-report-store";
import {
  ados2ItemLabel,
  ados2SectionHeading,
  isAdos2Test,
} from "@/lib/ados2-labels";
import { testData, testLabels } from "@/lib/test-data";
import type { Question } from "@/lib/types";
import { QuestionCard } from "./question-card";

type SectionGroup = {
  sectionNumber: number;
  section: string;
  questions: Question[];
};

function groupBySection(questions: Question[]): SectionGroup[] {
  const map = new Map<string, SectionGroup>();

  questions.forEach((q) => {
    const existing = map.get(q.section);
    if (existing) {
      existing.questions.push(q);
      return;
    }
    map.set(q.section, {
      sectionNumber: q.sectionNumber,
      section: q.section,
      questions: [q],
    });
  });

  return [...map.values()].sort((a, b) => a.sectionNumber - b.sectionNumber);
}

export function QuestionList() {
  const currentTest = useCurrentReportStore((s) => s.currentTest);
  const answers = useCurrentReportStore(selectCurrentAnswers);

  const questions = useMemo(() => testData[currentTest], [currentTest]);
  const sections = useMemo(() => groupBySection(questions), [questions]);
  const isAdos2 = isAdos2Test(currentTest);

  return (
    <div className="space-y-stack-section pb-10">
      {sections.map(({ sectionNumber, section, questions: qs }) => {
        const answeredInSection = qs.filter(
          (q) => answers[q.id] !== undefined
        ).length;
        const totalInSection = qs.length;
        const progress =
          totalInSection > 0 ? (answeredInSection / totalInSection) * 100 : 0;

        const sectionTitle = isAdos2
          ? ados2SectionHeading(sectionNumber, section)
          : `${sectionNumber}. ${section}`;

        return (
          <section key={`${sectionNumber}-${section}`}>
            <header className="mb-6">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <span className="text-label-md uppercase tracking-wider text-primary">
                    {testLabels[currentTest]}
                  </span>
                  <h1 className="mt-1 text-headline-lg text-on-background">
                    {sectionTitle}
                  </h1>
                </div>
                <span className="text-mono-sm text-on-surface-variant">
                  Progreso: {answeredInSection} / {totalInSection}
                </span>
              </div>
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest"
                role="progressbar"
                aria-valuenow={answeredInSection}
                aria-valuemin={0}
                aria-valuemax={totalInSection}
                aria-label="Progreso de la sección"
              >
                <div
                  className="h-2 rounded-full bg-primary transition-[width] duration-200 ease-out-strong motion-reduce:transition-none"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </header>
            <div className="space-y-3">
              {qs.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  displayCode={
                    isAdos2
                      ? ados2ItemLabel(sectionNumber, question.code)
                      : undefined
                  }
                  showAnswerLabels={isAdos2}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

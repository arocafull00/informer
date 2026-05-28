"use client";

import { useMemo } from "react";
import { useCurrentReportStore } from "@/store/use-current-report-store";
import { QuestionCard } from "./question-card";
import adirData from "@/data/adir.json";
import ados2Data from "@/data/ados2.json";
import type { Question, TestType } from "@/lib/types";

const testData: Record<TestType, Question[]> = {
  ADIR: adirData as unknown as Question[],
  ADOS2: ados2Data as unknown as Question[],
};

const testLabels: Record<TestType, string> = {
  ADIR: "ADI-R",
  ADOS2: "ADOS-2",
};

export function QuestionList() {
  const { currentTest, answers } = useCurrentReportStore();

  const questions = useMemo(() => testData[currentTest], [currentTest]);

  const grouped = useMemo(() => {
    const groups: Record<string, Question[]> = {};
    questions.forEach((q) => {
      const key = `${q.sectionNumber}. ${q.section}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(q);
    });
    return groups;
  }, [questions]);

  return (
    <div className="space-y-stack-section pb-10">
      {Object.entries(grouped).map(([, qs]) => {
        const first = qs[0];
        const answeredInSection = qs.filter((q) => answers[q.id] !== undefined).length;
        const totalInSection = qs.length;
        const progress =
          totalInSection > 0 ? (answeredInSection / totalInSection) * 100 : 0;

        return (
          <section key={`${first.sectionNumber}-${first.section}`}>
            <header className="mb-6">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <span className="text-label-md uppercase tracking-wider text-primary">
                    {testLabels[currentTest]}
                  </span>
                  <h1 className="mt-1 text-headline-lg text-on-background">
                    {first.sectionNumber}. {first.section}
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
                  className="h-2 rounded-full bg-primary transition-[width] duration-200 ease-out motion-reduce:transition-none"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </header>
            <div className="space-y-3">
              {qs.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

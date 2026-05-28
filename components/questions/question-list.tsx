"use client";

import { useCurrentReportStore } from "@/store/use-current-report-store";
import { QuestionRow } from "./question-row";
import adirData from "@/data/adir.json";
import ados2Data from "@/data/ados2.json";
import type { Question, TestType } from "@/lib/types";
import { useMemo } from "react";

const testData: Record<TestType, Question[]> = {
  ADIR: adirData as unknown as Question[],
  ADOS2: ados2Data as unknown as Question[],
};

interface QuestionListProps {
  className?: string;
}

export function QuestionList({ className }: QuestionListProps) {
  const { currentTest } = useCurrentReportStore();

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
    <div className={`space-y-8 ${className || ""}`}>
      {Object.entries(grouped).map(([, qs]) => {
        const first = qs[0];
        return (
          <section key={first.section}>
            <h2 className="sticky top-0 z-10 -mx-1 mb-1 bg-background/95 px-1 py-2 text-base font-medium tracking-tight text-foreground backdrop-blur-sm">
              {first.sectionNumber}. {first.section}
            </h2>
            <div className="divide-y divide-border">
              {qs.map((question) => (
                <QuestionRow key={question.id} question={question} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

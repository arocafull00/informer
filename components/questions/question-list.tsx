"use client";

import { useCurrentReportStore } from "@/store/use-current-report-store";
import { QuestionRow } from "./question-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className={`space-y-6 ${className || ""}`}>
      {Object.entries(grouped).map(([, qs]) => {
        const first = qs[0];
        return (
          <Card key={first.section}>
            <CardHeader>
              <CardTitle className="text-base">
                {first.sectionNumber}. {first.section}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {qs.map((question) => (
                <QuestionRow key={question.id} question={question} />
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
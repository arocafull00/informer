"use client";

import { useMemo } from "react";
import { useCurrentReportStore } from "@/store/use-current-report-store";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Question, TestType } from "@/lib/types";
import adirData from "@/data/adir.json";
import ados2Data from "@/data/ados2.json";

const testData: Record<TestType, Question[]> = {
  ADIR: adirData as unknown as Question[],
  ADOS2: ados2Data as unknown as Question[],
};

export function Topbar() {
  const { currentTest, answers, setCurrentTest } = useCurrentReportStore();

  const { answered, total } = useMemo(() => {
    const questions = testData[currentTest];
    const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length;
    return { answered: answeredCount, total: questions.length };
  }, [currentTest, answers]);

  const progress = total > 0 ? (answered / total) * 100 : 0;

  return (
    <div className="border-b border-border bg-background px-6 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={currentTest}
          onValueChange={(value) => setCurrentTest(value as TestType)}
        >
          <TabsList variant="line" className="h-9 w-fit">
            <TabsTrigger value="ADIR" className="px-3">
              ADI-R
            </TabsTrigger>
            <TabsTrigger value="ADOS2" className="px-3">
              ADOS-2
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex min-w-[140px] flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs text-muted-foreground">Progreso</span>
            <span className="text-xs font-medium tabular-nums text-foreground">
              {answered} / {total}
            </span>
          </div>
          <div
            className="h-1 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={answered}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-label="Preguntas respondidas"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out motion-reduce:transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

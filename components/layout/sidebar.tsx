"use client";

import { useReportHistoryStore } from "@/store/use-report-history-store";
import { useCurrentReportStore } from "@/store/use-current-report-store";
import { generateMarkdown } from "@/lib/generators/generate-markdown";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HistoryItem } from "@/components/history/history-item";
import adirData from "@/data/adir.json";
import ados2Data from "@/data/ados2.json";
import type { Question, TestType } from "@/lib/types";
import { useMemo } from "react";

const testData: Record<TestType, Question[]> = {
  ADIR: adirData as unknown as Question[],
  ADOS2: ados2Data as unknown as Question[],
};

export function Sidebar() {
  const { reports, saveReport, restoreReport, deleteReport } = useReportHistoryStore();
  const { currentTest, answers } = useCurrentReportStore();

  const markdown = useMemo(() => {
    const data = testData[currentTest];
    return generateMarkdown(data, answers);
  }, [currentTest, answers]);

  const handleSave = () => {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    saveReport({
      id,
      createdAt,
      test: currentTest,
      answers: { ...answers },
      markdown,
    });
  };

  const handleRestore = (id: string) => {
    restoreReport(id, useCurrentReportStore.getState().setAnswer, useCurrentReportStore.getState().setCurrentTest);
  };

  const hasAnswers = Object.keys(answers).length > 0;

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex-1 overflow-hidden">
        <div className="px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">Histórico</h2>
        </div>
        <Separator className="mb-3" />
        <ScrollArea className="h-[calc(100vh-200px)] px-4">
          <div className="space-y-3">
            {reports.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No hay informes guardados
              </p>
            ) : (
              reports.map((report) => (
                <HistoryItem
                  key={report.id}
                  report={report}
                  onRestore={() => handleRestore(report.id)}
                  onDelete={() => deleteReport(report.id)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
      <div className="border-t p-4">
        <Button
          className="w-full"
          onClick={handleSave}
          disabled={!hasAnswers}
        >
          Guardar informe
        </Button>
      </div>
    </aside>
  );
}
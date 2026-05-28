"use client";

import { useReportHistoryStore } from "@/store/use-report-history-store";
import { useCurrentReportStore } from "@/store/use-current-report-store";
import { generateMarkdown } from "@/lib/generators/generate-markdown";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
        <span className="text-sm font-medium text-sidebar-foreground">Histórico</span>
        <span className="text-xs tabular-nums text-muted-foreground">{reports.length}</span>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="px-2 py-2">
          {reports.length === 0 ? (
            <div className="px-2 py-10">
              <p className="text-sm font-medium text-foreground">Sin informes</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Responde preguntas y guarda el informe para verlo aquí.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {reports.map((report) => (
                <HistoryItem
                  key={report.id}
                  report={report}
                  onRestore={() => handleRestore(report.id)}
                  onDelete={() => deleteReport(report.id)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t border-sidebar-border p-3">
        <Button
          className="w-full transition-colors duration-200"
          onClick={handleSave}
          disabled={!hasAnswers}
        >
          Guardar informe
        </Button>
      </div>
    </aside>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useReportHistoryStore } from "@/store/use-report-history-store";
import { useCurrentReportStore } from "@/store/use-current-report-store";
import { HistoryItem } from "@/components/history/history-item";
import { NewReportDialog } from "@/components/reports/new-report-dialog";
import { useSaveReport } from "@/lib/use-save-report";
import { testLabels } from "@/lib/test-data";

export function Sidebar() {
  const { reports, restoreReport, deleteReport, updateReportTitle } =
    useReportHistoryStore();
  const currentTest = useCurrentReportStore((s) => s.currentTest);
  const reset = useCurrentReportStore((s) => s.reset);
  const setDraftTitle = useCurrentReportStore((s) => s.setDraftTitle);
  const setPatientSex = useCurrentReportStore((s) => s.setPatientSex);
  const { createNewReport } = useSaveReport();
  const [newReportOpen, setNewReportOpen] = useState(false);

  const suggestedTitle = useMemo(() => {
    const date = new Date().toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
    });
    return `${testLabels[currentTest]} · ${date}`;
  }, [currentTest]);

  const handleRestore = (id: string) => {
    const report = reports.find((r) => r.id === id);
    restoreReport(
      id,
      useCurrentReportStore.getState().setCurrentTest,
      useCurrentReportStore.getState().replaceAnswersForTest
    );
    if (report?.title?.trim()) {
      setDraftTitle(report.title);
    } else {
      setDraftTitle("");
    }
    setPatientSex(report?.patientSex ?? "");
  };

  const handleNewReportConfirm = (title: string, patientSex: string) => {
    reset();
    setDraftTitle(title);
    setPatientSex(patientSex);
    createNewReport(title, patientSex);
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-outline-variant bg-surface-container-low py-3 px-3">
      <div className="mb-3 px-2">
        <h2 className="text-headline-md font-bold text-primary">Histórico</h2>
        <p className="text-body-md text-on-surface-variant">Informes recientes</p>
      </div>
      <button
        type="button"
        onClick={() => setNewReportOpen(true)}
        className="interactive-press mb-3 w-full rounded-lg bg-primary py-1.5 text-label-md text-on-primary hover:opacity-90"
      >
        Nuevo Informe
      </button>
      <div className="space-y-1">
        {reports.length === 0 ? (
          <p className="px-2 py-6 text-body-md text-on-surface-variant">
            Sin informes guardados.
          </p>
        ) : (
          reports.map((report) => (
            <HistoryItem
              key={report.id}
              report={report}
              onRestore={() => handleRestore(report.id)}
              onDelete={() => deleteReport(report.id)}
              onUpdateTitle={(title) => updateReportTitle(report.id, title)}
            />
          ))
        )}
      </div>
      <NewReportDialog
        open={newReportOpen}
        currentTest={currentTest}
        suggestedTitle={suggestedTitle}
        onClose={() => setNewReportOpen(false)}
        onConfirm={handleNewReportConfirm}
      />
    </aside>
  );
}

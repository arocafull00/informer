"use client";

import { useReportHistoryStore } from "@/store/use-report-history-store";
import { useCurrentReportStore } from "@/store/use-current-report-store";
import { HistoryItem } from "@/components/history/history-item";

export function Sidebar() {
  const { reports, restoreReport, deleteReport, updateReportTitle } =
    useReportHistoryStore();
  const reset = useCurrentReportStore((s) => s.reset);
  const setDraftTitle = useCurrentReportStore((s) => s.setDraftTitle);

  const handleRestore = (id: string) => {
    const report = reports.find((r) => r.id === id);
    restoreReport(
      id,
      useCurrentReportStore.getState().setAnswer,
      useCurrentReportStore.getState().setCurrentTest
    );
    if (report?.title?.trim()) {
      setDraftTitle(report.title);
      return;
    }
    setDraftTitle("");
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-outline-variant bg-surface-container-low py-3 px-3">
      <div className="mb-3 px-2">
        <h2 className="text-headline-md font-bold text-primary">Histórico</h2>
        <p className="text-body-md text-on-surface-variant">Informes recientes</p>
      </div>
      <button
        type="button"
        onClick={() => reset()}
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
    </aside>
  );
}

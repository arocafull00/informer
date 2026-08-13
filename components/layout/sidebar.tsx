"use client";

import { useState } from "react";
import { FilePlus, Sparkles } from "lucide-react";
import { HistoryItem } from "@/components/history/history-item";
import { NewReportDialog } from "@/components/reports/new-report-dialog";
import { RiasGenerateResultsDialog } from "@/components/rias/rias-generate-results-dialog";
import { useCreateNewReport } from "@/lib/use-save-report";
import type { TestType } from "@/lib/types";
import { useAdirResultsDraftStore } from "@/store/use-adir-results-draft-store";
import {
  selectCurrentReportId,
  useCurrentReportStore,
} from "@/store/use-current-report-store";
import { useReportHistoryStore } from "@/store/use-report-history-store";

export function Sidebar() {
  const { reports, deleteReport, updateReportTitle } = useReportHistoryStore();
  const currentReportId = useCurrentReportStore(selectCurrentReportId);
  const openReport = useCurrentReportStore((state) => state.openReport);
  const setDraftTitle = useCurrentReportStore((state) => state.setDraftTitle);
  const setCurrentReportId = useCurrentReportStore(
    (state) => state.setCurrentReportId
  );
  const resetAdirDraft = useAdirResultsDraftStore((state) => state.reset);
  const createNewReport = useCreateNewReport();
  const [newReportOpen, setNewReportOpen] = useState(false);
  const [riasDialogOpen, setRiasDialogOpen] = useState(false);

  const handleRestore = (id: string) => {
    const report = reports.find((item) => item.id === id);
    if (!report) return;
    openReport(report);
    resetAdirDraft();
  };

  const handleDelete = (id: string) => {
    if (currentReportId === id) {
      setCurrentReportId(undefined);
    }
    deleteReport(id);
  };

  const handleUpdateTitle = (id: string, title: string) => {
    updateReportTitle(id, title);
    if (currentReportId === id) {
      setDraftTitle(title);
    }
  };

  const handleNewReportConfirm = (
    test: TestType,
    title: string,
    patientSex: string
  ) => {
    createNewReport(test, title, patientSex);
    resetAdirDraft();
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-outline-variant bg-surface-container-low px-3 py-3">
      <div className="mb-3 px-2">
        <h2 className="text-headline-md font-bold text-primary">Histórico</h2>
        <p className="text-body-md text-on-surface-variant">
          Informes recientes
        </p>
      </div>

      <div className="mb-4 space-y-2">
        <button
          type="button"
          onClick={() => setNewReportOpen(true)}
          className="interactive-press flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-label-md text-on-primary hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <FilePlus className="size-4" aria-hidden="true" />
          Nuevo informe
        </button>
        <button
          type="button"
          onClick={() => setRiasDialogOpen(true)}
          className="interactive-press flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-label-md text-on-surface hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          Generar RIAS
        </button>
      </div>

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
              isActive={report.id === currentReportId}
              onRestore={() => handleRestore(report.id)}
              onDelete={() => handleDelete(report.id)}
              onUpdateTitle={(title) => handleUpdateTitle(report.id, title)}
            />
          ))
        )}
      </div>

      {newReportOpen ? (
        <NewReportDialog
          onClose={() => setNewReportOpen(false)}
          onConfirm={handleNewReportConfirm}
        />
      ) : null}
      <RiasGenerateResultsDialog
        open={riasDialogOpen}
        onClose={() => setRiasDialogOpen(false)}
      />
    </aside>
  );
}

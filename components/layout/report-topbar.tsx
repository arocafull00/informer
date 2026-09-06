"use client";

import { useMemo } from "react";
import { getReportLabel } from "@/lib/get-report-label";
import { testLabels } from "@/lib/test-data";
import {
  selectCurrentPatientName,
  selectCurrentReportId,
  useCurrentReportStore,
} from "@/store/use-current-report-store";
import { useReportHistoryStore } from "@/store/use-report-history-store";

export function ReportTopbar() {
  const currentReportId = useCurrentReportStore(selectCurrentReportId);
  const currentTest = useCurrentReportStore((state) => state.currentTest);
  const patientName = useCurrentReportStore(selectCurrentPatientName);
  const report = useReportHistoryStore((state) =>
    currentReportId
      ? state.reports.find((item) => item.id === currentReportId)
      : undefined
  );

  const title = useMemo(() => {
    if (!currentReportId) return null;
    const trimmedPatientName = patientName?.trim();
    if (trimmedPatientName) return trimmedPatientName;
    if (report) return getReportLabel(report);
    return testLabels[currentTest];
  }, [currentReportId, currentTest, patientName, report]);

  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-outline-variant bg-surface-container-lowest px-gutter-grid py-3">
      {title ? (
        <>
          <h1 className="min-w-0 truncate text-headline-md text-on-surface">
            {title}
          </h1>
          <span className="shrink-0 rounded-md bg-surface-container px-2 py-1 text-mono-sm font-medium text-primary">
            {testLabels[currentTest]}
          </span>
        </>
      ) : (
        <p className="text-body-md text-on-surface-variant">
          Sin informe seleccionado
        </p>
      )}
    </header>
  );
}

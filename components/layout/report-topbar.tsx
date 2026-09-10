"use client";

import { useMemo } from "react";
import { ReportCompletenessBadge } from "@/components/reports/report-completeness-badge";
import { getReportCompleteness } from "@/lib/get-report-completeness";
import { getReportLabel } from "@/lib/get-report-label";
import { testLabels } from "@/lib/test-data";
import {
  selectCurrentAnswers,
  selectCurrentCarasIdentification,
  selectCurrentCumanesIdentification,
  selectCurrentPatientName,
  selectCurrentPatientSex,
  selectCurrentReportId,
  selectCurrentRiasForm,
  selectCurrentStaiIdentification,
  useCurrentReportStore,
} from "@/store/use-current-report-store";
import { useReportHistoryStore } from "@/store/use-report-history-store";

export function ReportTopbar() {
  const currentReportId = useCurrentReportStore(selectCurrentReportId);
  const currentTest = useCurrentReportStore((state) => state.currentTest);
  const patientName = useCurrentReportStore(selectCurrentPatientName);
  const patientSex = useCurrentReportStore(selectCurrentPatientSex);
  const answers = useCurrentReportStore(selectCurrentAnswers);
  const cumanesIdentification = useCurrentReportStore(
    selectCurrentCumanesIdentification
  );
  const carasIdentification = useCurrentReportStore(
    selectCurrentCarasIdentification
  );
  const staiIdentification = useCurrentReportStore(
    selectCurrentStaiIdentification
  );
  const riasForm = useCurrentReportStore(selectCurrentRiasForm);
  const report = useReportHistoryStore((state) =>
    currentReportId
      ? state.reports.find((item) => item.id === currentReportId)
      : undefined
  );

  const completeness = useMemo(() => {
    if (!currentReportId) return null;
    return getReportCompleteness({
      id: currentReportId,
      createdAt: report?.createdAt ?? "",
      test: currentTest,
      answers,
      markdown: "",
      patientName,
      patientSex,
      cumanesIdentification,
      carasIdentification,
      staiIdentification,
      riasForm,
    });
  }, [
    answers,
    carasIdentification,
    currentReportId,
    currentTest,
    cumanesIdentification,
    patientName,
    patientSex,
    report?.createdAt,
    riasForm,
    staiIdentification,
  ]);

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
          {completeness ? (
            <ReportCompletenessBadge completeness={completeness} />
          ) : null}
        </>
      ) : (
        <p className="text-body-md text-on-surface-variant">
          Sin informe seleccionado
        </p>
      )}
    </header>
  );
}

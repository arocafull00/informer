"use client";

import { useMemo, useCallback, useEffect } from "react";
import {
  selectCurrentAnswers,
  selectCurrentCumanesIdentification,
  selectCurrentCumanesLaterality,
  selectCurrentPatientName,
  selectCurrentPatientSex,
  selectCurrentReportId,
  useCurrentReportStore,
} from "@/store/use-current-report-store";
import { useReportHistoryStore } from "@/store/use-report-history-store";
import { generateMarkdown } from "@/lib/generators/generate-markdown";
import { testData } from "@/lib/test-data";
import {
  EMPTY_CUMANES_IDENTIFICATION,
  EMPTY_CUMANES_LATERALITY,
} from "@/lib/cumanes-types";
import type { CreateReportInput, SavedReport } from "@/lib/types";

export function useReportMarkdown() {
  const currentTest = useCurrentReportStore((s) => s.currentTest);
  const answers = useCurrentReportStore(selectCurrentAnswers);
  const patientSex = useCurrentReportStore(selectCurrentPatientSex);

  return useMemo(() => {
    const data = testData[currentTest];
    return generateMarkdown(data, answers, patientSex);
  }, [currentTest, answers, patientSex]);
}

export function useAutoSaveReport() {
  const currentTest = useCurrentReportStore((s) => s.currentTest);
  const answers = useCurrentReportStore(selectCurrentAnswers);
  const patientName = useCurrentReportStore(selectCurrentPatientName);
  const patientSex = useCurrentReportStore(selectCurrentPatientSex);
  const cumanesIdentification = useCurrentReportStore(
    selectCurrentCumanesIdentification
  );
  const cumanesLaterality = useCurrentReportStore(
    selectCurrentCumanesLaterality
  );
  const currentReportId = useCurrentReportStore(selectCurrentReportId);
  const saveReport = useReportHistoryStore((s) => s.saveReport);

  const markdown = useReportMarkdown();

  useEffect(() => {
    if (!currentReportId) return;

    const existingReport = useReportHistoryStore
      .getState()
      .reports.find((r) => r.id === currentReportId);
    if (!existingReport) return;

    const trimmedPatientName = patientName?.trim();
    const {
      patientName: previousPatientName,
      patientSex: previousPatientSex,
      cumanesIdentification: previousCumanesIdentification,
      cumanesLaterality: previousCumanesLaterality,
      ...reportBase
    } = existingReport;
    void previousPatientName;
    void previousPatientSex;
    void previousCumanesIdentification;
    void previousCumanesLaterality;

    saveReport({
      ...reportBase,
      test: currentTest,
      answers: { ...answers },
      markdown,
      ...(trimmedPatientName ? { patientName: trimmedPatientName } : {}),
      ...(patientSex ? { patientSex } : {}),
      ...(currentTest === "CUMANES"
        ? {
            cumanesIdentification: { ...cumanesIdentification },
            cumanesLaterality: { ...cumanesLaterality },
          }
        : {}),
    });
  }, [
    currentReportId,
    currentTest,
    answers,
    markdown,
    patientName,
    patientSex,
    cumanesIdentification,
    cumanesLaterality,
    saveReport,
  ]);
}

export function useCreateNewReport() {
  const openReport = useCurrentReportStore((s) => s.openReport);
  const saveReport = useReportHistoryStore((s) => s.saveReport);

  return useCallback(
    ({
      test,
      patientName,
      patientSex,
      cumanesIdentification,
    }: CreateReportInput) => {
      const trimmedPatientName = patientName?.trim();
      const data = testData[test];
      const emptyAnswers: Record<string, number> = {};
      const report: SavedReport = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        test,
        answers: emptyAnswers,
        markdown: generateMarkdown(data, emptyAnswers, patientSex ?? ""),
        ...(trimmedPatientName ? { patientName: trimmedPatientName } : {}),
        ...(patientSex ? { patientSex } : {}),
        ...(test === "CUMANES"
          ? {
              cumanesIdentification: {
                ...EMPTY_CUMANES_IDENTIFICATION,
                ...cumanesIdentification,
              },
              cumanesLaterality: { ...EMPTY_CUMANES_LATERALITY },
            }
          : {}),
      };

      saveReport(report);
      openReport(report);
    },
    [openReport, saveReport]
  );
}

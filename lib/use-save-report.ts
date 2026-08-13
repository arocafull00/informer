"use client";

import { useMemo, useCallback, useEffect } from "react";
import {
  selectCurrentAnswers,
  selectCurrentDraftTitle,
  selectCurrentPatientSex,
  selectCurrentReportId,
  useCurrentReportStore,
} from "@/store/use-current-report-store";
import { useReportHistoryStore } from "@/store/use-report-history-store";
import { generateMarkdown } from "@/lib/generators/generate-markdown";
import { testData } from "@/lib/test-data";
import type { SavedReport, TestType } from "@/lib/types";

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
  const draftTitle = useCurrentReportStore(selectCurrentDraftTitle);
  const patientSex = useCurrentReportStore(selectCurrentPatientSex);
  const currentReportId = useCurrentReportStore(selectCurrentReportId);
  const saveReport = useReportHistoryStore((s) => s.saveReport);

  const markdown = useReportMarkdown();

  useEffect(() => {
    if (!currentReportId) return;

    const existingReport = useReportHistoryStore
      .getState()
      .reports.find((r) => r.id === currentReportId);
    if (!existingReport) return;

    const trimmedTitle = draftTitle?.trim();
    saveReport({
      id: existingReport.id,
      createdAt: existingReport.createdAt,
      test: currentTest,
      answers: { ...answers },
      markdown,
      ...(trimmedTitle
        ? { title: trimmedTitle }
        : existingReport.title
          ? { title: existingReport.title }
          : {}),
      ...(patientSex ? { patientSex } : {}),
    });
  }, [
    currentReportId,
    currentTest,
    answers,
    markdown,
    draftTitle,
    patientSex,
    saveReport,
  ]);
}

export function useCreateNewReport() {
  const openReport = useCurrentReportStore((s) => s.openReport);
  const saveReport = useReportHistoryStore((s) => s.saveReport);

  return useCallback(
    (test: TestType, title: string, patientSex: string) => {
      const trimmed = title.trim();
      const data = testData[test];
      const emptyAnswers: Record<string, number> = {};
      const report: SavedReport = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        test,
        answers: emptyAnswers,
        markdown: generateMarkdown(data, emptyAnswers, patientSex),
        ...(trimmed ? { title: trimmed } : {}),
        ...(patientSex ? { patientSex } : {}),
      };

      saveReport(report);
      openReport(report);
    },
    [openReport, saveReport]
  );
}

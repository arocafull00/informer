"use client";

import { useMemo, useCallback } from "react";
import {
  selectCurrentAnswers,
  selectCurrentDraftTitle,
  selectCurrentPatientSex,
  selectCurrentReportId,
  useCurrentReportStore,
} from "@/store/use-current-report-store";
import { useReportHistoryStore } from "@/store/use-report-history-store";
import { generateMarkdown } from "@/lib/generators/generate-markdown";
import { testData, testLabels } from "@/lib/test-data";

export function useSaveReport() {
  const currentTest = useCurrentReportStore((s) => s.currentTest);
  const answers = useCurrentReportStore(selectCurrentAnswers);
  const draftTitle = useCurrentReportStore(selectCurrentDraftTitle);
  const patientSex = useCurrentReportStore(selectCurrentPatientSex);
  const currentReportId = useCurrentReportStore(selectCurrentReportId);
  const setDraftTitle = useCurrentReportStore((s) => s.setDraftTitle);
  const setCurrentReportId = useCurrentReportStore((s) => s.setCurrentReportId);
  const saveReport = useReportHistoryStore((s) => s.saveReport);
  const reports = useReportHistoryStore((s) => s.reports);

  const markdown = useMemo(() => {
    const data = testData[currentTest];
    return generateMarkdown(data, answers, patientSex);
  }, [currentTest, answers, patientSex]);

  const hasAnswers = Object.keys(answers).length > 0;

  const suggestedTitle = useMemo(() => {
    const date = new Date().toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
    });
    return `${testLabels[currentTest]} · ${date}`;
  }, [currentTest]);

  const saveWithTitle = useCallback(
    (title: string) => {
      if (!hasAnswers) return;
      const trimmed = title.trim();
      if (trimmed) {
        setDraftTitle(trimmed);
      }
      const existingReport = currentReportId
        ? reports.find((r) => r.id === currentReportId)
        : undefined;
      const id = existingReport?.id ?? crypto.randomUUID();
      saveReport({
        id,
        createdAt: existingReport?.createdAt ?? new Date().toISOString(),
        test: currentTest,
        answers: { ...answers },
        markdown,
        ...(trimmed ? { title: trimmed } : {}),
        ...(patientSex ? { patientSex } : {}),
      });
      if (!existingReport) {
        setCurrentReportId(id);
      }
    },
    [
      hasAnswers,
      setDraftTitle,
      currentReportId,
      reports,
      saveReport,
      setCurrentReportId,
      currentTest,
      answers,
      markdown,
      patientSex,
    ]
  );

  const trySave = useCallback(() => {
    if (!hasAnswers) return false;
    const trimmed = draftTitle?.trim();
    if (!trimmed) return false;
    saveWithTitle(trimmed);
    return true;
  }, [hasAnswers, draftTitle, saveWithTitle]);

  const createNewReport = useCallback(
    (title: string, patientSex: string) => {
      const trimmed = title.trim();
      const data = testData[currentTest];
      const emptyAnswers: Record<string, number> = {};
      const id = crypto.randomUUID();

      saveReport({
        id,
        createdAt: new Date().toISOString(),
        test: currentTest,
        answers: emptyAnswers,
        markdown: generateMarkdown(data, emptyAnswers, patientSex),
        ...(trimmed ? { title: trimmed } : {}),
        ...(patientSex ? { patientSex } : {}),
      });
      setCurrentReportId(id);
    },
    [currentTest, saveReport, setCurrentReportId]
  );

  return {
    trySave,
    saveWithTitle,
    createNewReport,
    hasAnswers,
    markdown,
    suggestedTitle,
    setDraftTitle,
  };
}

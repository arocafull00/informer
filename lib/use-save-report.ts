"use client";

import { useMemo, useCallback } from "react";
import { useCurrentReportStore } from "@/store/use-current-report-store";
import { useReportHistoryStore } from "@/store/use-report-history-store";
import { generateMarkdown } from "@/lib/generators/generate-markdown";
import adirData from "@/data/adir.json";
import ados2Data from "@/data/ados2.json";
import type { Question, TestType } from "@/lib/types";

const testData: Record<TestType, Question[]> = {
  ADIR: adirData as unknown as Question[],
  ADOS2: ados2Data as unknown as Question[],
};

const testLabels: Record<TestType, string> = {
  ADIR: "ADI-R",
  ADOS2: "ADOS-2",
};

export function useSaveReport() {
  const { currentTest, answers, draftTitle, setDraftTitle } =
    useCurrentReportStore();
  const saveReport = useReportHistoryStore((s) => s.saveReport);

  const markdown = useMemo(() => {
    const data = testData[currentTest];
    return generateMarkdown(data, answers);
  }, [currentTest, answers]);

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
      saveReport({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        test: currentTest,
        answers: { ...answers },
        markdown,
        ...(trimmed ? { title: trimmed } : {}),
      });
    },
    [
      hasAnswers,
      setDraftTitle,
      saveReport,
      currentTest,
      answers,
      markdown,
    ]
  );

  const trySave = useCallback(() => {
    if (!hasAnswers) return false;
    const trimmed = draftTitle?.trim();
    if (!trimmed) return false;
    saveWithTitle(trimmed);
    return true;
  }, [hasAnswers, draftTitle, saveWithTitle]);

  return {
    trySave,
    saveWithTitle,
    hasAnswers,
    markdown,
    suggestedTitle,
    setDraftTitle,
  };
}

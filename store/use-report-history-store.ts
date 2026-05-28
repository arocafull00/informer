import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SavedReport, TestType } from "@/lib/types";

type ReportHistoryStore = {
  reports: SavedReport[];
  saveReport: (report: SavedReport) => void;
  restoreReport: (
    id: string,
    setAnswer: (questionId: string, value: number) => void,
    setCurrentTest: (test: TestType) => void
  ) => void;
  deleteReport: (id: string) => void;
  updateReportTitle: (id: string, title: string) => void;
};

export const useReportHistoryStore = create<ReportHistoryStore>()(
  persist(
    (set, get) => ({
      reports: [],
      saveReport: (report) =>
        set((state) => ({
          reports: [report, ...state.reports],
        })),
      restoreReport: (id, setAnswer, setCurrentTest) => {
        const report = get().reports.find((r) => r.id === id);
        if (!report) return;
        setCurrentTest(report.test);
        Object.entries(report.answers).forEach(([questionId, value]) => {
          setAnswer(questionId, value);
        });
      },
      deleteReport: (id) =>
        set((state) => ({
          reports: state.reports.filter((r) => r.id !== id),
        })),
      updateReportTitle: (id, title) =>
        set((state) => ({
          reports: state.reports.map((report) => {
            if (report.id !== id) return report;
            const trimmed = title.trim();
            if (!trimmed) {
              const { title: _, ...rest } = report;
              return rest;
            }
            return { ...report, title: trimmed };
          }),
        })),
    }),
    {
      name: "informer-history",
    }
  )
);
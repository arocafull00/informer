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
    }),
    {
      name: "informer-history",
    }
  )
);
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SavedReport } from "@/lib/types";

type ReportHistoryStore = {
  reports: SavedReport[];
  saveReport: (report: SavedReport) => void;
  deleteReport: (id: string) => void;
  updateReportTitle: (id: string, title: string) => void;
};

export const useReportHistoryStore = create<ReportHistoryStore>()(
  persist(
    (set) => ({
      reports: [],
      saveReport: (report) =>
        set((state) => {
          const existingIndex = state.reports.findIndex((r) => r.id === report.id);
          if (existingIndex === -1) {
            return { reports: [report, ...state.reports] };
          }
          const reports = [...state.reports];
          reports[existingIndex] = report;
          return { reports };
        }),
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
              const { title: removedTitle, ...rest } = report;
              void removedTitle;
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

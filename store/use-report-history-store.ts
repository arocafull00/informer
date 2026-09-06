import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SavedReport } from "@/lib/types";

type ReportHistoryStore = {
  reports: SavedReport[];
  saveReport: (report: SavedReport) => void;
  deleteReport: (id: string) => void;
  updatePatientName: (id: string, patientName: string) => void;
};

type LegacySavedReport = SavedReport & { title?: string };

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
      updatePatientName: (id, patientName) =>
        set((state) => ({
          reports: state.reports.map((report) => {
            if (report.id !== id) return report;
            const trimmed = patientName.trim();
            if (!trimmed) {
              const { patientName: removedPatientName, ...rest } = report;
              void removedPatientName;
              return rest;
            }
            return { ...report, patientName: trimmed };
          }),
        })),
    }),
    {
      name: "informer-history",
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as { reports?: LegacySavedReport[] };
        return {
          reports: (state.reports ?? []).map((report) => {
            const { title, ...currentReport } = report;
            const patientName = report.patientName?.trim() || title?.trim();
            return {
              ...currentReport,
              ...(patientName ? { patientName } : {}),
            };
          }),
        };
      },
    }
  )
);

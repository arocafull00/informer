import { create } from "zustand";
import { persist } from "zustand/middleware";
import { arrayMove } from "@dnd-kit/helpers";
import type { ReportGroup, SavedReport } from "@/lib/types";

export type GroupMutationResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

type ReportHistoryStore = {
  reports: SavedReport[];
  groups: ReportGroup[];
  saveReport: (report: SavedReport) => void;
  deleteReport: (id: string) => void;
  updatePatientName: (id: string, patientName: string) => void;
  createGroup: (name: string) => GroupMutationResult;
  renameGroup: (id: string, name: string) => GroupMutationResult;
  deleteGroup: (id: string) => void;
  toggleGroup: (id: string) => void;
  moveGroup: (id: string, targetIndex: number) => void;
  moveReport: (
    reportId: string,
    targetGroupId: string | null,
    targetIndex: number
  ) => void;
};

type LegacySavedReport = SavedReport & { title?: string };

type PersistedHistoryState = {
  reports?: LegacySavedReport[];
  groups?: ReportGroup[];
};

function normalizeGroupName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function validateGroupName(
  groups: ReportGroup[],
  name: string,
  ignoredId?: string
): { name: string; error?: string } {
  const normalizedName = normalizeGroupName(name);
  if (!normalizedName) {
    return { name: normalizedName, error: "Escribe un nombre para el paciente." };
  }

  const duplicate = groups.some(
    (group) =>
      group.id !== ignoredId &&
      normalizeGroupName(group.name).localeCompare(normalizedName, "es", {
        sensitivity: "base",
      }) === 0
  );

  return duplicate
    ? { name: normalizedName, error: "Ya existe un paciente con ese nombre." }
    : { name: normalizedName };
}

function matchesGroup(report: SavedReport, groupId: string | null) {
  return groupId === null ? !report.groupId : report.groupId === groupId;
}

function withGroup(report: SavedReport, groupId: string | null): SavedReport {
  if (groupId) return { ...report, groupId };
  const { groupId: removedGroupId, ...ungroupedReport } = report;
  void removedGroupId;
  return ungroupedReport;
}

export const useReportHistoryStore = create<ReportHistoryStore>()(
  persist(
    (set) => ({
      reports: [],
      groups: [],
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
      createGroup: (name) => {
        let result: GroupMutationResult = {
          ok: false,
          error: "No se pudo crear el paciente.",
        };
        set((state) => {
          const validated = validateGroupName(state.groups, name);
          if (validated.error) {
            result = { ok: false, error: validated.error };
            return state;
          }

          const id = crypto.randomUUID();
          result = { ok: true, id };
          return {
            groups: [
              ...state.groups,
              { id, name: validated.name, collapsed: false },
            ],
          };
        });
        return result;
      },
      renameGroup: (id, name) => {
        let result: GroupMutationResult = {
          ok: false,
          error: "No se encontró el paciente.",
        };
        set((state) => {
          if (!state.groups.some((group) => group.id === id)) return state;
          const validated = validateGroupName(state.groups, name, id);
          if (validated.error) {
            result = { ok: false, error: validated.error };
            return state;
          }

          result = { ok: true, id };
          return {
            groups: state.groups.map((group) =>
              group.id === id ? { ...group, name: validated.name } : group
            ),
          };
        });
        return result;
      },
      deleteGroup: (id) =>
        set((state) => {
          const reportsOutsideGroup = state.reports.filter(
            (report) => report.groupId !== id
          );
          const reportsFromGroup = state.reports
            .filter((report) => report.groupId === id)
            .map((report) => withGroup(report, null));
          return {
            groups: state.groups.filter((group) => group.id !== id),
            reports: [...reportsOutsideGroup, ...reportsFromGroup],
          };
        }),
      toggleGroup: (id) =>
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === id
              ? { ...group, collapsed: !group.collapsed }
              : group
          ),
        })),
      moveGroup: (id, targetIndex) =>
        set((state) => {
          const currentIndex = state.groups.findIndex((group) => group.id === id);
          if (currentIndex === -1) return state;
          const nextIndex = Math.max(
            0,
            Math.min(targetIndex, state.groups.length - 1)
          );
          return { groups: arrayMove(state.groups, currentIndex, nextIndex) };
        }),
      moveReport: (reportId, targetGroupId, targetIndex) =>
        set((state) => {
          if (
            targetGroupId !== null &&
            !state.groups.some((group) => group.id === targetGroupId)
          ) {
            return state;
          }

          const report = state.reports.find((item) => item.id === reportId);
          if (!report) return state;
          const movedReport = withGroup(report, targetGroupId);
          const reports = state.reports.filter((item) => item.id !== reportId);
          const targetReports = reports.filter((item) =>
            matchesGroup(item, targetGroupId)
          );
          const nextIndex = Math.max(
            0,
            Math.min(targetIndex, targetReports.length)
          );

          if (targetReports.length === 0) {
            return { reports: [...reports, movedReport] };
          }

          if (nextIndex === targetReports.length) {
            const lastTargetId = targetReports[targetReports.length - 1].id;
            const insertionIndex =
              reports.findIndex((item) => item.id === lastTargetId) + 1;
            reports.splice(insertionIndex, 0, movedReport);
            return { reports };
          }

          const nextTargetId = targetReports[nextIndex].id;
          const insertionIndex = reports.findIndex(
            (item) => item.id === nextTargetId
          );
          reports.splice(insertionIndex, 0, movedReport);
          return { reports };
        }),
    }),
    {
      name: "informer-history",
      version: 2,
      migrate: (persistedState) => {
        const state = (persistedState ?? {}) as PersistedHistoryState;
        const groupIds = new Set((state.groups ?? []).map((group) => group.id));
        return {
          reports: (state.reports ?? []).map((report) => {
            const { title, groupId, ...currentReport } = report;
            const patientName = report.patientName?.trim() || title?.trim();
            return {
              ...currentReport,
              ...(groupId && groupIds.has(groupId) ? { groupId } : {}),
              ...(patientName ? { patientName } : {}),
            };
          }),
          groups: state.groups ?? [],
        };
      },
    }
  )
);

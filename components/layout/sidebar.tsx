"use client";

import { useMemo, useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import {
  Accessibility,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/dom";
import { isSortable } from "@dnd-kit/react/sortable";
import { FilePlus, FolderPlus, Sparkles } from "lucide-react";
import { DeleteGroupDialog } from "@/components/history/delete-group-dialog";
import { GroupNameDialog } from "@/components/history/group-name-dialog";
import { HistoryGroup } from "@/components/history/history-group";
import {
  REPORTS_GROUP_PREFIX,
  UNGROUPED_KEY,
} from "@/components/history/history-item";
import { NewReportDialog } from "@/components/reports/new-report-dialog";
import { RiasGenerateResultsDialog } from "@/components/rias/rias-generate-results-dialog";
import { useCreateNewReport } from "@/lib/use-save-report";
import type { CreateReportInput, ReportGroup } from "@/lib/types";
import { useAdirResultsDraftStore } from "@/store/use-adir-results-draft-store";
import {
  selectCurrentReportId,
  useCurrentReportStore,
} from "@/store/use-current-report-store";
import { useReportHistoryStore } from "@/store/use-report-history-store";

function getEntityLabel(entity: { id: PropertyKey; data?: Record<string, unknown> }) {
  const label = entity.data?.label;
  return typeof label === "string" ? label : String(entity.id);
}

const spanishAccessibility = Accessibility.configure({
  screenReaderInstructions: {
    draggable:
      "Para seleccionar un elemento, pulsa Espacio o Intro. Muévelo con las flechas, vuelve a pulsar Espacio o Intro para soltarlo y Escape para cancelar.",
  },
  announcements: {
    dragstart({ operation: { source } }: DragStartEvent) {
      if (!source) return;
      return `Has seleccionado ${getEntityLabel(source)}.`;
    },
    dragover({ operation: { source, target } }: DragOverEvent) {
      if (!source || !target) return;
      return `${getEntityLabel(source)} está sobre ${getEntityLabel(target)}.`;
    },
    dragend({ canceled, operation: { source, target } }: DragEndEvent) {
      if (!source) return;
      if (canceled) return `Se ha cancelado el movimiento de ${getEntityLabel(source)}.`;
      if (!target) return `${getEntityLabel(source)} no se ha movido.`;
      return `${getEntityLabel(source)} se ha colocado en ${getEntityLabel(target)}.`;
    },
  },
});

function getGroupIdFromSortableKey(value: PropertyKey | undefined) {
  if (value === undefined) return undefined;
  const key = String(value);
  if (!key.startsWith(REPORTS_GROUP_PREFIX)) return undefined;
  const groupKey = key.slice(REPORTS_GROUP_PREFIX.length);
  return groupKey === UNGROUPED_KEY ? null : groupKey;
}

export function Sidebar() {
  const {
    reports,
    groups,
    deleteReport,
    updatePatientName,
    createGroup,
    renameGroup,
    deleteGroup,
    toggleGroup,
    moveGroup,
    moveReport,
  } = useReportHistoryStore();
  const currentReportId = useCurrentReportStore(selectCurrentReportId);
  const openReport = useCurrentReportStore((state) => state.openReport);
  const setPatientName = useCurrentReportStore((state) => state.setPatientName);
  const setCurrentReportId = useCurrentReportStore(
    (state) => state.setCurrentReportId
  );
  const resetAdirDraft = useAdirResultsDraftStore((state) => state.reset);
  const createNewReport = useCreateNewReport();
  const [newReportOpen, setNewReportOpen] = useState(false);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ReportGroup | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<{
    group: ReportGroup;
    reportCount: number;
  } | null>(null);
  const [riasDialogOpen, setRiasDialogOpen] = useState(false);

  const ungroupedReports = useMemo(
    () => reports.filter((report) => !report.groupId),
    [reports]
  );
  const reportsByGroup = useMemo(() => {
    const grouped = new Map<string, typeof reports>();
    for (const group of groups) grouped.set(group.id, []);
    for (const report of reports) {
      if (!report.groupId) continue;
      grouped.get(report.groupId)?.push(report);
    }
    return grouped;
  }, [groups, reports]);

  const handleRestore = (id: string) => {
    const report = reports.find((item) => item.id === id);
    if (!report) return;
    openReport(report);
    resetAdirDraft();
  };

  const handleDelete = (id: string) => {
    if (currentReportId === id) setCurrentReportId(undefined);
    deleteReport(id);
  };

  const handleUpdatePatientName = (id: string, patientName: string) => {
    updatePatientName(id, patientName);
    if (currentReportId === id) setPatientName(patientName);
  };

  const handleNewReportConfirm = (input: CreateReportInput) => {
    createNewReport(input);
    resetAdirDraft();
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-outline-variant bg-surface-container-low px-3 py-3">
      <div className="mb-3 px-2">
        <h2 className="text-headline-md font-bold text-primary">Histórico</h2>
        <p className="text-body-md text-on-surface-variant">
          Tests de pacientes
        </p>
      </div>

      <div className="mb-4 space-y-2">
        <button
          type="button"
          onClick={() => setNewReportOpen(true)}
          className="interactive-press flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-label-md text-on-primary hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <FilePlus className="size-4" aria-hidden="true" />
          Nuevo informe
        </button>
        <button
          type="button"
          onClick={() => setGroupDialogOpen(true)}
          className="interactive-press flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-label-md text-on-surface hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <FolderPlus className="size-4" aria-hidden="true" />
          Nuevo paciente
        </button>
        <button
          type="button"
          onClick={() => setRiasDialogOpen(true)}
          className="interactive-press flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-label-md text-on-surface hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          Generar RIAS
        </button>
      </div>

      <DragDropProvider
        plugins={(defaults) =>
          defaults.map((plugin) =>
            plugin === Accessibility ? spanishAccessibility : plugin
          )
        }
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDragEnd={(event) => {
          if (event.canceled) return;
          const { source, target } = event.operation;
          if (!source) return;

          if (source.type === "group" && isSortable(source)) {
            const groupId = String(source.id).replace(/^group:/, "");
            const targetIndex =
              target?.type === "group" && isSortable(target)
                ? target.index
                : source.index;
            moveGroup(groupId, targetIndex);
            return;
          }

          if (source.type !== "report") return;
          const reportId = String(source.id).replace(/^report:/, "");
          const targetData = target?.data;
          if (target?.type === "report-zone") {
            const rawGroupId = targetData?.groupId;
            const targetGroupId =
              typeof rawGroupId === "string" ? rawGroupId : null;
            const targetLength =
              targetGroupId === null
                ? ungroupedReports.length
                : (reportsByGroup.get(targetGroupId)?.length ?? 0);
            moveReport(reportId, targetGroupId, targetLength);
            return;
          }

          if (target?.type === "report" && isSortable(target)) {
            const targetGroupId = getGroupIdFromSortableKey(target.group);
            if (targetGroupId !== undefined) {
              moveReport(reportId, targetGroupId, target.index);
            }
          }
        }}
      >
        <div className="space-y-2 pb-3">
          <HistoryGroup
            group={null}
            groupIndex={-1}
            groupCount={groups.length}
            groups={groups}
            reports={ungroupedReports}
            currentReportId={currentReportId}
            onRestoreReport={handleRestore}
            onDeleteReport={handleDelete}
            onUpdatePatientName={handleUpdatePatientName}
            onMoveReport={moveReport}
            onToggleGroup={toggleGroup}
            onEditGroup={setEditingGroup}
            onDeleteGroup={(group, reportCount) =>
              setGroupToDelete({ group, reportCount })
            }
            onMoveGroup={moveGroup}
          />

          {groups.map((group, groupIndex) => (
            <HistoryGroup
              key={group.id}
              group={group}
              groupIndex={groupIndex}
              groupCount={groups.length}
              groups={groups}
              reports={reportsByGroup.get(group.id) ?? []}
              currentReportId={currentReportId}
              onRestoreReport={handleRestore}
              onDeleteReport={handleDelete}
              onUpdatePatientName={handleUpdatePatientName}
              onMoveReport={moveReport}
              onToggleGroup={toggleGroup}
              onEditGroup={setEditingGroup}
              onDeleteGroup={(nextGroup, reportCount) =>
                setGroupToDelete({ group: nextGroup, reportCount })
              }
              onMoveGroup={moveGroup}
            />
          ))}
        </div>
      </DragDropProvider>

      {newReportOpen ? (
        <NewReportDialog
          onClose={() => setNewReportOpen(false)}
          onConfirm={handleNewReportConfirm}
        />
      ) : null}
      {groupDialogOpen ? (
        <GroupNameDialog
          open
          onClose={() => setGroupDialogOpen(false)}
          onSubmit={createGroup}
        />
      ) : null}
      {editingGroup ? (
        <GroupNameDialog
          key={editingGroup.id}
          open
          initialName={editingGroup.name}
          onClose={() => setEditingGroup(null)}
          onSubmit={(name) => renameGroup(editingGroup.id, name)}
        />
      ) : null}
      <DeleteGroupDialog
        groupName={groupToDelete?.group.name ?? null}
        reportCount={groupToDelete?.reportCount ?? 0}
        onClose={() => setGroupToDelete(null)}
        onConfirm={() => {
          if (groupToDelete) deleteGroup(groupToDelete.group.id);
          setGroupToDelete(null);
        }}
      />
      <RiasGenerateResultsDialog
        open={riasDialogOpen}
        onClose={() => setRiasDialogOpen(false)}
      />
    </aside>
  );
}

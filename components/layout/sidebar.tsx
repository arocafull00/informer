"use client";

import { useId, useMemo, useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import {
  Accessibility,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/dom";
import { isSortable } from "@dnd-kit/react/sortable";
import {
  ChevronDown,
  FilePlus,
  FolderPlus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { DeleteGroupDialog } from "@/components/history/delete-group-dialog";
import { GroupNameDialog } from "@/components/history/group-name-dialog";
import { HistoryGroup } from "@/components/history/history-group";
import {
  REPORTS_GROUP_PREFIX,
  UNGROUPED_KEY,
} from "@/components/history/history-item";
import { NewReportDialog } from "@/components/reports/new-report-dialog";
import { Input } from "@/components/ui/input";
import { testLabels } from "@/lib/test-data";
import { useCreateNewReport } from "@/lib/use-save-report";
import type { CreateReportInput, ReportGroup, TestType } from "@/lib/types";
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

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersId = useId();
  const [search, setSearch] = useState("");
  const [modifiedWithin, setModifiedWithin] = useState("all");
  const [testFilter, setTestFilter] = useState<TestType | "all">("all");
  const [groupToDelete, setGroupToDelete] = useState<{
    group: ReportGroup;
    reportCount: number;
  } | null>(null);

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

  const query = normalizeSearch(search.trim());
  const activeFilterCount =
    Number(Boolean(query)) +
    Number(modifiedWithin !== "all") +
    Number(testFilter !== "all");
  const filtersActive = activeFilterCount > 0;
  const filteredReports = useMemo(() => {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    if (modifiedWithin !== "all") {
      since.setDate(since.getDate() - (Number(modifiedWithin) - 1));
    }
    const groupNames = new Map(
      groups.map((group) => [group.id, normalizeSearch(group.name)])
    );
    return reports.filter((report) => {
      if (testFilter !== "all" && report.test !== testFilter) return false;
      if (
        modifiedWithin !== "all" &&
        !(new Date(report.updatedAt ?? report.createdAt).getTime() >= since.getTime())
      ) {
        return false;
      }
      return (
        !query ||
        normalizeSearch(report.patientName ?? "").includes(query) ||
        (groupNames.get(report.groupId ?? "") ?? "").includes(query)
      );
    });
  }, [groups, reports, query, modifiedWithin, testFilter]);
  const visibleUngroupedReports = filteredReports.filter((report) => !report.groupId);
  const visibleReportsByGroup = new Map<string, typeof reports>();
  for (const report of filteredReports) {
    if (!report.groupId) continue;
    const groupReports = visibleReportsByGroup.get(report.groupId) ?? [];
    groupReports.push(report);
    visibleReportsByGroup.set(report.groupId, groupReports);
  }
  const visibleGroups = groups.filter(
    (group) =>
      !filtersActive ||
      visibleReportsByGroup.has(group.id) ||
      (modifiedWithin === "all" &&
        testFilter === "all" &&
        normalizeSearch(group.name).includes(query))
  );
  const showUngrouped = !filtersActive || visibleUngroupedReports.length > 0;

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
    <aside className="flex h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-outline-variant bg-surface-container-low px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
          Nuevo test
        </button>
        <button
          type="button"
          onClick={() => setGroupDialogOpen(true)}
          className="interactive-press flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-label-md text-on-surface hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <FolderPlus className="size-4" aria-hidden="true" />
          Nuevo paciente
        </button>
      </div>

      <div className="t-acc mb-4 shrink-0" data-open={filtersOpen}>
        <button
          type="button"
          aria-expanded={filtersOpen}
          aria-controls={filtersId}
          onClick={() => setFiltersOpen((open) => !open)}
          className="t-acc-head interactive-press flex min-h-9 w-full items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-label-md text-on-surface hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filtros
          {filtersActive ? (
            <span className="rounded-full bg-surface-container-high px-1.5 text-mono-sm text-on-surface-variant">
              {activeFilterCount} {activeFilterCount === 1 ? "activo" : "activos"}
            </span>
          ) : null}
          <span className="t-acc-chevron ml-auto">
            <ChevronDown className="size-4" aria-hidden="true" />
          </span>
        </button>
        <div
          id={filtersId}
          className="t-acc-panel"
          inert={!filtersOpen}
          aria-hidden={!filtersOpen}
        >
          <div className="t-acc-panel-inner">
            <div
              className="space-y-3 px-0.5 pb-1 pt-3"
              role="search"
              aria-label="Filtrar pacientes"
            >
              <label className="block space-y-1 text-label-md text-on-surface-variant">
                <span>Buscar paciente</span>
                <span className="relative block">
                  <Search
                    className="pointer-events-none absolute left-2.5 top-2 size-4"
                    aria-hidden="true"
                  />
                  <Input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Nombre del paciente…"
                    className="bg-surface-container-lowest pl-8"
                  />
                </span>
              </label>
              <label className="block space-y-1 text-label-md text-on-surface-variant">
                <span>Última modificación</span>
                <select
                  value={modifiedWithin}
                  onChange={(event) => setModifiedWithin(event.target.value)}
                  className="h-8 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-2 text-body-md text-on-surface outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30"
                >
                  <option value="all">Cualquier fecha</option>
                  <option value="1">Hoy</option>
                  <option value="7">Últimos 7 días</option>
                  <option value="30">Últimos 30 días</option>
                </select>
              </label>
              <label className="block space-y-1 text-label-md text-on-surface-variant">
                <span>Tipo de test</span>
                <select
                  value={testFilter}
                  onChange={(event) =>
                    setTestFilter(event.target.value as TestType | "all")
                  }
                  className="h-8 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-2 text-body-md text-on-surface outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30"
                >
                  <option value="all">Todos los tests</option>
                  {Object.entries(testLabels).map(([test, label]) => (
                    <option key={test} value={test}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              {filtersActive ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setModifiedWithin("all");
                    setTestFilter("all");
                  }}
                  className="btn-raised interactive-press min-h-8 w-full rounded-lg px-3 py-1.5 text-label-md text-on-primary hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Limpiar filtros
                </button>
              ) : null}
            </div>
          </div>
        </div>
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
          if (event.canceled || filtersActive) return;
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
          {!showUngrouped && visibleGroups.length === 0 ? (
            <p role="status" className="px-2 py-3 text-body-md text-on-surface-variant">
              No hay coincidencias. Prueba con otro nombre o cambia los filtros.
            </p>
          ) : null}
          {showUngrouped ? (
            <HistoryGroup
              group={null}
              groupIndex={-1}
              groupCount={groups.length}
              groups={groups}
              reports={visibleUngroupedReports}
              filtering={filtersActive}
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
          ) : null}

          {visibleGroups.map((group) => (
            <HistoryGroup
              key={group.id}
              group={group}
              groupIndex={groups.indexOf(group)}
              groupCount={groups.length}
              groups={groups}
              reports={visibleReportsByGroup.get(group.id) ?? []}
              filtering={filtersActive}
              currentReportId={currentReportId}
              onRestoreReport={handleRestore}
              onDeleteReport={handleDelete}
              onUpdatePatientName={handleUpdatePatientName}
              onMoveReport={moveReport}
              onToggleGroup={toggleGroup}
              onEditGroup={setEditingGroup}
              onDeleteGroup={(nextGroup, reportCount) =>
                setGroupToDelete({
                  group: nextGroup,
                  reportCount:
                    reportsByGroup.get(nextGroup.id)?.length ?? reportCount,
                })
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
    </aside>
  );
}

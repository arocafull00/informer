"use client";

import { useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Folder,
  FolderOpen,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { HistoryItem, UNGROUPED_KEY } from "@/components/history/history-item";
import { cn } from "@/lib/utils";
import type { ReportGroup, SavedReport } from "@/lib/types";

type HistoryGroupProps = {
  group: ReportGroup | null;
  groupIndex: number;
  groupCount: number;
  groups: ReportGroup[];
  reports: SavedReport[];
  currentReportId?: string;
  onRestoreReport: (id: string) => void;
  onDeleteReport: (id: string) => void;
  onUpdatePatientName: (id: string, patientName: string) => void;
  onMoveReport: (
    reportId: string,
    groupId: string | null,
    targetIndex: number
  ) => void;
  onToggleGroup: (id: string) => void;
  onEditGroup: (group: ReportGroup) => void;
  onDeleteGroup: (group: ReportGroup, reportCount: number) => void;
  onMoveGroup: (id: string, targetIndex: number) => void;
};

type GroupContentProps = HistoryGroupProps & {
  sortableRef?: (element: Element | null) => void;
  handleRef?: (element: Element | null) => void;
  isDragging?: boolean;
  isGroupDropTarget?: boolean;
};

function HistoryGroupContent({
  group,
  groupIndex,
  groupCount,
  groups,
  reports,
  currentReportId,
  sortableRef,
  handleRef,
  isDragging = false,
  isGroupDropTarget = false,
  onRestoreReport,
  onDeleteReport,
  onUpdatePatientName,
  onMoveReport,
  onToggleGroup,
  onEditGroup,
  onDeleteGroup,
  onMoveGroup,
}: GroupContentProps) {
  const groupId = group?.id ?? null;
  const groupKey = group?.id ?? UNGROUPED_KEY;
  const collapsed = group?.collapsed ?? false;
  const { ref: reportZoneRef, isDropTarget: isReportDropTarget } = useDroppable({
    id: `report-zone:${groupKey}`,
    type: "report-zone",
    accept: "report",
    data: {
      entityType: "report-zone",
      groupId,
      label: group?.name ?? "Sin grupo",
    },
  });

  return (
    <section
      ref={sortableRef}
      className={cn(
        "rounded-xl transition-[background-color,border-color,opacity] motion-reduce:transition-none",
        isDragging && "z-20 opacity-70",
        isGroupDropTarget && !isDragging && "bg-surface-container"
      )}
      aria-label={group?.name ?? "Sin grupo"}
    >
      <div
        ref={reportZoneRef}
        data-report-zone={groupKey}
        className={cn(
          "rounded-xl border border-transparent p-1 transition-[background-color,border-color] motion-reduce:transition-none",
          isReportDropTarget && "border-primary/60 bg-surface-container"
        )}
      >
        <div className="flex min-h-9 items-center gap-1 rounded-lg px-1 text-on-surface">
          {group ? (
            <button
              ref={handleRef}
              type="button"
              className="interactive-press flex size-7 shrink-0 touch-none items-center justify-center rounded text-outline hover:bg-surface-container-high hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Arrastrar grupo ${group.name}`}
            >
              <GripVertical className="size-4" aria-hidden="true" />
            </button>
          ) : (
            <span className="flex size-7 shrink-0 items-center justify-center text-outline">
              <FolderOpen className="size-[18px]" aria-hidden="true" />
            </span>
          )}

          {group ? (
            <button
              type="button"
              onClick={() => onToggleGroup(group.id)}
              className="flex min-w-0 flex-1 items-center gap-1.5 rounded py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-expanded={!collapsed}
            >
              {collapsed ? (
                <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
              ) : (
                <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
              )}
              {collapsed ? (
                <Folder className="size-[18px] shrink-0 text-primary" aria-hidden="true" />
              ) : (
                <FolderOpen
                  className="size-[18px] shrink-0 text-primary"
                  aria-hidden="true"
                />
              )}
              <span className="truncate text-label-md font-semibold">
                {group.name}
              </span>
              <span className="ml-auto shrink-0 rounded-full bg-surface-container-high px-1.5 py-0.5 text-mono-sm text-on-surface-variant">
                {reports.length}
              </span>
            </button>
          ) : (
            <div className="flex min-w-0 flex-1 items-center gap-2 py-1">
              <span className="truncate text-label-md font-semibold">Sin grupo</span>
              <span className="ml-auto shrink-0 rounded-full bg-surface-container-high px-1.5 py-0.5 text-mono-sm text-on-surface-variant">
                {reports.length}
              </span>
            </div>
          )}

          {group ? (
            <details className="relative shrink-0">
              <summary
                className="interactive-press flex size-7 list-none items-center justify-center rounded text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden"
                aria-label={`Acciones del grupo ${group.name}`}
              >
                <MoreHorizontal className="size-[18px]" aria-hidden="true" />
              </summary>
              <div className="absolute right-0 z-50 mt-1 w-44 space-y-1 rounded-lg border border-outline-variant bg-surface-container-lowest p-1.5 text-on-surface shadow-level-1">
                <button
                  type="button"
                  disabled={groupIndex === 0}
                  onClick={() => onMoveGroup(group.id, groupIndex - 1)}
                  className="flex min-h-8 w-full items-center gap-2 rounded px-2 text-left text-label-md hover:bg-surface-container-high disabled:opacity-40"
                >
                  <ChevronUp className="size-4" aria-hidden="true" />
                  Subir grupo
                </button>
                <button
                  type="button"
                  disabled={groupIndex === groupCount - 1}
                  onClick={() => onMoveGroup(group.id, groupIndex + 1)}
                  className="flex min-h-8 w-full items-center gap-2 rounded px-2 text-left text-label-md hover:bg-surface-container-high disabled:opacity-40"
                >
                  <ChevronDown className="size-4" aria-hidden="true" />
                  Bajar grupo
                </button>
                <button
                  type="button"
                  onClick={() => onEditGroup(group)}
                  className="flex min-h-8 w-full items-center gap-2 rounded border-t border-outline-variant px-2 pt-1 text-left text-label-md hover:bg-surface-container-high"
                >
                  <Pencil className="size-4" aria-hidden="true" />
                  Cambiar nombre
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteGroup(group, reports.length)}
                  className="flex min-h-8 w-full items-center gap-2 rounded px-2 text-left text-label-md text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Eliminar grupo
                </button>
              </div>
            </details>
          ) : null}
        </div>

        {!collapsed ? (
          <div className="space-y-1">
            {reports.length > 0 ? (
              reports.map((report, index) => (
                <HistoryItem
                  key={report.id}
                  report={report}
                  groups={groups}
                  index={index}
                  isActive={report.id === currentReportId}
                  isFirst={index === 0}
                  isLast={index === reports.length - 1}
                  onRestore={() => onRestoreReport(report.id)}
                  onDelete={() => onDeleteReport(report.id)}
                  onUpdatePatientName={(patientName) =>
                    onUpdatePatientName(report.id, patientName)
                  }
                  onMove={(targetGroupId, targetIndex) =>
                    onMoveReport(report.id, targetGroupId, targetIndex)
                  }
                />
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-outline-variant px-2 py-3 text-center text-mono-sm text-on-surface-variant">
                Arrastra aquí un informe
              </p>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SortableHistoryGroup(props: HistoryGroupProps & { group: ReportGroup }) {
  const { group, groupIndex } = props;
  const { ref, handleRef, isDragging, isDropTarget } = useSortable({
    id: `group:${group.id}`,
    index: groupIndex,
    group: "history-groups",
    type: "group",
    accept: "group",
    data: {
      entityType: "group",
      groupId: group.id,
      label: `grupo ${group.name}`,
    },
  });

  return (
    <HistoryGroupContent
      {...props}
      sortableRef={ref}
      handleRef={handleRef}
      isDragging={isDragging}
      isGroupDropTarget={isDropTarget}
    />
  );
}

export function HistoryGroup(props: HistoryGroupProps) {
  if (props.group) {
    return <SortableHistoryGroup {...props} group={props.group} />;
  }
  return <HistoryGroupContent {...props} />;
}

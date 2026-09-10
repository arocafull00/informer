"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { HistoryItemLabel } from "./history-item-label";
import { ReportCompletenessBadge } from "@/components/reports/report-completeness-badge";
import { getReportCompleteness } from "@/lib/get-report-completeness";
import { getReportLabel } from "@/lib/get-report-label";
import { testLabels } from "@/lib/test-data";
import { cn } from "@/lib/utils";
import type { ReportGroup, SavedReport } from "@/lib/types";

export const UNGROUPED_KEY = "ungrouped";
export const REPORTS_GROUP_PREFIX = "reports:";

export function getReportsGroupKey(groupId: string | null) {
  return `${REPORTS_GROUP_PREFIX}${groupId ?? UNGROUPED_KEY}`;
}

interface HistoryItemProps {
  report: SavedReport;
  groups: ReportGroup[];
  index: number;
  isActive: boolean;
  isFirst: boolean;
  isLast: boolean;
  onRestore: () => void;
  onDelete: () => void;
  onUpdatePatientName: (patientName: string) => void;
  onMove: (groupId: string | null, targetIndex: number) => void;
}

export function HistoryItem({
  report,
  groups,
  index,
  isActive,
  isFirst,
  isLast,
  onRestore,
  onDelete,
  onUpdatePatientName,
  onMove,
}: HistoryItemProps) {
  const [editing, setEditing] = useState(false);
  const label = getReportLabel(report);
  const completeness = getReportCompleteness(report);
  const groupId = report.groupId ?? null;
  const { ref, handleRef, isDragging, isDropTarget } = useSortable({
    id: `report:${report.id}`,
    index,
    group: getReportsGroupKey(groupId),
    type: "report",
    accept: "report",
    data: {
      entityType: "report",
      reportId: report.id,
      groupId,
      label: `informe ${label}`,
    },
  });

  return (
    <div
      ref={ref}
      className={cn(
        "group relative flex items-center rounded-lg border py-1.5 pr-1 transition-[background-color,color,border-color,box-shadow,opacity] duration-150 ease-out-strong motion-reduce:transition-none",
        isActive
          ? "border-primary bg-surface-container-lowest text-primary shadow-level-1"
          : "border-transparent hover:bg-surface-container-high",
        isDropTarget && !isDragging && "border-primary/60 bg-surface-container",
        isDragging && "z-30 opacity-70 shadow-level-1"
      )}
    >
      <button
        ref={handleRef}
        type="button"
        className="interactive-press flex size-7 shrink-0 touch-none items-center justify-center rounded text-outline hover:bg-surface-container-highest hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Arrastrar ${label}`}
      >
        <GripVertical className="size-4" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={onRestore}
        disabled={editing}
        className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-left disabled:pointer-events-none"
      >
        <FileText
          className={cn(
            "size-[18px] shrink-0",
            isActive ? "text-primary" : "text-outline"
          )}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "mb-0.5 flex items-center gap-1 truncate text-mono-sm font-medium",
              isActive ? "text-primary" : "text-on-surface-variant"
            )}
          >
            <span className="truncate">{testLabels[report.test]}</span>
            <ReportCompletenessBadge completeness={completeness} compact />
          </span>
          <HistoryItemLabel
            label={label}
            isActive={isActive}
            editing={editing}
            onStartEdit={() => setEditing(true)}
            onStopEdit={() => setEditing(false)}
            onSave={onUpdatePatientName}
          />
        </span>
      </button>

      <details className="relative shrink-0">
        <summary
          className="interactive-press flex size-7 list-none items-center justify-center rounded text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden"
          aria-label={`Acciones de ${label}`}
        >
          <MoreHorizontal className="size-[18px]" aria-hidden="true" />
        </summary>
        <div className="absolute right-0 z-40 mt-1 w-48 space-y-1 rounded-lg border border-outline-variant bg-surface-container-lowest p-1.5 text-on-surface shadow-level-1">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => onMove(groupId, index - 1)}
            className="flex min-h-8 w-full items-center gap-2 rounded px-2 text-left text-label-md hover:bg-surface-container-high disabled:opacity-40"
          >
            <ChevronUp className="size-4" aria-hidden="true" />
            Subir
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={() => onMove(groupId, index + 1)}
            className="flex min-h-8 w-full items-center gap-2 rounded px-2 text-left text-label-md hover:bg-surface-container-high disabled:opacity-40"
          >
            <ChevronDown className="size-4" aria-hidden="true" />
            Bajar
          </button>
          <label className="block border-t border-outline-variant px-2 pt-2 text-mono-sm text-on-surface-variant">
            Mover a
            <select
              value={groupId ?? ""}
              onChange={(event) =>
                onMove(event.target.value || null, Number.MAX_SAFE_INTEGER)
              }
              className="mt-1 h-8 w-full rounded border border-outline-variant bg-surface-container-lowest px-2 text-body-md text-on-surface outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              <option value="">Sin paciente</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex min-h-8 w-full items-center gap-2 rounded border-t border-outline-variant px-2 pt-1 text-left text-label-md hover:bg-surface-container-high"
          >
            <Pencil className="size-4" aria-hidden="true" />
            Cambiar paciente
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex min-h-8 w-full items-center gap-2 rounded px-2 text-left text-label-md text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Eliminar informe
          </button>
        </div>
      </details>
    </div>
  );
}

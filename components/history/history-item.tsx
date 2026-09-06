"use client";

import { useState } from "react";
import { FileText, Pencil, Trash2 } from "lucide-react";
import { getReportLabel } from "@/lib/get-report-label";
import { testLabels } from "@/lib/test-data";
import { cn } from "@/lib/utils";
import type { SavedReport } from "@/lib/types";
import { HistoryItemLabel } from "./history-item-label";

interface HistoryItemProps {
  report: SavedReport;
  isActive: boolean;
  onRestore: () => void;
  onDelete: () => void;
  onUpdatePatientName: (patientName: string) => void;
}

export function HistoryItem({
  report,
  isActive,
  onRestore,
  onDelete,
  onUpdatePatientName,
}: HistoryItemProps) {
  const [editing, setEditing] = useState(false);
  const label = getReportLabel(report);

  return (
    <div
      className={cn(
        "group flex items-center justify-between rounded-lg border px-2 py-1.5 transition-[background-color,color,border-color,box-shadow] duration-150 ease-out-strong",
        isActive
          ? "border-primary bg-surface-container-lowest text-primary shadow-level-1"
          : "border-transparent hover:bg-surface-container-high"
      )}
    >
      <button
        type="button"
        onClick={onRestore}
        disabled={editing}
        className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-left disabled:pointer-events-none"
      >
        <FileText
          className={cn(
            "size-5 shrink-0",
            isActive ? "text-primary" : "text-outline"
          )}
        />
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "mb-0.5 block truncate text-mono-sm font-medium",
              isActive ? "text-primary" : "text-on-surface-variant"
            )}
          >
            {testLabels[report.test]}
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
      <div className="hover-reveal flex shrink-0 items-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setEditing(true);
          }}
          className="interactive-press rounded p-1 text-on-surface-variant hover:text-on-surface"
          aria-label="Editar nombre del paciente"
        >
          <Pencil className="size-[18px]" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="interactive-press rounded p-1 text-on-surface-variant hover:text-destructive"
          aria-label="Eliminar informe"
        >
          <Trash2 className="size-[18px]" />
        </button>
      </div>
    </div>
  );
}

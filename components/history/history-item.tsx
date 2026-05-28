"use client";

import { useState } from "react";
import { FileText, Pencil, Trash2 } from "lucide-react";
import { getReportLabel } from "@/lib/get-report-label";
import type { SavedReport } from "@/lib/types";
import { HistoryItemLabel } from "./history-item-label";

interface HistoryItemProps {
  report: SavedReport;
  onRestore: () => void;
  onDelete: () => void;
  onUpdateTitle: (title: string) => void;
}

export function HistoryItem({
  report,
  onRestore,
  onDelete,
  onUpdateTitle,
}: HistoryItemProps) {
  const [editing, setEditing] = useState(false);
  const label = getReportLabel(report);

  return (
    <div className="group flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-container-high">
      <button
        type="button"
        onClick={onRestore}
        disabled={editing}
        className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-left disabled:pointer-events-none"
      >
        <FileText className="size-5 shrink-0 text-outline" />
        <HistoryItemLabel
          label={label}
          editing={editing}
          onStartEdit={() => setEditing(true)}
          onStopEdit={() => setEditing(false)}
          onSave={onUpdateTitle}
        />
      </button>
      <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setEditing(true);
          }}
          className="p-1 text-on-surface-variant hover:text-on-surface"
          aria-label="Editar título"
        >
          <Pencil className="size-[18px]" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 text-on-surface-variant hover:text-destructive"
          aria-label="Eliminar informe"
        >
          <Trash2 className="size-[18px]" />
        </button>
      </div>
    </div>
  );
}

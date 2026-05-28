"use client";

import type { SavedReport } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HistoryItemProps {
  report: SavedReport;
  onRestore: () => void;
  onDelete: () => void;
}

export function HistoryItem({ report, onRestore, onDelete }: HistoryItemProps) {
  const date = new Date(report.createdAt);
  const formattedDate = date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const preview = report.markdown.split("\n").slice(0, 3).join(" ");

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <Badge variant="secondary">{report.test}</Badge>
        <span className="text-xs text-muted-foreground">
          {formattedDate} {formattedTime}
        </span>
      </div>
      <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
        {preview || "Sin contenido"}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 transition-transform active:scale-[0.97]"
          onClick={onRestore}
        >
          Restaurar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="transition-transform active:scale-[0.97]"
          onClick={onDelete}
        >
          Eliminar
        </Button>
      </div>
    </div>
  );
}
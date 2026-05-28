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
    <div className="group rounded-md px-2 py-2 transition-colors duration-200 hover:bg-sidebar-accent">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <Badge variant="secondary" className="h-5 px-1.5 text-[0.65rem] font-medium">
          {report.test}
        </Badge>
        <span className="shrink-0 text-[0.65rem] tabular-nums text-muted-foreground">
          {formattedDate} {formattedTime}
        </span>
      </div>
      <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {preview || "Sin contenido"}
      </p>
      <div className="flex gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:duration-200 sm:group-hover:opacity-100">
        <Button
          variant="ghost"
          size="xs"
          className="h-7 flex-1 transition-colors duration-200 active:scale-[0.98]"
          onClick={onRestore}
        >
          Restaurar
        </Button>
        <Button
          variant="ghost"
          size="xs"
          className="h-7 text-muted-foreground transition-colors duration-200 hover:text-destructive active:scale-[0.98]"
          onClick={onDelete}
        >
          Eliminar
        </Button>
      </div>
    </div>
  );
}

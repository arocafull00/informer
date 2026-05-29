import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PdfCoordinateEntry, PdfFieldType } from "@/lib/pdf/export-fields";

type PdfCoordinateEntryRowProps = {
  entry: PdfCoordinateEntry;
  onNameChange: (id: string, name: string) => void;
  onTypeChange: (id: string, type: PdfFieldType) => void;
  onDelete: (id: string) => void;
};

function formatCoords(entry: PdfCoordinateEntry): string {
  if (entry.type === "text" && entry.width && entry.height) {
    return `x:${entry.x} y:${entry.y} w:${entry.width} h:${entry.height}`;
  }

  if (entry.type === "check") {
    return `x:${entry.x} y:${entry.y} r:${entry.radius ?? 6}`;
  }

  return `x:${entry.x} y:${entry.y}`;
}

export function PdfCoordinateEntryRow({
  entry,
  onNameChange,
  onTypeChange,
  onDelete,
}: PdfCoordinateEntryRowProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-outline-variant bg-surface p-3">
      <div className="flex items-start gap-2">
        <Input
          value={entry.name}
          onChange={(event) => onNameChange(entry.id, event.target.value)}
          placeholder="field.name"
          className="flex-1"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(entry.id)}
          aria-label="Eliminar punto"
        >
          <Trash2 />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={entry.type}
          onChange={(event) =>
            onTypeChange(entry.id, event.target.value as PdfFieldType)
          }
          className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="point">point</option>
          <option value="text">text</option>
          <option value="check">check</option>
        </select>
        <span className="font-mono text-xs text-muted-foreground">
          {formatCoords(entry)}
        </span>
      </div>
    </div>
  );
}

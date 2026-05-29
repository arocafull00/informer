"use client";

import { useCallback, useMemo, useState } from "react";

import { PdfCoordinateEntryRow } from "@/components/pdf/pdf-coordinate-entry";
import {
  PdfCoordinateHoverReadout,
  PdfCoordinatePicker,
} from "@/components/pdf/pdf-coordinate-picker";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { normalizePdfRect, type PdfPoint } from "@/lib/pdf/coordinates";
import {
  buildFieldMapExport,
  type PdfCoordinateEntry,
  type PdfFieldType,
  type PdfPickerMode,
} from "@/lib/pdf/export-fields";
import {
  PDF_TEMPLATES,
  type PdfTemplate,
  type PdfTemplateId,
} from "@/lib/pdf/templates";

function createEntryId(): string {
  return crypto.randomUUID();
}

function createPointEntry(
  point: PdfPoint,
  type: PdfFieldType,
  index: number,
): PdfCoordinateEntry {
  return {
    id: createEntryId(),
    name: `field_${index + 1}`,
    type,
    x: point.x,
    y: point.y,
    radius: type === "check" ? 6 : undefined,
  };
}

function createRectEntry(
  first: PdfPoint,
  second: PdfPoint,
  index: number,
): PdfCoordinateEntry {
  const rect = normalizePdfRect(first, second);
  return {
    id: createEntryId(),
    name: `field_${index + 1}`,
    type: "text",
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    fontSize: 10,
    align: "left",
  };
}

export default function PdfCoordinatePage() {
  const [templateId, setTemplateId] = useState<PdfTemplateId>("adir");
  const [entries, setEntries] = useState<PdfCoordinateEntry[]>([]);
  const [mode, setMode] = useState<PdfPickerMode>("point");
  const [defaultType, setDefaultType] = useState<PdfFieldType>("text");
  const [pendingRectStart, setPendingRectStart] = useState<PdfPoint | null>(
    null,
  );
  const [hoverPoint, setHoverPoint] = useState<PdfPoint | null>(null);
  const [dimensionsMatch, setDimensionsMatch] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  const template = useMemo(
    () => PDF_TEMPLATES.find((item) => item.id === templateId) ?? PDF_TEMPLATES[0],
    [templateId],
  );

  const exportJson = useMemo(
    () => JSON.stringify(buildFieldMapExport(template.pageSize, entries), null, 2),
    [entries, template.pageSize],
  );

  const resetTemplateState = useCallback((nextTemplate: PdfTemplate) => {
    setTemplateId(nextTemplate.id);
    setEntries([]);
    setPendingRectStart(null);
    setHoverPoint(null);
    setCopyState("idle");
  }, []);

  const handleClick = useCallback(
    (point: PdfPoint) => {
      if (mode === "rect") {
        if (!pendingRectStart) {
          setPendingRectStart(point);
          return;
        }

        setEntries((current) => [
          ...current,
          createRectEntry(pendingRectStart, point, current.length),
        ]);
        setPendingRectStart(null);
        return;
      }

      setEntries((current) => [
        ...current,
        createPointEntry(point, defaultType, current.length),
      ]);
    },
    [defaultType, mode, pendingRectStart],
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(exportJson);
    setCopyState("copied");
    window.setTimeout(() => setCopyState("idle"), 1500);
  };

  const handleDownload = () => {
    const blob = new Blob([exportJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${template.id}-pdf-fields.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleUndo = () => {
    if (pendingRectStart) {
      setPendingRectStart(null);
      return;
    }

    setEntries((current) => current.slice(0, -1));
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-outline-variant px-6 py-4">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Editor de coordenadas PDF
            </h1>
            <p className="text-sm text-muted-foreground">
              Click para marcar campos compatibles con pdf-lib
            </p>
          </div>
          <Tabs
            value={templateId}
            onValueChange={(value) => {
              const nextTemplate = PDF_TEMPLATES.find((item) => item.id === value);
              if (!nextTemplate) return;
              resetTemplateState(nextTemplate);
            }}
          >
            <TabsList>
              {PDF_TEMPLATES.map((item) => (
                <TabsTrigger key={item.id} value={item.id}>
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 gap-6 overflow-hidden p-6">
        <section className="min-w-0 flex-1 overflow-auto">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-lg border border-outline-variant p-1">
              <Button
                type="button"
                size="sm"
                variant={mode === "point" ? "default" : "ghost"}
                onClick={() => {
                  setMode("point");
                  setPendingRectStart(null);
                }}
              >
                Punto
              </Button>
              <Button
                type="button"
                size="sm"
                variant={mode === "rect" ? "default" : "ghost"}
                onClick={() => {
                  setMode("rect");
                  setPendingRectStart(null);
                }}
              >
                Rectángulo
              </Button>
            </div>

            {mode === "point" ? (
              <select
                value={defaultType}
                onChange={(event) =>
                  setDefaultType(event.target.value as PdfFieldType)
                }
                className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="text">text</option>
                <option value="check">check</option>
                <option value="point">point</option>
              </select>
            ) : null}

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setZoom((current) => (current === 1 ? 0.5 : 1))}
            >
              Zoom {Math.round(zoom * 100)}%
            </Button>

            <PdfCoordinateHoverReadout point={hoverPoint} />
          </div>

          {!dimensionsMatch ? (
            <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              El PNG no coincide con pageSize ({template.pageSize.width}x
              {template.pageSize.height}). Regenera la imagen.
            </p>
          ) : null}

          {mode === "rect" && pendingRectStart ? (
            <p className="mb-4 text-sm text-muted-foreground">
              Primer punto fijado. Click en la esquina opuesta del campo.
            </p>
          ) : null}

          <Tabs value={templateId}>
            {PDF_TEMPLATES.map((item) => (
              <TabsContent key={item.id} value={item.id}>
                <PdfCoordinatePicker
                  imageSrc={item.imageSrc}
                  pageSize={item.pageSize}
                  entries={entries}
                  pendingRectStart={pendingRectStart}
                  zoom={zoom}
                  onDimensionsMatchChange={setDimensionsMatch}
                  onClick={handleClick}
                  onHover={setHoverPoint}
                />
              </TabsContent>
            ))}
          </Tabs>
        </section>

        <aside className="flex w-[360px] shrink-0 flex-col gap-4 overflow-hidden">
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={handleCopy}>
              {copyState === "copied" ? "Copiado" : "Copiar JSON"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={handleDownload}>
              Descargar
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={handleUndo}>
              Deshacer
            </Button>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sin puntos. Haz click en el PDF para empezar.
              </p>
            ) : (
              entries.map((entry) => (
                <PdfCoordinateEntryRow
                  key={entry.id}
                  entry={entry}
                  onNameChange={(id, name) => {
                    setEntries((current) =>
                      current.map((item) =>
                        item.id === id ? { ...item, name } : item,
                      ),
                    );
                  }}
                  onTypeChange={(id, type) => {
                    setEntries((current) =>
                      current.map((item) =>
                        item.id === id
                          ? {
                              ...item,
                              type,
                              radius: type === "check" ? item.radius ?? 6 : undefined,
                            }
                          : item,
                      ),
                    );
                  }}
                  onDelete={(id) => {
                    setEntries((current) =>
                      current.filter((item) => item.id !== id),
                    );
                  }}
                />
              ))
            )}
          </div>

          <pre className="max-h-48 overflow-auto rounded-lg border border-outline-variant bg-surface p-3 font-mono text-xs text-muted-foreground">
            {exportJson}
          </pre>
        </aside>
      </div>
    </div>
  );
}

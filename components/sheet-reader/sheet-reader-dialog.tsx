"use client";

import { useMemo, useState, type ChangeEvent, type DragEvent } from "react";
import { CircleCheck, LoaderCircle, ShieldCheck, TriangleAlert, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SheetCanvas, type SheetHighlight } from "@/components/sheet-reader/sheet-canvas";
import type { SheetItemReading, SheetItemStatus, SheetReading } from "@/lib/omr/read-sheet";
import type { SheetTest } from "@/lib/omr/sheet-maps";
import { cn } from "@/lib/utils";
import { useCurrentReportStore } from "@/store/use-current-report-store";

const PREVIEW_PX_PER_MM = 4;
const MARK_COLOR = "#1b7f3b";
const REVIEW_COLOR = "#c27c0e";
const ROW_MARGIN = { left: 15, right: 195, halfHeight: 5.5 };

const STATUS_LABELS: Record<Exclude<SheetItemStatus, "ok">, string> = {
  multiple: "Hay más de una casilla marcada",
  faint: "Marca dudosa",
  empty: "Sin marcar",
};

type ReadPage = { key: string; fileName: string; reading: SheetReading; preview: HTMLCanvasElement };
type FailedFile = { fileName: string; message: string };
type Results = { pages: ReadPage[]; failures: FailedFile[] };

type SheetReaderDialogProps = {
  test: SheetTest;
  open: boolean;
  onClose: () => void;
};

async function readFiles(files: File[], test: SheetTest): Promise<Results> {
  const [{ readSheet, rectifySheet, SheetReadError }, { loadSheetImages, imageToCanvas, SheetFileError }] =
    await Promise.all([import("@/lib/omr/read-sheet"), import("@/lib/omr/load-sheet-images")]);
  const pagesByNumber = new Map<number, ReadPage>();
  const failures: FailedFile[] = [];

  for (const file of files) {
    let images;
    try {
      images = await loadSheetImages(file);
    } catch (error) {
      failures.push({
        fileName: file.name,
        message: error instanceof SheetFileError ? error.message : "No se puede abrir el archivo.",
      });
      continue;
    }
    for (const { name, image } of images) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      try {
        const reading = readSheet(image);
        if (reading.test !== test) {
          failures.push({
            fileName: name,
            message: `Esta hoja es del ${reading.test}, pero el informe abierto es ${test}.`,
          });
          continue;
        }
        pagesByNumber.set(reading.page.page, {
          key: `${name}-${reading.page.page}`,
          fileName: name,
          reading,
          preview: imageToCanvas(rectifySheet(image, reading, PREVIEW_PX_PER_MM)),
        });
      } catch (error) {
        failures.push({
          fileName: name,
          message: error instanceof SheetReadError ? error.message : "No se ha podido leer la hoja.",
        });
      }
    }
  }

  return { pages: [...pagesByNumber.values()].sort((a, b) => a.reading.page.page - b.reading.page.page), failures };
}

function pageHighlights(reading: SheetReading): SheetHighlight[] {
  const size = reading.map.boxSize;
  return reading.items.flatMap(({ item, status, fills }) =>
    item.boxes.flatMap((box, index) => {
      if (status === "ok") return fills[index] > 0.025 ? [{ ...box, size, color: MARK_COLOR }] : [];
      return [{ ...box, size, color: REVIEW_COLOR }];
    }),
  );
}

function UploadStep({ test, onFiles }: { test: SheetTest; onFiles: (files: File[]) => void }) {
  const [dragging, setDragging] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])];
    event.target.value = "";
    if (files.length > 0) onFiles(files);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    const files = [...event.dataTransfer.files];
    if (files.length > 0) onFiles(files);
  };

  return (
    <div className="space-y-4 px-6 py-5">
      <label
        htmlFor="sheet-reader-files"
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-outline-variant hover:bg-surface-container-low",
        )}
      >
        <Upload className="size-6 text-primary" aria-hidden="true" />
        <span className="text-body-lg font-semibold text-on-surface">
          Arrastra aquí las fotos o el PDF de la hoja {test}
        </span>
        <span className="text-body-md text-on-surface-variant">
          o haz clic para elegirlos. JPG, PNG o PDF; puedes subir las dos páginas a la vez.
        </span>
        <input
          id="sheet-reader-files"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,application/pdf,.heic,.heif"
          className="sr-only"
          onChange={handleChange}
        />
      </label>
      <p className="flex items-start gap-2 text-body-md text-on-surface-variant">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        La imagen se procesa en este ordenador. No se envía a ningún servidor.
      </p>
    </div>
  );
}

function ReviewItem({
  page,
  reading,
  choice,
  onChoose,
}: {
  page: ReadPage;
  reading: SheetItemReading;
  choice: number | undefined;
  onChoose: (value: number | undefined) => void;
}) {
  const { item, status } = reading;
  const region = useMemo(
    () => ({
      x: ROW_MARGIN.left,
      y: item.boxes[0].y - ROW_MARGIN.halfHeight,
      width: ROW_MARGIN.right - ROW_MARGIN.left,
      height: ROW_MARGIN.halfHeight * 2,
    }),
    [item],
  );
  const highlights = useMemo(
    () => item.boxes.map((box) => ({ ...box, size: page.reading.map.boxSize, color: REVIEW_COLOR })),
    [item, page],
  );

  return (
    <li className="space-y-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
      <p className="text-body-md font-semibold text-on-surface">
        Ítem {item.code}
        <span className="ml-2 font-normal text-amber-700">{STATUS_LABELS[status as Exclude<SheetItemStatus, "ok">]}</span>
      </p>
      <SheetCanvas
        source={page.preview}
        pxPerMm={PREVIEW_PX_PER_MM}
        region={region}
        highlights={highlights}
        label={`Fila del ítem ${item.code} en la hoja`}
        className="w-full rounded-md border border-outline-variant"
      />
      <div className="flex flex-wrap gap-2" role="group" aria-label={`Respuesta del ítem ${item.code}`}>
        {item.boxes.map((box) => {
          const value = Number(box.value);
          const selected = choice === value;
          return (
            <button
              key={box.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChoose(selected ? undefined : value)}
              className={cn(
                "interactive-press rounded-lg border px-3 py-1.5 text-body-md outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "border-primary bg-primary text-on-primary"
                  : "border-outline-variant text-on-surface hover:bg-surface-container",
              )}
            >
              {box.label}
            </button>
          );
        })}
      </div>
    </li>
  );
}

function ReviewStep({
  results,
  choices,
  onChoose,
}: {
  results: Results;
  choices: Record<string, number | undefined>;
  onChoose: (id: string, value: number | undefined) => void;
}) {
  const pageCount = results.pages[0]?.reading.pageCount;
  const readNumbers = new Set(results.pages.map(({ reading }) => reading.page.page));
  const missingPages = pageCount
    ? Array.from({ length: pageCount }, (_, index) => index + 1).filter((number) => !readNumbers.has(number))
    : [];
  const pending = results.pages.flatMap((page) =>
    page.reading.items.filter(({ status }) => status !== "ok").map((reading) => ({ page, reading })),
  );

  return (
    <div className="space-y-5 px-6 py-5">
      {results.failures.length > 0 && (
        <ul className="space-y-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          {results.failures.map(({ fileName, message }) => (
            <li key={fileName} className="flex items-start gap-2 text-body-md text-on-surface">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
              <span>
                <span className="font-semibold">{fileName}:</span> {message}
              </span>
            </li>
          ))}
        </ul>
      )}

      {results.pages.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {results.pages.map((page) => {
            const toReview = page.reading.items.filter(({ status }) => status !== "ok").length;
            return (
              <figure key={page.key} className="space-y-2">
                <SheetCanvas
                  source={page.preview}
                  pxPerMm={PREVIEW_PX_PER_MM}
                  region={{ x: 0, y: 0, width: page.reading.map.page.width, height: page.reading.map.page.height }}
                  highlights={pageHighlights(page.reading)}
                  label={`Página ${page.reading.page.page} leída`}
                  className="w-full rounded-lg border border-outline-variant shadow-level-1"
                />
                <figcaption className="text-body-md text-on-surface-variant">
                  <span className="font-semibold text-on-surface">
                    Página {page.reading.page.page} de {page.reading.pageCount}
                  </span>{" "}
                  · {page.reading.items.length - toReview} leídas
                  {toReview > 0 ? ` · ${toReview} por revisar` : ""}
                </figcaption>
              </figure>
            );
          })}
        </div>
      )}

      {missingPages.length > 0 && (
        <p className="text-body-md text-on-surface-variant">
          Falta la página {missingPages.join(" y ")}: sus respuestas no se modificarán.
        </p>
      )}

      {results.pages.length > 0 &&
        (pending.length > 0 ? (
          <section className="space-y-3">
            <div>
              <h3 className="text-headline-md text-on-surface">Por revisar ({pending.length})</h3>
              <p className="text-body-md text-on-surface-variant">
                Elige la respuesta mirando la fila de la hoja. Si no eliges ninguna, el ítem quedará sin responder.
              </p>
            </div>
            <ul className="space-y-3">
              {pending.map(({ page, reading }) => (
                <ReviewItem
                  key={reading.item.id}
                  page={page}
                  reading={reading}
                  choice={choices[reading.item.id]}
                  onChoose={(value) => onChoose(reading.item.id, value)}
                />
              ))}
            </ul>
          </section>
        ) : (
          <p className="flex items-center gap-2 text-body-md text-on-surface">
            <CircleCheck className="size-4 text-[#1b7f3b]" aria-hidden="true" />
            Todas las respuestas se han leído sin dudas. Revisa la hoja marcada en verde antes de aplicar.
          </p>
        ))}
    </div>
  );
}

export function SheetReaderDialog({ test, open, onClose }: SheetReaderDialogProps) {
  const setAnswer = useCurrentReportStore((state) => state.setAnswer);
  const clearAnswer = useCurrentReportStore((state) => state.clearAnswer);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [choices, setChoices] = useState<Record<string, number | undefined>>({});

  const reset = () => {
    setResults(null);
    setChoices({});
    setProcessing(false);
  };

  const handleFiles = async (files: File[]) => {
    setProcessing(true);
    try {
      setResults(await readFiles(files, test));
    } catch {
      setResults({ pages: [], failures: [{ fileName: "Lectura", message: "No se ha podido leer la hoja." }] });
    } finally {
      setProcessing(false);
    }
  };

  const readCount = results?.pages.reduce((sum, page) => sum + page.reading.items.length, 0) ?? 0;

  const apply = () => {
    for (const page of results?.pages ?? []) {
      for (const { item, status, value } of page.reading.items) {
        const answer = status === "ok" ? value : choices[item.id];
        if (answer === undefined) clearAnswer(item.id);
        else setAnswer(item.id, answer);
      }
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent
        showCloseButton
        className="flex max-h-[90vh] w-full max-w-4xl flex-col gap-0 overflow-hidden border-outline-variant bg-surface-container-lowest p-0 sm:max-w-4xl"
      >
        <DialogHeader className="shrink-0 gap-0 border-b border-outline-variant px-6 py-5">
          <DialogTitle className="text-headline-md text-on-surface">Leer hoja rellenada · {test}</DialogTitle>
          <DialogDescription className="text-body-md text-on-surface-variant">
            {results
              ? "Comprueba lo leído. Las casillas verdes son las respuestas detectadas."
              : "Sube la hoja que ha rellenado el paciente y la app marcará las respuestas por ti."}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {processing ? (
            <div className="flex items-center justify-center gap-2 px-6 py-16 text-body-md text-on-surface-variant">
              <LoaderCircle className="size-5 animate-spin text-primary" aria-hidden="true" />
              Leyendo la hoja…
            </div>
          ) : results ? (
            <ReviewStep
              results={results}
              choices={choices}
              onChoose={(id, value) => setChoices((current) => ({ ...current, [id]: value }))}
            />
          ) : (
            <UploadStep test={test} onFiles={handleFiles} />
          )}
        </div>
        {results && !processing && (
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-outline-variant px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={reset}
              className="border-outline-variant bg-surface-container text-on-surface hover:bg-surface-container-high"
            >
              Subir otra vez
            </Button>
            <Button type="button" onClick={apply} disabled={readCount === 0} className="btn-raised text-on-primary">
              Aplicar respuestas
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

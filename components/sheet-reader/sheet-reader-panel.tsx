"use client";

import { useState } from "react";
import { Download, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetReaderDialog } from "@/components/sheet-reader/sheet-reader-dialog";
import { sheetTemplateUrls, type SheetTest } from "@/lib/omr/sheet-maps";

type SheetReaderPanelProps = {
  test: SheetTest;
  disabled?: boolean;
};

export function SheetReaderPanel({ test, disabled = false }: SheetReaderPanelProps) {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-level-1">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-container">
          <ScanLine className="size-5 text-primary" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-body-lg font-semibold text-on-surface">¿Tienes la hoja rellenada?</p>
          <p className="text-body-md text-on-surface-variant">
            Sube una foto o un escaneo y las respuestas se marcarán solas para que las revises.{" "}
            <a
              href={sheetTemplateUrls[test]}
              download
              className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
            >
              <Download className="size-3.5" aria-hidden="true" />
              Plantilla {test} (PDF)
            </a>
          </p>
        </div>
      </div>
      <Button
        type="button"
        size="lg"
        disabled={disabled}
        onClick={() => {
          setSession((current) => current + 1);
          setOpen(true);
        }}
        className="btn-raised px-4 text-on-primary"
      >
        Leer hoja
      </Button>
      <SheetReaderDialog key={session} test={test} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

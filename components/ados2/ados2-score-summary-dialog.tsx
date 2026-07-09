"use client";

import { useEffect, useState } from "react";
import { downloadAdos2Pdf } from "@/lib/ados2-pdf/download-ados2-pdf";
import type { Ados2ScoreSummary } from "@/lib/ados2-scoring";
import type { TestType } from "@/lib/types";
import { Ados2ScoreSummaryView } from "./ados2-score-summary";

type Ados2ScoreSummaryDialogProps = {
  open: boolean;
  test: TestType;
  testLabel: string;
  summary: Ados2ScoreSummary;
  onClose: () => void;
};

export function Ados2ScoreSummaryDialog({
  open,
  test,
  testLabel,
  summary,
  onClose,
}: Ados2ScoreSummaryDialogProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    try {
      await downloadAdos2Pdf(test, summary);
    } catch (error) {
      setDownloadError(
        error instanceof Error ? error.message : "No se pudo generar el PDF",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="dialog-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-labelledby="ados2-score-summary-heading"
        className="dialog-content flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 border-b border-slate-200 bg-slate-50/80 px-6 py-5">
          <h2
            id="ados2-score-summary-heading"
            className="mb-1 text-xl font-bold text-slate-900"
          >
            Puntuación ADOS-2
          </h2>
          <p className="text-sm font-medium text-slate-500">{testLabel}</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/50 p-6">
          <Ados2ScoreSummaryView summary={summary} />
        </div>
        <div className="flex shrink-0 flex-col items-center gap-3 border-t border-slate-200 bg-white px-6 py-4">
          {downloadError ? (
            <p className="text-sm text-red-600">{downloadError}</p>
          ) : null}
          <div className="flex w-full max-w-sm flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full rounded-md border border-primary bg-white px-8 py-2.5 text-sm font-medium text-primary shadow-sm transition-colors hover:bg-primary/5 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDownloading ? "Generando..." : "Descargar resultado"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-md bg-primary px-8 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

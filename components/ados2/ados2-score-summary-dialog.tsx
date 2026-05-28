"use client";

import { useEffect } from "react";
import type { Ados2ScoreSummary } from "@/lib/ados2-scoring";
import { Ados2ScoreSummaryView } from "./ados2-score-summary";

type Ados2ScoreSummaryDialogProps = {
  open: boolean;
  testLabel: string;
  summary: Ados2ScoreSummary;
  onClose: () => void;
};

export function Ados2ScoreSummaryDialog({
  open,
  testLabel,
  summary,
  onClose,
}: Ados2ScoreSummaryDialogProps) {
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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-labelledby="ados2-score-summary-heading"
        className="flex max-h-[min(90dvh,720px)] w-full max-w-2xl flex-col rounded-xl border border-outline-variant bg-surface-container-highest shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 border-b border-outline-variant px-4 py-3">
          <h3
            id="ados2-score-summary-heading"
            className="text-headline-md text-on-surface"
          >
            Puntuación ADOS-2
          </h3>
          <p className="mt-0.5 text-body-md text-on-surface-variant">
            {testLabel}
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <Ados2ScoreSummaryView summary={summary} />
        </div>
        <div className="shrink-0 border-t border-outline-variant p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-surface-container py-2 text-label-md text-on-surface transition-colors hover:bg-surface-container-high"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

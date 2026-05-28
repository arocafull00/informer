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
        <div className="flex shrink-0 justify-center border-t border-slate-200 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full max-w-sm rounded-md bg-primary px-8 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

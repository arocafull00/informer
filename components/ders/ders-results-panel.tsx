"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { DersResultRow } from "@/components/ders/ders-result-row";
import {
  buildDersMarkdown,
  getDersScoreSummary,
  type DersThresholdStatus,
} from "@/lib/ders-scoring";
import {
  selectCurrentAnswers,
  selectCurrentPatientSex,
  selectCurrentReportId,
  useCurrentReportStore,
} from "@/store/use-current-report-store";

function ThresholdNotice({ status }: { status: DersThresholdStatus }) {
  if (status === "matched") return null;

  return (
    <div className="mb-4 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2.5">
      <p className="text-body-md font-medium text-on-surface">
        Selecciona el sexo
      </p>
      <p className="mt-0.5 text-body-md text-on-surface-variant">
        Indica Varón o Mujer para comparar las puntuaciones con los umbrales.
      </p>
    </div>
  );
}

export function DersResultsPanel() {
  const currentReportId = useCurrentReportStore(selectCurrentReportId);
  const answers = useCurrentReportStore(selectCurrentAnswers);
  const patientSex = useCurrentReportStore(selectCurrentPatientSex);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const summary = getDersScoreSummary(patientSex, answers);
  const markdown = buildDersMarkdown(patientSex, answers);
  const hasInterpretations = markdown.trim().length > 0;

  const handleCopy = async () => {
    if (!hasInterpretations) return;

    setCopyError(null);
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError("No se pudo copiar las interpretaciones.");
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-outline-variant bg-surface-container-lowest p-3">
        <div className="min-w-0">
          <h2 className="text-headline-md text-on-surface">Resultados DERS</h2>
          <p className="mt-0.5 text-body-md text-on-surface-variant">
            Puntuaciones por subescala
          </p>
        </div>
        {currentReportId ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 text-label-md text-on-surface-variant">
            <Check className="size-3.5 text-primary" aria-hidden="true" />
            Guardado
          </span>
        ) : (
          <span className="rounded-md bg-surface-container px-2 py-1 text-mono-sm font-medium text-primary">
            Sin informe activo
          </span>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-surface-container-lowest p-4">
        <ThresholdNotice status={summary.thresholdStatus} />

        <div className="overflow-x-auto rounded-xl border border-outline-variant">
          <table className="w-full min-w-[320px] border-collapse bg-surface-container-lowest">
            <thead className="bg-surface-container-low">
              <tr className="text-mono-sm uppercase tracking-wider text-on-surface-variant">
                <th scope="col" className="px-4 py-2.5 text-left font-medium">
                  Subescala
                </th>
                <th scope="col" className="px-4 py-2.5 text-center font-medium">
                  PD
                </th>
              </tr>
            </thead>
            <tbody>
              {summary.subscales.map((result) => (
                <DersResultRow
                  key={result.key}
                  label={result.label}
                  score={result.score}
                  complete={result.complete}
                  elevated={result.elevated}
                />
              ))}
            </tbody>
          </table>
        </div>

        {summary.answeredCount < summary.totalItems ? (
          <p className="mt-4 text-body-md leading-relaxed text-on-surface-variant">
            Progreso: {summary.answeredCount} / {summary.totalItems} ítems
            respondidos. Cada subescala se calcula al completar sus ítems y el
            total al responder los 28.
          </p>
        ) : null}

        {summary.answeredCount === summary.totalItems &&
        summary.thresholdStatus === "matched" &&
        !hasInterpretations ? (
          <p className="mt-4 text-body-md leading-relaxed text-on-surface-variant">
            Ninguna subescala supera su umbral. No hay interpretaciones para
            copiar.
          </p>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-outline-variant bg-surface-container-lowest p-3">
        {copyError ? (
          <p className="mb-2 text-center text-label-md text-error" role="alert">
            {copyError}
          </p>
        ) : null}
        <button
          type="button"
          onClick={handleCopy}
          disabled={!currentReportId || !hasInterpretations}
          className="interactive-press flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-surface-container px-3 py-2 text-label-md text-on-surface hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {copied ? (
            <>
              <Check className="size-4" aria-hidden="true" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="size-4" aria-hidden="true" />
              Copiar interpretaciones
            </>
          )}
        </button>
      </div>
    </div>
  );
}

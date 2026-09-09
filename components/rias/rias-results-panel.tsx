"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { RiasIndexResultRow } from "./rias-index-result-row";
import { downloadRiasPdf } from "@/lib/rias-pdf/download-rias-pdf";
import {
  RIAS_INDEX_KEYS,
  isRiasResultsFormComplete,
} from "@/lib/rias-scoring";
import {
  selectCurrentReportId,
  selectCurrentRiasForm,
  useCurrentReportStore,
} from "@/store/use-current-report-store";

export function RiasResultsPanel() {
  const currentReportId = useCurrentReportStore(selectCurrentReportId);
  const form = useCurrentReportStore(selectCurrentRiasForm);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const isComplete = isRiasResultsFormComplete(form);

  const handleGeneratePdf = async () => {
    if (!isComplete) return;
    setIsGeneratingPdf(true);
    setPdfError(null);
    try {
      await downloadRiasPdf(form);
    } catch (error) {
      setPdfError(
        error instanceof Error ? error.message : "No se pudo generar el PDF",
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-outline-variant bg-surface-container-lowest p-3">
        <div className="min-w-0">
          <h2 className="text-headline-md text-on-surface">Resultados RIAS</h2>
          <p className="mt-0.5 text-body-md text-on-surface-variant">
            Índices, intervalos y percentiles
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
        <div className="overflow-x-auto rounded-xl border border-outline-variant">
          <table className="w-full min-w-[520px] border-collapse bg-surface-container-lowest">
            <thead className="bg-surface-container-low">
              <tr className="text-mono-sm uppercase tracking-wider text-on-surface-variant">
                <th scope="col" className="px-4 py-2.5 text-left font-medium">
                  Índice
                </th>
                <th scope="col" className="px-3 py-2.5 text-center font-medium">
                  Suma T
                </th>
                <th scope="col" className="px-3 py-2.5 text-center font-medium">
                  Índice
                </th>
                <th scope="col" className="px-3 py-2.5 text-center font-medium">
                  Percentil
                </th>
                <th scope="col" className="px-4 py-2.5 text-center font-medium">
                  Intervalo
                </th>
              </tr>
            </thead>
            <tbody>
              {RIAS_INDEX_KEYS.map((key) => (
                <RiasIndexResultRow
                  key={key}
                  indexKey={key}
                  tSums={form.tSums}
                  indices={form.indices}
                  intervals={form.intervals}
                  percentiles={form.percentiles}
                />
              ))}
            </tbody>
          </table>
        </div>

        {!isComplete ? (
          <p className="mt-4 text-body-md leading-relaxed text-on-surface-variant">
            Completa todos los pasos del formulario para generar el PDF de
            resultados.
          </p>
        ) : null}
        {pdfError ? (
          <p className="mt-4 text-body-md text-error" role="alert">
            {pdfError}
          </p>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-outline-variant bg-surface-container-lowest p-3">
        {currentReportId ? (
          <button
            type="button"
            onClick={handleGeneratePdf}
            disabled={!isComplete || isGeneratingPdf}
            className="interactive-press flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-label-md text-on-primary hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Sparkles className="size-4" aria-hidden="true" />
            {isGeneratingPdf ? "Generando..." : "Generar PDF"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

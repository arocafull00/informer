"use client";

import { useState } from "react";
import { downloadProescPdf } from "@/lib/proesc-pdf/download-proesc-pdf";
import { PROESC_LEVELS, PROESC_COURSES, getProescSummary } from "@/lib/proesc-scoring";
import {
  selectCurrentAnswers,
  selectCurrentPatientName,
  selectCurrentReportId,
  selectProescCourse,
  useCurrentReportStore,
} from "@/store/use-current-report-store";

export function ProescResultsPanel() {
  const reportId = useCurrentReportStore(selectCurrentReportId);
  const patientName = useCurrentReportStore(selectCurrentPatientName) ?? "";
  const course = useCurrentReportStore(selectProescCourse);
  const answers = useCurrentReportStore(selectCurrentAnswers);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const summary = getProescSummary(course, answers);
  const courseLabel = PROESC_COURSES.find((item) => item.value === course)?.label;
  const rows = [...summary.rows, { key: "total_bateria", label: "Total batería", score: summary.total, result: summary.totalResult }];

  const handleGeneratePdf = async () => {
    if (!reportId || !summary.complete) return;
    setGeneratingPdf(true);
    setPdfError(null);
    try {
      await downloadProescPdf({ patientName, course, answers });
    } catch (error) {
      setPdfError(error instanceof Error ? error.message : "No se pudo generar el PDF");
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 border-b border-outline-variant bg-surface-container-lowest p-4">
        <h2 className="text-headline-md text-on-surface">Resultados PROESC</h2>
        <p className="mt-1 text-body-md text-on-surface-variant">{courseLabel ? `Baremo · ${courseLabel}` : "Selecciona un curso para calcular la dificultad"}</p>
      </header>
      <div className="min-h-0 flex-1 overflow-auto bg-surface-container-lowest p-4">
        <div className="overflow-x-auto rounded-xl border border-outline-variant">
          <table className="w-full min-w-[690px] border-collapse text-body-md">
            <thead className="bg-surface-container-low text-on-surface">
              <tr>
                <th scope="col" rowSpan={2} className="px-3 py-2 text-left">Pruebas</th>
                <th scope="col" rowSpan={2} className="px-2 py-2 text-center">PD</th>
                <th scope="colgroup" colSpan={5} className="border-b border-outline-variant px-2 py-1 text-center">Dificultad</th>
              </tr>
              <tr>{PROESC_LEVELS.map((level) => <th key={level.key} scope="col" className="px-2 py-2 text-center text-label-md">{level.label}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row) => <tr key={row.key} className="border-t border-outline-variant">
                <th scope="row" className="px-3 py-2.5 text-left font-medium text-on-surface">{row.label}</th>
                <td className="px-2 py-2.5 text-center tabular-nums">{row.score ?? "—"}</td>
                {PROESC_LEVELS.map((level) => <td key={level.key} className="px-2 py-2.5 text-center font-semibold text-primary" aria-label={row.result === level.key ? level.label : undefined}>{row.result === level.key ? "X" : ""}</td>)}
              </tr>)}
            </tbody>
          </table>
        </div>
        {!summary.complete ? <p className="mt-4 text-body-md text-on-surface-variant">El total es provisional. Su nivel aparece al completar las diez puntuaciones y seleccionar el curso.</p> : null}
        {pdfError ? <p className="mt-4 text-body-md text-error" role="alert">{pdfError}</p> : null}
      </div>
      <div className="shrink-0 border-t border-outline-variant bg-surface-container-lowest p-3">
        <button
          type="button"
          onClick={handleGeneratePdf}
          disabled={!reportId || !summary.complete || generatingPdf}
          className="interactive-press min-h-9 w-full rounded-lg bg-primary px-4 py-2 text-label-md text-on-primary hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {generatingPdf ? "Generando..." : "Generar PDF"}
        </button>
      </div>
    </div>
  );
}

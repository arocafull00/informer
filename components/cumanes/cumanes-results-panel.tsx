"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import { buildCumanesPdfForm } from "@/lib/cumanes-pdf/build-cumanes-pdf-form";
import { buildCumanesResultsText } from "@/lib/cumanes-pdf/build-cumanes-results-text";
import { downloadCumanesPdf } from "@/lib/cumanes-pdf/download-cumanes-pdf";
import {
  CUMANES_TEST_ORDER,
  cumanesNorms,
  getCumanesIndexSummary,
  getCumanesScore,
  type CumanesMappedScore,
} from "@/lib/cumanes-scoring";
import {
  CUMANES_LATERALITY_AREAS,
  CUMANES_LATERALITY_OPTIONS,
  type TestCode,
} from "@/lib/cumanes-types";
import {
  selectCurrentAnswers,
  selectCurrentCumanesIdentification,
  selectCurrentCumanesLaterality,
  selectCurrentPatientName,
  selectCurrentPatientSex,
  selectCurrentReportId,
  useCurrentReportStore,
} from "@/store/use-current-report-store";

const lateralityLabelByValue = new Map(
  CUMANES_LATERALITY_OPTIONS.map((option) => [option.value, option.label])
);

function ResultValue({
  result,
  value,
  showStatus = true,
}: {
  result: CumanesMappedScore;
  value: number | null;
  showStatus?: boolean;
}) {
  if (!showStatus && result.status !== "matched") {
    return <span className="text-outline">—</span>;
  }
  if (result.status === "norm-missing") {
    return <span className="text-on-surface-variant">Sin baremo</span>;
  }
  if (result.status === "score-unmatched") {
    return <span className="text-error">Sin correspondencia</span>;
  }
  if (result.status !== "matched" || value === null) {
    return <span className="text-outline">—</span>;
  }
  return (
    <span className="font-semibold text-on-surface">
      {value.toLocaleString("es-ES", { maximumFractionDigits: 10 })}
    </span>
  );
}

function CumanesResultRow({ code }: { code: TestCode }) {
  const answers = useCurrentReportStore(selectCurrentAnswers);
  const identification = useCurrentReportStore(
    selectCurrentCumanesIdentification
  );
  const directScore = answers[code];
  const test = cumanesNorms.tests[code];
  const result = getCumanesScore(identification.age, code, directScore);

  return (
    <tr className="border-t border-outline-variant align-middle first:border-t-0">
      <th scope="row" className="px-3 py-3 text-left font-normal">
        <span className="block text-body-md font-medium text-on-surface">
          {test.name}
        </span>
        <span className="mt-0.5 block text-mono-sm font-medium text-primary">
          {code}
        </span>
      </th>
      <td className="px-2 py-3 text-center text-body-md tabular-nums text-on-surface">
        {directScore ?? <span className="text-outline">—</span>}
      </td>
      <td className="min-w-28 px-2 py-3 text-center text-body-md tabular-nums">
        {test.type === "range" ? (
          <span className="text-outline">—</span>
        ) : (
          <ResultValue result={result} value={result.transformation} />
        )}
      </td>
      <td className="min-w-20 px-3 py-3 text-center text-body-md tabular-nums">
        <ResultValue
          result={result}
          value={result.decatype}
          showStatus={test.type === "range"}
        />
      </td>
    </tr>
  );
}

export function CumanesResultsPanel() {
  const currentReportId = useCurrentReportStore(selectCurrentReportId);
  const answers = useCurrentReportStore(selectCurrentAnswers);
  const patientName = useCurrentReportStore(selectCurrentPatientName);
  const patientSex = useCurrentReportStore(selectCurrentPatientSex);
  const identification = useCurrentReportStore(
    selectCurrentCumanesIdentification
  );
  const laterality = useCurrentReportStore(selectCurrentCumanesLaterality);
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const indexSummary = getCumanesIndexSummary(identification.age, answers);
  const formattedSum =
    indexSummary.sum === null
      ? "—"
      : indexSummary.sum.toLocaleString("es-ES", {
          maximumFractionDigits: 2,
        });
  const resultsText = useMemo(
    () =>
      buildCumanesResultsText({
        patientName: patientName ?? "",
        patientSex,
        identification,
        laterality,
        answers,
      }),
    [answers, identification, laterality, patientName, patientSex]
  );

  const handleCopyText = async () => {
    await navigator.clipboard.writeText(resultsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true);
    setPdfError(null);
    try {
      const form = buildCumanesPdfForm({
        patientName: patientName ?? "",
        patientSex,
        identification,
        laterality,
        answers,
      });
      await downloadCumanesPdf(form);
    } catch (error) {
      setPdfError(
        error instanceof Error ? error.message : "No se pudo generar el PDF"
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-outline-variant bg-surface-container-lowest p-3">
        <div className="min-w-0">
          <h2 className="text-headline-md text-on-surface">
            Resultados CUMANES
          </h2>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <p className="text-body-md text-on-surface-variant">
              Transformación, decatipo e IDN
            </p>
            <span className="rounded-full bg-surface-container px-2 py-0.5 text-mono-sm font-medium text-primary">
              Baremo IDN · 7–11 años
            </span>
          </div>
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
        {!identification.age ? (
          <div className="mb-4 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2.5">
            <p className="text-body-md font-medium text-on-surface">
              Selecciona la edad para obtener resultados
            </p>
            <p className="mt-0.5 text-body-md text-on-surface-variant">
              Las puntuaciones directas se conservarán aunque la edad esté sin
              indicar.
            </p>
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-xl border border-outline-variant">
          <table className="w-full min-w-[540px] border-collapse bg-surface-container-lowest">
            <thead className="bg-surface-container-low">
              <tr className="text-mono-sm uppercase tracking-wider text-on-surface-variant">
                <th scope="col" className="px-3 py-2.5 text-left font-medium">
                  Prueba
                </th>
                <th scope="col" className="px-2 py-2.5 text-center font-medium">
                  PD
                </th>
                <th scope="col" className="px-2 py-2.5 text-center font-medium">
                  Transformación
                </th>
                <th scope="col" className="px-3 py-2.5 text-center font-medium">
                  Decatipo
                </th>
              </tr>
            </thead>
            <tbody>
              {CUMANES_TEST_ORDER.map((code) => (
                <CumanesResultRow key={code} code={code} />
              ))}
            </tbody>
            <tfoot className="border-t-2 border-primary/30 bg-surface-container-low">
              <tr>
                <th
                  scope="row"
                  colSpan={3}
                  className="px-3 py-3 text-left text-body-md font-semibold text-on-surface"
                >
                  Suma de T
                  <span className="ml-2 font-normal text-on-surface-variant">
                    FE-t y FE-e se restan
                  </span>
                </th>
                <td className="px-3 py-3 text-center text-body-lg font-semibold tabular-nums text-primary">
                  {formattedSum}
                </td>
              </tr>
              <tr className="border-t border-outline-variant">
                <th
                  scope="row"
                  colSpan={3}
                  className="px-3 py-3 text-left text-body-md font-medium text-on-surface"
                >
                  Puntuación típica (IDN)
                </th>
                <td className="px-3 py-3 text-center text-body-lg font-semibold tabular-nums text-on-surface">
                  {indexSummary.typicalScore ?? (
                    <span className="text-outline">—</span>
                  )}
                </td>
              </tr>
              <tr className="border-t border-outline-variant">
                <th
                  scope="row"
                  colSpan={3}
                  className="px-3 py-3 text-left text-body-md font-medium text-on-surface"
                >
                  Percentil
                </th>
                <td className="px-3 py-3 text-center text-body-lg font-semibold tabular-nums text-on-surface">
                  {indexSummary.percentile ?? (
                    <span className="text-outline">—</span>
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <section
          aria-labelledby="cumanes-results-laterality-heading"
          className="mt-4 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest"
        >
          <div className="border-b border-outline-variant bg-surface-container-low px-3 py-2.5">
            <h3
              id="cumanes-results-laterality-heading"
              className="text-label-md font-semibold uppercase tracking-wider text-on-surface-variant"
            >
              Lateralidad (LA)
            </h3>
          </div>
          <dl className="grid grid-cols-3 divide-x divide-outline-variant">
            {CUMANES_LATERALITY_AREAS.map((area) => {
              const selectedValue = laterality[area.value];
              return (
                <div key={area.value} className="min-w-0 px-3 py-3">
                  <dt className="text-mono-sm font-medium uppercase tracking-wider text-on-surface-variant">
                    {area.label}
                  </dt>
                  <dd className="mt-1 text-body-md font-medium leading-snug text-on-surface">
                    {selectedValue ? (
                      lateralityLabelByValue.get(selectedValue)
                    ) : (
                      <span className="text-outline">—</span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>

        <div className="mt-3 text-body-md leading-relaxed text-on-surface-variant">
          {indexSummary.status === "incomplete" ? (
            <p>
              {indexSummary.sum === null
                ? "Completa las puntuaciones transformadas para calcular el IDN."
                : `Suma parcial. Faltan ${indexSummary.missingCodes.length} pruebas con puntuación transformada.`}
            </p>
          ) : null}
          {indexSummary.status === "conversion-missing" ? (
            <p>No hay una conversión IDN para esta suma en el baremo actual.</p>
          ) : null}
          {indexSummary.status === "matched" &&
          indexSummary.roundedSum !== indexSummary.sum ? (
            <p>
              Conversión IDN realizada con la suma redondeada a{" "}
              {indexSummary.roundedSum}.
            </p>
          ) : null}
          <p>La velocidad lectora (LX-v) no aporta puntuación transformada.</p>
          {pdfError ? (
            <p className="mt-2 text-error">{pdfError}</p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 gap-2 border-t border-outline-variant bg-surface-container-lowest p-3">
        <button
          type="button"
          onClick={handleCopyText}
          className="interactive-press flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-surface-container px-3 py-2 text-label-md text-on-surface hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {copied ? (
            <>
              <Check className="size-4" aria-hidden="true" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="size-4" aria-hidden="true" />
              Copiar texto
            </>
          )}
        </button>
        {currentReportId ? (
          <button
            type="button"
            onClick={handleGeneratePdf}
            disabled={isGeneratingPdf}
            className="interactive-press flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-label-md text-on-primary hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Sparkles className="size-4" aria-hidden="true" />
            {isGeneratingPdf ? "Generando..." : "Generar PDF"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

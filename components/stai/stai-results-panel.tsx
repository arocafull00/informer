"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import {
  buildStaiMarkdown,
  getStaiScoreSummary,
  type StaiNormStatus,
} from "@/lib/stai-scoring";
import { STAI_AGE_GROUP_OPTIONS } from "@/lib/stai-types";
import {
  selectCurrentAnswers,
  selectCurrentPatientSex,
  selectCurrentReportId,
  selectCurrentStaiIdentification,
  useCurrentReportStore,
} from "@/store/use-current-report-store";

const ageGroupLabels = new Map(
  STAI_AGE_GROUP_OPTIONS.map(({ value, label }) => [value, label])
);

function NormNotice({ status }: { status: StaiNormStatus }) {
  if (status === "matched") return null;

  const content =
    status === "sex-missing"
      ? {
          title: "Selecciona el sexo",
          description:
            "Indica Varón o Mujer para consultar el baremo correspondiente.",
        }
      : {
          title: "Selecciona el grupo del baremo",
          description:
            "Indica Adolescente o Adulto para consultar los percentiles.",
        };

  return (
    <div className="mb-4 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2.5">
      <p className="text-body-md font-medium text-on-surface">
        {content.title}
      </p>
      <p className="mt-0.5 text-body-md text-on-surface-variant">
        {content.description}
      </p>
    </div>
  );
}

function ResultValue({ value }: { value: number | null }) {
  return value === null ? (
    <span className="text-outline">—</span>
  ) : (
    <span className="font-semibold text-on-surface">{value}</span>
  );
}

export function StaiResultsPanel() {
  const currentReportId = useCurrentReportStore(selectCurrentReportId);
  const answers = useCurrentReportStore(selectCurrentAnswers);
  const patientSex = useCurrentReportStore(selectCurrentPatientSex);
  const identification = useCurrentReportStore(selectCurrentStaiIdentification);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const summary = getStaiScoreSummary(identification, patientSex, answers);
  const markdown = buildStaiMarkdown(identification, patientSex, answers);
  const baremoLabel = identification.ageGroup
    ? ageGroupLabels.get(identification.ageGroup)
    : null;

  const handleCopy = async () => {
    setCopyError(null);
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError("No se pudo copiar la tabla.");
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-outline-variant bg-surface-container-lowest p-3">
        <div className="min-w-0">
          <h2 className="text-headline-md text-on-surface">Resultados STAI</h2>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <p className="text-body-md text-on-surface-variant">
              Puntuación directa y percentil
            </p>
            {baremoLabel ? (
              <span className="rounded-full bg-surface-container px-2 py-0.5 text-mono-sm font-medium text-primary">
                Baremo · {baremoLabel}
              </span>
            ) : null}
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
        <NormNotice status={summary.normStatus} />

        <div className="overflow-x-auto rounded-xl border border-outline-variant">
          <table className="w-full min-w-[360px] border-collapse bg-surface-container-lowest">
            <thead className="bg-surface-container-low">
              <tr className="text-mono-sm uppercase tracking-wider text-on-surface-variant">
                <th scope="col" className="px-4 py-2.5 text-left font-medium" />
                <th scope="col" className="px-3 py-2.5 text-center font-medium">
                  Ansiedad - estado
                </th>
                <th scope="col" className="px-4 py-2.5 text-center font-medium">
                  Ansiedad - rasgo
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-outline-variant align-middle">
                <th
                  scope="row"
                  className="px-4 py-3 text-left text-body-md font-medium text-on-surface"
                >
                  PD
                </th>
                <td className="px-3 py-3 text-center text-body-md tabular-nums">
                  <ResultValue value={summary.estado.directScore} />
                </td>
                <td className="px-4 py-3 text-center text-body-md tabular-nums">
                  <ResultValue value={summary.rasgo.directScore} />
                </td>
              </tr>
              <tr className="border-t border-outline-variant align-middle">
                <th
                  scope="row"
                  className="px-4 py-3 text-left text-body-md font-medium text-on-surface"
                >
                  Pc
                </th>
                <td className="px-3 py-3 text-center text-body-md tabular-nums">
                  <ResultValue value={summary.estado.percentile} />
                </td>
                <td className="px-4 py-3 text-center text-body-md tabular-nums">
                  <ResultValue value={summary.rasgo.percentile} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {!summary.estado.complete && !summary.rasgo.complete ? (
          <p className="mt-4 text-body-md leading-relaxed text-on-surface-variant">
            Las PD muestran el acumulado actual. Completa las 40 respuestas para
            calcular ambos percentiles.
          </p>
        ) : null}
        {summary.estado.complete && !summary.rasgo.complete ? (
          <p className="mt-4 text-body-md leading-relaxed text-on-surface-variant">
            Completa la sección Ansiedad-Rasgo para obtener su percentil.
          </p>
        ) : null}
        {!summary.estado.complete && summary.rasgo.complete ? (
          <p className="mt-4 text-body-md leading-relaxed text-on-surface-variant">
            Completa la sección Ansiedad-Estado para obtener su percentil.
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
          disabled={!currentReportId}
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
              Copiar tabla Markdown
            </>
          )}
        </button>
      </div>
    </div>
  );
}

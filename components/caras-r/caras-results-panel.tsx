"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import {
  buildCarasMarkdown,
  getCarasScoreSummary,
  type CarasNormStatus,
} from "@/lib/caras-r-scoring";
import { CARAS_COURSES } from "@/lib/caras-r-types";
import {
  selectCurrentAnswers,
  selectCurrentCarasIdentification,
  selectCurrentReportId,
  useCurrentReportStore,
} from "@/store/use-current-report-store";

const courseLabels = new Map(
  CARAS_COURSES.map(({ value, label }) => [value, label])
);

function NormNotice({ status }: { status: CarasNormStatus }) {
  if (status === "matched") return null;

  const content =
    status === "age-course-mismatch"
      ? {
          title: "Edad y curso incompatibles",
          description:
            "Corrige uno de los dos campos para consultar el baremo correspondiente.",
          error: true,
        }
      : {
          title: "Completa edad y curso",
          description:
            "Las puntuaciones se guardarán, pero los percentiles requieren ambos datos.",
          error: false,
        };

  return (
    <div
      className={`mb-4 rounded-lg border px-3 py-2.5 ${
        content.error
          ? "border-error/40 bg-error/5"
          : "border-outline-variant bg-surface-container-low"
      }`}
      role={content.error ? "alert" : undefined}
    >
      <p className="text-body-md font-medium text-on-surface">
        {content.title}
      </p>
      <p className="mt-0.5 text-body-md text-on-surface-variant">
        {content.description}
      </p>
    </div>
  );
}

function ResultValue({
  value,
  unmatched = false,
}: {
  value: number | null;
  unmatched?: boolean;
}) {
  if (unmatched) {
    return <span className="text-error">Sin correspondencia</span>;
  }
  return value === null ? (
    <span className="text-outline">—</span>
  ) : (
    <span className="font-semibold text-on-surface">{value}</span>
  );
}

export function CarasResultsPanel() {
  const currentReportId = useCurrentReportStore(selectCurrentReportId);
  const answers = useCurrentReportStore(selectCurrentAnswers);
  const identification = useCurrentReportStore(selectCurrentCarasIdentification);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const summary = getCarasScoreSummary(identification, answers);
  const markdown = buildCarasMarkdown(identification, answers);
  const baremoLabel = identification.course
    ? courseLabels.get(identification.course)
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
          <h2 className="text-headline-md text-on-surface">
            Resultados CARAS-R
          </h2>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <p className="text-body-md text-on-surface-variant">
              Puntuaciones directas y percentiles
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
          <table className="w-full min-w-[440px] border-collapse bg-surface-container-lowest">
            <thead className="bg-surface-container-low">
              <tr className="text-mono-sm uppercase tracking-wider text-on-surface-variant">
                <th scope="col" className="px-4 py-2.5 text-left font-medium">
                  PDPC
                </th>
                <th scope="col" className="px-3 py-2.5 text-center font-medium">
                  PD
                </th>
                <th scope="col" className="px-4 py-2.5 text-center font-medium">
                  PC
                </th>
              </tr>
            </thead>
            <tbody>
              {summary.rows.map((row) => (
                <tr
                  key={row.code}
                  className="border-t border-outline-variant align-middle"
                >
                  <th
                    scope="row"
                    className="px-4 py-3 text-left text-body-md font-medium text-on-surface"
                  >
                    {row.label}
                  </th>
                  <td className="px-3 py-3 text-center text-body-md tabular-nums">
                    <ResultValue value={row.directScore} />
                  </td>
                  <td className="px-4 py-3 text-center text-body-md tabular-nums">
                    <ResultValue
                      value={row.percentile}
                      unmatched={
                        summary.normStatus === "matched" &&
                        row.directScore !== null &&
                        row.percentile === null
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {summary.netScore === null ? (
          <p className="mt-4 text-body-md leading-relaxed text-on-surface-variant">
            Introduce Aciertos y Errores para calcular Netos e ICI.
          </p>
        ) : summary.ici === null ? (
          <p className="mt-4 text-body-md leading-relaxed text-on-surface-variant">
            El ICI no puede calcularse cuando no hay ninguna respuesta.
          </p>
        ) : (
          <p className="mt-4 text-body-md leading-relaxed text-on-surface-variant">
            El ICI se redondea al entero más próximo antes de consultar el
            baremo.
          </p>
        )}
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

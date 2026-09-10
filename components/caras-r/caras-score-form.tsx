"use client";

import { useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { IncompleteItemNavigation } from "@/components/progress/incomplete-item-navigation";
import { useIncompleteItemNavigation } from "@/hooks/use-incomplete-item-navigation";
import { CarasIdentificationFields } from "@/components/caras-r/caras-identification-fields";
import { CarasScoreInputRow } from "@/components/caras-r/caras-score-input-row";
import {
  selectCurrentAnswers,
  selectCurrentCarasIdentification,
  selectCurrentPatientName,
  selectCurrentReportId,
  useCurrentReportStore,
} from "@/store/use-current-report-store";

const INPUT_CODES = ["A", "E"] as const;

export function CarasScoreForm() {
  const answers = useCurrentReportStore(selectCurrentAnswers);
  const patientName = useCurrentReportStore(selectCurrentPatientName) ?? "";
  const identification = useCurrentReportStore(selectCurrentCarasIdentification);
  const currentReportId = useCurrentReportStore(selectCurrentReportId);
  const setAnswer = useCurrentReportStore((state) => state.setAnswer);
  const clearAnswer = useCurrentReportStore((state) => state.clearAnswer);
  const setPatientName = useCurrentReportStore((state) => state.setPatientName);
  const setIdentification = useCurrentReportStore(
    (state) => state.setCarasIdentification
  );
  const scoringEnabled = Boolean(currentReportId);
  const answeredCount = INPUT_CODES.filter(
    (code) => answers[code] !== undefined
  ).length;
  const resolveFocusTarget = useCallback(
    (code: string) => document.getElementById(`caras-score-${code}`),
    []
  );
  const incompleteNavigation = useIncompleteItemNavigation({
    itemIds: INPUT_CODES,
    answers,
    resolveFocusTarget,
    disabled: !scoringEnabled,
  });

  return (
    <div className="space-y-stack-section pb-10">
      {!scoringEnabled ? (
        <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
          <p className="text-body-md font-medium text-on-surface">
            Selecciona o crea un informe CARAS-R
          </p>
          <p className="mt-1 text-body-md leading-relaxed text-on-surface-variant">
            Abre un informe del histórico para editar sus datos y puntuaciones.
          </p>
        </div>
      ) : null}

      <details
        open
        className="group rounded-xl border border-outline-variant bg-surface-container-lowest shadow-level-1"
      >
        <summary className="interactive-press flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
          <span>
            <span className="block text-headline-md text-on-surface">
              Datos del baremo
            </span>
            <span className="mt-0.5 block text-body-md text-on-surface-variant">
              La edad y el curso determinan los percentiles.
            </span>
          </span>
          <ChevronDown
            className="size-5 shrink-0 text-on-surface-variant transition-transform group-open:rotate-180 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </summary>
        <div className="border-t border-outline-variant px-5 py-5">
          <CarasIdentificationFields
            idPrefix="caras-workspace"
            patientName={patientName}
            identification={identification}
            onPatientNameChange={setPatientName}
            onIdentificationChange={setIdentification}
            disabled={!scoringEnabled}
          />
        </div>
      </details>

      <section>
        <header className="mb-6">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <span className="text-label-md uppercase tracking-wider text-primary">
                CARAS-R
              </span>
              <h1 className="mt-1 text-headline-lg text-on-background">
                Puntuaciones directas
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <span className="text-mono-sm text-on-surface-variant">
                Progreso: {answeredCount} / {INPUT_CODES.length}
              </span>
              <IncompleteItemNavigation
                canNavigate={incompleteNavigation.canNavigate}
                onNavigatePrevious={incompleteNavigation.navigatePrevious}
                onNavigateNext={incompleteNavigation.navigateNext}
              />
            </div>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest"
            role="progressbar"
            aria-valuenow={answeredCount}
            aria-valuemin={0}
            aria-valuemax={INPUT_CODES.length}
            aria-label="Progreso de las puntuaciones CARAS-R"
          >
            <div
              className="h-2 rounded-full bg-primary transition-[width] duration-200 ease-out-strong motion-reduce:transition-none"
              style={{ width: `${(answeredCount / INPUT_CODES.length) * 100}%` }}
            />
          </div>
        </header>

        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
          {INPUT_CODES.map((code, index) => (
            <CarasScoreInputRow
              key={`${currentReportId ?? "none"}-${code}`}
              code={code}
              value={answers[code]}
              onValidChange={(score) => setAnswer(code, score)}
              onClear={() => clearAnswer(code)}
              disabled={!scoringEnabled}
              showTopBorder={index > 0}
            />
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-surface-container-low px-4 py-3">
            <p className="text-label-md font-semibold text-on-surface">Netos</p>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Aciertos − Errores
            </p>
          </div>
          <div className="rounded-xl bg-surface-container-low px-4 py-3">
            <p className="text-label-md font-semibold text-on-surface">ICI</p>
            <p className="mt-1 text-body-md text-on-surface-variant">
              (Netos ÷ Respuestas) × 100
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

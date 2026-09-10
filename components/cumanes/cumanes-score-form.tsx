"use client";

import { useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { IncompleteItemNavigation } from "@/components/progress/incomplete-item-navigation";
import { useIncompleteItemNavigation } from "@/hooks/use-incomplete-item-navigation";
import { CumanesIdentificationFields } from "@/components/cumanes/cumanes-identification-fields";
import { CumanesLateralitySection } from "@/components/cumanes/cumanes-laterality-section";
import { CumanesScoreInputRow } from "@/components/cumanes/cumanes-score-input-row";
import {
  CUMANES_TEST_GROUPS,
  CUMANES_TEST_ORDER,
} from "@/lib/cumanes-scoring";
import {
  selectCurrentAnswers,
  selectCurrentCumanesIdentification,
  selectCurrentCumanesLaterality,
  selectCurrentPatientName,
  selectCurrentPatientSex,
  selectCurrentReportId,
  useCurrentReportStore,
} from "@/store/use-current-report-store";

export function CumanesScoreForm() {
  const answers = useCurrentReportStore(selectCurrentAnswers);
  const patientName = useCurrentReportStore(selectCurrentPatientName) ?? "";
  const patientSex = useCurrentReportStore(selectCurrentPatientSex);
  const identification = useCurrentReportStore(
    selectCurrentCumanesIdentification
  );
  const laterality = useCurrentReportStore(selectCurrentCumanesLaterality);
  const currentReportId = useCurrentReportStore(selectCurrentReportId);
  const setAnswer = useCurrentReportStore((state) => state.setAnswer);
  const clearAnswer = useCurrentReportStore((state) => state.clearAnswer);
  const setPatientName = useCurrentReportStore((state) => state.setPatientName);
  const setPatientSex = useCurrentReportStore((state) => state.setPatientSex);
  const setIdentification = useCurrentReportStore(
    (state) => state.setCumanesIdentification
  );
  const setLaterality = useCurrentReportStore(
    (state) => state.setCumanesLaterality
  );
  const scoringEnabled = Boolean(currentReportId);
  const answeredCount = CUMANES_TEST_ORDER.filter(
    (code) => answers[code] !== undefined
  ).length;
  const progress = (answeredCount / CUMANES_TEST_ORDER.length) * 100;
  const resolveFocusTarget = useCallback(
    (code: string) => document.getElementById(`cumanes-score-${code}`),
    []
  );
  const incompleteNavigation = useIncompleteItemNavigation({
    itemIds: CUMANES_TEST_ORDER,
    answers,
    resolveFocusTarget,
    disabled: !scoringEnabled,
  });

  return (
    <div className="space-y-stack-section pb-10">
      {!scoringEnabled ? (
        <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
          <p className="text-body-md font-medium text-on-surface">
            Selecciona o crea un informe CUMANES
          </p>
          <p className="mt-1 text-body-md leading-relaxed text-on-surface-variant">
            Abre un informe del histórico para editar su identificación y sus
            puntuaciones directas.
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
              Datos de identificación
            </span>
            <span className="mt-0.5 block text-body-md text-on-surface-variant">
              Todos los campos son opcionales.
            </span>
          </span>
          <ChevronDown
            className="size-5 shrink-0 text-on-surface-variant transition-transform group-open:rotate-180 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </summary>
        <div className="border-t border-outline-variant px-5 py-5">
          <CumanesIdentificationFields
            idPrefix="cumanes-workspace"
            patientName={patientName}
            patientSex={patientSex}
            identification={identification}
            onPatientNameChange={setPatientName}
            onPatientSexChange={setPatientSex}
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
                CUMANES
              </span>
              <h1 className="mt-1 text-headline-lg text-on-background">
                Puntuaciones directas
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <span className="text-mono-sm text-on-surface-variant">
                Progreso: {answeredCount} / {CUMANES_TEST_ORDER.length}
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
            aria-valuemax={CUMANES_TEST_ORDER.length}
            aria-label="Progreso de las puntuaciones CUMANES"
          >
            <div
              className="h-2 rounded-full bg-primary transition-[width] duration-200 ease-out-strong motion-reduce:transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        <div className="space-y-5">
          {CUMANES_TEST_GROUPS.map((group) => {
            const headingId = `cumanes-group-${group.codes[0]}`;
            return (
              <section key={group.title} aria-labelledby={headingId}>
                <h2
                  id={headingId}
                  className="mb-2 text-label-md font-semibold uppercase tracking-wider text-on-surface-variant"
                >
                  {group.title}
                </h2>
                <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
                  {group.codes.map((code, index) => (
                    <CumanesScoreInputRow
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
              </section>
            );
          })}
        </div>
      </section>

      <CumanesLateralitySection
        value={laterality}
        onChange={setLaterality}
        disabled={!scoringEnabled}
      />
    </div>
  );
}

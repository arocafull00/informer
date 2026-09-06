"use client";

import { ChevronDown } from "lucide-react";
import { CumanesIdentificationFields } from "@/components/cumanes/cumanes-identification-fields";
import { CumanesLateralitySection } from "@/components/cumanes/cumanes-laterality-section";
import { Input } from "@/components/ui/input";
import {
  CUMANES_TEST_GROUPS,
  CUMANES_TEST_ORDER,
  cumanesNorms,
} from "@/lib/cumanes-scoring";
import type { TestCode } from "@/lib/cumanes-types";
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

  const handleScoreChange = (code: TestCode, value: string) => {
    if (value === "") {
      clearAnswer(code);
      return;
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 0) {
      clearAnswer(code);
      return;
    }
    setAnswer(code, parsed);
  };

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
            <span className="shrink-0 text-mono-sm text-on-surface-variant">
              Progreso: {answeredCount} / {CUMANES_TEST_ORDER.length}
            </span>
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
                    <div
                      key={code}
                      className={`grid min-h-16 grid-cols-[minmax(0,1fr)_7rem] items-center gap-4 px-4 py-3 ${
                        index > 0 ? "border-t border-outline-variant" : ""
                      }`}
                    >
                      <label
                        htmlFor={`cumanes-score-${code}`}
                        className="min-w-0"
                      >
                        <span className="block text-body-md font-medium text-on-surface">
                          {cumanesNorms.tests[code].name}
                        </span>
                        <span className="mt-0.5 block text-mono-sm font-medium text-primary">
                          {code}
                        </span>
                      </label>
                      <Input
                        id={`cumanes-score-${code}`}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={1}
                        value={answers[code] ?? ""}
                        onChange={(event) =>
                          handleScoreChange(code, event.target.value)
                        }
                        disabled={!scoringEnabled}
                        aria-label={`Puntuación directa de ${cumanesNorms.tests[code].name}`}
                        className="h-10 border-outline-variant bg-surface-container-lowest text-right text-body-lg tabular-nums text-on-surface"
                      />
                    </div>
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

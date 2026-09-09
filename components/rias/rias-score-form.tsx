"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RiasDirectScoresStep } from "./rias-direct-scores-step";
import { RiasIndicesStep } from "./rias-indices-step";
import { RiasIntervalsStep } from "./rias-intervals-step";
import { RiasPatientStep } from "./rias-patient-step";
import { RiasTScoresStep } from "./rias-t-scores-step";
import { RiasTSumsStep } from "./rias-t-sums-step";
import { RiasWizardStepIndicator } from "./rias-wizard-step-indicator";
import {
  RIAS_WIZARD_STEPS,
  isRiasWizardStepComplete,
} from "@/lib/rias-scoring";
import {
  selectCurrentReportId,
  selectCurrentRiasForm,
  useCurrentReportStore,
} from "@/store/use-current-report-store";

const LAST_STEP = RIAS_WIZARD_STEPS.length - 1;

export function RiasScoreForm() {
  const [step, setStep] = useState(0);
  const currentReportId = useCurrentReportStore(selectCurrentReportId);
  const form = useCurrentReportStore(selectCurrentRiasForm);
  const setRiasPatient = useCurrentReportStore((state) => state.setRiasPatient);
  const setRiasDirectScore = useCurrentReportStore(
    (state) => state.setRiasDirectScore,
  );
  const setRiasTScore = useCurrentReportStore((state) => state.setRiasTScore);
  const setRiasIndex = useCurrentReportStore((state) => state.setRiasIndex);
  const setRiasIntervalField = useCurrentReportStore(
    (state) => state.setRiasIntervalField,
  );
  const setRiasPercentile = useCurrentReportStore(
    (state) => state.setRiasPercentile,
  );

  const scoringEnabled = Boolean(currentReportId);
  const isCurrentStepComplete = isRiasWizardStepComplete(step, form);
  const isFirstStep = step === 0;
  const isLastStep = step === LAST_STEP;

  const handlePrevious = () => {
    if (step === 0) return;
    setStep(step - 1);
  };

  const handleNext = () => {
    if (step >= LAST_STEP) return;
    if (!isRiasWizardStepComplete(step, form)) return;
    setStep(step + 1);
  };

  return (
    <div className="space-y-stack-section pb-10">
      {!scoringEnabled ? (
        <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
          <p className="text-body-md font-medium text-on-surface">
            Selecciona o crea un informe RIAS
          </p>
          <p className="mt-1 text-body-md leading-relaxed text-on-surface-variant">
            Abre un informe del histórico para registrar los datos del paciente
            y las puntuaciones.
          </p>
        </div>
      ) : null}

      <header className="space-y-4">
        <div>
          <span className="text-label-md uppercase tracking-wider text-primary">
            RIAS
          </span>
          <h1 className="mt-1 text-headline-lg text-on-background">
            {RIAS_WIZARD_STEPS[step]}
          </h1>
        </div>
        <RiasWizardStepIndicator currentStep={step} />
      </header>

      <div
        className={
          scoringEnabled ? undefined : "pointer-events-none opacity-60"
        }
      >
        {step === 0 ? (
          <RiasPatientStep patient={form.patient} onChange={setRiasPatient} />
        ) : null}
        {step === 1 ? (
          <RiasDirectScoresStep
            directScores={form.directScores}
            onScoreChange={setRiasDirectScore}
          />
        ) : null}
        {step === 2 ? (
          <RiasTScoresStep
            tScores={form.tScores}
            onScoreChange={setRiasTScore}
          />
        ) : null}
        {step === 3 ? <RiasTSumsStep tSums={form.tSums} /> : null}
        {step === 4 ? (
          <RiasIndicesStep
            indices={form.indices}
            onIndexChange={setRiasIndex}
          />
        ) : null}
        {step === 5 ? (
          <RiasIntervalsStep
            intervals={form.intervals}
            percentiles={form.percentiles}
            onIntervalChange={setRiasIntervalField}
            onPercentileChange={setRiasPercentile}
          />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep || !scoringEnabled}
          className="border-outline-variant bg-surface-container text-on-surface hover:bg-surface-container-high"
        >
          Anterior
        </Button>
        {!isLastStep ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={!isCurrentStepComplete || !scoringEnabled}
            className="bg-primary text-on-primary hover:opacity-90"
          >
            Siguiente
          </Button>
        ) : null}
      </div>
    </div>
  );
}

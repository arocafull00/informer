"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { RiasDirectScoresStep } from "./rias-direct-scores-step";
import { RiasIndicesStep } from "./rias-indices-step";
import { RiasIntervalsStep } from "./rias-intervals-step";
import { RiasPatientStep } from "./rias-patient-step";
import { RiasTScoresStep } from "./rias-t-scores-step";
import { RiasTSumsStep } from "./rias-t-sums-step";
import { RiasWizardStepIndicator } from "./rias-wizard-step-indicator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { downloadRiasPdf } from "@/lib/rias-pdf/download-rias-pdf";
import {
  RIAS_WIZARD_STEPS,
  isRiasResultsFormComplete,
  isRiasWizardStepComplete,
} from "@/lib/rias-scoring";
import { useRiasResultsDraftStore } from "@/store/use-rias-results-draft-store";

type RiasGenerateResultsDialogProps = {
  open: boolean;
  onClose: () => void;
};

const LAST_STEP = RIAS_WIZARD_STEPS.length - 1;

const STEP_FIELD_SELECTOR =
  'input:not([disabled]):not([type="hidden"]):not([type="radio"]):not([type="checkbox"]):not([type="submit"]):not([type="button"])';

type RiasGenerateResultsWizardProps = {
  onClose: () => void;
};

function RiasGenerateResultsWizard({ onClose }: RiasGenerateResultsWizardProps) {
  const step = useRiasResultsDraftStore((state) => state.step);
  const form = useRiasResultsDraftStore((state) => state.form);
  const setStep = useRiasResultsDraftStore((state) => state.setStep);
  const setPatient = useRiasResultsDraftStore((state) => state.setPatient);
  const setDirectScore = useRiasResultsDraftStore((state) => state.setDirectScore);
  const setTScore = useRiasResultsDraftStore((state) => state.setTScore);
  const setIndex = useRiasResultsDraftStore((state) => state.setIndex);
  const setIntervalField = useRiasResultsDraftStore((state) => state.setIntervalField);
  const setPercentile = useRiasResultsDraftStore((state) => state.setPercentile);
  const resetDraft = useRiasResultsDraftStore((state) => state.reset);

  const stepContentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const isComplete = isRiasResultsFormComplete(form);
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

  const handleGenerate = async () => {
    if (!isRiasResultsFormComplete(form)) return;
    setIsGenerating(true);
    setGenerateError(null);
    try {
      await downloadRiasPdf(form);
      onClose();
    } catch (error) {
      setGenerateError(
        error instanceof Error ? error.message : "No se pudo generar el PDF",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancel = () => {
    resetDraft();
    onClose();
  };

  const getStepFields = () => {
    const root = stepContentRef.current;
    if (!root) return [];
    return Array.from(root.querySelectorAll<HTMLInputElement>(STEP_FIELD_SELECTOR));
  };

  const advanceWizard = () => {
    if (isGenerating) return;
    if (isLastStep) {
      if (!isComplete) return;
      void handleGenerate();
      return;
    }
    handleNext();
  };

  const handleFormKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== "Enter") return;
    if (event.nativeEvent.isComposing) return;

    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (target.type === "radio" || target.type === "checkbox") return;

    const fields = getStepFields();
    const currentIndex = fields.indexOf(target);
    if (currentIndex === -1) return;

    const nextField = fields[currentIndex + 1];
    if (nextField) {
      event.preventDefault();
      nextField.focus();
      if (nextField.type === "text") {
        nextField.select();
      }
      return;
    }

    event.preventDefault();
    advanceWizard();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    advanceWizard();
  };

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleFormKeyDown}
      className="flex min-h-0 flex-1 flex-col"
    >
      <DialogHeader className="shrink-0 border-b border-outline-variant px-6 py-5">
        <DialogTitle className="text-headline-md text-on-surface">
          Generar resultados RIAS
        </DialogTitle>
        <DialogDescription className="text-body-md text-on-surface-variant">
          {RIAS_WIZARD_STEPS[step]}
        </DialogDescription>
        <div className="pt-3">
          <RiasWizardStepIndicator currentStep={step} />
        </div>
      </DialogHeader>
      <ScrollArea className="min-h-0 flex-1">
        <div ref={stepContentRef} className="px-6 py-5">
          {step === 0 && (
            <RiasPatientStep patient={form.patient} onChange={setPatient} />
          )}
          {step === 1 && (
            <RiasDirectScoresStep
              directScores={form.directScores}
              onScoreChange={setDirectScore}
            />
          )}
          {step === 2 && (
            <RiasTScoresStep
              tScores={form.tScores}
              onScoreChange={setTScore}
            />
          )}
          {step === 3 && <RiasTSumsStep tSums={form.tSums} />}
          {step === 4 && (
            <RiasIndicesStep indices={form.indices} onIndexChange={setIndex} />
          )}
          {step === 5 && (
            <RiasIntervalsStep
              intervals={form.intervals}
              percentiles={form.percentiles}
              onIntervalChange={setIntervalField}
              onPercentileChange={setPercentile}
            />
          )}
        </div>
      </ScrollArea>
      <DialogFooter className="mx-0 mb-0 shrink-0 flex-col gap-3 border-t border-outline-variant bg-surface-container-lowest px-6 py-5 sm:flex-row sm:justify-between">
        {generateError && (
          <p className="w-full text-body-md text-error sm:order-first sm:basis-full">
            {generateError}
          </p>
        )}
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isGenerating}
            className="border-outline-variant bg-surface-container text-on-surface hover:bg-surface-container-high"
          >
            Reiniciar
          </Button>
          {!isFirstStep && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={isGenerating}
              className="border-outline-variant bg-surface-container text-on-surface hover:bg-surface-container-high"
            >
              Anterior
            </Button>
          )}
        </div>
        {isLastStep ? (
          <Button
            type="submit"
            disabled={!isComplete || isGenerating}
            className="bg-primary text-on-primary hover:opacity-90"
          >
            {isGenerating ? "Generando…" : "Generar resultados"}
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={!isCurrentStepComplete || isGenerating}
            className="bg-primary text-on-primary hover:opacity-90"
          >
            Siguiente
          </Button>
        )}
      </DialogFooter>
    </form>
  );
}

export function RiasGenerateResultsDialog({
  open,
  onClose,
}: RiasGenerateResultsDialogProps) {
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) return;
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {open ? (
        <DialogContent
          showCloseButton
          className="flex max-h-[90vh] w-full max-w-4xl flex-col gap-0 overflow-hidden border-outline-variant bg-surface-container-lowest p-0 sm:max-w-4xl"
        >
          <RiasGenerateResultsWizard onClose={onClose} />
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

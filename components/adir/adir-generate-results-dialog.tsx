"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { AdirAlgorithmStep } from "./adir-algorithm-step";
import { AdirInformantStep } from "./adir-informant-step";
import { AdirDomainScoresStep } from "./adir-domain-scores-step";
import { AdirTotalsStep } from "./adir-totals-step";
import { AdirSubjectStep } from "./adir-subject-step";
import { AdirWizardStepIndicator } from "./adir-wizard-step-indicator";
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
import { downloadAdirPdf } from "@/lib/adir-pdf/download-adir-pdf";
import {
  ADIR_DOMAIN_SCORE_STEP_OFFSET,
  ADIR_SCORE_SECTIONS,
  ADIR_WIZARD_STEPS,
  isAdirResultsFormComplete,
  isAdirWizardStepComplete,
} from "@/lib/adir-scoring";
import { useAdirResultsDraftStore } from "@/store/use-adir-results-draft-store";
import { useCurrentReportStore } from "@/store/use-current-report-store";

type AdirGenerateResultsDialogProps = {
  open: boolean;
  onClose: () => void;
};

const LAST_STEP = ADIR_WIZARD_STEPS.length - 1;

const STEP_FIELD_SELECTOR =
  'input:not([disabled]):not([type="hidden"]):not([type="radio"]):not([type="checkbox"]):not([type="submit"]):not([type="button"])';

type AdirGenerateResultsWizardProps = {
  onClose: () => void;
};

function AdirGenerateResultsWizard({ onClose }: AdirGenerateResultsWizardProps) {
  const step = useAdirResultsDraftStore((state) => state.step);
  const form = useAdirResultsDraftStore((state) => state.form);
  const setStep = useAdirResultsDraftStore((state) => state.setStep);
  const setSubject = useAdirResultsDraftStore((state) => state.setSubject);
  const setInformant = useAdirResultsDraftStore((state) => state.setInformant);
  const setAlgorithm = useAdirResultsDraftStore((state) => state.setAlgorithm);
  const setScore = useAdirResultsDraftStore((state) => state.setScore);
  const setTotal = useAdirResultsDraftStore((state) => state.setTotal);
  const syncComputedScores = useAdirResultsDraftStore(
    (state) => state.syncComputedScores
  );
  const resetDraft = useAdirResultsDraftStore((state) => state.reset);
  const adirAnswers = useCurrentReportStore((state) => state.answersByTest.ADIR);

  const stepContentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  useEffect(() => {
    syncComputedScores(adirAnswers);
  }, [adirAnswers, form.subject.chronologicalAge, syncComputedScores]);

  const isComplete = isAdirResultsFormComplete(form);
  const isCurrentStepComplete = isAdirWizardStepComplete(step, form);
  const isFirstStep = step === 0;
  const isLastStep = step === LAST_STEP;

  const handlePrevious = () => {
    if (step === 0) return;
    setStep(step - 1);
  };

  const handleNext = () => {
    if (step >= LAST_STEP) return;
    if (!isAdirWizardStepComplete(step, form)) return;
    setStep(step + 1);
  };

  const handleGenerate = async () => {
    if (!isAdirResultsFormComplete(form)) return;
    setIsGenerating(true);
    setGenerateError(null);
    try {
      await downloadAdirPdf(form);
      onClose();
    } catch (error) {
      setGenerateError(
        error instanceof Error ? error.message : "No se pudo generar el PDF"
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
          Generar resultados ADI-R
        </DialogTitle>
        <DialogDescription className="text-body-md text-on-surface-variant">
          {ADIR_WIZARD_STEPS[step]}
        </DialogDescription>
        <div className="pt-3">
          <AdirWizardStepIndicator currentStep={step} />
        </div>
      </DialogHeader>
      <ScrollArea className="min-h-0 flex-1">
        <div ref={stepContentRef} className="px-6 py-5">
          {step === 0 && (
            <AdirSubjectStep subject={form.subject} onChange={setSubject} />
          )}
          {step === 1 && (
            <AdirInformantStep
              informant={form.informant}
              onChange={setInformant}
            />
          )}
          {step === 2 && (
            <AdirAlgorithmStep
              algorithm={form.algorithm}
              onChange={setAlgorithm}
            />
          )}
          {step >= ADIR_DOMAIN_SCORE_STEP_OFFSET &&
            step < ADIR_DOMAIN_SCORE_STEP_OFFSET + ADIR_SCORE_SECTIONS.length && (
              <AdirDomainScoresStep
                sectionIndex={step - ADIR_DOMAIN_SCORE_STEP_OFFSET}
                scores={form.scores}
                onScoreChange={setScore}
              />
            )}
          {step === ADIR_DOMAIN_SCORE_STEP_OFFSET + ADIR_SCORE_SECTIONS.length && (
            <AdirTotalsStep totals={form.totals} onTotalChange={setTotal} />
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
            Cancelar
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

export function AdirGenerateResultsDialog({
  open,
  onClose,
}: AdirGenerateResultsDialogProps) {
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
          <AdirGenerateResultsWizard onClose={onClose} />
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

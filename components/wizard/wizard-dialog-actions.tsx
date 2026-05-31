import { Button } from "@/components/ui/button";

type WizardDialogActionsProps = {
  isFirstStep: boolean;
  isLastStep: boolean;
  isComplete: boolean;
  isCurrentStepComplete: boolean;
  isGenerating: boolean;
  onCancel: () => void;
  onPrevious: () => void;
  generateLabel?: string;
};

export function WizardDialogActions({
  isFirstStep,
  isLastStep,
  isComplete,
  isCurrentStepComplete,
  isGenerating,
  onCancel,
  onPrevious,
  generateLabel = "Generar resultados",
}: WizardDialogActionsProps) {
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-outline-variant px-6 py-4">
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="destructive"
          onClick={onCancel}
          disabled={isGenerating}
        >
          Reiniciar
        </Button>
        {!isFirstStep && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
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
          {isGenerating ? "Generando…" : generateLabel}
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
    </div>
  );
}

import { cn } from "@/lib/utils";
import { RIAS_WIZARD_STEPS, RIAS_WIZARD_STEP_SHORT_LABELS } from "@/lib/rias-scoring";

type RiasWizardStepIndicatorProps = {
  currentStep: number;
};

export function RiasWizardStepIndicator({
  currentStep,
}: RiasWizardStepIndicatorProps) {
  return (
    <ol className="flex min-w-0 gap-2 overflow-x-auto pb-1">
      {RIAS_WIZARD_STEP_SHORT_LABELS.map((label, index) => {
        const isActive = index === currentStep;
        const isComplete = index < currentStep;
        const fullLabel = RIAS_WIZARD_STEPS[index] ?? label;

        return (
          <li
            key={fullLabel}
            title={fullLabel}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-label-md whitespace-nowrap transition-colors",
              isActive && "bg-primary text-on-primary",
              isComplete &&
                !isActive &&
                "bg-surface-container-high text-on-surface",
              !isActive &&
                !isComplete &&
                "bg-surface-container text-on-surface-variant",
            )}
          >
            {label}
          </li>
        );
      })}
    </ol>
  );
}

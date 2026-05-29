import { cn } from "@/lib/utils";
import { RIAS_WIZARD_STEPS } from "@/lib/rias-scoring";

type RiasWizardStepIndicatorProps = {
  currentStep: number;
};

export function RiasWizardStepIndicator({
  currentStep,
}: RiasWizardStepIndicatorProps) {
  return (
    <ol className="flex flex-wrap gap-2 sm:flex-nowrap">
      {RIAS_WIZARD_STEPS.map((label, index) => {
        const isActive = index === currentStep;
        const isComplete = index < currentStep;

        return (
          <li
            key={label}
            className={cn(
              "rounded-full px-3 py-1 text-label-md transition-colors",
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

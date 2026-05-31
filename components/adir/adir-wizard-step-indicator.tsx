import { cn } from "@/lib/utils";
import { ADIR_WIZARD_STEPS } from "@/lib/adir-scoring";

type AdirWizardStepIndicatorProps = {
  currentStep: number;
};

export function AdirWizardStepIndicator({
  currentStep,
}: AdirWizardStepIndicatorProps) {
  return (
    <ol className="flex min-w-0 gap-2 overflow-x-auto pb-1">
      {ADIR_WIZARD_STEPS.map((label, index) => {
        const isActive = index === currentStep;
        const isComplete = index < currentStep;

        return (
          <li
            key={label}
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

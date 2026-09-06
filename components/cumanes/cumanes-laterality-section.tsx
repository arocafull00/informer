"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  CUMANES_LATERALITY_AREAS,
  CUMANES_LATERALITY_OPTIONS,
  type CumanesLaterality,
  type CumanesLateralityValue,
} from "@/lib/cumanes-types";

type CumanesLateralitySectionProps = {
  value: CumanesLaterality;
  onChange: (value: CumanesLaterality) => void;
  disabled?: boolean;
};

export function CumanesLateralitySection({
  value,
  onChange,
  disabled = false,
}: CumanesLateralitySectionProps) {
  return (
    <section aria-labelledby="cumanes-laterality-heading">
      <header className="mb-3">
        <h2
          id="cumanes-laterality-heading"
          className="text-headline-md text-on-background"
        >
          Lateralidad (LA)
        </h2>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Selecciona una opción para cada área. Todos los campos son opcionales.
        </p>
      </header>

      <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest">
        <div className="min-w-[760px]">
          <div
            className="grid grid-cols-[7rem_repeat(5,minmax(0,1fr))] border-b border-outline-variant bg-primary text-primary-foreground"
            aria-hidden="true"
          >
            <span className="px-3 py-3" />
            {CUMANES_LATERALITY_OPTIONS.map((option) => (
              <span
                key={option.value}
                className="flex min-h-14 items-center justify-center border-l border-primary-foreground/20 px-2 py-2 text-center text-label-md font-semibold leading-tight"
              >
                {option.label}
              </span>
            ))}
          </div>

          {CUMANES_LATERALITY_AREAS.map((area, areaIndex) => (
            <div
              key={area.value}
              className={`grid grid-cols-[7rem_minmax(0,1fr)] items-stretch ${
                areaIndex > 0 ? "border-t border-outline-variant" : ""
              }`}
            >
              <div
                id={`cumanes-laterality-${area.value}-label`}
                className="flex items-center px-4 py-3 text-body-md font-medium text-on-surface"
              >
                {area.label}
              </div>
              <RadioGroup
                value={value[area.value]}
                onValueChange={(nextValue) =>
                  onChange({
                    ...value,
                    [area.value]: nextValue as CumanesLateralityValue,
                  })
                }
                disabled={disabled}
                aria-labelledby={`cumanes-laterality-${area.value}-label`}
                className="grid grid-cols-5 gap-0"
              >
                {CUMANES_LATERALITY_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="flex min-h-14 cursor-pointer items-center justify-center border-l border-outline-variant px-2 py-3 has-data-checked:bg-primary/8 has-data-checked:text-primary"
                  >
                    <RadioGroupItem
                      value={option.value}
                      aria-label={`${area.label}: ${option.label}`}
                    />
                  </label>
                ))}
              </RadioGroup>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

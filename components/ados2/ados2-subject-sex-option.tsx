import { RadioGroupItem } from "@/components/ui/radio-group";
import type { Ados2SubjectSexOption } from "@/lib/ados2-pdf/types";

type Ados2SubjectSexOptionProps = {
  option: Ados2SubjectSexOption;
};

export function Ados2SubjectSexOptionRow({ option }: Ados2SubjectSexOptionProps) {
  return (
    <div className="relative flex min-h-10 flex-1 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 has-data-[checked]:border-primary has-data-[checked]:bg-surface-container focus-within:ring-2 focus-within:ring-ring/40">
      <RadioGroupItem
        id={`ados2-subject-sex-${option.value}`}
        value={option.value}
        aria-label={option.label}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer rounded-lg border-0 opacity-0"
      />
      <span className="pointer-events-none text-body-md text-on-surface">
        {option.label}
      </span>
    </div>
  );
}

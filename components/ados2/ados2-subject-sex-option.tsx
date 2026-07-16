import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";
import type { Ados2SubjectSexOption } from "@/lib/ados2-pdf/types";

type Ados2SubjectSexOptionProps = {
  option: Ados2SubjectSexOption;
};

export function Ados2SubjectSexOptionRow({ option }: Ados2SubjectSexOptionProps) {
  return (
    <Label
      htmlFor={`ados2-subject-sex-${option.value}`}
      className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 has-[:checked]:border-primary has-[:checked]:bg-surface-container"
    >
      <RadioGroupItem
        id={`ados2-subject-sex-${option.value}`}
        value={option.value}
        className="sr-only"
      />
      <span className="text-body-md text-on-surface">{option.label}</span>
    </Label>
  );
}

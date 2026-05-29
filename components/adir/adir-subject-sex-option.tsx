import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";
import type { AdirSubjectSexOption } from "@/lib/adir-scoring";

type AdirSubjectSexOptionProps = {
  option: AdirSubjectSexOption;
};

export function AdirSubjectSexOptionRow({ option }: AdirSubjectSexOptionProps) {
  return (
    <Label
      htmlFor={`adir-subject-sex-${option.value}`}
      className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 has-[:checked]:border-primary has-[:checked]:bg-surface-container"
    >
      <RadioGroupItem
        id={`adir-subject-sex-${option.value}`}
        value={option.value}
        className="sr-only"
      />
      <span className="text-body-md text-on-surface">{option.label}</span>
    </Label>
  );
}

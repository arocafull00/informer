import { AdirSubjectSexOptionRow } from "./adir-subject-sex-option";
import { RadioGroup } from "@/components/ui/radio-group";
import { SEX_OPTIONS, type AdirSubjectSex } from "@/lib/adir-scoring";

type AdirSubjectSexPickerProps = {
  value: AdirSubjectSex;
  onChange: (sex: AdirSubjectSex) => void;
};

export function AdirSubjectSexPicker({
  value,
  onChange,
}: AdirSubjectSexPickerProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(next) => {
        if (!next) return;
        onChange(next as AdirSubjectSex);
      }}
      className="grid w-full grid-cols-2 gap-2"
      aria-label="Sexo"
    >
      {SEX_OPTIONS.map((option) => (
        <AdirSubjectSexOptionRow key={option.value} option={option} />
      ))}
    </RadioGroup>
  );
}

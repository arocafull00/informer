import { RadioGroup } from "@/components/ui/radio-group";
import {
  ADOS2_SEX_OPTIONS,
  type Ados2SubjectSex,
} from "@/lib/ados2-pdf/types";
import { Ados2SubjectSexOptionRow } from "./ados2-subject-sex-option";

type Ados2SubjectSexPickerProps = {
  value: Ados2SubjectSex;
  onChange: (sex: Ados2SubjectSex) => void;
};

export function Ados2SubjectSexPicker({
  value,
  onChange,
}: Ados2SubjectSexPickerProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(next) => {
        if (!next) return;
        onChange(next as Ados2SubjectSex);
      }}
      className="grid w-full grid-cols-2 gap-2"
      aria-label="Sexo"
    >
      {ADOS2_SEX_OPTIONS.map((option) => (
        <Ados2SubjectSexOptionRow key={option.value} option={option} />
      ))}
    </RadioGroup>
  );
}

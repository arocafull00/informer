import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ALGORITHM_OPTIONS,
  type AdirAlgorithm,
  type AdirAlgorithmGroup,
} from "@/lib/adir-scoring";

type AdirAlgorithmStepProps = {
  algorithm: AdirAlgorithm;
  onChange: (algorithm: AdirAlgorithm) => void;
};

const GROUP_LABELS: Record<AdirAlgorithmGroup, string> = {
  conducta_actual: "Algoritmo de la conducta actual",
  diagnostico: "Algoritmo diagnóstico",
};

const GROUP_ORDER: AdirAlgorithmGroup[] = [
  "conducta_actual",
  "diagnostico",
];

type AdirAlgorithmOptionRowProps = {
  optionValue: AdirAlgorithm;
  label: string;
};

function AdirAlgorithmOptionRow({
  optionValue,
  label,
}: AdirAlgorithmOptionRowProps) {
  return (
    <Label
      htmlFor={`adir-algorithm-${optionValue}`}
      className="flex cursor-pointer items-start gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 has-[:checked]:border-primary has-[:checked]:bg-surface-container"
    >
      <RadioGroupItem
        id={`adir-algorithm-${optionValue}`}
        value={optionValue}
        className="mt-0.5"
      />
      <span className="text-body-md leading-snug text-on-surface">{label}</span>
    </Label>
  );
}

type AdirAlgorithmGroupBlockProps = {
  group: AdirAlgorithmGroup;
};

function AdirAlgorithmGroupBlock({ group }: AdirAlgorithmGroupBlockProps) {
  const options = ALGORITHM_OPTIONS.filter((option) => option.group === group);

  return (
    <div className="space-y-3">
      <p className="text-body-md font-medium text-on-surface">
        {GROUP_LABELS[group]}
      </p>
      <div className="space-y-2">
        {options.map((option) => (
          <AdirAlgorithmOptionRow
            key={option.value}
            optionValue={option.value}
            label={option.label}
          />
        ))}
      </div>
    </div>
  );
}

export function AdirAlgorithmStep({
  algorithm,
  onChange,
}: AdirAlgorithmStepProps) {
  return (
    <RadioGroup
      value={algorithm}
      onValueChange={(value) => {
        if (!value) return;
        onChange(value as AdirAlgorithm);
      }}
      className="gap-6"
    >
      {GROUP_ORDER.map((group) => (
        <AdirAlgorithmGroupBlock key={group} group={group} />
      ))}
    </RadioGroup>
  );
}

import { Label } from "@/components/ui/label";
import { RIAS_INDEX_KEYS, RIAS_INDEX_LABELS, type RiasTSums } from "@/lib/rias-scoring";

type RiasTSumsStepProps = {
  tSums: RiasTSums;
};

export function RiasTSumsStep({ tSums }: RiasTSumsStepProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-body-md font-medium text-on-surface">
        Suma de puntuaciones T
      </h3>
      <div className="space-y-2">
        {RIAS_INDEX_KEYS.map((key) => (
          <div key={key} className="grid grid-cols-[1fr_5rem] items-center gap-3">
            <Label
              htmlFor={`rias-tsum-${key}`}
              className="text-body-md font-medium text-on-surface"
            >
              {RIAS_INDEX_LABELS[key]}
            </Label>
            <div
              id={`rias-tsum-${key}`}
              className="flex h-9 items-center justify-end rounded-lg border border-outline-variant bg-surface-container px-2.5 text-body-md font-medium text-on-surface"
            >
              {tSums[key] === null ? "—" : tSums[key]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

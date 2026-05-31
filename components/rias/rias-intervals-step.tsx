import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RIAS_INDEX_KEYS,
  RIAS_INDEX_LABELS,
  type RiasIndexKey,
  type RiasIntervals,
  type RiasPercentiles,
} from "@/lib/rias-scoring";

type RiasIntervalsStepProps = {
  intervals: RiasIntervals;
  percentiles: RiasPercentiles;
  onIntervalChange: (key: keyof RiasIntervals, value: string) => void;
  onPercentileChange: (key: RiasIndexKey, value: string) => void;
};

export function RiasIntervalsStep({
  intervals,
  percentiles,
  onIntervalChange,
  onPercentileChange,
}: RiasIntervalsStepProps) {
  return (
    <div className="max-h-[calc(90vh-13rem)] overflow-y-auto pr-1">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="rias-confidence" className="text-body-md text-on-surface">
            Intervalo de confianza (%)
          </Label>
          <Input
            id="rias-confidence"
            inputMode="numeric"
            value={intervals.confidenceLevel}
            onChange={(e) => onIntervalChange("confidenceLevel", e.target.value)}
            placeholder="95"
            className="h-9 max-w-[8rem] border-outline-variant bg-surface-container-lowest text-body-md text-on-surface"
          />
        </div>
        {RIAS_INDEX_KEYS.map((key) => (
          <div key={key} className="space-y-2 rounded-lg border border-outline-variant p-3">
            <p className="text-body-md font-medium text-on-surface">
              {RIAS_INDEX_LABELS[key]}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor={`rias-interval-${key}`}
                  className="text-label-md text-on-surface-variant"
                >
                  Intervalo de confianza
                </Label>
                <Input
                  id={`rias-interval-${key}`}
                  value={intervals[key]}
                  onChange={(e) => onIntervalChange(key, e.target.value)}
                  placeholder="80-90"
                  className="h-9 border-outline-variant bg-surface-container-lowest text-body-md text-on-surface"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor={`rias-percentile-${key}`}
                  className="text-label-md text-on-surface-variant"
                >
                  Percentil
                </Label>
                <Input
                  id={`rias-percentile-${key}`}
                  value={percentiles[key]}
                  onChange={(e) => onPercentileChange(key, e.target.value)}
                  className="h-9 border-outline-variant bg-surface-container-lowest text-body-md text-on-surface"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

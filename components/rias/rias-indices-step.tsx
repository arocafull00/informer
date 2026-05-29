import { RiasScoreInputRow } from "./rias-score-input-row";
import {
  RIAS_INDEX_KEYS,
  RIAS_INDEX_LABELS,
  type RiasIndexKey,
  type RiasIndices,
} from "@/lib/rias-scoring";

type RiasIndicesStepProps = {
  indices: RiasIndices;
  onIndexChange: (key: RiasIndexKey, value: number | null) => void;
};

export function RiasIndicesStep({
  indices,
  onIndexChange,
}: RiasIndicesStepProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-body-md font-medium text-on-surface">Índices del RIAS</h3>
      <div className="space-y-2">
        {RIAS_INDEX_KEYS.map((key) => (
          <RiasScoreInputRow
            key={key}
            id={`rias-index-${key}`}
            label={RIAS_INDEX_LABELS[key]}
            value={indices[key]}
            onChange={(value) => onIndexChange(key, value)}
          />
        ))}
      </div>
    </div>
  );
}

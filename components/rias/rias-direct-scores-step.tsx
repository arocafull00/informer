import { RiasScoreInputRow } from "./rias-score-input-row";
import {
  RIAS_SUBTEST_KEYS,
  RIAS_SUBTEST_LABELS,
  type RiasDirectScores,
  type RiasSubtestKey,
} from "@/lib/rias-scoring";

type RiasDirectScoresStepProps = {
  directScores: RiasDirectScores;
  onScoreChange: (key: RiasSubtestKey, value: number | null) => void;
};

export function RiasDirectScoresStep({
  directScores,
  onScoreChange,
}: RiasDirectScoresStepProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {RIAS_SUBTEST_KEYS.map((key) => (
          <RiasScoreInputRow
            key={key}
            id={`rias-direct-${key}`}
            label={RIAS_SUBTEST_LABELS[key]}
            value={directScores[key]}
            onChange={(value) => onScoreChange(key, value)}
          />
        ))}
      </div>
    </div>
  );
}

import { RiasScoreInputRow } from "./rias-score-input-row";
import { RiasTScoreSectionTitle } from "./rias-t-score-section-title";
import {
  RIAS_SUBTEST_LABELS,
  RIAS_T_SCORE_SECTIONS,
  type RiasSubtestKey,
  type RiasTScores,
} from "@/lib/rias-scoring";

type RiasTScoresStepProps = {
  tScores: RiasTScores;
  onScoreChange: (key: RiasSubtestKey, value: number | null) => void;
};

export function RiasTScoresStep({
  tScores,
  onScoreChange,
}: RiasTScoresStepProps) {
  return (
    <div className="space-y-4">
      {RIAS_T_SCORE_SECTIONS.map((section) => (
        <div key={section.title} className="space-y-3">
          <RiasTScoreSectionTitle title={section.title} />
          <div className="space-y-2">
            {section.keys.map((key) => (
              <RiasScoreInputRow
                key={key}
                id={`rias-t-${key}`}
                label={RIAS_SUBTEST_LABELS[key]}
                value={tScores[key]}
                onChange={(value) => onScoreChange(key, value)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

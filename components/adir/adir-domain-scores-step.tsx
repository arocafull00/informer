import { AdirScoreInputRow } from "./adir-score-input-row";
import {
  ADIR_SCORE_SECTIONS,
  type AdirScoreKey,
  type AdirScores,
} from "@/lib/adir-scoring";

type AdirDomainScoresStepProps = {
  sectionIndex: number;
  scores: AdirScores;
  onScoreChange: (key: AdirScoreKey, value: number | null) => void;
};

export function AdirDomainScoresStep({
  sectionIndex,
  scores,
  onScoreChange,
}: AdirDomainScoresStepProps) {
  const section = ADIR_SCORE_SECTIONS[sectionIndex];
  if (!section) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-body-md font-medium text-on-surface">{section.title}</h3>
      <div className="space-y-2">
        {section.keys.map((key) => (
          <AdirScoreInputRow
            key={key}
            id={`adir-score-${key}`}
            label={key}
            value={scores[key]}
            onChange={(value) => onScoreChange(key, value)}
          />
        ))}
      </div>
    </div>
  );
}

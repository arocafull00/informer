import { AdirDomainScoreRow } from "./adir-domain-score-row";
import {
  ADIR_SCORE_SECTIONS,
  type AdirScoreKey,
  type AdirScores,
} from "@/lib/adir-scoring";
import type { AdirDomainScoringContext } from "@/lib/adir-domain-scoring";

type AdirDomainScoresStepProps = {
  sectionIndex: number;
  scores: AdirScores;
  answers: Record<string, number>;
  scoringContext: AdirDomainScoringContext;
  onScoreChange: (key: AdirScoreKey, value: number | null) => void;
};

export function AdirDomainScoresStep({
  sectionIndex,
  scores,
  answers,
  scoringContext,
  onScoreChange,
}: AdirDomainScoresStepProps) {
  const section = ADIR_SCORE_SECTIONS[sectionIndex];
  if (!section) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-body-md font-medium text-on-surface">{section.title}</h3>
      <div className="space-y-3">
        {section.keys.map((key) => (
          <AdirDomainScoreRow
            key={key}
            scoreKey={key}
            value={scores[key]}
            answers={answers}
            context={scoringContext}
            onChange={(value) => onScoreChange(key, value)}
          />
        ))}
      </div>
    </div>
  );
}

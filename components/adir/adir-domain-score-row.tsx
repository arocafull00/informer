import { AdirScoreBreakdownLabel } from "./adir-score-breakdown-label";
import { AdirScoreInputRow } from "./adir-score-input-row";
import {
  resolveAdirDomainQuestionIds,
  type AdirDomainScoringContext,
} from "@/lib/adir-domain-scoring";
import type { AdirScoreKey } from "@/lib/adir-scoring";

type AdirDomainScoreRowProps = {
  scoreKey: AdirScoreKey;
  value: number | null;
  answers: Record<string, number>;
  context: AdirDomainScoringContext;
  onChange: (value: number | null) => void;
};

export function AdirDomainScoreRow({
  scoreKey,
  value,
  answers,
  context,
  onChange,
}: AdirDomainScoreRowProps) {
  const questionIds = resolveAdirDomainQuestionIds(scoreKey, answers, context);

  return (
    <AdirScoreInputRow
      id={`adir-score-${scoreKey}`}
      label={
        <AdirScoreBreakdownLabel
          scoreKey={scoreKey}
          questionIds={questionIds}
          answers={answers}
        />
      }
      value={value}
      onChange={onChange}
    />
  );
}

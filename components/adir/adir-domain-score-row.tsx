import { AdirScoreInputRow } from "./adir-score-input-row";
import {
  formatAdirScoreBreakdown,
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
  const breakdown = formatAdirScoreBreakdown(questionIds, answers);

  return (
    <AdirScoreInputRow
      id={`adir-score-${scoreKey}`}
      label={breakdown}
      value={value}
      onChange={onChange}
    />
  );
}

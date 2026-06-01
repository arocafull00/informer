import {
  formatAdirQuestionBreakdown,
  formatAdirScoreKeyLabel,
} from "@/lib/adir-domain-scoring";
import type { AdirScoreKey } from "@/lib/adir-scoring";

type AdirScoreBreakdownLabelProps = {
  scoreKey: AdirScoreKey;
  questionIds: string[];
  answers: Record<string, number>;
};

export function AdirScoreBreakdownLabel({
  scoreKey,
  questionIds,
  answers,
}: AdirScoreBreakdownLabelProps) {
  const breakdown = formatAdirQuestionBreakdown(questionIds, answers);

  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className="inline-block rounded-md border border-outline-variant bg-surface-container px-1.5 py-0.5 font-medium tabular-nums text-on-surface">
        {formatAdirScoreKeyLabel(scoreKey)}
      </span>
      {breakdown ? (
        <span className="text-on-surface-variant">{breakdown}</span>
      ) : null}
    </span>
  );
}

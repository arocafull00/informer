import type { Ados2ScoreSummary } from "@/lib/ados2-scoring";
import { Ados2ScoreDomainBlock } from "./ados2-score-domain-block";

type Ados2ScoreSummaryProps = {
  summary: Ados2ScoreSummary;
};

export function Ados2ScoreSummaryView({ summary }: Ados2ScoreSummaryProps) {
  return (
    <div className="space-y-6">
      {summary.domains.map((domain) => (
        <Ados2ScoreDomainBlock
          key={domain.id}
          domain={domain}
          showCPlusIsr={domain.id === "isr"}
          cPlusIsr={domain.id === "isr" ? summary.cPlusIsr : undefined}
        />
      ))}
    </div>
  );
}

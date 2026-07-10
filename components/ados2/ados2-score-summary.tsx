import type { Ados2ScoreSummary } from "@/lib/ados2-scoring";
import type { TestType } from "@/lib/types";
import { Ados2ScoreDomainBlock } from "./ados2-score-domain-block";

type Ados2ScoreSummaryProps = {
  test: TestType;
  summary: Ados2ScoreSummary;
};

export function Ados2ScoreSummaryView({ test, summary }: Ados2ScoreSummaryProps) {
  const grandTotalLabel =
    test === "ADOS2_NINO"
      ? "PUNTUACIÓN TOTAL (AS + CRR)"
      : "PUNTUACIÓN TOTAL C+ISR";
  const showGrandTotalOnDomain = test === "ADOS2_NINO" ? "crr" : "isr";

  return (
    <div className="space-y-6">
      {summary.domains.map((domain) => (
        <Ados2ScoreDomainBlock
          key={domain.id}
          domain={domain}
          showGrandTotal={domain.id === showGrandTotalOnDomain}
          grandTotal={
            domain.id === showGrandTotalOnDomain ? summary.cPlusIsr : undefined
          }
          grandTotalLabel={grandTotalLabel}
        />
      ))}
    </div>
  );
}

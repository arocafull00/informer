import type { Ados2ScoreDomainResult } from "@/lib/ados2-scoring";
import { Ados2ScoreRow } from "./ados2-score-row";

type Ados2ScoreDomainBlockProps = {
  domain: Ados2ScoreDomainResult;
  showGrandTotal?: boolean;
  grandTotal?: number | null;
  grandTotalLabel?: string;
};

export function Ados2ScoreDomainBlock({
  domain,
  showGrandTotal = false,
  grandTotal = null,
  grandTotalLabel = "PUNTUACIÓN TOTAL C+ISR",
}: Ados2ScoreDomainBlockProps) {
  return (
    <section className="space-y-3 rounded-lg border border-primary/15 bg-slate-50 p-4">
      {domain.rows.map((row) => (
        <Ados2ScoreRow
          key={row.itemCode}
          label={`(${row.itemCode})`}
          score={row.score}
        />
      ))}
      {domain.totalLabel && (
        <Ados2ScoreRow
          label={domain.totalLabel}
          score={domain.total}
          variant="total"
        />
      )}
      {showGrandTotal && (
        <Ados2ScoreRow
          label={grandTotalLabel}
          score={grandTotal}
          variant="grandTotal"
        />
      )}
    </section>
  );
}

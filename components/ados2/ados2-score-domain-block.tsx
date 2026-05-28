import type { Ados2ScoreDomainResult } from "@/lib/ados2-scoring";
import { Ados2ScoreRow } from "./ados2-score-row";

type Ados2ScoreDomainBlockProps = {
  domain: Ados2ScoreDomainResult;
  showCPlusIsr?: boolean;
  cPlusIsr?: number | null;
};

export function Ados2ScoreDomainBlock({
  domain,
  showCPlusIsr = false,
  cPlusIsr = null,
}: Ados2ScoreDomainBlockProps) {
  const warm = domain.variant === "warm";

  return (
    <section
      className={`rounded-lg px-3 ${
        warm ? "bg-primary/8" : "bg-surface-container"
      }`}
    >
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
      {showCPlusIsr && (
        <Ados2ScoreRow
          label="PUNTUACIÓN TOTAL C+ISR"
          score={cPlusIsr}
          variant="grandTotal"
        />
      )}
    </section>
  );
}

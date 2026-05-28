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
    <section>
      <h4 className="mb-2 text-headline-md text-on-surface">{domain.title}</h4>
      <div
        className={`rounded-lg px-3 ${
          warm ? "bg-primary/8" : "bg-surface-container"
        }`}
      >
        {domain.rows.map((row) => (
          <Ados2ScoreRow
            key={row.itemCode}
            question={row.question}
            itemCode={row.itemCode}
            score={row.score}
          />
        ))}
        {domain.totalLabel && (
          <Ados2ScoreRow
            question={domain.totalLabel}
            itemCode=""
            score={domain.total}
            variant="total"
          />
        )}
        {showCPlusIsr && (
          <Ados2ScoreRow
            question="PUNTUACIÓN TOTAL C+ISR"
            itemCode=""
            score={cPlusIsr}
            variant="grandTotal"
          />
        )}
      </div>
    </section>
  );
}

type Ados2ScoreRowProps = {
  question: string;
  itemCode: string;
  score: number | null;
  variant?: "default" | "total" | "grandTotal";
};

export function Ados2ScoreRow({
  question,
  itemCode,
  score,
  variant = "default",
}: Ados2ScoreRowProps) {
  const isTotal = variant === "total" || variant === "grandTotal";

  return (
    <div
      className={`grid grid-cols-[1fr_auto] items-center gap-3 py-2 ${
        isTotal ? "font-semibold" : ""
      }`}
    >
      <div className="min-w-0">
        {isTotal ? (
          <span className="text-body-md text-on-surface">{question}</span>
        ) : (
          <span className="text-body-md text-on-surface">
            <span>{question}</span>
            <span className="text-on-surface-variant"> ({itemCode})</span>
          </span>
        )}
      </div>
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-lg border text-body-md tabular-nums ${
          variant === "grandTotal"
            ? "border-primary bg-primary/15 text-on-surface"
            : isTotal
              ? "border-outline-variant bg-surface-container-lowest text-on-surface"
              : "border-outline-variant bg-surface-container-lowest text-on-surface"
        }`}
      >
        {score !== null ? score : "—"}
      </div>
    </div>
  );
}

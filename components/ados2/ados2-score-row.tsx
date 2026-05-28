type Ados2ScoreRowProps = {
  label: string;
  score: number | null;
  variant?: "default" | "total" | "grandTotal";
};

const scoreBoxBase =
  "flex h-10 w-12 shrink-0 items-center justify-center rounded-md border bg-white text-slate-800 shadow-sm tabular-nums";

export function Ados2ScoreRow({
  label,
  score,
  variant = "default",
}: Ados2ScoreRowProps) {
  if (variant === "total" || variant === "grandTotal") {
    const isGrandTotal = variant === "grandTotal";

    return (
      <div
        className={`flex items-center justify-between border-t border-primary/20 pt-3 ${
          isGrandTotal ? "mt-1" : "mt-3"
        }`}
      >
        <span className="font-bold text-slate-900">{label}</span>
        <div
          className={`${scoreBoxBase} font-bold ${
            isGrandTotal
              ? "border-2 border-primary bg-primary/10"
              : "border-2 border-primary/20"
          }`}
        >
          {score !== null ? score : "—"}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <span className="font-medium text-slate-700">{label}</span>
      <div className={`${scoreBoxBase} border-slate-200 font-semibold`}>
        {score !== null ? score : "—"}
      </div>
    </div>
  );
}

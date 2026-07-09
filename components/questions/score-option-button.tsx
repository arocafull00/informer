"use client";

import { cn } from "@/lib/utils";

type ScoreOptionButtonProps = {
  score: number;
  label?: string;
  isSelected: boolean;
  variant: "compact" | "labeled";
  onSelect: () => void;
};

export function ScoreOptionButton({
  score,
  label,
  isSelected,
  variant,
  onSelect,
}: ScoreOptionButtonProps) {
  const ariaLabel = label ? `${score}: ${label}` : String(score);

  if (variant === "labeled") {
    return (
      <button
        type="button"
        aria-label={ariaLabel}
        aria-pressed={isSelected}
        className={cn(
          "interactive-press flex w-full items-start gap-3 rounded-lg border p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          isSelected
            ? "border-2 border-primary bg-primary/5"
            : "border-outline-variant hover:bg-surface-container"
        )}
        onClick={onSelect}
      >
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md border text-body-md font-semibold tabular-nums",
            isSelected
              ? "border-primary bg-primary text-on-primary"
              : "border-outline-variant text-on-surface-variant"
          )}
        >
          {score}
        </span>
        {label && (
          <span className="min-w-0 flex-1 text-body-md leading-snug text-on-surface">
            {label}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      title={label}
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      className={cn(
        "interactive-press flex size-10 items-center justify-center rounded-lg border text-body-md tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        isSelected
          ? "border-2 border-primary bg-primary text-on-primary shadow-inner"
          : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
      )}
      onClick={onSelect}
    >
      {score}
    </button>
  );
}

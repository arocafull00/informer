"use client";

import { CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReportCompleteness } from "@/lib/get-report-completeness";

type ReportCompletenessBadgeProps = {
  completeness: ReportCompleteness;
  compact?: boolean;
};

export function ReportCompletenessBadge({
  completeness,
  compact = false,
}: ReportCompletenessBadgeProps) {
  if (!completeness.isComplete) return null;

  if (compact) {
    return (
      <CircleCheck
        className="size-3.5 shrink-0 text-primary"
        aria-label="Informe completo"
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 text-label-md text-on-surface-variant"
      )}
    >
      <CircleCheck className="size-3.5 text-primary" aria-hidden="true" />
      Completo
    </span>
  );
}

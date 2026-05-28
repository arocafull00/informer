"use client";

import { useCurrentReportStore } from "@/store/use-current-report-store";
import { cn } from "@/lib/utils";

interface ScoreSelectorProps {
  questionId: string;
}

export function ScoreSelector({ questionId }: ScoreSelectorProps) {
  const { answers, setAnswer } = useCurrentReportStore();
  const selected = answers[questionId];

  return (
    <div
      className="inline-flex shrink-0 rounded-md border border-border bg-muted/50 p-0.5"
      role="group"
      aria-label="Puntuación"
    >
      {[0, 1, 2, 3].map((score) => {
        const isSelected = selected === score;
        return (
          <button
            key={score}
            type="button"
            aria-pressed={isSelected}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-[calc(var(--radius-md)-2px)] text-sm font-medium tabular-nums transition-all duration-200 motion-reduce:transition-none outline-none",
              "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              "active:scale-[0.97]",
              isSelected
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            )}
            onClick={() => setAnswer(questionId, score)}
          >
            {score}
          </button>
        );
      })}
    </div>
  );
}

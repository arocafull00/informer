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
    <div className="flex gap-2" role="group" aria-label="Puntuación">
      {[0, 1, 2, 3].map((score) => {
        const isSelected = selected === score;
        return (
          <button
            key={score}
            type="button"
            aria-pressed={isSelected}
            className={cn(
              "flex size-10 items-center justify-center rounded-lg border text-body-md tabular-nums transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100",
              isSelected
                ? "border-2 border-primary bg-primary text-on-primary shadow-inner"
                : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
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

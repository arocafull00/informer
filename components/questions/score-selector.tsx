"use client";

import { useMemo } from "react";
import { getAnswerScores } from "@/lib/get-answer-scores";
import { useCurrentReportStore } from "@/store/use-current-report-store";
import { cn } from "@/lib/utils";

interface ScoreSelectorProps {
  questionId: string;
  options: Record<string, string>;
}

export function ScoreSelector({ questionId, options }: ScoreSelectorProps) {
  const { answers, setAnswer } = useCurrentReportStore();
  const selected = answers[questionId];
  const scores = useMemo(() => getAnswerScores(options), [options]);

  if (scores.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Puntuación">
      {scores.map((score) => {
        const isSelected = selected === score;
        const label = options[String(score)];

        return (
          <button
            key={score}
            type="button"
            title={label}
            aria-label={label ? `${score}: ${label}` : String(score)}
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

"use client";

import { useMemo } from "react";
import { getAnswerScores } from "@/lib/get-answer-scores";
import {
  selectCurrentAnswers,
  useCurrentReportStore,
} from "@/store/use-current-report-store";
import { ScoreOptionButton } from "./score-option-button";

interface ScoreSelectorProps {
  questionId: string;
  options: Record<string, string>;
  showLabels?: boolean;
}

export function ScoreSelector({
  questionId,
  options,
  showLabels = false,
}: ScoreSelectorProps) {
  const answers = useCurrentReportStore(selectCurrentAnswers);
  const setAnswer = useCurrentReportStore((s) => s.setAnswer);
  const selected = answers[questionId];
  const scores = useMemo(() => getAnswerScores(options), [options]);
  const variant = showLabels ? "labeled" : "compact";

  if (scores.length === 0) {
    return null;
  }

  return (
    <div
      className={
        showLabels ? "flex flex-col gap-2" : "flex flex-wrap gap-2"
      }
      role="group"
      aria-label="Puntuación"
    >
      {scores.map((score) => (
        <ScoreOptionButton
          key={score}
          score={score}
          label={options[String(score)]}
          isSelected={selected === score}
          variant={variant}
          onSelect={() => setAnswer(questionId, score)}
        />
      ))}
    </div>
  );
}

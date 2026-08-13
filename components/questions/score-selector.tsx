"use client";

import { useMemo } from "react";
import { getAnswerScores } from "@/lib/get-answer-scores";
import { applyGenderedPhrasing } from "@/lib/gendered-phrasing";
import {
  selectCurrentAnswers,
  selectCurrentPatientSex,
  useCurrentReportStore,
} from "@/store/use-current-report-store";
import { ScoreOptionButton } from "./score-option-button";

interface ScoreSelectorProps {
  questionId: string;
  options: Record<string, string>;
  showLabels?: boolean;
  disabled?: boolean;
}

export function ScoreSelector({
  questionId,
  options,
  showLabels = false,
  disabled = false,
}: ScoreSelectorProps) {
  const answers = useCurrentReportStore(selectCurrentAnswers);
  const patientSex = useCurrentReportStore(selectCurrentPatientSex);
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
      aria-disabled={disabled}
    >
      {scores.map((score) => (
        <ScoreOptionButton
          key={score}
          score={score}
          label={applyGenderedPhrasing(options[String(score)], patientSex)}
          isSelected={selected === score}
          variant={variant}
          disabled={disabled}
          onSelect={() => {
            if (disabled) return;
            setAnswer(questionId, score);
          }}
        />
      ))}
    </div>
  );
}

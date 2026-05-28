"use client";

import { useCurrentReportStore } from "@/store/use-current-report-store";
import { Button } from "@/components/ui/button";

interface ScoreSelectorProps {
  questionId: string;
}

export function ScoreSelector({ questionId }: ScoreSelectorProps) {
  const { answers, setAnswer } = useCurrentReportStore();
  const selected = answers[questionId];

  return (
    <div className="flex gap-1">
      {[0, 1, 2, 3].map((score) => (
        <Button
          key={score}
          variant={selected === score ? "default" : "outline"}
          size="sm"
          className="h-8 w-8 p-0 transition-transform active:scale-[0.97]"
          onClick={() => setAnswer(questionId, score)}
        >
          {score}
        </Button>
      ))}
    </div>
  );
}
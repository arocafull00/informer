"use client";

import type { Question } from "@/lib/types";
import { ScoreSelector } from "./score-selector";

interface QuestionRowProps {
  question: Question;
}

export function QuestionRow({ question }: QuestionRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium tabular-nums text-muted-foreground">
          {question.number}
        </span>
        <span className="text-sm leading-relaxed text-foreground">{question.question}</span>
      </div>
      <ScoreSelector questionId={question.id} />
    </div>
  );
}

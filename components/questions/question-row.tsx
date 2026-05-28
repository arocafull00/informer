"use client";

import type { Question } from "@/lib/types";
import { ScoreSelector } from "./score-selector";

interface QuestionRowProps {
  question: Question;
}

export function QuestionRow({ question }: QuestionRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-sm font-medium">
          {question.number}
        </span>
        <span className="text-sm">{question.question}</span>
      </div>
      <ScoreSelector questionId={question.id} />
    </div>
  );
}
"use client";

import type { Question } from "@/lib/types";
import { ScoreSelector } from "./score-selector";

interface QuestionCardProps {
  question: Question;
}

export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-level-1 transition-shadow hover:shadow-md">
      <div className="flex gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-container">
          <span className="text-label-md text-primary">{question.number}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 text-body-lg font-semibold text-on-surface">
            {question.question}
          </h3>
          <ScoreSelector questionId={question.id} />
        </div>
      </div>
    </div>
  );
}

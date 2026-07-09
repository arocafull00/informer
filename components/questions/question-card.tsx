"use client";

import type { Question } from "@/lib/types";
import { ScoreSelector } from "./score-selector";

interface QuestionCardProps {
  question: Question;
  displayCode?: string;
  showAnswerLabels?: boolean;
}

export function QuestionCard({
  question,
  displayCode,
  showAnswerLabels = false,
}: QuestionCardProps) {
  return (
    <div className="card-interactive rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-level-1">
      <div className="flex gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-container">
          <span className="text-label-md text-primary">
            {displayCode ?? question.code}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 text-body-lg font-semibold text-on-surface">
            {question.question}
          </h3>
          <ScoreSelector
            questionId={question.id}
            options={question.answers}
            showLabels={showAnswerLabels}
          />
        </div>
      </div>
    </div>
  );
}

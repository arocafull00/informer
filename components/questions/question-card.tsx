"use client";

import type { Question } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ScoreSelector } from "./score-selector";

interface QuestionCardProps {
  question: Question;
  isSubItem?: boolean;
  displayCode?: string;
}

export function QuestionCard({
  question,
  isSubItem = false,
  displayCode,
}: QuestionCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-level-1 transition-shadow hover:shadow-md",
        isSubItem && "ml-6 border-l-2 border-l-primary/30"
      )}
    >
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
          <ScoreSelector questionId={question.id} options={question.answers} />
        </div>
      </div>
    </div>
  );
}

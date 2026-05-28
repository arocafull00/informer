"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { useCurrentReportStore } from "@/store/use-current-report-store";
import { generateMarkdown } from "@/lib/generators/generate-markdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CopyButton } from "./copy-button";
import adirData from "@/data/adir.json";
import ados2Data from "@/data/ados2.json";
import type { Question, TestType } from "@/lib/types";

const testData: Record<TestType, Question[]> = {
  ADIR: adirData as unknown as Question[],
  ADOS2: ados2Data as unknown as Question[],
};

export function MarkdownPreview() {
  const { currentTest, answers } = useCurrentReportStore();

  const markdown = useMemo(() => {
    const questions = testData[currentTest];
    return generateMarkdown(questions, answers);
  }, [currentTest, answers]);

  const isEmpty = markdown.split("\n").filter(Boolean).length <= 2;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-medium text-foreground">Vista previa</h3>
        <CopyButton text={markdown} />
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="px-4 py-4">
          {isEmpty ? (
            <div>
              <p className="text-sm font-medium text-foreground">Informe vacío</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Asigna puntuaciones en el panel central para generar el texto del informe.
              </p>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none text-foreground prose-headings:font-medium prose-headings:tracking-tight prose-p:text-sm prose-p:leading-relaxed prose-p:text-muted-foreground prose-strong:text-foreground">
              <ReactMarkdown>{markdown}</ReactMarkdown>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

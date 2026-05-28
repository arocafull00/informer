"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { useCurrentReportStore } from "@/store/use-current-report-store";
import { generateMarkdown } from "@/lib/generators/generate-markdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CopyButton } from "./copy-button";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="sticky top-0 h-fit">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium">Vista previa</h3>
          <CopyButton text={markdown} />
        </div>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            {isEmpty ? (
              <p className="text-sm italic text-muted-foreground">
                Responde las preguntas para ver el informe
              </p>
            ) : (
              <ReactMarkdown>{markdown}</ReactMarkdown>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
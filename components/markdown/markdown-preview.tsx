"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { AdirGenerateResultsDialog } from "@/components/adir/adir-generate-results-dialog";
import { Ados2ScoreSummaryDialog } from "@/components/ados2/ados2-score-summary-dialog";
import { isAdos2Test } from "@/lib/ados2-labels";
import { buildAdos2ScoreSummary } from "@/lib/ados2-scoring";
import { testData, testLabels } from "@/lib/test-data";
import { useReportMarkdown } from "@/lib/use-save-report";
import {
  selectCurrentAnswers,
  selectCurrentReportId,
  useCurrentReportStore,
} from "@/store/use-current-report-store";

export function MarkdownPreview() {
  const currentTest = useCurrentReportStore((state) => state.currentTest);
  const answers = useCurrentReportStore(selectCurrentAnswers);
  const currentReportId = useCurrentReportStore(selectCurrentReportId);
  const markdown = useReportMarkdown();
  const [copied, setCopied] = useState(false);
  const [adirDialogOpen, setAdirDialogOpen] = useState(false);
  const [adosDialogOpen, setAdosDialogOpen] = useState(false);

  const isAdos2 = isAdos2Test(currentTest);
  const scoreSummary = useMemo(() => {
    if (!isAdos2) return null;
    return buildAdos2ScoreSummary(
      currentTest,
      testData[currentTest],
      answers
    );
  }, [answers, currentTest, isAdos2]);

  const isEmpty = useMemo(
    () => markdown.split("\n").filter(Boolean).length <= 2,
    [markdown]
  );

  const handleCopyText = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = () => {
    if (!currentReportId) return;
    if (isAdos2) {
      if (scoreSummary) setAdosDialogOpen(true);
      return;
    }
    setAdirDialogOpen(true);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-outline-variant bg-surface-container-lowest p-3">
        <h2 className="text-headline-md text-on-surface">
          Vista previa del informe
        </h2>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-md bg-surface-container px-2 py-1 text-mono-sm font-medium text-primary">
            {currentReportId ? testLabels[currentTest] : "Sin informe activo"}
          </span>
          {currentReportId ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 text-label-md text-on-surface-variant">
              <Check className="size-3.5 text-primary" aria-hidden="true" />
              Guardado
            </span>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-surface-container-lowest p-4">
        {isEmpty ? (
          <div>
            <p className="text-body-md font-medium text-on-surface">
              Informe vacío
            </p>
            <p className="mt-1 text-body-md leading-relaxed text-on-surface-variant">
              Asigna puntuaciones en el panel central para generar el texto del
              informe.
            </p>
          </div>
        ) : (
          <div className="max-w-none text-on-surface-variant [&_li]:text-body-md [&_li]:leading-[1.6] [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_p]:text-body-md [&_p]:leading-[1.6] [&_strong]:font-semibold [&_strong]:text-on-surface [&_ul]:my-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </div>
        )}
      </div>

      <div className="flex shrink-0 gap-2 border-t border-outline-variant bg-surface-container-lowest p-3">
        <button
          type="button"
          onClick={handleCopyText}
          className="interactive-press flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-surface-container px-3 py-2 text-label-md text-on-surface hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {copied ? (
            <>
              <Check className="size-4" aria-hidden="true" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="size-4" aria-hidden="true" />
              Copiar texto
            </>
          )}
        </button>
        {currentReportId ? (
          <button
            type="button"
            onClick={handleGenerate}
            className="interactive-press flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-label-md text-on-primary hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Sparkles className="size-4" aria-hidden="true" />
            {isAdos2 ? "Generar ADOS-2" : "Generar ADI-R"}
          </button>
        ) : null}
      </div>

      <AdirGenerateResultsDialog
        open={adirDialogOpen}
        onClose={() => setAdirDialogOpen(false)}
      />
      {scoreSummary ? (
        <Ados2ScoreSummaryDialog
          key={currentTest}
          open={adosDialogOpen}
          test={currentTest}
          testLabel={testLabels[currentTest]}
          summary={scoreSummary}
          onClose={() => setAdosDialogOpen(false)}
        />
      ) : null}
    </div>
  );
}

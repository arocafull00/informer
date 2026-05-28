"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Check, Copy } from "lucide-react";
import { useSaveReport } from "@/lib/use-save-report";
import { SaveReportTitleDialog } from "@/components/reports/save-report-title-dialog";
import { CopyButton } from "./copy-button";

export function MarkdownPreview() {
  const { trySave, saveWithTitle, hasAnswers, markdown, suggestedTitle } =
    useSaveReport();
  const [copied, setCopied] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const isEmpty = useMemo(
    () => markdown.split("\n").filter(Boolean).length <= 2,
    [markdown]
  );

  const handleCopyText = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveClick = () => {
    if (!hasAnswers) return;
    if (trySave()) return;
    setSaveDialogOpen(true);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-outline-variant bg-surface-container-lowest p-3">
        <h2 className="text-headline-md text-on-surface">VISTA PREVIA DEL INFORME</h2>
        <CopyButton text={markdown} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto bg-surface-container-lowest p-4">
        {isEmpty ? (
          <div>
            <p className="text-body-md font-medium text-on-surface">Informe vacío</p>
            <p className="mt-1 text-body-md leading-relaxed text-on-surface-variant">
              Asigna puntuaciones en el panel central para generar el texto del informe.
            </p>
          </div>
        ) : (
          <div className="max-w-none text-on-surface-variant [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_li]:text-body-md [&_li]:leading-[1.6] [&_p]:text-body-md [&_p]:leading-[1.6] [&_strong]:font-semibold [&_strong]:text-on-surface">
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </div>
        )}
      </div>
      <div className="flex shrink-0 gap-3 border-t border-outline-variant bg-surface-container-lowest p-3">
        <button
          type="button"
          onClick={handleCopyText}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-surface-container py-2 text-label-md text-on-surface transition-colors hover:bg-surface-container-high active:scale-[0.98]"
        >
          {copied ? (
            <>
              <Check className="size-4" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="size-4" />
              Copiar Texto
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleSaveClick}
          disabled={!hasAnswers}
          className="flex-1 rounded-lg bg-primary py-2 text-label-md text-on-primary transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
        >
          Guardar Informe
        </button>
      </div>
      <SaveReportTitleDialog
        open={saveDialogOpen}
        suggestedTitle={suggestedTitle}
        onClose={() => setSaveDialogOpen(false)}
        onConfirm={saveWithTitle}
      />
    </div>
  );
}

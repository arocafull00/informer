"use client";

import { useEffect, useRef, useState } from "react";
import { AdirSubjectSexPicker } from "@/components/adir/adir-subject-sex-picker";
import { Ados2SubjectSexPicker } from "@/components/ados2/ados2-subject-sex-picker";
import { isAdos2Test } from "@/lib/ados2-labels";
import type { Ados2SubjectSex } from "@/lib/ados2-pdf/types";
import type { AdirSubjectSex } from "@/lib/adir-scoring";
import type { TestType } from "@/lib/types";

type NewReportDialogProps = {
  open: boolean;
  currentTest: TestType;
  suggestedTitle: string;
  onClose: () => void;
  onConfirm: (title: string, patientSex: string) => void;
};

export function NewReportDialog({
  open,
  currentTest,
  suggestedTitle,
  onClose,
  onConfirm,
}: NewReportDialogProps) {
  const [title, setTitle] = useState("");
  const [adirSex, setAdirSex] = useState<AdirSubjectSex>("");
  const [adosSex, setAdosSex] = useState<Ados2SubjectSex>("");
  const [prevOpen, setPrevOpen] = useState(open);
  const inputRef = useRef<HTMLInputElement>(null);
  const isAdos2 = isAdos2Test(currentTest);
  const patientSex = isAdos2 ? adosSex : adirSex;

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setTitle("");
      setAdirSex("");
      setAdosSex("");
    }
  }

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleConfirm = () => {
    if (!patientSex) return;
    onConfirm(title.trim() || suggestedTitle, patientSex);
    onClose();
  };

  return (
    <div
      className="dialog-backdrop fixed inset-0 z-50 flex items-center justify-center bg-on-background/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-labelledby="new-report-heading"
        className="dialog-content w-full max-w-sm rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="new-report-heading" className="text-headline-md text-on-surface">
          Nuevo informe
        </h3>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Indica el título y el sexo del paciente.
        </p>
        <div className="mt-3 space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="new-report-title"
              className="text-body-md text-on-surface"
            >
              Título
            </label>
            <input
              ref={inputRef}
              id="new-report-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && patientSex) {
                  handleConfirm();
                }
              }}
              placeholder={suggestedTitle}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface outline-none focus:border-primary"
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-body-md text-on-surface">Sexo</p>
            {isAdos2 ? (
              <Ados2SubjectSexPicker value={adosSex} onChange={setAdosSex} />
            ) : (
              <AdirSubjectSexPicker value={adirSex} onChange={setAdirSex} />
            )}
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="interactive-press flex-1 rounded-lg bg-surface-container py-2 text-label-md text-on-surface hover:bg-surface-container-high"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!patientSex}
            className="interactive-press flex-1 rounded-lg bg-primary py-2 text-label-md text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Crear
          </button>
        </div>
      </div>
    </div>
  );
}

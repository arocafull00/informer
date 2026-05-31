"use client";

import { useEffect, useRef, useState } from "react";

interface SaveReportTitleDialogProps {
  open: boolean;
  suggestedTitle: string;
  onClose: () => void;
  onConfirm: (title: string) => void;
}

export function SaveReportTitleDialog({
  open,
  suggestedTitle,
  onClose,
  onConfirm,
}: SaveReportTitleDialogProps) {
  const [value, setValue] = useState("");
  const [prevOpen, setPrevOpen] = useState(open);
  const inputRef = useRef<HTMLInputElement>(null);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setValue("");
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
    onConfirm(value);
    onClose();
  };

  return (
    <div
      className="dialog-backdrop fixed inset-0 z-50 flex items-center justify-center bg-on-background/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-labelledby="save-report-title-heading"
        className="dialog-content w-full max-w-sm rounded-xl border border-outline-variant bg-surface-container-highest p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          id="save-report-title-heading"
          className="text-headline-md text-on-surface"
        >
          Título del informe
        </h3>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Opcional. Si lo dejas vacío se usará el nombre del test y la fecha.
        </p>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleConfirm();
            }
          }}
          placeholder={suggestedTitle}
          className="mt-3 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface outline-none focus:border-primary"
        />
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="interactive-press flex-1 rounded-lg bg-surface-container py-2 text-label-md text-on-surface hover:bg-surface-container-high"
          >
            Reiniciar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="interactive-press flex-1 rounded-lg bg-primary py-2 text-label-md text-on-primary hover:opacity-90"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { AdirSubjectSexPicker } from "@/components/adir/adir-subject-sex-picker";
import { Ados2SubjectSexPicker } from "@/components/ados2/ados2-subject-sex-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Ados2SubjectSex } from "@/lib/ados2-pdf/types";
import type { AdirSubjectSex } from "@/lib/adir-scoring";
import { isAdos2Test } from "@/lib/ados2-labels";
import { testLabels } from "@/lib/test-data";
import type { TestType } from "@/lib/types";
import { cn } from "@/lib/utils";

type NewReportDialogProps = {
  onClose: () => void;
  onConfirm: (test: TestType, title: string, patientSex: string) => void;
};

const reportTypes: {
  value: TestType;
  label: string;
  description: string;
}[] = [
  {
    value: "ADIR",
    label: "ADI-R",
    description: "Entrevista diagnóstica para el autismo.",
  },
  {
    value: "ADOS2_ADULTO",
    label: "ADOS-2 Adulto",
    description: "Observación para adolescentes y adultos.",
  },
  {
    value: "ADOS2_NINO",
    label: "ADOS-2 Niño",
    description: "Observación adaptada a población infantil.",
  },
];

export function NewReportDialog({
  onClose,
  onConfirm,
}: NewReportDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedTest, setSelectedTest] = useState<TestType | null>(null);
  const [title, setTitle] = useState("");
  const [adirSex, setAdirSex] = useState<AdirSubjectSex>("");
  const [adosSex, setAdosSex] = useState<Ados2SubjectSex>("");

  const isAdos2 = selectedTest ? isAdos2Test(selectedTest) : false;
  const patientSex = isAdos2 ? adosSex : adirSex;
  const suggestedTitle = selectedTest
    ? `${testLabels[selectedTest]} · ${new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
      })}`
    : "";

  const handleTestChange = (value: string) => {
    setSelectedTest(value as TestType);
    setAdirSex("");
    setAdosSex("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (step === 1) {
      if (!selectedTest) return;
      setStep(2);
      return;
    }

    if (!selectedTest || !patientSex) return;
    onConfirm(selectedTest, title.trim() || suggestedTitle, patientSex);
    onClose();
  };

  return (
    <Dialog
      open
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-lg gap-0 overflow-hidden border-outline-variant bg-surface-container-lowest p-0 sm:max-w-lg"
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b border-outline-variant px-5 py-4">
            <div className="flex items-start justify-between gap-4 pr-1">
              <div>
                <DialogTitle className="text-headline-md text-on-surface">
                  Nuevo informe
                </DialogTitle>
                <DialogDescription className="mt-1 text-body-md text-on-surface-variant">
                  {step === 1
                    ? "Elige el instrumento que quedará asignado al informe."
                    : `Completa los datos para ${selectedTest ? testLabels[selectedTest] : "el informe"}.`}
                </DialogDescription>
              </div>
              <span className="shrink-0 text-mono-sm text-on-surface-variant">
                {step} de 2
              </span>
            </div>
            <div
              className="mt-3 grid grid-cols-2 gap-1"
              aria-label={`Paso ${step} de 2`}
            >
              <span
                className="h-1 rounded-full bg-primary"
                aria-hidden="true"
              />
              <span
                className={cn(
                  "h-1 rounded-full",
                  step === 2 ? "bg-primary" : "bg-surface-container-highest"
                )}
                aria-hidden="true"
              />
            </div>
          </DialogHeader>

          <div className="px-5 py-5">
            {step === 1 ? (
              <RadioGroup
                value={selectedTest ?? ""}
                onValueChange={(value) => {
                  if (value) handleTestChange(value);
                }}
                aria-label="Tipo de informe"
                className="gap-3"
              >
                {reportTypes.map((option, index) => {
                  const selected = selectedTest === option.value;
                  const descriptionId = `new-report-type-${option.value}-description`;

                  return (
                    <label
                      key={option.value}
                      htmlFor={`new-report-type-${option.value}`}
                      className={cn(
                        "interactive-press flex min-h-16 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3",
                        selected
                          ? "border-primary bg-surface-container text-primary shadow-inner"
                          : "border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low"
                      )}
                    >
                      <RadioGroupItem
                        id={`new-report-type-${option.value}`}
                        value={option.value}
                        aria-describedby={descriptionId}
                        autoFocus={index === 0}
                      />
                      <span className="min-w-0">
                        <span className="block text-body-md font-semibold">
                          {option.label}
                        </span>
                        <span
                          id={descriptionId}
                          className="mt-0.5 block text-body-md text-on-surface-variant"
                        >
                          {option.description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </RadioGroup>
            ) : (
              <div className="space-y-5">
                <div className="rounded-lg bg-surface-container-low px-3 py-2.5">
                  <span className="text-mono-sm uppercase tracking-wider text-on-surface-variant">
                    Tipo de informe
                  </span>
                  <p className="mt-0.5 text-body-md font-semibold text-primary">
                    {selectedTest ? testLabels[selectedTest] : ""}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="new-report-title"
                    className="text-body-md font-medium text-on-surface"
                  >
                    Título
                  </label>
                  <input
                    autoFocus
                    id="new-report-title"
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder={suggestedTitle}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30"
                  />
                </div>

                <fieldset className="space-y-1.5">
                  <legend className="text-body-md font-medium text-on-surface">
                    Sexo
                  </legend>
                  {isAdos2 ? (
                    <Ados2SubjectSexPicker
                      value={adosSex}
                      onChange={setAdosSex}
                    />
                  ) : (
                    <AdirSubjectSexPicker
                      value={adirSex}
                      onChange={setAdirSex}
                    />
                  )}
                </fieldset>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-outline-variant bg-surface-container-low px-5 py-4">
            {step === 1 ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="interactive-press min-h-9 flex-1 rounded-lg bg-surface-container px-3 py-2 text-label-md text-on-surface hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!selectedTest}
                  className="interactive-press min-h-9 flex-1 rounded-lg bg-primary px-3 py-2 text-label-md text-on-primary hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continuar
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="interactive-press min-h-9 rounded-lg px-3 py-2 text-label-md text-on-surface-variant hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="interactive-press ml-auto min-h-9 rounded-lg bg-surface-container px-3 py-2 text-label-md text-on-surface hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!patientSex}
                  className="interactive-press min-h-9 rounded-lg bg-primary px-4 py-2 text-label-md text-on-primary hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Crear informe
                </button>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { AdirSubjectSexPicker } from "@/components/adir/adir-subject-sex-picker";
import { Ados2SubjectSexPicker } from "@/components/ados2/ados2-subject-sex-picker";
import { CumanesIdentificationFields } from "@/components/cumanes/cumanes-identification-fields";
import { CarasIdentificationFields } from "@/components/caras-r/caras-identification-fields";
import { StaiIdentificationFields } from "@/components/stai/stai-identification-fields";
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
import {
  EMPTY_CUMANES_IDENTIFICATION,
  type CumanesIdentification,
} from "@/lib/cumanes-types";
import {
  EMPTY_CARAS_IDENTIFICATION,
  type CarasIdentification,
} from "@/lib/caras-r-types";
import {
  EMPTY_STAI_IDENTIFICATION,
  type StaiIdentification,
} from "@/lib/stai-types";
import { testLabels } from "@/lib/test-data";
import type { CreateReportInput, TestType } from "@/lib/types";
import { cn } from "@/lib/utils";

type NewReportDialogProps = {
  onClose: () => void;
  onConfirm: (input: CreateReportInput) => void;
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
  {
    value: "CUMANES",
    label: "CUMANES",
    description: "Madurez neuropsicológica en población escolar.",
  },
  {
    value: "CARAS_R",
    label: "CARAS-R",
    description: "Percepción de diferencias y control de la impulsividad.",
  },
  {
    value: "STAI",
    label: "STAI",
    description: "Inventario de ansiedad estado-rasgo.",
  },
];

export function NewReportDialog({
  onClose,
  onConfirm,
}: NewReportDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedTest, setSelectedTest] = useState<TestType | null>(null);
  const [patientName, setPatientName] = useState("");
  const [adirSex, setAdirSex] = useState<AdirSubjectSex>("");
  const [adosSex, setAdosSex] = useState<Ados2SubjectSex>("");
  const [cumanesIdentification, setCumanesIdentification] =
    useState<CumanesIdentification>({ ...EMPTY_CUMANES_IDENTIFICATION });
  const [carasIdentification, setCarasIdentification] =
    useState<CarasIdentification>({ ...EMPTY_CARAS_IDENTIFICATION });
  const [staiIdentification, setStaiIdentification] =
    useState<StaiIdentification>({ ...EMPTY_STAI_IDENTIFICATION });

  const isAdos2 = selectedTest ? isAdos2Test(selectedTest) : false;
  const isCumanes = selectedTest === "CUMANES";
  const isCaras = selectedTest === "CARAS_R";
  const isStai = selectedTest === "STAI";
  const patientSex = isCaras
    ? ""
    : isAdos2 || isCumanes || isStai
      ? adosSex
      : adirSex;

  const handleTestChange = (value: string) => {
    setSelectedTest(value as TestType);
    setAdirSex("");
    setAdosSex("");
    setCumanesIdentification({ ...EMPTY_CUMANES_IDENTIFICATION });
    setCarasIdentification({ ...EMPTY_CARAS_IDENTIFICATION });
    setStaiIdentification({ ...EMPTY_STAI_IDENTIFICATION });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (step === 1) {
      if (!selectedTest) return;
      setStep(2);
      return;
    }

    if (!selectedTest) return;
    onConfirm({
      test: selectedTest,
      patientName,
      patientSex,
      ...(isCumanes ? { cumanesIdentification } : {}),
      ...(isCaras ? { carasIdentification } : {}),
      ...(isStai ? { staiIdentification } : {}),
    });
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
        className="flex max-h-[90vh] w-full max-w-lg flex-col gap-0 overflow-hidden border-outline-variant bg-surface-container-lowest p-0 sm:max-w-lg"
      >
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader className="shrink-0 border-b border-outline-variant px-5 py-4">
            <div className="flex items-start justify-between gap-4 pr-1">
              <div>
                <DialogTitle className="text-headline-md text-on-surface">
                  Nuevo informe
                </DialogTitle>
                <DialogDescription className="mt-1 text-body-md text-on-surface-variant">
                  {step === 1
                    ? "Elige el instrumento que quedará asignado al informe."
                    : `Añade los datos que quieras conservar para ${selectedTest ? testLabels[selectedTest] : "el informe"}.`}
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

          <div className="min-h-0 overflow-y-auto px-5 py-5">
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

                {isCumanes ? (
                  <CumanesIdentificationFields
                    idPrefix="new-cumanes"
                    patientName={patientName}
                    patientSex={patientSex}
                    identification={cumanesIdentification}
                    onPatientNameChange={setPatientName}
                    onPatientSexChange={(sex) =>
                      setAdosSex(sex as Ados2SubjectSex)
                    }
                    onIdentificationChange={setCumanesIdentification}
                  />
                ) : isCaras ? (
                  <CarasIdentificationFields
                    idPrefix="new-caras"
                    patientName={patientName}
                    identification={carasIdentification}
                    onPatientNameChange={setPatientName}
                    onIdentificationChange={setCarasIdentification}
                  />
                ) : isStai ? (
                  <StaiIdentificationFields
                    idPrefix="new-stai"
                    patientName={patientName}
                    patientSex={patientSex}
                    identification={staiIdentification}
                    onPatientNameChange={setPatientName}
                    onPatientSexChange={(sex) =>
                      setAdosSex(sex as Ados2SubjectSex)
                    }
                    onIdentificationChange={setStaiIdentification}
                  />
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="new-report-patient-name"
                        className="text-body-md font-medium text-on-surface"
                      >
                        Nombre del paciente
                      </label>
                      <input
                        autoFocus
                        id="new-report-patient-name"
                        type="text"
                        value={patientName}
                        onChange={(event) => setPatientName(event.target.value)}
                        placeholder="Nombre y apellidos"
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
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2 border-t border-outline-variant bg-surface-container-low px-5 py-4">
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

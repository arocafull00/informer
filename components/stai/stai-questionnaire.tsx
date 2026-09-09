"use client";

import { ChevronDown } from "lucide-react";
import { StaiIdentificationFields } from "@/components/stai/stai-identification-fields";
import { QuestionList } from "@/components/questions/question-list";
import {
  selectCurrentPatientName,
  selectCurrentPatientSex,
  selectCurrentReportId,
  selectCurrentStaiIdentification,
  useCurrentReportStore,
} from "@/store/use-current-report-store";

export function StaiQuestionnaire() {
  const currentReportId = useCurrentReportStore(selectCurrentReportId);
  const patientName = useCurrentReportStore(selectCurrentPatientName) ?? "";
  const patientSex = useCurrentReportStore(selectCurrentPatientSex);
  const identification = useCurrentReportStore(selectCurrentStaiIdentification);
  const setPatientName = useCurrentReportStore((state) => state.setPatientName);
  const setPatientSex = useCurrentReportStore((state) => state.setPatientSex);
  const setIdentification = useCurrentReportStore(
    (state) => state.setStaiIdentification
  );
  const scoringEnabled = Boolean(currentReportId);

  return (
    <div className="space-y-stack-section pb-10">
      {!scoringEnabled ? (
        <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
          <p className="text-body-md font-medium text-on-surface">
            Selecciona o crea un informe STAI
          </p>
          <p className="mt-1 text-body-md leading-relaxed text-on-surface-variant">
            Abre un informe del histórico para editar sus datos y respuestas.
          </p>
        </div>
      ) : null}

      <details
        open
        className="group rounded-xl border border-outline-variant bg-surface-container-lowest shadow-level-1"
      >
        <summary className="interactive-press flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
          <span>
            <span className="block text-headline-md text-on-surface">
              Datos del baremo
            </span>
            <span className="mt-0.5 block text-body-md text-on-surface-variant">
              El sexo y el grupo determinan los percentiles.
            </span>
          </span>
          <ChevronDown
            className="size-5 shrink-0 text-on-surface-variant transition-transform group-open:rotate-180 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </summary>
        <div className="border-t border-outline-variant px-5 py-5">
          <StaiIdentificationFields
            idPrefix="stai-workspace"
            patientName={patientName}
            patientSex={patientSex}
            identification={identification}
            onPatientNameChange={setPatientName}
            onPatientSexChange={setPatientSex}
            onIdentificationChange={setIdentification}
            disabled={!scoringEnabled}
          />
        </div>
      </details>

      <QuestionList />
    </div>
  );
}

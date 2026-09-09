"use client";

import { useMemo, useCallback, useEffect } from "react";
import {
  selectCurrentCarasIdentification,
  selectCurrentAnswers,
  selectCurrentCumanesIdentification,
  selectCurrentCumanesLaterality,
  selectCurrentPatientName,
  selectCurrentPatientSex,
  selectCurrentReportId,
  selectCurrentRiasForm,
  selectCurrentStaiIdentification,
  useCurrentReportStore,
} from "@/store/use-current-report-store";
import { buildCarasMarkdown } from "@/lib/caras-r-scoring";
import { EMPTY_CARAS_IDENTIFICATION } from "@/lib/caras-r-types";
import { buildDersMarkdown } from "@/lib/ders-scoring";
import { buildStaiMarkdown } from "@/lib/stai-scoring";
import { EMPTY_STAI_IDENTIFICATION } from "@/lib/stai-types";
import { useReportHistoryStore } from "@/store/use-report-history-store";
import { generateMarkdown } from "@/lib/generators/generate-markdown";
import { testData } from "@/lib/test-data";
import {
  EMPTY_CUMANES_IDENTIFICATION,
  EMPTY_CUMANES_LATERALITY,
} from "@/lib/cumanes-types";
import type { CreateReportInput, SavedReport } from "@/lib/types";
import {
  createDefaultRiasResultsForm,
  normalizeRiasResultsForm,
} from "@/lib/rias-scoring";

export function useReportMarkdown() {
  const currentTest = useCurrentReportStore((s) => s.currentTest);
  const answers = useCurrentReportStore(selectCurrentAnswers);
  const patientSex = useCurrentReportStore(selectCurrentPatientSex);
  const carasIdentification = useCurrentReportStore(
    selectCurrentCarasIdentification
  );
  const staiIdentification = useCurrentReportStore(
    selectCurrentStaiIdentification
  );

  return useMemo(() => {
    if (currentTest === "CARAS_R") {
      return buildCarasMarkdown(carasIdentification, answers);
    }
    if (currentTest === "STAI") {
      return buildStaiMarkdown(staiIdentification, patientSex, answers);
    }
    if (currentTest === "DERS") {
      return buildDersMarkdown(patientSex, answers);
    }
    if (currentTest === "RIAS") return "";
    const data = testData[currentTest];
    return generateMarkdown(data, answers, patientSex);
  }, [answers, carasIdentification, currentTest, patientSex, staiIdentification]);
}

export function useAutoSaveReport() {
  const currentTest = useCurrentReportStore((s) => s.currentTest);
  const answers = useCurrentReportStore(selectCurrentAnswers);
  const patientName = useCurrentReportStore(selectCurrentPatientName);
  const patientSex = useCurrentReportStore(selectCurrentPatientSex);
  const cumanesIdentification = useCurrentReportStore(
    selectCurrentCumanesIdentification
  );
  const cumanesLaterality = useCurrentReportStore(
    selectCurrentCumanesLaterality
  );
  const carasIdentification = useCurrentReportStore(
    selectCurrentCarasIdentification
  );
  const staiIdentification = useCurrentReportStore(
    selectCurrentStaiIdentification
  );
  const riasForm = useCurrentReportStore(selectCurrentRiasForm);
  const currentReportId = useCurrentReportStore(selectCurrentReportId);
  const saveReport = useReportHistoryStore((s) => s.saveReport);

  const markdown = useReportMarkdown();

  useEffect(() => {
    if (!currentReportId) return;

    const existingReport = useReportHistoryStore
      .getState()
      .reports.find((r) => r.id === currentReportId);
    if (!existingReport) return;

    const trimmedPatientName = patientName?.trim();
    const {
      patientName: previousPatientName,
      patientSex: previousPatientSex,
      cumanesIdentification: previousCumanesIdentification,
      cumanesLaterality: previousCumanesLaterality,
      carasIdentification: previousCarasIdentification,
      staiIdentification: previousStaiIdentification,
      riasForm: previousRiasForm,
      ...reportBase
    } = existingReport;
    void previousPatientName;
    void previousPatientSex;
    void previousCumanesIdentification;
    void previousCumanesLaterality;
    void previousCarasIdentification;
    void previousStaiIdentification;
    void previousRiasForm;

    saveReport({
      ...reportBase,
      test: currentTest,
      answers: { ...answers },
      markdown,
      ...(trimmedPatientName ? { patientName: trimmedPatientName } : {}),
      ...(patientSex ? { patientSex } : {}),
      ...(currentTest === "CUMANES"
        ? {
            cumanesIdentification: { ...cumanesIdentification },
            cumanesLaterality: { ...cumanesLaterality },
          }
        : {}),
      ...(currentTest === "CARAS_R"
        ? { carasIdentification: { ...carasIdentification } }
        : {}),
      ...(currentTest === "STAI"
        ? { staiIdentification: { ...staiIdentification } }
        : {}),
      ...(currentTest === "RIAS"
        ? { riasForm: normalizeRiasResultsForm(riasForm) }
        : {}),
    });
  }, [
    currentReportId,
    currentTest,
    answers,
    markdown,
    patientName,
    patientSex,
    cumanesIdentification,
    cumanesLaterality,
    carasIdentification,
    staiIdentification,
    riasForm,
    saveReport,
  ]);
}

export function useCreateNewReport() {
  const openReport = useCurrentReportStore((s) => s.openReport);
  const saveReport = useReportHistoryStore((s) => s.saveReport);

  return useCallback(
    ({
      test,
      patientName,
      patientSex,
      cumanesIdentification,
      carasIdentification,
      staiIdentification,
      riasPatient,
    }: CreateReportInput) => {
      const trimmedPatientName = patientName?.trim();
      const data = testData[test];
      const emptyAnswers: Record<string, number> = {};
      const initialCarasIdentification = {
        ...EMPTY_CARAS_IDENTIFICATION,
        ...carasIdentification,
      };
      const initialStaiIdentification = {
        ...EMPTY_STAI_IDENTIFICATION,
        ...staiIdentification,
      };
      const initialRiasForm = normalizeRiasResultsForm({
        ...createDefaultRiasResultsForm(),
        patient: {
          ...createDefaultRiasResultsForm().patient,
          ...riasPatient,
          name: riasPatient?.name.trim() || trimmedPatientName || "",
        },
      });
      const report: SavedReport = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        test,
        answers: emptyAnswers,
        markdown:
          test === "RIAS"
            ? ""
            : test === "CARAS_R"
            ? buildCarasMarkdown(initialCarasIdentification, emptyAnswers)
            : test === "STAI"
              ? buildStaiMarkdown(
                  initialStaiIdentification,
                  patientSex ?? "",
                  emptyAnswers
                )
              : test === "DERS"
                ? buildDersMarkdown(patientSex ?? "", emptyAnswers)
                : generateMarkdown(data, emptyAnswers, patientSex ?? ""),
        ...(trimmedPatientName ? { patientName: trimmedPatientName } : {}),
        ...(patientSex ? { patientSex } : {}),
        ...(test === "CUMANES"
          ? {
              cumanesIdentification: {
                ...EMPTY_CUMANES_IDENTIFICATION,
                ...cumanesIdentification,
              },
              cumanesLaterality: { ...EMPTY_CUMANES_LATERALITY },
            }
          : {}),
        ...(test === "CARAS_R"
          ? {
              carasIdentification: {
                ...initialCarasIdentification,
              },
            }
          : {}),
        ...(test === "STAI"
          ? {
              staiIdentification: {
                ...initialStaiIdentification,
              },
            }
          : {}),
        ...(test === "RIAS" ? { riasForm: initialRiasForm } : {}),
      };

      saveReport(report);
      openReport(report);
    },
    [openReport, saveReport]
  );
}

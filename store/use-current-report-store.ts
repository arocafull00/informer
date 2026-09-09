import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  EMPTY_CUMANES_IDENTIFICATION,
  EMPTY_CUMANES_LATERALITY,
  type CumanesIdentification,
  type CumanesLaterality,
} from "@/lib/cumanes-types";
import {
  EMPTY_CARAS_IDENTIFICATION,
  type CarasIdentification,
} from "@/lib/caras-r-types";
import {
  EMPTY_STAI_IDENTIFICATION,
  type StaiIdentification,
} from "@/lib/stai-types";
import type { SavedReport, TestType } from "@/lib/types";

const emptyAnswersByTest = (): Record<TestType, Record<string, number>> => ({
  ADIR: {},
  ADOS2_ADULTO: {},
  ADOS2_NINO: {},
  CUMANES: {},
  CARAS_R: {},
  STAI: {},
});

const emptyPatientNameByTest = (): Record<TestType, string | undefined> => ({
  ADIR: undefined,
  ADOS2_ADULTO: undefined,
  ADOS2_NINO: undefined,
  CUMANES: undefined,
  CARAS_R: undefined,
  STAI: undefined,
});

const emptyPatientSexByTest = (): Record<TestType, string> => ({
  ADIR: "",
  ADOS2_ADULTO: "",
  ADOS2_NINO: "",
  CUMANES: "",
  CARAS_R: "",
  STAI: "",
});

const emptyCumanesIdentificationByTest = (): Record<
  TestType,
  CumanesIdentification
> => ({
  ADIR: { ...EMPTY_CUMANES_IDENTIFICATION },
  ADOS2_ADULTO: { ...EMPTY_CUMANES_IDENTIFICATION },
  ADOS2_NINO: { ...EMPTY_CUMANES_IDENTIFICATION },
  CUMANES: { ...EMPTY_CUMANES_IDENTIFICATION },
  CARAS_R: { ...EMPTY_CUMANES_IDENTIFICATION },
  STAI: { ...EMPTY_CUMANES_IDENTIFICATION },
});

const emptyCumanesLateralityByTest = (): Record<
  TestType,
  CumanesLaterality
> => ({
  ADIR: { ...EMPTY_CUMANES_LATERALITY },
  ADOS2_ADULTO: { ...EMPTY_CUMANES_LATERALITY },
  ADOS2_NINO: { ...EMPTY_CUMANES_LATERALITY },
  CUMANES: { ...EMPTY_CUMANES_LATERALITY },
  CARAS_R: { ...EMPTY_CUMANES_LATERALITY },
  STAI: { ...EMPTY_CUMANES_LATERALITY },
});

const emptyCarasIdentificationByTest = (): Record<
  TestType,
  CarasIdentification
> => ({
  ADIR: { ...EMPTY_CARAS_IDENTIFICATION },
  ADOS2_ADULTO: { ...EMPTY_CARAS_IDENTIFICATION },
  ADOS2_NINO: { ...EMPTY_CARAS_IDENTIFICATION },
  CUMANES: { ...EMPTY_CARAS_IDENTIFICATION },
  CARAS_R: { ...EMPTY_CARAS_IDENTIFICATION },
  STAI: { ...EMPTY_CARAS_IDENTIFICATION },
});

const emptyStaiIdentificationByTest = (): Record<
  TestType,
  StaiIdentification
> => ({
  ADIR: { ...EMPTY_STAI_IDENTIFICATION },
  ADOS2_ADULTO: { ...EMPTY_STAI_IDENTIFICATION },
  ADOS2_NINO: { ...EMPTY_STAI_IDENTIFICATION },
  CUMANES: { ...EMPTY_STAI_IDENTIFICATION },
  CARAS_R: { ...EMPTY_STAI_IDENTIFICATION },
  STAI: { ...EMPTY_STAI_IDENTIFICATION },
});

const emptyCurrentReportIdByTest = (): Record<TestType, string | undefined> => ({
  ADIR: undefined,
  ADOS2_ADULTO: undefined,
  ADOS2_NINO: undefined,
  CUMANES: undefined,
  CARAS_R: undefined,
  STAI: undefined,
});

type CurrentReportStore = {
  currentTest: TestType;
  answersByTest: Record<TestType, Record<string, number>>;
  patientNameByTest: Record<TestType, string | undefined>;
  patientSexByTest: Record<TestType, string>;
  cumanesIdentificationByTest: Record<TestType, CumanesIdentification>;
  cumanesLateralityByTest: Record<TestType, CumanesLaterality>;
  carasIdentificationByTest: Record<TestType, CarasIdentification>;
  staiIdentificationByTest: Record<TestType, StaiIdentification>;
  currentReportIdByTest: Record<TestType, string | undefined>;
  openReport: (report: SavedReport) => void;
  setAnswer: (questionId: string, value: number) => void;
  clearAnswer: (questionId: string) => void;
  setPatientName: (name: string) => void;
  setPatientSex: (sex: string) => void;
  setCumanesIdentification: (
    identification: CumanesIdentification
  ) => void;
  setCumanesLaterality: (laterality: CumanesLaterality) => void;
  setCarasIdentification: (identification: CarasIdentification) => void;
  setStaiIdentification: (identification: StaiIdentification) => void;
  setCurrentReportId: (id: string | undefined) => void;
  reset: () => void;
};

export const selectCurrentAnswers = (state: CurrentReportStore) =>
  state.answersByTest[state.currentTest];

export const selectCurrentPatientName = (state: CurrentReportStore) =>
  state.patientNameByTest[state.currentTest];

export const selectCurrentPatientSex = (state: CurrentReportStore) =>
  state.patientSexByTest[state.currentTest];

export const selectCurrentCumanesIdentification = (state: CurrentReportStore) =>
  state.cumanesIdentificationByTest[state.currentTest];

export const selectCurrentCumanesLaterality = (state: CurrentReportStore) =>
  state.cumanesLateralityByTest[state.currentTest];

export const selectCurrentCarasIdentification = (state: CurrentReportStore) =>
  state.carasIdentificationByTest[state.currentTest];

export const selectCurrentStaiIdentification = (state: CurrentReportStore) =>
  state.staiIdentificationByTest[state.currentTest];

export const selectCurrentReportId = (state: CurrentReportStore) =>
  state.currentReportIdByTest[state.currentTest];

type LegacyCurrentReportState = Partial<CurrentReportStore> & {
  answers?: Record<string, number>;
  draftTitle?: string;
  draftTitleByTest?: Partial<Record<TestType, string | undefined>>;
};

function normalizePersistedState(
  persistedState: unknown
): Omit<
  CurrentReportStore,
  | "openReport"
  | "setAnswer"
  | "clearAnswer"
  | "setPatientName"
  | "setPatientSex"
  | "setCumanesIdentification"
  | "setCumanesLaterality"
  | "setCarasIdentification"
  | "setStaiIdentification"
  | "setCurrentReportId"
  | "reset"
> {
  const legacy = (persistedState ?? {}) as LegacyCurrentReportState;
  const currentTest = legacy.currentTest ?? "ADIR";
  const answersByTest = {
    ...emptyAnswersByTest(),
    ...legacy.answersByTest,
  };
  const patientNameByTest = {
    ...emptyPatientNameByTest(),
    ...legacy.draftTitleByTest,
    ...legacy.patientNameByTest,
  };
  const patientSexByTest = {
    ...emptyPatientSexByTest(),
    ...legacy.patientSexByTest,
  };
  const currentReportIdByTest = {
    ...emptyCurrentReportIdByTest(),
    ...legacy.currentReportIdByTest,
  };
  const cumanesIdentificationByTest = emptyCumanesIdentificationByTest();
  const cumanesLateralityByTest = emptyCumanesLateralityByTest();
  const carasIdentificationByTest = emptyCarasIdentificationByTest();
  const staiIdentificationByTest = emptyStaiIdentificationByTest();

  for (const test of Object.keys(cumanesIdentificationByTest) as TestType[]) {
    cumanesIdentificationByTest[test] = {
      ...EMPTY_CUMANES_IDENTIFICATION,
      ...legacy.cumanesIdentificationByTest?.[test],
    };
  }

  for (const test of Object.keys(cumanesLateralityByTest) as TestType[]) {
    cumanesLateralityByTest[test] = {
      ...EMPTY_CUMANES_LATERALITY,
      ...legacy.cumanesLateralityByTest?.[test],
    };
  }

  for (const test of Object.keys(carasIdentificationByTest) as TestType[]) {
    carasIdentificationByTest[test] = {
      ...EMPTY_CARAS_IDENTIFICATION,
      ...legacy.carasIdentificationByTest?.[test],
    };
  }

  for (const test of Object.keys(staiIdentificationByTest) as TestType[]) {
    staiIdentificationByTest[test] = {
      ...EMPTY_STAI_IDENTIFICATION,
      ...legacy.staiIdentificationByTest?.[test],
    };
  }

  if (legacy.answers) {
    answersByTest[currentTest] = legacy.answers;
  }
  if (legacy.draftTitle) {
    patientNameByTest[currentTest] = legacy.draftTitle;
  }

  return {
    currentTest,
    answersByTest,
    patientNameByTest,
    patientSexByTest,
    cumanesIdentificationByTest,
    cumanesLateralityByTest,
    carasIdentificationByTest,
    staiIdentificationByTest,
    currentReportIdByTest,
  };
}

export const useCurrentReportStore = create<CurrentReportStore>()(
  persist(
    (set) => ({
      currentTest: "ADIR",
      answersByTest: emptyAnswersByTest(),
      patientNameByTest: emptyPatientNameByTest(),
      patientSexByTest: emptyPatientSexByTest(),
      cumanesIdentificationByTest: emptyCumanesIdentificationByTest(),
      cumanesLateralityByTest: emptyCumanesLateralityByTest(),
      carasIdentificationByTest: emptyCarasIdentificationByTest(),
      staiIdentificationByTest: emptyStaiIdentificationByTest(),
      currentReportIdByTest: emptyCurrentReportIdByTest(),
      openReport: (report) =>
        set((state) => ({
          currentTest: report.test,
          answersByTest: {
            ...state.answersByTest,
            [report.test]: { ...report.answers },
          },
          patientNameByTest: {
            ...state.patientNameByTest,
            [report.test]: report.patientName?.trim() || undefined,
          },
          patientSexByTest: {
            ...state.patientSexByTest,
            [report.test]: report.patientSex ?? "",
          },
          cumanesIdentificationByTest: {
            ...state.cumanesIdentificationByTest,
            [report.test]: {
              ...EMPTY_CUMANES_IDENTIFICATION,
              ...report.cumanesIdentification,
            },
          },
          cumanesLateralityByTest: {
            ...state.cumanesLateralityByTest,
            [report.test]: {
              ...EMPTY_CUMANES_LATERALITY,
              ...report.cumanesLaterality,
            },
          },
          carasIdentificationByTest: {
            ...state.carasIdentificationByTest,
            [report.test]: {
              ...EMPTY_CARAS_IDENTIFICATION,
              ...report.carasIdentification,
            },
          },
          staiIdentificationByTest: {
            ...state.staiIdentificationByTest,
            [report.test]: {
              ...EMPTY_STAI_IDENTIFICATION,
              ...report.staiIdentification,
            },
          },
          currentReportIdByTest: {
            ...state.currentReportIdByTest,
            [report.test]: report.id,
          },
        })),
      setAnswer: (questionId, value) =>
        set((state) => ({
          answersByTest: {
            ...state.answersByTest,
            [state.currentTest]: {
              ...state.answersByTest[state.currentTest],
              [questionId]: value,
            },
          },
        })),
      clearAnswer: (questionId) =>
        set((state) => {
          const answers = { ...state.answersByTest[state.currentTest] };
          delete answers[questionId];
          return {
            answersByTest: {
              ...state.answersByTest,
              [state.currentTest]: answers,
            },
          };
        }),
      setPatientName: (name) =>
        set((state) => ({
          patientNameByTest: {
            ...state.patientNameByTest,
            [state.currentTest]: name || undefined,
          },
        })),
      setPatientSex: (sex) =>
        set((state) => ({
          patientSexByTest: {
            ...state.patientSexByTest,
            [state.currentTest]: sex,
          },
        })),
      setCumanesIdentification: (identification) =>
        set((state) => ({
          cumanesIdentificationByTest: {
            ...state.cumanesIdentificationByTest,
            [state.currentTest]: identification,
          },
        })),
      setCumanesLaterality: (laterality) =>
        set((state) => ({
          cumanesLateralityByTest: {
            ...state.cumanesLateralityByTest,
            [state.currentTest]: laterality,
          },
        })),
      setCarasIdentification: (identification) =>
        set((state) => ({
          carasIdentificationByTest: {
            ...state.carasIdentificationByTest,
            [state.currentTest]: identification,
          },
        })),
      setStaiIdentification: (identification) =>
        set((state) => ({
          staiIdentificationByTest: {
            ...state.staiIdentificationByTest,
            [state.currentTest]: identification,
          },
        })),
      setCurrentReportId: (id) =>
        set((state) => ({
          currentReportIdByTest: {
            ...state.currentReportIdByTest,
            [state.currentTest]: id,
          },
        })),
      reset: () =>
        set((state) => ({
          answersByTest: {
            ...state.answersByTest,
            [state.currentTest]: {},
          },
          patientNameByTest: {
            ...state.patientNameByTest,
            [state.currentTest]: undefined,
          },
          patientSexByTest: {
            ...state.patientSexByTest,
            [state.currentTest]: "",
          },
          cumanesIdentificationByTest: {
            ...state.cumanesIdentificationByTest,
            [state.currentTest]: { ...EMPTY_CUMANES_IDENTIFICATION },
          },
          cumanesLateralityByTest: {
            ...state.cumanesLateralityByTest,
            [state.currentTest]: { ...EMPTY_CUMANES_LATERALITY },
          },
          carasIdentificationByTest: {
            ...state.carasIdentificationByTest,
            [state.currentTest]: { ...EMPTY_CARAS_IDENTIFICATION },
          },
          staiIdentificationByTest: {
            ...state.staiIdentificationByTest,
            [state.currentTest]: { ...EMPTY_STAI_IDENTIFICATION },
          },
          currentReportIdByTest: {
            ...state.currentReportIdByTest,
            [state.currentTest]: undefined,
          },
        })),
    }),
    {
      name: "informer-current-report",
      version: 7,
      migrate: (persistedState) => normalizePersistedState(persistedState),
    }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TestType } from "@/lib/types";

const emptyAnswersByTest = (): Record<TestType, Record<string, number>> => ({
  ADIR: {},
  ADOS2_ADULTO: {},
  ADOS2_NINO: {},
});

const emptyDraftTitleByTest = (): Record<TestType, string | undefined> => ({
  ADIR: undefined,
  ADOS2_ADULTO: undefined,
  ADOS2_NINO: undefined,
});

const emptyPatientSexByTest = (): Record<TestType, string> => ({
  ADIR: "",
  ADOS2_ADULTO: "",
  ADOS2_NINO: "",
});

const emptyCurrentReportIdByTest = (): Record<TestType, string | undefined> => ({
  ADIR: undefined,
  ADOS2_ADULTO: undefined,
  ADOS2_NINO: undefined,
});

type CurrentReportStore = {
  currentTest: TestType;
  answersByTest: Record<TestType, Record<string, number>>;
  draftTitleByTest: Record<TestType, string | undefined>;
  patientSexByTest: Record<TestType, string>;
  currentReportIdByTest: Record<TestType, string | undefined>;
  setCurrentTest: (test: TestType) => void;
  setAnswer: (questionId: string, value: number) => void;
  setDraftTitle: (title: string) => void;
  setPatientSex: (sex: string) => void;
  setCurrentReportId: (id: string | undefined) => void;
  replaceAnswersForTest: (test: TestType, answers: Record<string, number>) => void;
  reset: () => void;
};

export const selectCurrentAnswers = (state: CurrentReportStore) =>
  state.answersByTest[state.currentTest];

export const selectCurrentDraftTitle = (state: CurrentReportStore) =>
  state.draftTitleByTest[state.currentTest];

export const selectCurrentPatientSex = (state: CurrentReportStore) =>
  state.patientSexByTest[state.currentTest];

export const selectCurrentReportId = (state: CurrentReportStore) =>
  state.currentReportIdByTest[state.currentTest];

export const useCurrentReportStore = create<CurrentReportStore>()(
  persist(
    (set) => ({
      currentTest: "ADIR",
      answersByTest: emptyAnswersByTest(),
      draftTitleByTest: emptyDraftTitleByTest(),
      patientSexByTest: emptyPatientSexByTest(),
      currentReportIdByTest: emptyCurrentReportIdByTest(),
      setCurrentTest: (test) => set({ currentTest: test }),
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
      setDraftTitle: (title) =>
        set((state) => ({
          draftTitleByTest: {
            ...state.draftTitleByTest,
            [state.currentTest]: title.trim() || undefined,
          },
        })),
      setPatientSex: (sex) =>
        set((state) => ({
          patientSexByTest: {
            ...state.patientSexByTest,
            [state.currentTest]: sex,
          },
        })),
      setCurrentReportId: (id) =>
        set((state) => ({
          currentReportIdByTest: {
            ...state.currentReportIdByTest,
            [state.currentTest]: id,
          },
        })),
      replaceAnswersForTest: (test, answers) =>
        set((state) => ({
          answersByTest: {
            ...state.answersByTest,
            [test]: { ...answers },
          },
        })),
      reset: () =>
        set((state) => ({
          answersByTest: {
            ...state.answersByTest,
            [state.currentTest]: {},
          },
          draftTitleByTest: {
            ...state.draftTitleByTest,
            [state.currentTest]: undefined,
          },
          patientSexByTest: {
            ...state.patientSexByTest,
            [state.currentTest]: "",
          },
          currentReportIdByTest: {
            ...state.currentReportIdByTest,
            [state.currentTest]: undefined,
          },
        })),
    }),
    {
      name: "informer-current-report",
      version: 3,
      migrate: (persistedState, version) => {
        const state = persistedState as Partial<CurrentReportStore>;

        if (version >= 3) {
          return state as CurrentReportStore;
        }

        if (version >= 2) {
          return {
            ...state,
            patientSexByTest:
              state.patientSexByTest ?? emptyPatientSexByTest(),
            currentReportIdByTest:
              state.currentReportIdByTest ?? emptyCurrentReportIdByTest(),
          } as CurrentReportStore;
        }

        const legacy = persistedState as {
          currentTest?: TestType;
          answers?: Record<string, number>;
          draftTitle?: string;
          answersByTest?: Record<TestType, Record<string, number>>;
          draftTitleByTest?: Record<TestType, string | undefined>;
        };

        const currentTest = legacy.currentTest ?? "ADIR";
        const answersByTest = legacy.answersByTest ?? emptyAnswersByTest();
        const draftTitleByTest =
          legacy.draftTitleByTest ?? emptyDraftTitleByTest();

        if (legacy.answers) {
          answersByTest[currentTest] = legacy.answers;
        }

        if (legacy.draftTitle) {
          draftTitleByTest[currentTest] = legacy.draftTitle;
        }

        return {
          currentTest,
          answersByTest,
          draftTitleByTest,
          patientSexByTest: emptyPatientSexByTest(),
          currentReportIdByTest: emptyCurrentReportIdByTest(),
        };
      },
    }
  )
);

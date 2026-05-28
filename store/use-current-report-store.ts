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

type CurrentReportStore = {
  currentTest: TestType;
  answersByTest: Record<TestType, Record<string, number>>;
  draftTitleByTest: Record<TestType, string | undefined>;
  setCurrentTest: (test: TestType) => void;
  setAnswer: (questionId: string, value: number) => void;
  setDraftTitle: (title: string) => void;
  replaceAnswersForTest: (test: TestType, answers: Record<string, number>) => void;
  reset: () => void;
};

export const selectCurrentAnswers = (state: CurrentReportStore) =>
  state.answersByTest[state.currentTest];

export const selectCurrentDraftTitle = (state: CurrentReportStore) =>
  state.draftTitleByTest[state.currentTest];

export const useCurrentReportStore = create<CurrentReportStore>()(
  persist(
    (set) => ({
      currentTest: "ADIR",
      answersByTest: emptyAnswersByTest(),
      draftTitleByTest: emptyDraftTitleByTest(),
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
        })),
    }),
    {
      name: "informer-current-report",
      version: 1,
      migrate: (persistedState, version) => {
        if (version >= 1) {
          return persistedState as CurrentReportStore;
        }

        const legacy = persistedState as {
          currentTest?: TestType;
          answers?: Record<string, number>;
          draftTitle?: string;
        };

        const currentTest = legacy.currentTest ?? "ADIR";
        const answersByTest = emptyAnswersByTest();
        const draftTitleByTest = emptyDraftTitleByTest();

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
        };
      },
    }
  )
);

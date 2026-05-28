import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TestType } from "@/lib/types";

type CurrentReportStore = {
  currentTest: TestType;
  answers: Record<string, number>;
  draftTitle?: string;
  setCurrentTest: (test: TestType) => void;
  setAnswer: (questionId: string, value: number) => void;
  setDraftTitle: (title: string) => void;
  reset: () => void;
};

export const useCurrentReportStore = create<CurrentReportStore>()(
  persist(
    (set) => ({
      currentTest: "ADIR",
      answers: {},
      draftTitle: undefined,
      setCurrentTest: (test) =>
        set({
          currentTest: test,
          answers: {},
          draftTitle: undefined,
        }),
      setAnswer: (questionId, value) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: value },
        })),
      setDraftTitle: (title) =>
        set({
          draftTitle: title.trim() || undefined,
        }),
      reset: () => set({ answers: {}, draftTitle: undefined }),
    }),
    {
      name: "informer-current-report",
    }
  )
);
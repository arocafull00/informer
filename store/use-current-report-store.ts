import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TestType } from "@/lib/types";

type CurrentReportStore = {
  currentTest: TestType;
  answers: Record<string, number>;
  setCurrentTest: (test: TestType) => void;
  setAnswer: (questionId: string, value: number) => void;
  reset: () => void;
};

export const useCurrentReportStore = create<CurrentReportStore>()(
  persist(
    (set) => ({
      currentTest: "ADIR",
      answers: {},
      setCurrentTest: (test) =>
        set({
          currentTest: test,
          answers: {},
        }),
      setAnswer: (questionId, value) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: value },
        })),
      reset: () => set({ answers: {} }),
    }),
    {
      name: "informer-current-report",
    }
  )
);
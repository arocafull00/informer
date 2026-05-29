import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createDefaultAdirResultsForm,
  mergeAdirTotals,
  type AdirAlgorithm,
  type AdirInformant,
  type AdirResultsForm,
  type AdirScoreKey,
  type AdirSubject,
} from "@/lib/adir-scoring";

type AdirResultsDraftStore = {
  step: number;
  form: AdirResultsForm;
  setStep: (step: number) => void;
  setSubject: (subject: AdirSubject) => void;
  setInformant: (informant: AdirInformant) => void;
  setAlgorithm: (algorithm: AdirAlgorithm) => void;
  setScore: (key: AdirScoreKey, value: number | null) => void;
  setTotal: (key: "totalBNoVerbal" | "totalD", value: number | null) => void;
  reset: () => void;
};

const createInitialState = () => ({
  step: 0,
  form: createDefaultAdirResultsForm(),
});

export const useAdirResultsDraftStore = create<AdirResultsDraftStore>()(
  persist(
    (set) => ({
      ...createInitialState(),
      setStep: (step) => set({ step }),
      setSubject: (subject) =>
        set((state) => ({ form: { ...state.form, subject } })),
      setInformant: (informant) =>
        set((state) => ({ form: { ...state.form, informant } })),
      setAlgorithm: (algorithm) =>
        set((state) => ({ form: { ...state.form, algorithm } })),
      setScore: (key, value) =>
        set((state) => ({
          form: mergeAdirTotals({
            ...state.form,
            scores: { ...state.form.scores, [key]: value },
          }),
        })),
      setTotal: (key, value) =>
        set((state) => ({
          form: {
            ...state.form,
            totals: { ...state.form.totals, [key]: value },
          },
        })),
      reset: () => set(createInitialState()),
    }),
    {
      name: "informer-adir-results-draft",
      version: 1,
    }
  )
);

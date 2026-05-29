import { create } from "zustand";
import { persist } from "zustand/middleware";
import { computeAdirDomainScores } from "@/lib/adir-domain-scoring";
import {
  ADIR_SCORE_KEYS,
  createDefaultAdirResultsForm,
  mergeAdirTotals,
  type AdirAlgorithm,
  type AdirInformant,
  type AdirResultsForm,
  type AdirScoreKey,
  type AdirSubject,
} from "@/lib/adir-scoring";

type AdirScoreSource = "auto" | "manual";

type AdirResultsDraftState = {
  step: number;
  form: AdirResultsForm;
  scoreSources: Partial<Record<AdirScoreKey, AdirScoreSource>>;
};

type AdirResultsDraftStore = AdirResultsDraftState & {
  setStep: (step: number) => void;
  setSubject: (subject: AdirSubject) => void;
  setInformant: (informant: AdirInformant) => void;
  setAlgorithm: (algorithm: AdirAlgorithm) => void;
  setScore: (key: AdirScoreKey, value: number | null) => void;
  setTotal: (key: "totalBNoVerbal" | "totalD", value: number | null) => void;
  syncComputedScores: (answers: Record<string, number>) => void;
  reset: () => void;
};

const createInitialState = (): AdirResultsDraftState => ({
  step: 0,
  form: createDefaultAdirResultsForm(),
  scoreSources: {},
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
          scoreSources: { ...state.scoreSources, [key]: "manual" },
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
      syncComputedScores: (answers) =>
        set((state) => {
          const computed = computeAdirDomainScores(answers, {
            chronologicalAge: state.form.subject.chronologicalAge,
          });
          const nextScores = { ...state.form.scores };

          for (const key of ADIR_SCORE_KEYS) {
            if (state.scoreSources[key] === "manual") continue;
            nextScores[key] = computed[key];
          }

          return {
            form: mergeAdirTotals({
              ...state.form,
              scores: nextScores,
            }),
          };
        }),
      reset: () => set(createInitialState()),
    }),
    {
      name: "informer-adir-results-draft",
      version: 2,
      migrate: (persistedState, version) => {
        const defaults = createInitialState();
        if (version >= 2) {
          return persistedState as AdirResultsDraftStore;
        }

        const legacy = persistedState as Partial<AdirResultsDraftState>;
        return {
          ...defaults,
          step: typeof legacy.step === "number" ? legacy.step : defaults.step,
          form: legacy.form ?? defaults.form,
          scoreSources: {},
        };
      },
    }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createDefaultRiasResultsForm,
  mergeRiasTSums,
  type RiasIndexKey,
  type RiasIntervals,
  type RiasPatient,
  type RiasResultsForm,
  type RiasSubtestKey,
} from "@/lib/rias-scoring";

type RiasResultsDraftState = {
  step: number;
  form: RiasResultsForm;
};

type RiasResultsDraftStore = RiasResultsDraftState & {
  setStep: (step: number) => void;
  setPatient: (patient: RiasPatient) => void;
  setDirectScore: (key: RiasSubtestKey, value: number | null) => void;
  setTScore: (key: RiasSubtestKey, value: number | null) => void;
  setIndex: (key: RiasIndexKey, value: number | null) => void;
  setIntervalField: (key: keyof RiasIntervals, value: string) => void;
  setPercentile: (key: RiasIndexKey, value: string) => void;
  reset: () => void;
};

const createInitialState = (): RiasResultsDraftState => ({
  step: 0,
  form: createDefaultRiasResultsForm(),
});

function normalizeChronologicalAge(value: unknown): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";

  const age = value as { years?: unknown; months?: unknown; days?: unknown };
  if (typeof age.years === "string") return age.years;
  return "";
}

function mergePersistedRiasState(persisted: unknown): RiasResultsDraftState {
  const defaults = createInitialState();
  if (!persisted || typeof persisted !== "object") return defaults;

  const { step, form } = persisted as Partial<RiasResultsDraftState>;
  if (!form || typeof form !== "object") {
    return {
      step: typeof step === "number" ? step : defaults.step,
      form: defaults.form,
    };
  }

  const legacyPatient = form.patient as
    | Partial<RiasPatient>
    | { chronologicalAge?: unknown }
    | undefined;

  const mergedForm = mergeRiasTSums({
    ...defaults.form,
    ...form,
    patient: {
      ...defaults.form.patient,
      ...legacyPatient,
      chronologicalAge: normalizeChronologicalAge(
        legacyPatient?.chronologicalAge,
      ),
    },
    directScores: { ...defaults.form.directScores, ...form.directScores },
    tScores: { ...defaults.form.tScores, ...form.tScores },
    tSums: { ...defaults.form.tSums, ...form.tSums },
    indices: { ...defaults.form.indices, ...form.indices },
    intervals: { ...defaults.form.intervals, ...form.intervals },
    percentiles: { ...defaults.form.percentiles, ...form.percentiles },
  });

  return {
    step: typeof step === "number" ? step : defaults.step,
    form: mergedForm,
  };
}

export const useRiasResultsDraftStore = create<RiasResultsDraftStore>()(
  persist(
    (set) => ({
      ...createInitialState(),
      setStep: (step) => set({ step }),
      setPatient: (patient) =>
        set((state) => ({ form: { ...state.form, patient } })),
      setDirectScore: (key, value) =>
        set((state) => ({
          form: {
            ...state.form,
            directScores: { ...state.form.directScores, [key]: value },
          },
        })),
      setTScore: (key, value) =>
        set((state) => ({
          form: mergeRiasTSums({
            ...state.form,
            tScores: { ...state.form.tScores, [key]: value },
          }),
        })),
      setIndex: (key, value) =>
        set((state) => ({
          form: {
            ...state.form,
            indices: { ...state.form.indices, [key]: value },
          },
        })),
      setIntervalField: (key, value) =>
        set((state) => ({
          form: {
            ...state.form,
            intervals: { ...state.form.intervals, [key]: value },
          },
        })),
      setPercentile: (key, value) =>
        set((state) => ({
          form: {
            ...state.form,
            percentiles: { ...state.form.percentiles, [key]: value },
          },
        })),
      reset: () => set(createInitialState()),
    }),
    {
      name: "informer-rias-results-draft",
      version: 5,
      partialize: (state) => ({ step: state.step, form: state.form }),
      migrate: (persistedState) => mergePersistedRiasState(persistedState),
    },
  ),
);

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PROESC_COURSES, PROESC_TESTS, getProescSummary, isValidProescScore, type ProescCourse } from "@/lib/proesc-scoring";
import {
  selectCurrentAnswers,
  selectCurrentPatientName,
  selectCurrentReportId,
  selectProescCourse,
  useCurrentReportStore,
} from "@/store/use-current-report-store";

export function ProescScoreForm() {
  const reportId = useCurrentReportStore(selectCurrentReportId);
  const patientName = useCurrentReportStore(selectCurrentPatientName) ?? "";
  const course = useCurrentReportStore(selectProescCourse);
  const answers = useCurrentReportStore(selectCurrentAnswers);
  const setPatientName = useCurrentReportStore((state) => state.setPatientName);
  const setCourse = useCurrentReportStore((state) => state.setProescCourse);
  const setAnswer = useCurrentReportStore((state) => state.setAnswer);
  const clearAnswer = useCurrentReportStore((state) => state.clearAnswer);
  const summary = getProescSummary(course, answers);

  return (
    <div className="space-y-6 pb-10">
      <header>
        <span className="text-label-md uppercase tracking-wider text-primary">PROESC</span>
        <h1 className="mt-1 text-headline-lg text-on-background">Puntuaciones directas</h1>
        <p className="mt-2 text-body-md text-on-surface-variant">Introduce las diez puntuaciones de la batería. El total y los niveles se calculan automáticamente.</p>
      </header>
      {!reportId ? <p className="rounded-xl border border-outline-variant bg-surface-container-low p-4 text-body-md">Selecciona o crea un informe PROESC para introducir puntuaciones.</p> : null}
      <section className="grid gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-5 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="proesc-name">Nombre del paciente</Label>
          <Input id="proesc-name" value={patientName} disabled={!reportId} onChange={(event) => setPatientName(event.target.value)} placeholder="Nombre y apellidos" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="proesc-course">Curso del niño</Label>
          <select id="proesc-course" value={course} disabled={!reportId} onChange={(event) => setCourse(event.target.value as ProescCourse)} className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-md text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="">Selecciona un curso</option>
            {PROESC_COURSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
      </section>
      <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        <div className="flex items-center justify-between gap-3 bg-surface-container-low px-4 py-3">
          <h2 className="text-headline-md text-on-surface">Pruebas</h2>
          <span className="text-mono-sm text-on-surface-variant">{summary.answeredCount} / {PROESC_TESTS.length}</span>
        </div>
        {PROESC_TESTS.map((test) => (
          <div key={test.key} className="grid grid-cols-[minmax(0,1fr)_6rem] items-center gap-4 border-t border-outline-variant px-4 py-3">
            <Label htmlFor={`proesc-${test.key}`} className="text-body-md leading-snug">{test.label}</Label>
            <div>
              <Input
                id={`proesc-${test.key}`}
                type="number"
                inputMode="numeric"
                min={0}
                max={test.max}
                step={1}
                value={answers[test.key] ?? ""}
                disabled={!reportId}
                onChange={(event) => {
                  const raw = event.target.value;
                  if (raw === "") clearAnswer(test.key);
                  else if (isValidProescScore(Number(raw), test.max)) setAnswer(test.key, Number(raw));
                }}
                aria-label={`PD ${test.label}, de 0 a ${test.max}`}
                className="text-right tabular-nums"
              />
              <p className="mt-1 text-right text-mono-sm text-on-surface-variant">/ {test.max}</p>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-low px-4 py-4 font-semibold text-on-surface">
          <span>Total batería</span>
          <span className="text-right tabular-nums">{summary.total ?? "—"} / 168{summary.answeredCount > 0 && !summary.complete ? <span className="block text-label-md font-normal text-on-surface-variant">Provisional</span> : null}</span>
        </div>
      </section>
    </div>
  );
}

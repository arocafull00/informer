import norms from "../data/proesc-norms.json" with { type: "json" };

export const PROESC_COURSES = Object.entries(norms).map(([value, course]) => ({
  value,
  label: course.nombre,
}));

export type ProescCourse = keyof typeof norms | "";
export type ProescResult = "si" | "dudas" | "nivel_bajo" | "nivel_medio" | "nivel_alto";

export const PROESC_LEVELS: { key: ProescResult; label: string }[] = [
  { key: "si", label: "Sí" },
  { key: "dudas", label: "Dudas" },
  { key: "nivel_bajo", label: "Nivel bajo" },
  { key: "nivel_medio", label: "Nivel medio" },
  { key: "nivel_alto", label: "Nivel alto" },
];

export const PROESC_TESTS = [
  { key: "dictado_silabas", label: "1. Dictado de sílabas", max: 25 },
  { key: "dictado_palabras_ortografia_arbitraria", label: "2. Dictado de palabras · Ortografía arbitraria", max: 25 },
  { key: "dictado_palabras_ortografia_reglada", label: "2. Dictado de palabras · Ortografía reglada", max: 25 },
  { key: "dictado_pseudopalabras_total", label: "3. Dictado de pseudopalabras · Total", max: 25 },
  { key: "dictado_pseudopalabras_reglas_ortograficas", label: "3. Dictado de pseudopalabras · Reglas ortográficas", max: 15 },
  { key: "dictado_frases_acentos", label: "4. Dictado de frases · Acentos", max: 15 },
  { key: "dictado_frases_mayusculas", label: "4. Dictado de frases · Mayúsculas", max: 10 },
  { key: "dictado_frases_signos_puntuacion", label: "4. Dictado de frases · Signos de puntuación", max: 8 },
  { key: "escritura_cuento", label: "5. Escritura de un cuento", max: 10 },
  { key: "escritura_redaccion", label: "6. Escritura de una redacción", max: 10 },
] as const;

export function isValidProescScore(score: number, max: number): boolean {
  return Number.isInteger(score) && score >= 0 && score <= max;
}

export function getProescResult(
  course: ProescCourse,
  key: string,
  score: number | null,
): ProescResult | null {
  if (!course || score === null || !(course in norms)) return null;
  const courseNorms = norms[course] as { pruebas: Record<string, { rangos: { min: number; max: number; resultado: string }[] }> };
  const range = courseNorms.pruebas[key]?.rangos.find(
    ({ min, max }) => score >= min && score <= max,
  );
  return (range?.resultado as ProescResult | undefined) ?? null;
}

export function getProescSummary(course: ProescCourse, answers: Record<string, number>) {
  const rows = PROESC_TESTS.map((test) => {
    const raw = answers[test.key];
    const score = isValidProescScore(raw, test.max) ? raw : null;
    return { ...test, score, result: getProescResult(course, test.key, score) };
  });
  const answeredCount = rows.filter((row) => row.score !== null).length;
  const complete = answeredCount === rows.length;
  const total = answeredCount > 0
    ? rows.reduce((sum, row) => sum + (row.score ?? 0), 0)
    : null;
  return {
    rows,
    total,
    totalResult: complete ? getProescResult(course, "total_bateria", total) : null,
    answeredCount,
    complete: complete && Boolean(course),
  };
}

export type ProescPdfInput = {
  patientName: string;
  course: Exclude<ProescCourse, "">;
  answers: Record<string, number>;
};

export function parseProescPdfInput(value: unknown): ProescPdfInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (typeof input.course !== "string" || !(input.course in norms)) return null;
  if (input.patientName !== undefined && (typeof input.patientName !== "string" || input.patientName.length > 120)) return null;
  if (!input.answers || typeof input.answers !== "object" || Array.isArray(input.answers)) return null;
  const rawAnswers = input.answers as Record<string, unknown>;
  const answers: Record<string, number> = {};
  for (const { key, max } of PROESC_TESTS) {
    const score = rawAnswers[key];
    if (typeof score !== "number" || !isValidProescScore(score, max)) return null;
    answers[key] = score;
  }
  return {
    patientName: (input.patientName as string | undefined)?.trim() ?? "",
    course: input.course as Exclude<ProescCourse, "">,
    answers,
  };
}

export function buildProescMarkdown(course: ProescCourse, answers: Record<string, number>): string {
  const summary = getProescSummary(course, answers);
  const courseLabel = PROESC_COURSES.find((item) => item.value === course)?.label ?? "Sin indicar";
  const lines = [
    "# PROESC",
    `Curso: ${courseLabel}`,
    "",
    "| Prueba | PD | Sí | Dudas | Nivel bajo | Nivel medio | Nivel alto |",
    "| --- | ---: | :---: | :---: | :---: | :---: | :---: |",
  ];
  for (const row of [...summary.rows, { label: "Total batería", score: summary.total, result: summary.totalResult }]) {
    lines.push(`| ${row.label} | ${row.score ?? "—"} | ${PROESC_LEVELS.map(({ key }) => row.result === key ? "X" : "").join(" | ")} |`);
  }
  return lines.join("\n");
}

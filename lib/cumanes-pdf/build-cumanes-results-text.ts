import {
  CUMANES_TEST_ORDER,
  cumanesNorms,
  getCumanesIndexSummary,
  getCumanesScore,
} from "@/lib/cumanes-scoring";
import {
  CUMANES_LATERALITY_AREAS,
  CUMANES_LATERALITY_OPTIONS,
  type CumanesIdentification,
  type CumanesLaterality,
} from "@/lib/cumanes-types";

const lateralityLabelByValue = new Map(
  CUMANES_LATERALITY_OPTIONS.map((option) => [option.value, option.label]),
);

type BuildCumanesResultsTextInput = {
  patientName: string;
  patientSex: string;
  identification: CumanesIdentification;
  laterality: CumanesLaterality;
  answers: Record<string, number>;
};

function formatSex(sex: string): string {
  if (sex === "varon") return "Varón";
  if (sex === "mujer") return "Mujer";
  return "Sin indicar";
}

export function buildCumanesResultsText({
  patientName,
  patientSex,
  identification,
  laterality,
  answers,
}: BuildCumanesResultsTextInput): string {
  const lines: string[] = ["CUMANES - Resultados", ""];

  if (patientName.trim()) {
    lines.push(`Paciente: ${patientName.trim()}`);
  }

  lines.push(`Sexo: ${formatSex(patientSex)}`);

  if (identification.examinerName.trim()) {
    lines.push(`Examinador: ${identification.examinerName.trim()}`);
  }

  if (identification.center.trim()) {
    lines.push(`Centro: ${identification.center.trim()}`);
  }

  if (identification.course.trim()) {
    lines.push(`Curso: ${identification.course.trim()}`);
  }

  if (identification.evaluationDate) {
    lines.push(`Fecha de evaluación: ${identification.evaluationDate}`);
  }

  if (identification.birthDate) {
    lines.push(`Fecha de nacimiento: ${identification.birthDate}`);
  }

  if (identification.age) {
    lines.push(`Edad para baremo: ${identification.age} años`);
  }

  lines.push("", "Prueba\tPD\tTransformación\tDecatipo");

  for (const code of CUMANES_TEST_ORDER) {
    const test = cumanesNorms.tests[code];
    const directScore = answers[code];
    const result = getCumanesScore(identification.age, code, directScore);
    const pd = directScore ?? "—";
    const transformation =
      test.type === "range" || code === "LX-v"
        ? "—"
        : (result.transformation ?? "—");
    const decatype = result.decatype ?? "—";
    lines.push(`${test.name} (${code})\t${pd}\t${transformation}\t${decatype}`);
  }

  const indexSummary = getCumanesIndexSummary(identification.age, answers);
  lines.push("");
  lines.push(`Suma de T: ${indexSummary.sum ?? "—"}`);
  lines.push(`Puntuación típica (IDN): ${indexSummary.typicalScore ?? "—"}`);
  lines.push(`Percentil: ${indexSummary.percentile ?? "—"}`);
  lines.push("", "Lateralidad");

  for (const area of CUMANES_LATERALITY_AREAS) {
    const value = laterality[area.value];
    lines.push(
      `${area.label}: ${value ? lateralityLabelByValue.get(value) : "—"}`,
    );
  }

  return lines.join("\n");
}

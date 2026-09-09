import dersQuestions from "../data/ders.json" with { type: "json" };

export type DersSubscaleKey =
  | "desatencion"
  | "confusion"
  | "rechazo"
  | "interferencia"
  | "descontrol"
  | "dersTotal";

export type DersSex = "masculino" | "femenino";

export type DersThresholdStatus = "matched" | "sex-missing";

export type DersSubscaleResult = {
  key: DersSubscaleKey;
  label: string;
  score: number | null;
  complete: boolean;
  threshold: number | null;
  elevated: boolean;
};

export type DersScoreSummary = {
  thresholdStatus: DersThresholdStatus;
  subscales: DersSubscaleResult[];
  answeredCount: number;
  totalItems: number;
};

type DersQuestion = {
  id: string;
  code: string;
  scoring: "direct" | "reverse";
};

const questions = dersQuestions as DersQuestion[];

const DERS_SUBSCALE_CODES: Record<
  Exclude<DersSubscaleKey, "dersTotal">,
  string[]
> = {
  desatencion: ["2", "6", "7", "9"],
  confusion: ["1", "4", "5", "8"],
  rechazo: ["10", "11", "18", "19", "20", "23", "24"],
  interferencia: ["12", "16", "21", "27"],
  descontrol: ["3", "13", "14", "15", "17", "22", "25", "26", "28"],
};

const DERS_SUBSCALE_LABELS: Record<DersSubscaleKey, string> = {
  desatencion: "Desatención",
  confusion: "Confusión",
  rechazo: "Rechazo",
  interferencia: "Interferencia",
  descontrol: "Descontrol",
  dersTotal: "DERS total",
};

const DERS_THRESHOLDS: Record<
  DersSubscaleKey,
  Record<DersSex, number>
> = {
  desatencion: { masculino: 12.9, femenino: 13 },
  confusion: { masculino: 10.7, femenino: 11 },
  rechazo: { masculino: 21, femenino: 21.4 },
  interferencia: { masculino: 18.2, femenino: 14.1 },
  descontrol: { masculino: 22.3, femenino: 24 },
  dersTotal: { masculino: 75.2, femenino: 76.6 },
};

const DERS_INTERPRETATIONS: Record<
  Exclude<DersSubscaleKey, "dersTotal">,
  string
> = {
  descontrol:
    "Esta subescala evalúa la tendencia a experimentar dificultades en el control de las propias emociones. Puntuaciones altas en esta subescala sugieren que la paciente puede tener dificultades para regular sus emociones, lo que puede manifestarse en respuestas emocionales intensas o impulsivas ante situaciones estresantes.",
  interferencia:
    "Esta subescala evalúa en qué medida las dificultades en la regulación emocional interfieren con la vida diaria de la persona. Las puntuaciones altas de la paciente sugieren que las dificultades emocionales pueden afectar negativamente al funcionamiento social, académico, laboral o personal.",
  desatencion:
    "Esta subescala evalúa la tendencia a ignorar, minimizar o no prestar atención a las propias emociones. En este caso, las puntuaciones bajas sugieren una atención elevada hacia la experiencia emocional interna. No obstante, este resultado debe interpretarse con cautela, ya que en personas con alexitimia pueden existir dificultades para identificar, diferenciar y comprender adecuadamente sus propios estados emocionales. En consecuencia, la aparente focalización en las emociones podría reflejar una atención constante de sensaciones internas.",
  confusion:
    "Se evalúa la dificultad para identificar y comprender claramente las emociones que una persona está experimentando. Las personas que experimentan confusión emocional suelen tener problemas para saber con precisión qué es lo que sienten o para diferenciar entre distintas emociones (como tristeza, enojo, ansiedad).",
  rechazo:
    "Analiza la no aceptación de las propias emociones. Esto significa que una persona juzga negativamente sus emociones o se resiste a sentirlas, en lugar de aceptarlas como una parte natural de la experiencia humana. Suele haber una tendencia a suprimir o negar emociones dolorosas o negativas, lo que a menudo genera más angustia. Las altas puntuaciones en esta área pueden provocar sentimientos de vergüenza, enfado o frustración por tener ciertas emociones, lo que dificulta la regulación emocional.",
};

const DERS_TOTAL_INTERPRETATION =
  "Esta es la suma de todas las puntuaciones de las subescalas del DERS y proporciona una medida general de las dificultades en la regulación emocional. Una puntuación total alta en el DERS indica un nivel general de dificultades en la regulación emocional.";

const questionByCode = new Map(questions.map((question) => [question.code, question]));

function mapPatientSexToDersSex(patientSex: string): DersSex | null {
  if (patientSex === "masculino") return "masculino";
  if (patientSex === "femenino") return "femenino";
  return null;
}

function getThresholdStatus(patientSex: string): DersThresholdStatus {
  if (!mapPatientSexToDersSex(patientSex)) return "sex-missing";
  return "matched";
}

function scoreItem(raw: number, reverse: boolean): number {
  if (reverse) return 6 - raw;
  return raw;
}

function getScoredValue(
  code: string,
  answers: Record<string, number>
): number | null {
  const question = questionByCode.get(code);
  if (!question) return null;

  const raw = answers[question.id];
  if (raw === undefined) return null;

  return scoreItem(raw, question.scoring === "reverse");
}

function computeSubscaleScore(
  codes: string[],
  answers: Record<string, number>
): { score: number | null; complete: boolean } {
  const values = codes.map((code) => getScoredValue(code, answers));
  const answeredCount = values.filter((value) => value !== null).length;

  if (answeredCount === 0) {
    return { score: null, complete: false };
  }

  if (answeredCount < codes.length) {
    return { score: null, complete: false };
  }

  const score = values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
  return { score, complete: true };
}

function isElevated(
  score: number | null,
  threshold: number | null
): boolean {
  if (score === null) return false;
  if (threshold === null) return false;
  return score > threshold;
}

function buildSubscaleResult(
  key: Exclude<DersSubscaleKey, "dersTotal">,
  patientSex: string,
  answers: Record<string, number>
): DersSubscaleResult {
  const { score, complete } = computeSubscaleScore(
    DERS_SUBSCALE_CODES[key],
    answers
  );
  const sex = mapPatientSexToDersSex(patientSex);
  const threshold = sex ? DERS_THRESHOLDS[key][sex] : null;

  return {
    key,
    label: DERS_SUBSCALE_LABELS[key],
    score,
    complete,
    threshold,
    elevated: complete ? isElevated(score, threshold) : false,
  };
}

function buildTotalResult(
  subscaleResults: DersSubscaleResult[],
  patientSex: string,
  answers: Record<string, number>
): DersSubscaleResult {
  const allComplete = subscaleResults.every((result) => result.complete);
  const answeredCount = questions.filter(
    (question) => answers[question.id] !== undefined
  ).length;
  const totalComplete = answeredCount === questions.length;

  if (!allComplete || !totalComplete) {
    return {
      key: "dersTotal",
      label: DERS_SUBSCALE_LABELS.dersTotal,
      score: null,
      complete: false,
      threshold: null,
      elevated: false,
    };
  }

  const score = subscaleResults.reduce<number>(
    (sum, result) => sum + (result.score ?? 0),
    0
  );
  const sex = mapPatientSexToDersSex(patientSex);
  const threshold = sex ? DERS_THRESHOLDS.dersTotal[sex] : null;

  return {
    key: "dersTotal",
    label: DERS_SUBSCALE_LABELS.dersTotal,
    score,
    complete: true,
    threshold,
    elevated: isElevated(score, threshold),
  };
}

export function getDersScoreSummary(
  patientSex: string,
  answers: Record<string, number>
): DersScoreSummary {
  const subscaleKeys = Object.keys(DERS_SUBSCALE_CODES) as Array<
    Exclude<DersSubscaleKey, "dersTotal">
  >;
  const subscaleResults = subscaleKeys.map((key) =>
    buildSubscaleResult(key, patientSex, answers)
  );
  const totalResult = buildTotalResult(subscaleResults, patientSex, answers);

  return {
    thresholdStatus: getThresholdStatus(patientSex),
    subscales: [...subscaleResults, totalResult],
    answeredCount: questions.filter(
      (question) => answers[question.id] !== undefined
    ).length,
    totalItems: questions.length,
  };
}

function getInterpretationText(key: DersSubscaleKey): string {
  if (key === "dersTotal") return DERS_TOTAL_INTERPRETATION;
  return DERS_INTERPRETATIONS[key];
}

export function buildDersMarkdown(
  patientSex: string,
  answers: Record<string, number>
): string {
  const summary = getDersScoreSummary(patientSex, answers);
  if (summary.thresholdStatus !== "matched") return "";

  const elevatedResults = summary.subscales.filter(
    (result) => result.complete && result.elevated
  );
  if (elevatedResults.length === 0) return "";

  return elevatedResults
    .map((result) => {
      const label =
        result.key === "dersTotal"
          ? "Escala total del DERS"
          : result.label;
      return `- **${label}**: ${getInterpretationText(result.key)}`;
    })
    .join("\n\n");
}

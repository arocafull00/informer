import staicQuestions from "../data/staic.json" with { type: "json" };

export type StaicScale = "estado" | "rasgo";

export type StaicScaleResult = {
  scale: StaicScale;
  label: string;
  directScore: number | null;
  answeredCount: number;
  totalItems: number;
  complete: boolean;
};

export type StaicScoreSummary = {
  estado: StaicScaleResult;
  rasgo: StaicScaleResult;
};

type StaicQuestion = {
  id: string;
  sectionNumber: number;
  scoring: "direct" | "reverse";
};

const questions = staicQuestions as StaicQuestion[];

const SCALE_LABELS: Record<StaicScale, string> = {
  estado: "Ansiedad - estado",
  rasgo: "Ansiedad - rasgo",
};

function scoreItem(raw: number, reverse: boolean): number {
  return reverse ? 4 - raw : raw;
}

function buildScaleResult(
  scale: StaicScale,
  answers: Record<string, number>
): StaicScaleResult {
  const sectionNumber = scale === "estado" ? 1 : 2;
  const scaleQuestions = questions.filter(
    (q) => q.sectionNumber === sectionNumber
  );
  let sum = 0;
  let answeredCount = 0;

  for (const question of scaleQuestions) {
    const raw = answers[question.id];
    if (raw === undefined) continue;
    sum += scoreItem(raw, question.scoring === "reverse");
    answeredCount += 1;
  }

  return {
    scale,
    label: SCALE_LABELS[scale],
    directScore: answeredCount > 0 ? sum : null,
    answeredCount,
    totalItems: scaleQuestions.length,
    complete: answeredCount === scaleQuestions.length,
  };
}

export function getStaicScoreSummary(
  answers: Record<string, number>
): StaicScoreSummary {
  return {
    estado: buildScaleResult("estado", answers),
    rasgo: buildScaleResult("rasgo", answers),
  };
}

function formatTableValue(value: number | null): string {
  return value === null ? "—" : String(value);
}

export function buildStaicMarkdown(answers: Record<string, number>): string {
  const summary = getStaicScoreSummary(answers);

  return [
    "| | Ansiedad - estado | Ansiedad - rasgo |",
    "| --- | ---: | ---: |",
    `| PD | ${formatTableValue(summary.estado.directScore)} | ${formatTableValue(summary.rasgo.directScore)} |`,
  ].join("\n");
}

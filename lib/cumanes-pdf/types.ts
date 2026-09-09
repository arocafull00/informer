import type {
  Age,
  CumanesIdentification,
  CumanesLaterality,
  CumanesLateralityArea,
  CumanesLateralityValue,
  TestCode,
} from "@/lib/cumanes-types";

export type CumanesPdfTextAlign = "left" | "center" | "right";

export type CumanesPdfTextField = {
  type: "text";
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  align: CumanesPdfTextAlign;
};

export type CumanesPdfPointField = {
  type: "point";
  x: number;
  y: number;
  fontSize?: number;
  align?: "left" | "center";
};

export type CumanesPdfCheckField = {
  type: "check";
  x: number;
  y: number;
  radius: number;
};

export type CumanesPdfField =
  | CumanesPdfTextField
  | CumanesPdfPointField
  | CumanesPdfCheckField;

export type CumanesPdfPerfilDecatipo = {
  size: { width: number; height: number };
  xByDecatipo: Record<string, number>;
  yByPrueba: Record<TestCode, number>;
};

export type CumanesPdfPuntuacionesTipicas = {
  minScore: number;
  maxScore: number;
  startX: number;
  endX: number;
  y: number;
  markRadius: number;
};

export type CumanesPdfFieldMap = {
  pageSize: { width: number; height: number };
  perfilDecatipo: CumanesPdfPerfilDecatipo;
  puntuacionesTipicas: CumanesPdfPuntuacionesTipicas;
  fields: Record<string, CumanesPdfField>;
};

export function getTypicalScoreScaleX(
  typicalScore: number,
  scale: CumanesPdfPuntuacionesTipicas,
): number {
  const clamped = Math.min(
    scale.maxScore,
    Math.max(scale.minScore, typicalScore),
  );
  const ratio =
    (clamped - scale.minScore) / (scale.maxScore - scale.minScore);
  return scale.startX + ratio * (scale.endX - scale.startX);
}

export type CumanesPdfTestScore = {
  directScore: number | null;
  transformation: number | null;
  decatype: number | null;
};

export type CumanesPdfForm = {
  patientName: string;
  patientSex: string;
  identification: CumanesIdentification;
  laterality: CumanesLaterality;
  scores: Partial<Record<TestCode, CumanesPdfTestScore>>;
  sum: number | null;
  typicalScore: number | null;
  percentile: number | string | null;
};

export const CUMANES_LATERALITY_FIELD_KEYS: Record<
  CumanesLateralityArea,
  Record<CumanesLateralityValue, string>
> = {
  manual: {
    "left-consistent": "laterality.manual.leftConsistent",
    "left-inconsistent": "laterality.manual.leftInconsistent",
    ambiguous: "laterality.manual.ambiguous",
    "right-inconsistent": "laterality.manual.rightInconsistent",
    "right-consistent": "laterality.manual.rightConsistent",
  },
  podalic: {
    "left-consistent": "laterality.podalic.leftConsistent",
    "left-inconsistent": "laterality.podalic.leftInconsistent",
    ambiguous: "laterality.podalic.ambiguous",
    "right-inconsistent": "laterality.podalic.rightInconsistent",
    "right-consistent": "laterality.podalic.rightConsistent",
  },
  ocular: {
    "left-consistent": "laterality.ocular.leftConsistent",
    "left-inconsistent": "laterality.ocular.leftInconsistent",
    ambiguous: "laterality.ocular.ambiguous",
    "right-inconsistent": "laterality.ocular.rightInconsistent",
    "right-consistent": "laterality.ocular.rightConsistent",
  },
};

export function formatCumanesPdfNumber(value: number): string {
  return value.toLocaleString("es-ES", { maximumFractionDigits: 2 });
}

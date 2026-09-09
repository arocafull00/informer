import { readFileSync } from "node:fs";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { TestCode } from "@/lib/cumanes-types";
import {
  CUMANES_LATERALITY_FIELD_KEYS,
  formatCumanesPdfNumber,
  getTypicalScoreScaleX,
  type CumanesPdfCheckField,
  type CumanesPdfPerfilDecatipo,
  type CumanesPdfPuntuacionesTipicas,
  type CumanesPdfFieldMap,
  type CumanesPdfForm,
  type CumanesPdfPointField,
  type CumanesPdfTextField,
} from "./types";

function loadFieldMap(): CumanesPdfFieldMap {
  const mapPath = path.join(process.cwd(), "data", "cumanes-pdf-fields.json");
  return JSON.parse(readFileSync(mapPath, "utf8")) as CumanesPdfFieldMap;
}

function loadTemplateBytes(): Uint8Array {
  const templatePath = path.join(process.cwd(), "data", "cumanes.pdf");
  return readFileSync(templatePath);
}

function parseDateParts(date: string): {
  day: string;
  month: string;
  year: string;
} | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;
  return {
    day: match[3],
    month: match[2],
    year: match[1].slice(-2),
  };
}

function assignDateParts(
  values: Record<string, string>,
  prefix: string,
  date: string,
): void {
  const parts = parseDateParts(date);
  if (!parts) return;
  values[`${prefix}.year`] = parts.year;
  values[`${prefix}.month`] = parts.month;
  values[`${prefix}.day`] = parts.day;
}

function getTextBaseline(field: CumanesPdfTextField): number {
  return field.y + field.height * 0.32;
}

function drawTextInField(
  page: ReturnType<PDFDocument["getPages"]>[number],
  field: CumanesPdfTextField,
  text: string,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
) {
  const baseline = getTextBaseline(field);
  const textWidth = font.widthOfTextAtSize(text, field.fontSize);

  let x = field.x + 2;
  if (field.align === "center") {
    x = field.x + (field.width - textWidth) / 2;
  }
  if (field.align === "right") {
    x = field.x + field.width - textWidth - 2;
  }

  page.drawText(text, {
    x,
    y: baseline,
    size: field.fontSize,
    font,
    color: rgb(0, 0, 0),
  });
}

function drawTextAtPoint(
  page: ReturnType<PDFDocument["getPages"]>[number],
  field: CumanesPdfPointField,
  text: string,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
) {
  const fontSize = field.fontSize ?? 10;
  const textWidth = font.widthOfTextAtSize(text, fontSize);
  const align = field.align ?? "left";

  let x = field.x;
  if (align === "center") {
    x = field.x - textWidth / 2;
  }

  page.drawText(text, {
    x,
    y: field.y,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  });
}

function drawFieldValue(
  page: ReturnType<PDFDocument["getPages"]>[number],
  field: CumanesPdfTextField | CumanesPdfPointField,
  text: string,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
) {
  if (field.type === "point") {
    drawTextAtPoint(page, field, text, font);
    return;
  }

  drawTextInField(page, field, text, font);
}

const CUMANES_PDF_MARK_COLOR = rgb(1, 0, 0);

function drawRedDot(
  page: ReturnType<PDFDocument["getPages"]>[number],
  x: number,
  y: number,
  radius: number,
) {
  page.drawCircle({
    x,
    y,
    size: radius,
    color: CUMANES_PDF_MARK_COLOR,
  });
}

function drawCheckInField(
  page: ReturnType<PDFDocument["getPages"]>[number],
  field: CumanesPdfCheckField,
) {
  drawRedDot(page, field.x, field.y, field.radius);
}

function buildFieldValues(form: CumanesPdfForm): Record<string, string> {
  const values: Record<string, string> = {};
  const trimmedName = form.patientName.trim();
  if (trimmedName) {
    values["patient.name"] = trimmedName;
  }

  const examinerName = form.identification.examinerName.trim();
  if (examinerName) {
    values["identification.examinerName"] = examinerName;
  }

  const center = form.identification.center.trim();
  if (center) {
    values["identification.center"] = center;
  }

  const course = form.identification.course.trim();
  if (course) {
    values["identification.course"] = course;
  }

  if (form.patientSex === "varon") {
    values["patient.sex.varon"] = "1";
  }

  if (form.patientSex === "mujer") {
    values["patient.sex.mujer"] = "1";
  }

  assignDateParts(
    values,
    "identification.evaluationDate",
    form.identification.evaluationDate,
  );
  assignDateParts(
    values,
    "identification.birthDate",
    form.identification.birthDate,
  );

  if (form.identification.age) {
    values["identification.age"] = String(form.identification.age);
  }

  for (const [code, score] of Object.entries(form.scores)) {
    if (!score) continue;
    if (score.directScore !== null) {
      values[`directScores.${code}`] = String(score.directScore);
    }
    if (score.transformation !== null) {
      values[`transformations.${code}`] = formatCumanesPdfNumber(
        score.transformation,
      );
    }
    if (score.decatype !== null) {
      values[`decatypes.${code}`] = String(score.decatype);
    }
  }

  if (form.sum !== null) {
    values["index.sum"] = formatCumanesPdfNumber(form.sum);
  }

  if (form.typicalScore !== null) {
    values["index.typicalScore"] = String(form.typicalScore);
  }

  if (form.percentile !== null && form.percentile !== "") {
    values["index.percentile"] = String(form.percentile);
  }

  for (const [area, selection] of Object.entries(form.laterality)) {
    if (!selection) continue;
    const fieldKey =
      CUMANES_LATERALITY_FIELD_KEYS[
        area as keyof typeof CUMANES_LATERALITY_FIELD_KEYS
      ][selection as keyof (typeof CUMANES_LATERALITY_FIELD_KEYS)["manual"]];
    if (fieldKey) {
      values[fieldKey] = "1";
    }
  }

  return values;
}

function drawTypicalScoreMark(
  page: ReturnType<PDFDocument["getPages"]>[number],
  typicalScore: number,
  scale: CumanesPdfPuntuacionesTipicas,
) {
  drawRedDot(
    page,
    getTypicalScoreScaleX(typicalScore, scale),
    scale.y,
    scale.markRadius,
  );
}

function drawProfileChecks(
  page: ReturnType<PDFDocument["getPages"]>[number],
  form: CumanesPdfForm,
  perfilDecatipo: CumanesPdfPerfilDecatipo,
) {
  for (const [code, score] of Object.entries(form.scores)) {
    if (!score || score.decatype === null) continue;
    const rowY = perfilDecatipo.yByPrueba[code as TestCode];
    if (!rowY) continue;

    const decatypeKey = String(
      Math.min(10, Math.max(1, Math.round(score.decatype))),
    );
    const x = perfilDecatipo.xByDecatipo[decatypeKey];
    if (x === undefined) continue;

    drawCheckInField(page, {
      type: "check",
      x,
      y: rowY,
      radius: 5,
    });
  }
}

export async function fillCumanesPdf(form: CumanesPdfForm): Promise<Uint8Array> {
  const fieldMap = loadFieldMap();
  const templateBytes = loadTemplateBytes();
  const pdfDoc = await PDFDocument.load(templateBytes);
  const page = pdfDoc.getPages()[0];
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const values = buildFieldValues(form);

  for (const [fieldKey, field] of Object.entries(fieldMap.fields)) {
    if (field.type === "check") {
      if (!values[fieldKey]) continue;
      drawCheckInField(page, field);
      continue;
    }

    if (field.type === "point" || field.type === "text") {
      const value = values[fieldKey];
      if (!value) continue;
      drawFieldValue(page, field, value, font);
    }
  }

  drawProfileChecks(page, form, fieldMap.perfilDecatipo);

  if (form.typicalScore !== null) {
    drawTypicalScoreMark(page, form.typicalScore, fieldMap.puntuacionesTipicas);
  }

  return pdfDoc.save();
}

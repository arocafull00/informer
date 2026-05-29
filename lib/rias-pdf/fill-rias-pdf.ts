import { readFileSync } from "node:fs";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type {
  RiasIndexKey,
  RiasResultsForm,
  RiasSubtestKey,
} from "@/lib/rias-scoring";
import type {
  RiasPdfFieldMap,
  RiasPdfPointField,
  RiasPdfTextField,
} from "./types";

function loadFieldMap(): RiasPdfFieldMap {
  const mapPath = path.join(process.cwd(), "data", "rias-pdf-fields.json");
  return JSON.parse(readFileSync(mapPath, "utf8")) as RiasPdfFieldMap;
}

function loadTemplateBytes(): Uint8Array {
  const templatePath = path.join(process.cwd(), "data", "RÍAS PERFIL.pdf");
  return readFileSync(templatePath);
}

function splitTwoDigitPart(value: string): [string, string] {
  const padded = value.padStart(2, "0").slice(-2);
  return [padded[0] ?? "", padded[1] ?? ""];
}

function parseDateParts(date: string): {
  day: [string, string];
  month: [string, string];
  year: [string, string];
} | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;
  return {
    day: splitTwoDigitPart(match[3]),
    month: splitTwoDigitPart(match[2]),
    year: splitTwoDigitPart(match[1].slice(-2)),
  };
}

function assignDateParts(
  values: Record<string, string>,
  prefix: string,
  date: string,
): void {
  const parts = parseDateParts(date);
  if (!parts) return;
  values[`${prefix}.day.0`] = parts.day[0];
  values[`${prefix}.day.1`] = parts.day[1];
  values[`${prefix}.month.0`] = parts.month[0];
  values[`${prefix}.month.1`] = parts.month[1];
  values[`${prefix}.year.0`] = parts.year[0];
  values[`${prefix}.year.1`] = parts.year[1];
}

function assignAgeYears(
  values: Record<string, string>,
  years: string,
): void {
  const digits = splitTwoDigitPart(years);
  values["patient.chronologicalAge.years.0"] = digits[0];
  values["patient.chronologicalAge.years.1"] = digits[1];
}

function getTextBaseline(field: RiasPdfTextField): number {
  return field.y + field.height * 0.32;
}

function drawPointInField(
  page: ReturnType<PDFDocument["getPages"]>[number],
  field: RiasPdfPointField,
) {
  page.drawCircle({
    x: field.x,
    y: field.y,
    size: 2,
    color: rgb(0, 0, 0),
  });
}

function drawTextInField(
  page: ReturnType<PDFDocument["getPages"]>[number],
  field: RiasPdfTextField,
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

function buildFieldValues(form: RiasResultsForm): Record<string, string> {
  const values: Record<string, string> = {
    "patient.name": form.patient.name,
    "intervals.confidenceLevel": form.intervals.confidenceLevel,
  };

  assignDateParts(values, "patient.evaluationDate", form.patient.evaluationDate);
  assignAgeYears(values, form.patient.chronologicalAge);

  for (const [key, value] of Object.entries(form.directScores)) {
    if (value === null) continue;
    values[`directScores.${key}`] = String(value);
  }

  for (const [key, value] of Object.entries(form.tScores)) {
    if (value === null) continue;
    values[`tScores.${key}`] = String(value);
  }

  for (const [key, value] of Object.entries(form.tSums)) {
    if (value === null) continue;
    values[`tSums.${key}`] = String(value);
  }

  for (const [key, value] of Object.entries(form.indices)) {
    if (value === null) continue;
    values[`indices.${key}`] = String(value);
  }

  for (const key of ["IV", "INV", "IG", "IM"] as const) {
    if (form.intervals[key]) {
      values[`intervals.${key}`] = form.intervals[key];
    }
    if (form.percentiles[key]) {
      values[`percentiles.${key}`] = form.percentiles[key];
    }
  }

  return values;
}

const evaluationDatePointKeys = new Set([
  "patient.evaluationDate.year",
  "patient.evaluationDate.month",
  "patient.evaluationDate.day",
]);

function shouldDrawPoint(fieldKey: string, form: RiasResultsForm): boolean {
  if (evaluationDatePointKeys.has(fieldKey)) {
    return parseDateParts(form.patient.evaluationDate) !== null;
  }

  if (fieldKey === "patient.chronologicalAge") {
    return form.patient.chronologicalAge.trim().length > 0;
  }

  const directScorePointMatch = /^directScores\.(\w+)\.point$/.exec(fieldKey);
  if (directScorePointMatch) {
    const key = directScorePointMatch[1] as RiasSubtestKey;
    return form.directScores[key] !== null;
  }

  const tScorePointMatch = /^tScores\.(\w+)\.point$/.exec(fieldKey);
  if (tScorePointMatch) {
    const key = tScorePointMatch[1] as RiasSubtestKey;
    return form.tScores[key] !== null;
  }

  const tSumPointMatch = /^tSums\.(\w+)\.point$/.exec(fieldKey);
  if (tSumPointMatch) {
    const key = tSumPointMatch[1] as RiasIndexKey;
    return form.tSums[key] !== null;
  }

  const indexPointMatch = /^indices\.(\w+)\.point$/.exec(fieldKey);
  if (indexPointMatch) {
    const key = indexPointMatch[1] as RiasIndexKey;
    return form.indices[key] !== null;
  }

  const indexValuePointMatch = /^indices\.(IV|INV|IG|IM)\.value\.point$/.exec(
    fieldKey,
  );
  if (indexValuePointMatch) {
    const key = indexValuePointMatch[1] as RiasIndexKey;
    return form.indices[key] !== null;
  }

  if (fieldKey === "intervals.confidenceLevel.point") {
    return form.intervals.confidenceLevel.trim().length > 0;
  }

  const intervalPointMatch = /^intervals\.(IV|INV|IG|IM)\.point$/.exec(fieldKey);
  if (intervalPointMatch) {
    const key = intervalPointMatch[1] as RiasIndexKey;
    return form.intervals[key].trim().length > 0;
  }

  const percentilePointMatch = /^percentiles\.(\w+)\.point$/.exec(fieldKey);
  if (percentilePointMatch) {
    const key = percentilePointMatch[1] as RiasIndexKey;
    return form.percentiles[key].trim().length > 0;
  }

  return false;
}

export async function fillRiasPdf(form: RiasResultsForm): Promise<Uint8Array> {
  const fieldMap = loadFieldMap();
  const templateBytes = loadTemplateBytes();
  const pdfDoc = await PDFDocument.load(templateBytes);
  const page = pdfDoc.getPages()[0];
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const values = buildFieldValues(form);

  for (const [fieldKey, field] of Object.entries(fieldMap.fields)) {
    if (field.type === "check") continue;

    if (field.type === "point") {
      if (!shouldDrawPoint(fieldKey, form)) continue;
      drawPointInField(page, field);
      continue;
    }

    const value = values[fieldKey];
    if (!value) continue;
    drawTextInField(page, field, value, font);
  }

  return pdfDoc.save();
}

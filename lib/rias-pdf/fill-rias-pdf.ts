import { readFileSync } from "node:fs";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { RiasResultsForm } from "@/lib/rias-scoring";
import type { RiasPdfFieldMap, RiasPdfTextField } from "./types";

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

function parseIntervalRange(value: string): { min: string; max: string } | null {
  const match = /^(\d+)\s*-\s*(\d+)$/.exec(value.trim());
  if (!match) return null;
  return { min: match[1], max: match[2] };
}

function assignDateParts(
  values: Record<string, string>,
  prefix: string,
  date: string,
): void {
  const parts = parseDateParts(date);
  if (!parts) return;
  values[`${prefix}.day`] = parts.day;
  values[`${prefix}.month`] = parts.month;
  values[`${prefix}.year`] = parts.year;
}

type PdfPageOrigin = {
  x: number;
  y: number;
};

function getPageOrigin(
  page: ReturnType<PDFDocument["getPages"]>[number],
): PdfPageOrigin {
  const mediaBox = page.getMediaBox();
  return { x: mediaBox.x, y: mediaBox.y };
}

function getTextBaseline(field: RiasPdfTextField): number {
  return field.y + field.height * 0.32;
}

function drawTextInField(
  page: ReturnType<PDFDocument["getPages"]>[number],
  field: RiasPdfTextField,
  text: string,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  origin: PdfPageOrigin,
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
    x: x + origin.x,
    y: baseline + origin.y,
    size: field.fontSize,
    font,
    color: rgb(0, 0, 0),
  });
}

function buildFieldValues(form: RiasResultsForm): Record<string, string> {
  const values: Record<string, string> = {
    "patient.name": form.patient.name,
    "patient.chronologicalAge": splitTwoDigitPart(form.patient.chronologicalAge).join(""),
    "intervals.confidenceLevel": form.intervals.confidenceLevel,
  };

  if (form.patient.chronologicalAgeMonths.trim() !== "") {
    values["patient.chronologicalAgeMonths"] = splitTwoDigitPart(
      form.patient.chronologicalAgeMonths,
    ).join("");
  }

  assignDateParts(values, "patient.evaluationDate", form.patient.evaluationDate);

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
    const interval = form.intervals[key];
    if (interval) {
      const range = parseIntervalRange(interval);
      if (range) {
        values[`intervals.${key}.min`] = range.min;
        values[`intervals.${key}.max`] = range.max;
      }
    }
    if (form.percentiles[key]) {
      values[`percentiles.${key}`] = form.percentiles[key];
    }
  }

  return values;
}

export async function fillRiasPdf(form: RiasResultsForm): Promise<Uint8Array> {
  const fieldMap = loadFieldMap();
  const templateBytes = loadTemplateBytes();
  const pdfDoc = await PDFDocument.load(templateBytes);
  const page = pdfDoc.getPages()[0];
  const origin = getPageOrigin(page);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const values = buildFieldValues(form);

  for (const [fieldKey, field] of Object.entries(fieldMap.fields)) {
    if (field.type === "check" || field.type === "point") continue;

    const value = values[fieldKey];
    if (!value) continue;
    drawTextInField(page, field, value, font, origin);
  }

  return pdfDoc.save();
}

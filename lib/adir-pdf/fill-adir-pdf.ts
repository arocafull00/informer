import { readFileSync } from "node:fs";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { AdirResultsForm } from "@/lib/adir-scoring";
import type { AdirPdfFieldMap, AdirPdfTextField } from "./types";

function loadFieldMap(): AdirPdfFieldMap {
  const mapPath = path.join(process.cwd(), "data", "adir-pdf-fields.json");
  return JSON.parse(readFileSync(mapPath, "utf8")) as AdirPdfFieldMap;
}

function loadTemplateBytes(): Uint8Array {
  const templatePath = path.join(process.cwd(), "data", "ADI-R.pdf");
  return readFileSync(templatePath);
}

function parseBirthDateParts(birthDate: string): {
  day: string;
  month: string;
  year: string;
} | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  if (!match) return null;
  return {
    day: match[3],
    month: match[2],
    year: match[1].slice(-2),
  };
}

function getTextBaseline(field: AdirPdfTextField): number {
  return field.y + field.height * 0.32;
}

function drawTextInField(
  page: ReturnType<PDFDocument["getPages"]>[number],
  field: AdirPdfTextField,
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

function buildFieldValues(form: AdirResultsForm): Record<string, string> {
  const values: Record<string, string> = {
    "subject.nameOrId": form.subject.nameOrId,
    "subject.chronologicalAge": form.subject.chronologicalAge,
    "subject.sex": form.subject.sex,
    "informant.name": form.informant.name,
    "informant.relationshipToSubject": form.informant.relationshipToSubject,
  };

  const birthParts = parseBirthDateParts(form.subject.birthDate);
  if (birthParts) {
    values["subject.birthDay"] = birthParts.day;
    values["subject.birthMonth"] = birthParts.month;
    values["subject.birthYear"] = birthParts.year;
  }

  for (const [key, value] of Object.entries(form.scores)) {
    if (value === null) continue;
    values[`scores.${key}`] = String(value);
  }

  for (const [key, value] of Object.entries(form.totals)) {
    if (value === null) continue;
    values[`totals.${key}`] = String(value);
  }

  return values;
}

export async function fillAdirPdf(form: AdirResultsForm): Promise<Uint8Array> {
  const fieldMap = loadFieldMap();
  const templateBytes = loadTemplateBytes();
  const pdfDoc = await PDFDocument.load(templateBytes);
  const page = pdfDoc.getPages()[0];
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const values = buildFieldValues(form);

  for (const [fieldKey, field] of Object.entries(fieldMap.fields)) {
    if (field.type === "check") {
      if (fieldKey !== `algorithm.${form.algorithm}`) continue;
      page.drawEllipse({
        x: field.x,
        y: field.y,
        xScale: field.radius * 0.75,
        yScale: field.radius * 0.55,
        color: rgb(0, 0, 0),
      });
      continue;
    }

    const value = values[fieldKey];
    if (!value) continue;
    drawTextInField(page, field, value, font);
  }

  return pdfDoc.save();
}

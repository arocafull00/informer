import { readFileSync } from "node:fs";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { capScoreForSum } from "@/lib/score-sum-cap";
import type {
  Ados2PdfField,
  Ados2PdfFieldMap,
  Ados2PdfForm,
  Ados2PdfPointField,
  Ados2PdfTest,
  Ados2PdfTextField,
} from "./types";

function loadFieldMap(test: Ados2PdfTest): Ados2PdfFieldMap {
  const fileName =
    test === "ADOS2_NINO"
      ? "ados2-nino-pdf-fields.json"
      : "ados2-adulto-pdf-fields.json";
  const mapPath = path.join(process.cwd(), "data", fileName);
  return JSON.parse(readFileSync(mapPath, "utf8")) as Ados2PdfFieldMap;
}

function loadTemplateBytes(test: Ados2PdfTest): Uint8Array {
  const fileName =
    test === "ADOS2_NINO" ? "ADOS2-niño.pdf" : "ADOS2-adulto.pdf";
  const templatePath = path.join(process.cwd(), "data", fileName);
  return readFileSync(templatePath);
}

function getTextBaseline(field: Ados2PdfTextField): number {
  return field.y + field.height * 0.32;
}

function drawTextInField(
  page: ReturnType<PDFDocument["getPages"]>[number],
  field: Ados2PdfTextField,
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
  field: Ados2PdfPointField,
  text: string,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
) {
  const fontSize = field.fontSize ?? 10;
  const textWidth = font.widthOfTextAtSize(text, fontSize);
  const align = field.align ?? "center";

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
  field: Ados2PdfField,
  text: string,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
) {
  if (field.type === "point") {
    drawTextAtPoint(page, field, text, font);
    return;
  }

  drawTextInField(page, field, text, font);
}

function getClassification(test: Ados2PdfTest, total: number): string {
  if (test === "ADOS2_NINO") {
    if (total >= 9) return "Autismo";
    if (total >= 7) return "Espectro autista";
    return "No TEA";
  }

  if (total >= 10) return "Autismo";
  if (total >= 7) return "Espectro autista";
  return "No TEA";
}

function buildFieldValues(form: Ados2PdfForm): Record<string, string> {
  const values: Record<string, string> = {};
  const { summary } = form;

  for (const domain of summary.domains) {
    for (const row of domain.rows) {
      if (row.score === null) continue;
      values[`scores.${row.itemCode}`] = String(capScoreForSum(row.score));
    }

    if (domain.total === null) continue;

    if (form.test === "ADOS2_NINO") {
      if (domain.id === "as") {
        values["totals.as"] = String(domain.total);
      }
      if (domain.id === "crr") {
        values["totals.crr"] = String(domain.total);
      }
      continue;
    }

    if (domain.id === "communication") {
      values["totals.communication"] = String(domain.total);
    }
    if (domain.id === "isr") {
      values["totals.isr"] = String(domain.total);
    }
    if (domain.id === "rbs") {
      values["totals.rbs"] = String(domain.total);
    }
  }

  if (summary.cPlusIsr !== null) {
    if (form.test === "ADOS2_NINO") {
      values["totals.asPlusCrr"] = String(summary.cPlusIsr);
    } else {
      values["totals.cPlusIsr"] = String(summary.cPlusIsr);
    }
    values["clasificacion"] = getClassification(form.test, summary.cPlusIsr);
  }

  return values;
}

export async function fillAdos2Pdf(form: Ados2PdfForm): Promise<Uint8Array> {
  const fieldMap = loadFieldMap(form.test);
  const templateBytes = loadTemplateBytes(form.test);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const page = pdfDoc.getPages()[0];
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const values = buildFieldValues(form);

  for (const [fieldKey, field] of Object.entries(fieldMap.fields)) {
    const value = values[fieldKey];
    if (!value) continue;
    const fieldFont = fieldKey === "clasificacion" ? boldFont : font;
    drawFieldValue(page, field, value, fieldFont);
  }

  return pdfDoc.save();
}

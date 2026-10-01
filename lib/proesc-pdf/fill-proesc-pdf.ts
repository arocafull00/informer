import { readFileSync } from "node:fs";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from "pdf-lib";
import {
  PROESC_LEVELS,
  PROESC_COURSES,
  getProescSummary,
  type ProescPdfInput,
} from "../proesc-scoring.ts";

const TEMPLATE_WIDTH = 1448;
const TEMPLATE_HEIGHT = 1086;
const PAGE_WIDTH = 841.89;
const PAGE_HEIGHT = 595.28;
const SCALE = PAGE_HEIGHT / TEMPLATE_HEIGHT;
const IMAGE_X = (PAGE_WIDTH - TEMPLATE_WIDTH * SCALE) / 2;

// Centres measured on the supplied 1448 x 1086 image, from top to bottom.
const ROW_Y = [337, 385, 433, 482, 533, 581, 632, 682, 733, 784, 837];
const LEVEL_X = [972, 1072, 1183, 1285, 1380];
const SCORE_X = 850;

function imagePoint(x: number, y: number) {
  return { x: IMAGE_X + x * SCALE, y: PAGE_HEIGHT - y * SCALE };
}

function drawCenteredText(page: PDFPage, text: string, x: number, y: number, font: PDFFont, size: number) {
  const point = imagePoint(x, y);
  page.drawText(text, {
    x: point.x - font.widthOfTextAtSize(text, size) / 2,
    y: point.y - size * 0.35,
    font,
    size,
    color: rgb(0, 0, 0),
  });
}

export async function fillProescPdf(input: ProescPdfInput): Promise<Uint8Array> {
  const summary = getProescSummary(input.course, input.answers);
  if (!summary.complete || summary.total === null || summary.totalResult === null) {
    throw new Error("El informe PROESC debe estar completo");
  }

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const template = await pdf.embedPng(readFileSync(path.join(process.cwd(), "data", "proesc-template.png")));
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  page.drawImage(template, { x: IMAGE_X, y: 0, width: TEMPLATE_WIDTH * SCALE, height: PAGE_HEIGHT });

  const courseLabel = PROESC_COURSES.find(({ value }) => value === input.course)?.label ?? "";
  const headerX = imagePoint(38, 0).x;
  page.drawText("PROESC - Resultados", { x: headerX, y: imagePoint(0, 51).y, font: boldFont, size: 16, color: rgb(0, 0, 0) });
  page.drawText(`Paciente: ${input.patientName || "Sin indicar"}`, { x: headerX, y: imagePoint(0, 91).y, font, size: 11, color: rgb(0, 0, 0), maxWidth: 720 });
  page.drawText(`Curso: ${courseLabel}`, { x: headerX, y: imagePoint(0, 119).y, font, size: 11, color: rgb(0, 0, 0) });

  const rows = [...summary.rows, { score: summary.total, result: summary.totalResult }];
  rows.forEach((row, rowIndex) => {
    const y = ROW_Y[rowIndex];
    drawCenteredText(page, String(row.score), SCORE_X, y, boldFont, 16);
    LEVEL_X.forEach((x) => {
      const point = imagePoint(x, y);
      page.drawRectangle({
        x: point.x - 7,
        y: point.y - 7,
        width: 14,
        height: 14,
        color: rgb(1, 1, 1),
      });
    });
    const selectedColumn = PROESC_LEVELS.findIndex(({ key }) => key === row.result);
    if (selectedColumn < 0) throw new Error("Nivel PROESC sin correspondencia");
    drawCenteredText(page, "X", LEVEL_X[selectedColumn], y, boldFont, 16);
  });

  pdf.setTitle("PROESC - Resultados");
  return pdf.save();
}

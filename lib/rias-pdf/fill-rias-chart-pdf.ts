import { readFileSync } from "node:fs";
import path from "node:path";
import { PDFDocument, rgb } from "pdf-lib";
import type { RiasIndexKey, RiasResultsForm, RiasSubtestKey } from "@/lib/rias-scoring";
import {
  getRiasChartScoreY,
  type RiasChartPdfFieldMap,
  type RiasChartScoreColumn,
} from "./types";

const CHART_MARK_COLOR = rgb(0, 0, 0);

function loadFieldMap(): RiasChartPdfFieldMap {
  const mapPath = path.join(process.cwd(), "data", "rias-grafica-pdf-fields.json");
  return JSON.parse(readFileSync(mapPath, "utf8")) as RiasChartPdfFieldMap;
}

function loadTemplateBytes(): Uint8Array {
  const templatePath = path.join(process.cwd(), "data", "rias-grafica.pdf");
  return readFileSync(templatePath);
}

type ChartPoint = {
  key: string;
  x: number;
  y: number;
};

function getTScorePoint(
  key: RiasSubtestKey,
  score: number,
  column: RiasChartScoreColumn,
): ChartPoint {
  return {
    key,
    x: column.x,
    y: getRiasChartScoreY(score, column),
  };
}

function getIndexPoint(
  key: RiasIndexKey,
  score: number,
  column: RiasChartScoreColumn,
): ChartPoint {
  return {
    key,
    x: column.x,
    y: getRiasChartScoreY(score, column),
  };
}

function drawMark(
  page: ReturnType<PDFDocument["getPages"]>[number],
  point: ChartPoint,
  radius: number,
) {
  page.drawCircle({
    x: point.x,
    y: point.y,
    size: radius,
    color: CHART_MARK_COLOR,
  });
}

function buildChartPoints(
  form: RiasResultsForm,
  fieldMap: RiasChartPdfFieldMap,
): ChartPoint[] {
  const points: ChartPoint[] = [];

  for (const [key, column] of Object.entries(fieldMap.tScoreColumns)) {
    const score = form.tScores[key as RiasSubtestKey];
    if (score === null) continue;
    points.push(getTScorePoint(key as RiasSubtestKey, score, column));
  }

  for (const [key, column] of Object.entries(fieldMap.indexColumns)) {
    const score = form.indices[key as RiasIndexKey];
    if (score === null) continue;
    points.push(getIndexPoint(key as RiasIndexKey, score, column));
  }

  return points;
}

export async function fillRiasChartPdf(
  form: RiasResultsForm,
): Promise<Uint8Array> {
  const fieldMap = loadFieldMap();
  const templateBytes = loadTemplateBytes();
  const pdfDoc = await PDFDocument.load(templateBytes);
  const page = pdfDoc.getPages()[0];
  const points = buildChartPoints(form, fieldMap);

  for (const point of points) {
    drawMark(page, point, fieldMap.markRadius);
  }

  return pdfDoc.save();
}

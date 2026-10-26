import jsQRModule from "jsqr";
import { applyHomography, fitAffine, fitHomography, type Matrix3, type Point } from "./homography.ts";
import { sheetMaps, type SheetItem, type SheetMap, type SheetPage, type SheetTest } from "./sheet-maps.ts";

export type RgbaImage = { width: number; height: number; data: Uint8ClampedArray };

export type SheetItemStatus = "ok" | "empty" | "multiple" | "faint";

export type SheetItemReading = {
  item: SheetItem;
  status: SheetItemStatus;
  value?: number;
  fills: number[];
};

export type SheetReading = {
  test: SheetTest;
  map: SheetMap;
  page: SheetPage;
  pageCount: number;
  mmToImage: Matrix3;
  items: SheetItemReading[];
};

export class SheetReadError extends Error {}

export const MARK_FILL = 0.06;
export const FAINT_FILL = 0.025;

const INK_RATIO = 0.7;
const BOX_INSET = 0.9;
const BOX_SAMPLES = 15;
const QR_PAYLOAD = /^(STAI|DERS)-(\d+)\/(\d+)$/;

type JsQr = typeof jsQRModule;
const jsQR: JsQr =
  typeof jsQRModule === "function" ? jsQRModule : (jsQRModule as unknown as { default: JsQr }).default;

type Gray = { width: number; height: number; data: Uint8Array };

function toGray({ width, height, data }: RgbaImage): Gray {
  const gray = new Uint8Array(width * height);
  for (let i = 0; i < gray.length; i++) {
    gray[i] = (data[i * 4] * 299 + data[i * 4 + 1] * 587 + data[i * 4 + 2] * 114) / 1000;
  }
  return { width, height, data: gray };
}

function halve({ width, height, data }: RgbaImage): RgbaImage {
  const w = Math.floor(width / 2);
  const h = Math.floor(height / 2);
  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      for (let c = 0; c < 4; c++) {
        const i = (2 * y * width + 2 * x) * 4 + c;
        out[(y * w + x) * 4 + c] =
          (data[i] + data[i + 4] + data[i + width * 4] + data[i + width * 4 + 4]) / 4;
      }
    }
  }
  return { width: w, height: h, data: out };
}

function decodeQr(image: RgbaImage) {
  let current = image;
  let scale = 1;
  for (let attempt = 0; attempt < 3; attempt++) {
    const result = jsQR(current.data, current.width, current.height, { inversionAttempts: "dontInvert" });
    if (result) {
      const corner = (p: Point) => ({ x: p.x * scale, y: p.y * scale });
      return {
        payload: result.data,
        corners: [
          corner(result.location.topLeftCorner),
          corner(result.location.topRightCorner),
          corner(result.location.bottomRightCorner),
          corner(result.location.bottomLeftCorner),
        ],
      };
    }
    if (Math.min(current.width, current.height) < 600) break;
    current = halve(current);
    scale *= 2;
  }
  return null;
}

function integralImage({ width, height, data }: Gray) {
  const stride = width + 1;
  const sums = new Float64Array(stride * (height + 1));
  for (let y = 0; y < height; y++) {
    let row = 0;
    for (let x = 0; x < width; x++) {
      row += data[y * width + x];
      sums[(y + 1) * stride + x + 1] = sums[y * stride + x + 1] + row;
    }
  }
  return (x0: number, y0: number, x1: number, y1: number) =>
    sums[y1 * stride + x1] - sums[y0 * stride + x1] - sums[y1 * stride + x0] + sums[y0 * stride + x0];
}

function findMarker(
  gray: Gray,
  areaSum: ReturnType<typeof integralImage>,
  predicted: Point,
  pxPerMm: number,
  markerSize: number,
  searchRadiusMm: number,
): Point | null {
  const { width, height, data } = gray;
  const searchRadius = Math.round(searchRadiusMm * pxPerMm);
  const meanRadius = Math.max(4, Math.round(1.5 * markerSize * pxPerMm));
  const x0 = Math.max(0, Math.round(predicted.x - searchRadius));
  const y0 = Math.max(0, Math.round(predicted.y - searchRadius));
  const x1 = Math.min(width, Math.round(predicted.x + searchRadius));
  const y1 = Math.min(height, Math.round(predicted.y + searchRadius));
  if (x1 - x0 < 4 || y1 - y0 < 4) return null;

  const windowWidth = x1 - x0;
  const isDark = new Uint8Array(windowWidth * (y1 - y0));
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const ax = Math.max(0, x - meanRadius);
      const ay = Math.max(0, y - meanRadius);
      const bx = Math.min(width, x + meanRadius);
      const by = Math.min(height, y + meanRadius);
      const mean = areaSum(ax, ay, bx, by) / ((bx - ax) * (by - ay));
      if (data[y * width + x] < mean * 0.6) isDark[(y - y0) * windowWidth + (x - x0)] = 1;
    }
  }

  const expectedArea = (markerSize * pxPerMm) ** 2;
  const stack: number[] = [];
  let best: { point: Point; distance: number } | null = null;

  for (let start = 0; start < isDark.length; start++) {
    if (isDark[start] !== 1) continue;
    isDark[start] = 2;
    stack.push(start);
    let count = 0;
    let sumX = 0;
    let sumY = 0;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    while (stack.length > 0) {
      const index = stack.pop()!;
      const x = index % windowWidth;
      const y = (index - x) / windowWidth;
      count++;
      sumX += x;
      sumY += y;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      const neighbours = [
        x > 0 ? index - 1 : -1,
        x < windowWidth - 1 ? index + 1 : -1,
        index - windowWidth,
        index + windowWidth,
      ];
      for (const next of neighbours) {
        if (next >= 0 && next < isDark.length && isDark[next] === 1) {
          isDark[next] = 2;
          stack.push(next);
        }
      }
    }

    const boxWidth = maxX - minX + 1;
    const boxHeight = maxY - minY + 1;
    const aspect = boxWidth / boxHeight;
    const fill = count / (boxWidth * boxHeight);
    if (count < expectedArea * 0.25 || count > expectedArea * 4) continue;
    if (aspect < 0.5 || aspect > 2 || fill < 0.45) continue;

    const point = { x: x0 + sumX / count, y: y0 + sumY / count };
    const distance = Math.hypot(point.x - predicted.x, point.y - predicted.y);
    if (!best || distance < best.distance) best = { point, distance };
  }

  return best?.point ?? null;
}

function sampleGray({ width, height, data }: Gray, { x, y }: Point) {
  const fx = Math.min(Math.max(x - 0.5, 0), width - 1.001);
  const fy = Math.min(Math.max(y - 0.5, 0), height - 1.001);
  const ix = Math.floor(fx);
  const iy = Math.floor(fy);
  const dx = fx - ix;
  const dy = fy - iy;
  const i = iy * width + ix;
  return (
    data[i] * (1 - dx) * (1 - dy) +
    data[i + 1] * dx * (1 - dy) +
    data[i + width] * (1 - dx) * dy +
    data[i + width + 1] * dx * dy
  );
}

function boxFill(gray: Gray, h: Matrix3, box: { x: number; y: number }, boxSize: number) {
  const paperSamples: number[] = [];
  for (const side of [-1, 1]) {
    for (let dx = boxSize / 2 + 2; dx <= boxSize / 2 + 4; dx += 0.5) {
      for (let dy = -2; dy <= 2; dy += 0.5) {
        paperSamples.push(sampleGray(gray, applyHomography(h, { x: box.x + side * dx, y: box.y + dy })));
      }
    }
  }
  paperSamples.sort((a, b) => a - b);
  const paper = paperSamples[Math.floor(paperSamples.length * 0.75)];

  const half = boxSize / 2 - BOX_INSET;
  let dark = 0;
  for (let row = 0; row < BOX_SAMPLES; row++) {
    for (let col = 0; col < BOX_SAMPLES; col++) {
      const point = {
        x: box.x - half + (2 * half * col) / (BOX_SAMPLES - 1),
        y: box.y - half + (2 * half * row) / (BOX_SAMPLES - 1),
      };
      if (sampleGray(gray, applyHomography(h, point)) < paper * INK_RATIO) dark++;
    }
  }
  return dark / BOX_SAMPLES ** 2;
}

function classify(item: SheetItem, fills: number[]): SheetItemReading {
  const marked = fills.flatMap((fill, index) => (fill >= MARK_FILL ? [index] : []));
  const faint = fills.filter((fill) => fill >= FAINT_FILL && fill < MARK_FILL).length;
  if (marked.length > 1) return { item, fills, status: "multiple" };
  if (marked.length === 1 && faint === 0) {
    return { item, fills, status: "ok", value: Number(item.boxes[marked[0]].value) };
  }
  if (marked.length === 0 && faint === 0) return { item, fills, status: "empty" };
  return { item, fills, status: "faint" };
}

function isInside({ width, height }: RgbaImage, { x, y }: Point) {
  return x >= 0 && y >= 0 && x < width && y < height;
}

export function readSheet(image: RgbaImage): SheetReading {
  const qr = decodeQr(image);
  if (!qr) {
    throw new SheetReadError(
      "No se encuentra el código QR de la hoja. Comprueba que la hoja se ve entera, enfocada y sin brillos.",
    );
  }
  const match = QR_PAYLOAD.exec(qr.payload);
  const map = match ? sheetMaps[match[1] as SheetTest] : undefined;
  const page = map?.pages.find((candidate) => candidate.qr === qr.payload);
  if (!match || !map || !page) {
    throw new SheetReadError(`El código QR («${qr.payload}») no corresponde a ninguna plantilla de la app.`);
  }

  const qrHalf = page.qrSize / 2;
  const [qx, qy] = page.qrCenter;
  const qrMm: Point[] = [
    { x: qx - qrHalf, y: qy - qrHalf },
    { x: qx + qrHalf, y: qy - qrHalf },
    { x: qx + qrHalf, y: qy + qrHalf },
    { x: qx - qrHalf, y: qy + qrHalf },
  ];
  const roughHomography = fitAffine(qrMm, qr.corners);
  const qrSidePx =
    qr.corners.reduce((sum, corner, index) => {
      const next = qr.corners[(index + 1) % 4];
      return sum + Math.hypot(next.x - corner.x, next.y - corner.y);
    }, 0) / 4;
  const pxPerMm = qrSidePx / page.qrSize;

  const gray = toGray(image);
  const areaSum = integralImage(gray);
  const markerMm = Object.values(page.markers).map(([x, y]) => ({ x, y }));
  const markerPx = markerMm.map((point) => {
    const predicted = applyHomography(roughHomography, point);
    return (
      findMarker(gray, areaSum, predicted, pxPerMm, map.markerSize, 40) ??
      findMarker(gray, areaSum, predicted, pxPerMm, map.markerSize, 90)
    );
  });
  if (markerPx.some((point) => point === null)) {
    throw new SheetReadError(
      "No se encuentran las tres marcas negras de las esquinas. Haz la foto con la hoja entera a la vista.",
    );
  }

  const mmToImage = fitHomography([...markerMm, ...qrMm], [...(markerPx as Point[]), ...qr.corners]);
  const worstError = Math.max(
    ...markerMm.map((point, index) => {
      const projected = applyHomography(mmToImage, point);
      return Math.hypot(projected.x - markerPx[index]!.x, projected.y - markerPx[index]!.y) / pxPerMm;
    }),
  );
  if (worstError > 3) {
    throw new SheetReadError(
      "La hoja está doblada o muy inclinada y no se puede enderezar. Ponla plana y haz la foto desde arriba.",
    );
  }

  const allBoxes = page.items.flatMap((item) => item.boxes);
  if (!allBoxes.every((box) => isInside(image, applyHomography(mmToImage, box)))) {
    throw new SheetReadError("Parte de la hoja queda fuera de la foto.");
  }

  const items = page.items.map((item) =>
    classify(
      item,
      item.boxes.map((box) => boxFill(gray, mmToImage, box, map.boxSize)),
    ),
  );

  return { test: map.test, map, page, pageCount: map.pages.length, mmToImage, items };
}

export function rectifySheet(image: RgbaImage, reading: SheetReading, pxPerMm: number): RgbaImage {
  const width = Math.round(reading.map.page.width * pxPerMm);
  const height = Math.round(reading.map.page.height * pxPerMm);
  const out = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const source = applyHomography(reading.mmToImage, { x: (x + 0.5) / pxPerMm, y: (y + 0.5) / pxPerMm });
      const sx = Math.min(Math.max(Math.round(source.x - 0.5), 0), image.width - 1);
      const sy = Math.min(Math.max(Math.round(source.y - 0.5), 0), image.height - 1);
      const from = (sy * image.width + sx) * 4;
      const to = (y * width + x) * 4;
      out[to] = image.data[from];
      out[to + 1] = image.data[from + 1];
      out[to + 2] = image.data[from + 2];
      out[to + 3] = 255;
    }
  }
  return { width, height, data: out };
}

import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { pdf } from "pdf-to-img";
import sharp from "sharp";
import { applyHomography, fitHomography } from "./homography.ts";
import { readSheet, SheetReadError, type RgbaImage } from "./read-sheet.ts";
import { sheetMaps, type SheetTest } from "./sheet-maps.ts";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const RENDER_SCALE = 2;
const PX_PER_MM = (RENDER_SCALE * 72) / 25.4;

async function renderPage(test: SheetTest, pageNumber: number) {
  const document = await pdf(path.join(root, "public", "plantillas", `${test.toLowerCase()}.pdf`), {
    scale: RENDER_SCALE,
  });
  return document.getPage(pageNumber);
}

function crossSvg(width: number, height: number, marks: { x: number; y: number; size?: number }[]) {
  const lines = marks
    .map(({ x, y, size = 2.4 }, index) => {
      const cx = x * PX_PER_MM + (index % 3) - 1;
      const cy = y * PX_PER_MM + ((index * 2) % 3) - 1;
      const r = size * PX_PER_MM;
      return `<path d="M${cx - r} ${cy - r * 0.9} L${cx + r} ${cy + r} M${cx + r * 0.9} ${cy - r} L${cx - r} ${cy + r * 0.8}" stroke="#1d2f86" stroke-width="${0.45 * PX_PER_MM}" stroke-linecap="round" fill="none"/>`;
    })
    .join("");
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${lines}</svg>`);
}

async function photograph(
  page: Buffer,
  marks: { x: number; y: number; size?: number }[],
  { angle = 0, width = 1800 } = {},
): Promise<RgbaImage> {
  const { width: pageWidth, height: pageHeight } = await sharp(page).metadata();
  const drawn = await sharp(page)
    .composite([{ input: crossSvg(pageWidth!, pageHeight!, marks) }])
    .png()
    .toBuffer();
  const { data, info } = await sharp(drawn)
    .rotate(angle, { background: "#d8d2c4" })
    .resize({ width })
    .linear(0.85, 10)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { width: info.width, height: info.height, data: new Uint8ClampedArray(data) };
}

function chosenIndex(itemIndex: number, optionCount: number) {
  return (itemIndex * 7 + 1) % optionCount;
}

for (const sheetTest of ["STAI", "STAIC", "DERS"] as const) {
  for (const pageNumber of [1, 2]) {
    test(`${sheetTest} page ${pageNumber}: reads one cross per item from a tilted photo`, async () => {
      const page = sheetMaps[sheetTest].pages[pageNumber - 1];
      const marks = page.items.flatMap((item, index) => {
        if (index === 2) return [];
        const boxes = [item.boxes[chosenIndex(index, item.boxes.length)]];
        if (index === 4) boxes.push(item.boxes[(chosenIndex(index, item.boxes.length) + 1) % item.boxes.length]);
        return boxes;
      });
      const image = await photograph(await renderPage(sheetTest, pageNumber), marks, { angle: 4 });

      const reading = readSheet(image);

      assert.equal(reading.test, sheetTest);
      assert.equal(reading.page.page, pageNumber);
      reading.items.forEach(({ item, status, value }, index) => {
        if (index === 2) return assert.equal(status, "empty", `item ${item.code}`);
        if (index === 4) return assert.equal(status, "multiple", `item ${item.code}`);
        assert.equal(status, "ok", `item ${item.code}`);
        assert.equal(value, Number(item.boxes[chosenIndex(index, item.boxes.length)].value), `item ${item.code}`);
      });
    });
  }
}

test("reads a sheet photographed upside down", async () => {
  const page = sheetMaps.STAI.pages[0];
  const marks = page.items.map((item, index) => item.boxes[chosenIndex(index, item.boxes.length)]);
  const image = await photograph(await renderPage("STAI", 1), marks, { angle: 180, width: 1500 });

  const reading = readSheet(image);

  assert.deepEqual(
    reading.items.map(({ value }) => value),
    page.items.map((item, index) => Number(item.boxes[chosenIndex(index, item.boxes.length)].value)),
  );
});

function keystone(image: RgbaImage, amount: number): RgbaImage {
  const { width, height } = image;
  const corners = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ];
  const warped = [
    { x: width * amount, y: height * 0.04 },
    { x: width * (1 - amount * 0.6), y: 0 },
    { x: width, y: height },
    { x: 0, y: height * 0.97 },
  ];
  const toSource = fitHomography(warped, corners);
  const data = new Uint8ClampedArray(width * height * 4).fill(110);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const source = applyHomography(toSource, { x, y });
      const sx = Math.round(source.x);
      const sy = Math.round(source.y);
      if (sx < 0 || sy < 0 || sx >= width || sy >= height) continue;
      data.set(image.data.subarray((sy * width + sx) * 4, (sy * width + sx) * 4 + 4), (y * width + x) * 4);
    }
  }
  return { width, height, data };
}

test("reads a blurry photo taken at an angle", async () => {
  const page = sheetMaps.DERS.pages[1];
  const marks = page.items.map((item, index) => ({
    ...item.boxes[chosenIndex(index, item.boxes.length)],
    size: 1.6,
  }));
  const photo = await photograph(await renderPage("DERS", 2), marks, { width: 1400 });
  const blurred = await sharp(Buffer.from(photo.data), { raw: { width: photo.width, height: photo.height, channels: 4 } })
    .blur(1.2)
    .raw()
    .toBuffer();

  const reading = readSheet(keystone({ ...photo, data: new Uint8ClampedArray(blurred) }, 0.12));

  assert.deepEqual(
    reading.items.map(({ value }) => value),
    page.items.map((item, index) => Number(item.boxes[chosenIndex(index, item.boxes.length)].value)),
  );
});

test("rejects an image without a template QR code", async () => {
  const { data, info } = await sharp({ create: { width: 800, height: 1100, channels: 4, background: "#ffffff" } })
    .raw()
    .toBuffer({ resolveWithObject: true });

  assert.throws(
    () => readSheet({ width: info.width, height: info.height, data: new Uint8ClampedArray(data) }),
    SheetReadError,
  );
});

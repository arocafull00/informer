import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const pdfOutDir = path.join(root, "public", "plantillas");

const PAGE = { width: 210, height: 297 };
const MARKER_SIZE = 10;
const MARKERS = { topLeft: [15, 15], bottomLeft: [15, 282], bottomRight: [195, 282] };
const QR_CENTER = [195, 15];
const QR_SIZE = 14;
const CONTENT = { left: 15, right: 195, top: 28, bottom: 270 };
const BOX_SIZE = 5.5;
const NUMBER_COL = 9;
const TEXT_SIZE = 10.5;
const LINE_HEIGHT = 4.6;
const MIN_ROW_HEIGHT = 9;

const BLACK = rgb(0, 0, 0);
const BOX_STROKE = rgb(0.25, 0.25, 0.25);
const RULE = rgb(0.82, 0.82, 0.82);
const MUTED = rgb(0.45, 0.45, 0.45);

const pt = (mm) => (mm * 72) / 25.4;
const round = (value) => Math.round(value * 100) / 100;

const loadItems = (name) =>
  JSON.parse(readFileSync(path.join(root, "data", `${name}.json`), "utf8"));

const tests = [
  {
    name: "stai",
    test: "STAI",
    pages: (items) => [
      {
        title: "Ansiedad-Estado",
        items: items.filter((item) => item.section === "Ansiedad-Estado"),
        instructions:
          "Lea cada frase y marque la respuesta que mejor indique cómo se siente usted ahora mismo, en este momento. No hay respuestas buenas ni malas.",
      },
      {
        title: "Ansiedad-Rasgo",
        items: items.filter((item) => item.section === "Ansiedad-Rasgo"),
        instructions:
          "Lea cada frase y marque la respuesta que mejor indique cómo se siente usted en general, en la mayoría de las ocasiones. No hay respuestas buenas ni malas.",
      },
    ],
  },
  {
    name: "staic",
    test: "STAIC",
    pages: (items) => [
      {
        title: "Ansiedad-Estado",
        items: items.filter((item) => item.section === "Ansiedad-Estado"),
        instructions:
          "Lee cada frase y marca la respuesta que diga mejor cómo te sientes ahora mismo, en este momento. No hay respuestas buenas ni malas.",
      },
      {
        title: "Ansiedad-Rasgo",
        items: items.filter((item) => item.section === "Ansiedad-Rasgo"),
        instructions:
          "Lee cada frase y marca la respuesta que diga mejor cómo te sientes en general, no sólo en este momento. No hay respuestas buenas ni malas.",
      },
    ],
  },
  {
    name: "ders",
    test: "DERS",
    pages: (items) => {
      const instructions =
        "Lea cada frase y marque con qué frecuencia le ocurre lo que describe. No hay respuestas buenas ni malas.";
      return [
        { title: "Regulación emocional", items: items.slice(0, 14), instructions },
        { title: "Regulación emocional", items: items.slice(14), instructions },
      ];
    },
  },
];

function wrap(text, font, size, maxWidthMm) {
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && pt(maxWidthMm) < font.widthOfTextAtSize(candidate, size)) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function createDrawer(page) {
  const toY = (mm) => pt(PAGE.height - mm);
  return {
    text(text, x, baseline, font, size, color = BLACK) {
      page.drawText(text, { x: pt(x), y: toY(baseline), font, size, color });
    },
    rect(x, y, width, height, options) {
      page.drawRectangle({
        x: pt(x),
        y: toY(y + height),
        width: pt(width),
        height: pt(height),
        ...options,
      });
    },
    line(x1, y1, x2, y2, thickness, color) {
      page.drawLine({ start: { x: pt(x1), y: toY(y1) }, end: { x: pt(x2), y: toY(y2) }, thickness, color });
    },
  };
}

function drawQr(draw, payload) {
  const { modules } = QRCode.create(payload, { errorCorrectionLevel: "M" });
  const moduleSize = QR_SIZE / modules.size;
  const left = QR_CENTER[0] - QR_SIZE / 2;
  const top = QR_CENTER[1] - QR_SIZE / 2;
  for (let row = 0; row < modules.size; row++) {
    for (let col = 0; col < modules.size; col++) {
      if (modules.get(row, col)) {
        draw.rect(left + col * moduleSize, top + row * moduleSize, moduleSize, moduleSize, { color: BLACK });
      }
    }
  }
}

function drawPage(doc, fonts, { test, title, items, instructions, pageNumber, pageCount }) {
  const page = doc.addPage([pt(PAGE.width), pt(PAGE.height)]);
  const draw = createDrawer(page);
  const { regular, bold } = fonts;
  const qrPayload = `${test}-${pageNumber}/${pageCount}`;

  for (const [x, y] of Object.values(MARKERS)) {
    draw.rect(x - MARKER_SIZE / 2, y - MARKER_SIZE / 2, MARKER_SIZE, MARKER_SIZE, { color: BLACK });
  }
  drawQr(draw, qrPayload);

  draw.text(`${test} · ${title}`, CONTENT.left, 31, bold, 14);
  const pageLabel = `Página ${pageNumber} de ${pageCount}`;
  const pageLabelWidth = (regular.widthOfTextAtSize(pageLabel, 10) * 25.4) / 72;
  draw.text(pageLabel, QR_CENTER[0] - QR_SIZE / 2 - 4 - pageLabelWidth, 31, regular, 10, MUTED);
  draw.text("Código: ____________________     Fecha: ____ / ____ / ________", CONTENT.left, 40, regular, TEXT_SIZE);

  let cursor = 49;
  for (const line of wrap(instructions, regular, TEXT_SIZE, CONTENT.right - CONTENT.left)) {
    draw.text(line, CONTENT.left, cursor, regular, TEXT_SIZE);
    cursor += LINE_HEIGHT + 0.4;
  }
  draw.text("Marque con una X una sola respuesta por pregunta.", CONTENT.left, cursor, bold, TEXT_SIZE);
  cursor += 9;

  const options = Object.entries(items[0].answers);
  const optionCol = options.length > 4 ? 17 : 19;
  const optionsLeft = CONTENT.right - optionCol * options.length;
  const textLeft = CONTENT.left + NUMBER_COL;
  const textWidth = optionsLeft - 3 - textLeft;

  const headerLines = options.map(([, label]) => wrap(label, bold, 9, optionCol - 1.5));
  const headerLineCount = Math.max(...headerLines.map((lines) => lines.length));
  headerLines.forEach((lines, index) => {
    const centerX = optionsLeft + optionCol * index + optionCol / 2;
    lines.forEach((line, lineIndex) => {
      const width = (bold.widthOfTextAtSize(line, 9) * 25.4) / 72;
      const baseline = cursor + (headerLineCount - lines.length + lineIndex) * 3.8;
      draw.text(line, centerX - width / 2, baseline, bold, 9);
    });
  });
  draw.text("Nº", CONTENT.left, cursor + (headerLineCount - 1) * 3.8, bold, 9);
  draw.text("Frase", textLeft, cursor + (headerLineCount - 1) * 3.8, bold, 9);
  cursor += (headerLineCount - 1) * 3.8 + 2.5;
  draw.line(CONTENT.left, cursor, CONTENT.right, cursor, 0.8, BLACK);

  const mappedItems = [];
  for (const item of items) {
    const lines = wrap(item.question, regular, TEXT_SIZE, textWidth);
    const rowHeight = Math.max(MIN_ROW_HEIGHT, lines.length * LINE_HEIGHT + 4.4);
    const rowCenter = cursor + rowHeight / 2;
    const firstBaseline = rowCenter - ((lines.length - 1) * LINE_HEIGHT) / 2 + 1.3;

    const number = item.code;
    const numberWidth = (regular.widthOfTextAtSize(number, TEXT_SIZE) * 25.4) / 72;
    draw.text(number, textLeft - 2.5 - numberWidth, firstBaseline, regular, TEXT_SIZE);
    lines.forEach((line, index) => draw.text(line, textLeft, firstBaseline + index * LINE_HEIGHT, regular, TEXT_SIZE));

    const boxes = options.map(([value, label], index) => {
      const centerX = optionsLeft + optionCol * index + optionCol / 2;
      draw.rect(centerX - BOX_SIZE / 2, rowCenter - BOX_SIZE / 2, BOX_SIZE, BOX_SIZE, {
        borderColor: BOX_STROKE,
        borderWidth: 0.6,
      });
      return { value, label, x: round(centerX), y: round(rowCenter) };
    });
    mappedItems.push({ id: item.id, code: item.code, boxes });

    cursor += rowHeight;
    draw.line(CONTENT.left, cursor, CONTENT.right, cursor, 0.3, RULE);
  }

  if (cursor > CONTENT.bottom) {
    throw new Error(`${qrPayload} overflows the page (${round(cursor)} mm > ${CONTENT.bottom} mm)`);
  }

  const footer = "Imprimir al 100 % (tamaño real)";
  const footerWidth = (regular.widthOfTextAtSize(footer, 7) * 25.4) / 72;
  draw.text(footer, PAGE.width / 2 - footerWidth / 2, 283, regular, 7, MUTED);

  return {
    page: pageNumber,
    qr: qrPayload,
    qrCenter: QR_CENTER,
    qrSize: QR_SIZE,
    markers: MARKERS,
    items: mappedItems,
  };
}

async function generate({ name, test, pages }) {
  const doc = await PDFDocument.create();
  doc.setTitle(`Plantilla ${test}`);
  const fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
  };

  const pageDefs = pages(loadItems(name));
  const mappedPages = pageDefs.map((pageDef, index) =>
    drawPage(doc, fonts, { test, ...pageDef, pageNumber: index + 1, pageCount: pageDefs.length }),
  );

  writeFileSync(path.join(pdfOutDir, `${name}.pdf`), await doc.save());

  const map = {
    test,
    version: 1,
    units: "mm",
    origin: "top-left",
    page: PAGE,
    markerSize: MARKER_SIZE,
    boxSize: BOX_SIZE,
    pages: mappedPages,
  };
  writeFileSync(path.join(root, "data", `${name}-omr-map.json`), `${JSON.stringify(map, null, 2)}\n`);
  console.log(`Generated ${name}.pdf and ${name}-omr-map.json`);
}

mkdirSync(pdfOutDir, { recursive: true });
for (const test of tests) {
  await generate(test);
}

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pdf } from "pdf-to-img";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "pdf");

const templates = [
  {
    input: path.join(root, "data", "ADI-R.pdf"),
    output: path.join(outDir, "adi-r.png"),
    width: 705,
    height: 1000,
  },
  {
    input: path.join(root, "data", "RÍAS PERFIL.pdf"),
    output: path.join(outDir, "rias-perfil.png"),
    width: 496,
    height: 710,
  },
  {
    input: path.join(root, "data", "ADOS2-niño.pdf"),
    output: path.join(outDir, "ados2-nino.png"),
    width: 595,
    height: 842,
  },
  {
    input: path.join(root, "data", "ADOS2-adulto.pdf"),
    output: path.join(outDir, "ados2-adulto.png"),
    width: 595,
    height: 842,
  },
];

async function renderTemplate(template) {
  const document = await pdf(template.input, { scale: 1 });
  let pageBuffer = null;

  for await (const page of document) {
    pageBuffer = page;
    break;
  }

  if (!pageBuffer) {
    throw new Error(`No pages found in ${template.input}`);
  }

  const resized = await sharp(pageBuffer)
    .resize(template.width, template.height, { fit: "fill" })
    .png()
    .toBuffer();

  writeFileSync(template.output, resized);
  const metadata = await sharp(resized).metadata();
  console.log(
    `${path.basename(template.output)}: ${metadata.width}x${metadata.height}`,
  );
}

mkdirSync(outDir, { recursive: true });

for (const template of templates) {
  await renderTemplate(template);
}

import type { RgbaImage } from "./read-sheet";

export type LoadedSheetImage = { name: string; image: RgbaImage };

const MAX_SIDE = 2400;

export class SheetFileError extends Error {}

function canvasToImage(canvas: HTMLCanvasElement): RgbaImage {
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  return { width: canvas.width, height: canvas.height, data };
}

async function loadBitmap(file: File): Promise<RgbaImage> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new SheetFileError("No se puede abrir la imagen. Usa una foto JPG o PNG.");
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvasToImage(canvas);
}

async function loadPdfPages(file: File): Promise<LoadedSheetImage[]> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const document = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages: LoadedSheetImage[] = [];
  for (let number = 1; number <= document.numPages; number++) {
    const page = await document.getPage(number);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: MAX_SIDE / Math.max(base.width, base.height) });
    const canvas = globalThis.document.createElement("canvas");
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    await page.render({ canvas, viewport }).promise;
    pages.push({
      name: document.numPages > 1 ? `${file.name} · página ${number}` : file.name,
      image: canvasToImage(canvas),
    });
  }
  await document.destroy();
  return pages;
}

export async function loadSheetImages(file: File): Promise<LoadedSheetImage[]> {
  const name = file.name.toLowerCase();
  if (file.type === "application/pdf" || name.endsWith(".pdf")) return loadPdfPages(file);
  if (/image\/hei[cf]/.test(file.type) || /\.(heic|heif)$/.test(name)) {
    throw new SheetFileError(
      "Las fotos HEIC del iPhone no se pueden abrir aquí. Activa Ajustes → Cámara → Formatos → «Más compatible» o expórtala como JPG.",
    );
  }
  return [{ name: file.name, image: await loadBitmap(file) }];
}

export function imageToCanvas({ width, height, data }: RgbaImage): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.putImageData(new ImageData(new Uint8ClampedArray(data), width, height), 0, 0);
  return canvas;
}

export type PdfPoint = {
  x: number;
  y: number;
};

export type PdfRect = PdfPoint & {
  width: number;
  height: number;
};

export function imageDimensionsMatchPageSize(
  img: HTMLImageElement,
  pageWidth: number,
  pageHeight: number,
): boolean {
  return img.naturalWidth === pageWidth && img.naturalHeight === pageHeight;
}

export function screenToPdf(
  clientX: number,
  clientY: number,
  img: HTMLImageElement,
  pageHeight: number,
): PdfPoint {
  const rect = img.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * img.naturalWidth;
  const screenY = ((clientY - rect.top) / rect.height) * img.naturalHeight;
  return {
    x: Math.round(x),
    y: Math.round(pageHeight - screenY),
  };
}

export function pdfToScreen(
  point: PdfPoint,
  img: HTMLImageElement,
  pageHeight: number,
): PdfPoint {
  const rect = img.getBoundingClientRect();
  const scaleX = rect.width / img.naturalWidth;
  const scaleY = rect.height / img.naturalHeight;
  const screenY = pageHeight - point.y;
  return {
    x: point.x * scaleX,
    y: screenY * scaleY,
  };
}

export function pdfRectToScreen(
  rect: PdfRect,
  img: HTMLImageElement,
  pageHeight: number,
): { left: number; top: number; width: number; height: number } {
  const topLeft = pdfToScreen({ x: rect.x, y: rect.y + rect.height }, img, pageHeight);
  const bottomRight = pdfToScreen({ x: rect.x + rect.width, y: rect.y }, img, pageHeight);
  return {
    left: topLeft.x,
    top: topLeft.y,
    width: bottomRight.x - topLeft.x,
    height: bottomRight.y - topLeft.y,
  };
}

export function normalizePdfRect(first: PdfPoint, second: PdfPoint): PdfRect {
  return {
    x: Math.min(first.x, second.x),
    y: Math.min(first.y, second.y),
    width: Math.abs(second.x - first.x),
    height: Math.abs(second.y - first.y),
  };
}

export type PdfPoint = {
  x: number;
  y: number;
};

export type PdfRect = PdfPoint & {
  width: number;
  height: number;
};

export type PdfPageSize = {
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
  pageSize: PdfPageSize,
): PdfPoint {
  const rect = img.getBoundingClientRect();
  const ratioX = (clientX - rect.left) / rect.width;
  const ratioY = (clientY - rect.top) / rect.height;

  return {
    x: Math.round(ratioX * pageSize.width),
    y: Math.round(pageSize.height - ratioY * pageSize.height),
  };
}

export function pdfToScreen(
  point: PdfPoint,
  img: HTMLImageElement,
  pageSize: PdfPageSize,
): PdfPoint {
  const rect = img.getBoundingClientRect();
  const ratioX = point.x / pageSize.width;
  const ratioY = (pageSize.height - point.y) / pageSize.height;

  return {
    x: ratioX * rect.width,
    y: ratioY * rect.height,
  };
}

export function pdfRectToScreen(
  rect: PdfRect,
  img: HTMLImageElement,
  pageSize: PdfPageSize,
): { left: number; top: number; width: number; height: number } {
  const topLeft = pdfToScreen(
    { x: rect.x, y: rect.y + rect.height },
    img,
    pageSize,
  );
  const bottomRight = pdfToScreen(
    { x: rect.x + rect.width, y: rect.y },
    img,
    pageSize,
  );

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

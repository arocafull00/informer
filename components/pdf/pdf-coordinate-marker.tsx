import type { PdfCoordinateEntry } from "@/lib/pdf/export-fields";
import {
  pdfRectToScreen,
  pdfToScreen,
  type PdfPageSize,
} from "@/lib/pdf/coordinates";

type PdfCoordinateMarkerProps = {
  entry: PdfCoordinateEntry;
  img: HTMLImageElement | null;
  pageSize: PdfPageSize;
};

export function PdfCoordinateMarker({
  entry,
  img,
  pageSize,
}: PdfCoordinateMarkerProps) {
  if (!img) return null;

  if (entry.type === "text" && entry.width && entry.height) {
    const rect = pdfRectToScreen(
      {
        x: entry.x,
        y: entry.y,
        width: entry.width,
        height: entry.height,
      },
      img,
      pageSize,
    );

    return (
      <div
        className="pointer-events-none absolute border-2 border-red-500 bg-red-500/20"
        style={{
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        }}
      />
    );
  }

  const point = pdfToScreen({ x: entry.x, y: entry.y }, img, pageSize);

  return (
    <div
      className="pointer-events-none absolute size-2 rounded-full bg-red-500"
      style={{
        left: point.x - 4,
        top: point.y - 4,
      }}
    />
  );
}

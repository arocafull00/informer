export type PdfFieldType = "point" | "text" | "check";

export type PdfCoordinateEntry = {
  id: string;
  name: string;
  type: PdfFieldType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  fontSize?: number;
  align?: "left" | "center" | "right";
};

export type PdfPickerMode = "point" | "rect";

export function buildFieldMapExport(
  pageSize: { width: number; height: number },
  entries: PdfCoordinateEntry[],
) {
  const fields: Record<string, unknown> = {};

  for (const entry of entries) {
    const key = entry.name.trim();
    if (!key) continue;

    if (entry.type === "check") {
      fields[key] = {
        type: "check",
        x: entry.x,
        y: entry.y,
        radius: entry.radius ?? 6,
      };
      continue;
    }

    if (entry.type === "text" && entry.width && entry.height) {
      fields[key] = {
        type: "text",
        x: entry.x,
        y: entry.y,
        width: entry.width,
        height: entry.height,
        fontSize: entry.fontSize ?? 10,
        align: entry.align ?? "left",
      };
      continue;
    }

    fields[key] = {
      type: "point",
      x: entry.x,
      y: entry.y,
    };
  }

  return {
    pageSize,
    fields,
  };
}

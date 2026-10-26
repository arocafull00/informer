import dersMap from "../../data/ders-omr-map.json" with { type: "json" };
import staiMap from "../../data/stai-omr-map.json" with { type: "json" };

export type SheetTest = "STAI" | "DERS";

export type SheetBox = { value: string; label: string; x: number; y: number };

export type SheetItem = { id: string; code: string; boxes: SheetBox[] };

export type SheetPage = {
  page: number;
  qr: string;
  qrCenter: number[];
  qrSize: number;
  markers: Record<"topLeft" | "bottomLeft" | "bottomRight", number[]>;
  items: SheetItem[];
};

export type SheetMap = {
  test: SheetTest;
  version: number;
  page: { width: number; height: number };
  markerSize: number;
  boxSize: number;
  pages: SheetPage[];
};

export const sheetMaps: Record<SheetTest, SheetMap> = {
  STAI: staiMap as SheetMap,
  DERS: dersMap as SheetMap,
};

export const sheetTemplateUrls: Record<SheetTest, string> = {
  STAI: "/plantillas/stai.pdf",
  DERS: "/plantillas/ders.pdf",
};

export function isSheetTest(test: string): test is SheetTest {
  return test in sheetMaps;
}

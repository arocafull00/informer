import type { SavedReport } from "@/lib/types";

export function getReportLabel(report: SavedReport): string {
  const trimmed = report.title?.trim();
  if (trimmed) return trimmed;
  const date = new Date(report.createdAt).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
  });
  return `${report.test} · ${date}`;
}

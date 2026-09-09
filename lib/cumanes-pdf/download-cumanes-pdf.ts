import type { CumanesPdfForm } from "./types";

export async function downloadCumanesPdf(form: CumanesPdfForm): Promise<void> {
  const response = await fetch("/api/cumanes-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "No se pudo generar el PDF");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "cumanes-resultados.pdf";
  anchor.click();
  URL.revokeObjectURL(url);
}

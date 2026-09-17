import type { RiasResultsForm } from "@/lib/rias-scoring";

async function downloadPdfBlob(blob: Blob, filename: string): Promise<void> {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function fetchRiasPdf(
  form: RiasResultsForm,
  endpoint: string,
): Promise<Blob> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "No se pudo generar el PDF");
  }

  return response.blob();
}

export async function downloadRiasPdf(form: RiasResultsForm): Promise<void> {
  const blob = await fetchRiasPdf(form, "/api/rias-pdf");
  await downloadPdfBlob(blob, "rias-perfil-resultados.pdf");
}

export async function downloadRiasChartPdf(
  form: RiasResultsForm,
): Promise<void> {
  const blob = await fetchRiasPdf(form, "/api/rias-chart-pdf");
  await downloadPdfBlob(blob, "rias-grafica-resultados.pdf");
}

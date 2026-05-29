import type { RiasResultsForm } from "@/lib/rias-scoring";

export async function downloadRiasPdf(form: RiasResultsForm): Promise<void> {
  const response = await fetch("/api/rias-pdf", {
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
  anchor.download = "rias-perfil-resultados.pdf";
  anchor.click();
  URL.revokeObjectURL(url);
}

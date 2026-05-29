import type { AdirResultsForm } from "@/lib/adir-scoring";

export async function downloadAdirPdf(form: AdirResultsForm): Promise<void> {
  const response = await fetch("/api/adir-pdf", {
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
  anchor.download = "adi-r-resultados.pdf";
  anchor.click();
  URL.revokeObjectURL(url);
}

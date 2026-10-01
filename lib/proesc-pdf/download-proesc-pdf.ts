import type { ProescCourse } from "@/lib/proesc-scoring";

export async function downloadProescPdf(input: {
  patientName: string;
  course: ProescCourse;
  answers: Record<string, number>;
}): Promise<void> {
  const response = await fetch("/api/proesc-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error((await response.text()) || "No se pudo generar el PDF");
  }
  const url = URL.createObjectURL(await response.blob());
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "proesc-resultados.pdf";
  anchor.click();
  URL.revokeObjectURL(url);
}

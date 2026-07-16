import type { Ados2ScoreSummary } from "@/lib/ados2-scoring";
import type { TestType } from "@/lib/types";
import { isAdos2PdfTest, type Ados2PdfForm, type Ados2Subject } from "./types";

export async function downloadAdos2Pdf(
  test: TestType,
  summary: Ados2ScoreSummary,
  subject: Ados2Subject,
): Promise<void> {
  if (!isAdos2PdfTest(test)) {
    throw new Error("Test no compatible con ADOS-2 PDF");
  }

  const form: Ados2PdfForm = { test, summary, subject };
  const response = await fetch("/api/ados2-pdf", {
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
  anchor.download =
    test === "ADOS2_NINO"
      ? "ados2-nino-resultados.pdf"
      : "ados2-adulto-resultados.pdf";
  anchor.click();
  URL.revokeObjectURL(url);
}

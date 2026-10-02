import { fillProescPdf } from "@/lib/proesc-pdf/fill-proesc-pdf";
import { parseProescPdfInput } from "@/lib/proesc-scoring";
import { getReportPdfFilename } from "@/lib/pdf/report-filename";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response("JSON no válido", { status: 400 });
  }
  const input = parseProescPdfInput(body);
  if (!input) {
    return new Response("Completa el curso y las diez puntuaciones directas válidas", { status: 400 });
  }
  try {
    const bytes = await fillProescPdf(input);
    return new Response(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${getReportPdfFilename(input.patientName, "proesc")}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("No se pudo generar el PDF", { status: 500 });
  }
}

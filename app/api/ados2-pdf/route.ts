import { fillAdos2Pdf } from "@/lib/ados2-pdf/fill-ados2-pdf";
import { isAdos2PdfTest, type Ados2PdfForm } from "@/lib/ados2-pdf/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let form: Ados2PdfForm;
  try {
    form = (await request.json()) as Ados2PdfForm;
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  if (!isAdos2PdfTest(form.test) || !form.summary || !form.subject) {
    return new Response("Invalid ADOS-2 PDF form", { status: 400 });
  }

  try {
    const pdfBytes = await fillAdos2Pdf(form);
    const filename =
      form.test === "ADOS2_NINO"
        ? "ados2-nino-resultados.pdf"
        : "ados2-adulto-resultados.pdf";

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return new Response("Failed to generate PDF", { status: 500 });
  }
}

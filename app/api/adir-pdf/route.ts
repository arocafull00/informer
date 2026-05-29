import {
  isAdirResultsFormComplete,
  type AdirResultsForm,
} from "@/lib/adir-scoring";
import { fillAdirPdf } from "@/lib/adir-pdf/fill-adir-pdf";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let form: AdirResultsForm;
  try {
    form = (await request.json()) as AdirResultsForm;
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  if (!isAdirResultsFormComplete(form)) {
    return new Response("Incomplete ADI-R results form", { status: 400 });
  }

  try {
    const pdfBytes = await fillAdirPdf(form);
    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="adi-r-resultados.pdf"',
      },
    });
  } catch {
    return new Response("Failed to generate PDF", { status: 500 });
  }
}

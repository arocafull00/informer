import {
  isRiasResultsFormComplete,
  type RiasResultsForm,
} from "@/lib/rias-scoring";
import { fillRiasPdf } from "@/lib/rias-pdf/fill-rias-pdf";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let form: RiasResultsForm;
  try {
    form = (await request.json()) as RiasResultsForm;
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  if (!isRiasResultsFormComplete(form)) {
    return new Response("Incomplete RIAS results form", { status: 400 });
  }

  try {
    const pdfBytes = await fillRiasPdf(form);
    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="rias-perfil-resultados.pdf"',
      },
    });
  } catch {
    return new Response("Failed to generate PDF", { status: 500 });
  }
}

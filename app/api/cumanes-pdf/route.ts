import { fillCumanesPdf } from "@/lib/cumanes-pdf/fill-cumanes-pdf";
import type { CumanesPdfForm } from "@/lib/cumanes-pdf/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let form: CumanesPdfForm;
  try {
    form = (await request.json()) as CumanesPdfForm;
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  try {
    const pdfBytes = await fillCumanesPdf(form);
    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="cumanes-resultados.pdf"',
      },
    });
  } catch {
    return new Response("Failed to generate PDF", { status: 500 });
  }
}

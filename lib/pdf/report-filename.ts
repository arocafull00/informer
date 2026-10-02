export function getReportPdfFilename(
  patientName: string | null | undefined,
  test: string,
): string {
  const patient = (patientName ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${patient || "paciente"}-${test}.pdf`;
}

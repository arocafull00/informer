export type PdfTemplateId = "adir" | "rias";

export type PdfTemplate = {
  id: PdfTemplateId;
  label: string;
  imageSrc: string;
  pageSize: { width: number; height: number };
};

export const PDF_TEMPLATES: PdfTemplate[] = [
  {
    id: "adir",
    label: "ADI-R",
    imageSrc: "/pdf/adi-r.png",
    pageSize: { width: 705, height: 1000 },
  },
  {
    id: "rias",
    label: "RIAS Perfil",
    imageSrc: "/pdf/rias-perfil.png",
    pageSize: { width: 496, height: 710 },
  },
];

export function getPdfTemplate(id: PdfTemplateId): PdfTemplate {
  const template = PDF_TEMPLATES.find((item) => item.id === id);
  if (!template) throw new Error(`Unknown PDF template: ${id}`);
  return template;
}

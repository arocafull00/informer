export type PdfTemplateId = "adir" | "rias" | "ados2-nino" | "ados2-adulto";

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
  {
    id: "ados2-nino",
    label: "ADOS-2 Niño",
    imageSrc: "/pdf/ados2-nino.png",
    pageSize: { width: 595, height: 842 },
  },
  {
    id: "ados2-adulto",
    label: "ADOS-2 Adulto",
    imageSrc: "/pdf/ados2-adulto.png",
    pageSize: { width: 595, height: 842 },
  },
];

export function getPdfTemplate(id: PdfTemplateId): PdfTemplate {
  const template = PDF_TEMPLATES.find((item) => item.id === id);
  if (!template) throw new Error(`Unknown PDF template: ${id}`);
  return template;
}

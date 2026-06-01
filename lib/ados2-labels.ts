import type { TestType } from "@/lib/types";

export function isAdos2Test(test: TestType): boolean {
  return test === "ADOS2_ADULTO" || test === "ADOS2_NINO";
}

export function ados2SectionLetter(sectionNumber: number): string {
  return String.fromCharCode(64 + sectionNumber);
}

export function formatAdos2SectionName(section: string): string {
  const lower = section.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function ados2SectionHeading(
  sectionNumber: number,
  section: string
): string {
  const letter = ados2SectionLetter(sectionNumber);
  return `${letter}. ${formatAdos2SectionName(section)}`;
}

export function ados2ItemLabel(
  sectionNumber: number,
  code: string
): string {
  return `${ados2SectionLetter(sectionNumber)}${code}`;
}

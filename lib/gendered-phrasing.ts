export function isFemalePatientSex(sex: string): boolean {
  return sex === "femenino" || sex === "mujer";
}

const FEMININE_REPLACEMENTS: [string, string][] = [
  ["al evaluado", "a la evaluada"],
  ["el evaluado", "la evaluada"],
  ["enfadado", "enfadada"],
  ["inquieto", "inquieta"],
  ["sentado", "sentada"],
  ["sí mismo", "sí misma"],
  ["ocupado", "ocupada"],
  ["del sujeto", "de la evaluada"],
];

export function applyGenderedPhrasing(text: string, sex: string): string {
  if (!isFemalePatientSex(sex)) {
    return text;
  }

  let result = text;
  for (const [masculine, feminine] of FEMININE_REPLACEMENTS) {
    result = result.replaceAll(masculine, feminine);
  }
  return result;
}

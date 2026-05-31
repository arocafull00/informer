export type TestType = "ADIR" | "ADOS2_ADULTO" | "ADOS2_NINO";

export type Question = {
  id: string;
  test: TestType;
  sectionNumber: number;
  section: string;
  code: string;
  question: string;
  answers: Record<string, string>;
};

export type SavedReport = {
  id: string;
  createdAt: string;
  test: TestType;
  answers: Record<string, number>;
  markdown: string;
  title?: string;
};

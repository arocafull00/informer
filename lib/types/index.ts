export type TestType = "ADIR" | "ADOS2";

export type Question = {
  id: string;
  test: TestType;
  sectionNumber: number;
  section: string;
  number: number;
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
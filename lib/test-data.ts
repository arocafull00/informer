import adirData from "@/data/adir.json";
import ados2AdultoData from "@/data/ados2-adulto.json";
import ados2NinoData from "@/data/ados2-nino.json";
import type { Question, TestType } from "@/lib/types";

export const testData: Record<TestType, Question[]> = {
  ADIR: adirData as unknown as Question[],
  ADOS2_ADULTO: ados2AdultoData as unknown as Question[],
  ADOS2_NINO: ados2NinoData as unknown as Question[],
};

export const testLabels: Record<TestType, string> = {
  ADIR: "ADI-R",
  ADOS2_ADULTO: "ADOS-2 Adulto",
  ADOS2_NINO: "ADOS-2 Niño",
};

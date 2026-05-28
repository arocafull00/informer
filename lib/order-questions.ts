import type { Question } from "@/lib/types";

export function orderQuestionsWithSubItems(questions: Question[]): Question[] {
  const childrenByParent = new Map<string, Question[]>();
  const parents: Question[] = [];

  for (const question of questions) {
    if (question.parentCode) {
      const list = childrenByParent.get(question.parentCode) ?? [];
      list.push(question);
      childrenByParent.set(question.parentCode, list);
      continue;
    }
    parents.push(question);
  }

  return parents.flatMap((parent) => [
    parent,
    ...(childrenByParent.get(parent.code) ?? []),
  ]);
}

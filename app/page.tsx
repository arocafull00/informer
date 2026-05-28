"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { QuestionList } from "@/components/questions/question-list";
import { MarkdownPreview } from "@/components/markdown/markdown-preview";

export default function Home() {
  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-background">
      <Topbar />
      <main className="flex min-h-0 flex-1 overflow-hidden w-full">
        <Sidebar />
        <section className="mx-auto flex min-w-0 flex-1 flex-col overflow-y-auto bg-background p-gutter-grid lg:max-w-[960px]">
          <QuestionList />
        </section>
        <aside className="flex w-[45%] min-w-[360px] max-w-[720px] shrink-0 flex-col border-l border-outline-variant bg-surface">
          <MarkdownPreview />
        </aside>
      </main>
    </div>
  );
}

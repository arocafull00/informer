"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { QuestionList } from "@/components/questions/question-list";
import { MarkdownPreview } from "@/components/markdown/markdown-preview";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Home() {
  return (
    <div className="flex min-h-dvh overflow-hidden bg-background">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
        <Topbar />
        <ScrollArea className="flex-1">
          <div className="p-6">
            <QuestionList className="max-w-3xl" />
          </div>
        </ScrollArea>
      </main>
      <aside className="flex w-[380px] shrink-0 flex-col border-l border-border bg-preview">
        <MarkdownPreview />
      </aside>
    </div>
  );
}
